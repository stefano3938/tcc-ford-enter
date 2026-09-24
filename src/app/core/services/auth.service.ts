import { Injectable, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { StorageService } from './storage.service';
import { ToastService } from './toast.service';
import { UserService } from './user.service';
import { I18nService } from './i18n.service';

export interface AuthSession {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  token: string;
  createdAt: string;
}

export type AuthField = 'name' | 'email' | 'password';

/** Outcome of a login/registration attempt; errors point at the field to fix. */
export type AuthResult = { ok: true } | { ok: false; field: AuthField; message: string };

type AuthProvider = 'password' | 'google';

/** A locally registered account. Passwords are only ever stored as a salted SHA-256 hash. */
interface StoredAccount {
  id: string;
  email: string;
  name: string;
  provider: AuthProvider;
  passwordHash?: string;
  salt?: string;
  createdAt: string;
}

export const PASSWORD_MIN_LENGTH = 8;

/**
 * Stricter than the browser's type="email": rejects `a@b.c`, `name@host` and `x@@y.com`.
 * Local part without spaces or @, dot-separated domain labels and a letters-only TLD of 2+ chars.
 */
export function isValidEmail(value: string): boolean {
  const email = value.trim();
  if (email.length > 254) return false;
  const match = /^([^\s@]+)@([^\s@]+)$/.exec(email);
  if (!match) return false;
  const [, local, domain] = match;
  if (local.length > 64 || local.startsWith('.') || local.endsWith('.') || local.includes('..')) return false;
  const labels = domain.toLowerCase().split('.');
  if (labels.length < 2) return false;
  const tld = labels[labels.length - 1];
  if (!/^[a-z]{2,}$/.test(tld)) return false;
  return labels.every(label => /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/.test(label));
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly storage = inject(StorageService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);
  private readonly userService = inject(UserService);
  private readonly i18n = inject(I18nService);

  private readonly AUTH_KEY = 'redmindme_auth_session';
  private readonly ACCOUNTS_KEY = 'redmindme_accounts';
  private readonly SESSION_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

  readonly session = signal<AuthSession | null>(this.loadSession());
  readonly isAuthenticated = computed(() => this.session() !== null && !!this.session()?.token);

  /** Field-level check shared by the form (on blur) and by login/register. */
  validateField(field: AuthField, value: string, mode: 'login' | 'register'): string | null {
    switch (field) {
      case 'name':
        return value.trim().length < 2 ? this.i18n.t('auth.error.name') : null;
      case 'email':
        if (!value.trim()) return this.i18n.t('auth.error.emailRequired');
        return isValidEmail(value) ? null : this.i18n.t('auth.error.email');
      case 'password':
        if (!value) return this.i18n.t('auth.error.passwordRequired');
        return mode === 'register' && value.length < PASSWORD_MIN_LENGTH
          ? this.i18n.t('auth.error.password', { count: PASSWORD_MIN_LENGTH })
          : null;
    }
  }

  async login(email: string, password: string): Promise<AuthResult> {
    const invalid = this.firstError({ email, password }, 'login');
    if (invalid) return invalid;

    const account = this.findAccount(email);
    if (account?.provider === 'google') {
      return this.fail('email', 'auth.error.useGoogle');
    }
    if (!account?.salt || !account.passwordHash || (await this.hash(password, account.salt)) !== account.passwordHash) {
      // Same message for unknown email and wrong password, so the form doesn't reveal which accounts exist
      return this.fail('password', 'auth.error.credentials');
    }

    this.startSession(account);
    this.toast.success(this.i18n.t('toast.loggedIn'), this.i18n.t('toast.loggedIn.body', { email: account.email }));
    return { ok: true };
  }

  async register(name: string, email: string, password: string): Promise<AuthResult> {
    const invalid = this.firstError({ name, email, password }, 'register');
    if (invalid) return invalid;
    if (this.findAccount(email)) {
      return this.fail('email', 'auth.error.emailTaken');
    }

    const salt = this.randomHex(16);
    const account: StoredAccount = {
      id: 'usr-' + this.generateSecureId(),
      email: email.trim().toLowerCase(),
      name: name.trim(),
      provider: 'password',
      salt,
      passwordHash: await this.hash(password, salt),
      createdAt: new Date().toISOString()
    };
    this.saveAccounts([...this.loadAccounts(), account]);

    this.startSession(account);
    this.toast.success(this.i18n.t('toast.registered'), this.i18n.t('toast.registered.body', { name: account.name }));
    return { ok: true };
  }

  /** Simulated Google sign-in: signs in the chosen account, creating it on first use. */
  loginWithGoogle(profile: { name: string; email: string }): AuthResult {
    const invalid = this.firstError({ name: profile.name, email: profile.email }, 'register');
    if (invalid) return invalid;

    let account = this.findAccount(profile.email);
    if (!account) {
      account = {
        id: 'usr-' + this.generateSecureId(),
        email: profile.email.trim().toLowerCase(),
        name: profile.name.trim(),
        provider: 'google',
        createdAt: new Date().toISOString()
      };
      this.saveAccounts([...this.loadAccounts(), account]);
    }

    this.startSession(account);
    this.toast.success(this.i18n.t('toast.loggedIn'), this.i18n.t('toast.loggedIn.body', { email: account.email }));
    return { ok: true };
  }

  logout(): void {
    this.storage.removeItem(this.AUTH_KEY);
    this.session.set(null);
    this.toast.info(this.i18n.t('toast.sessionEnded'), this.i18n.t('toast.sessionEnded.body'));
    this.router.navigate(['/home']);
  }

  private firstError(values: Partial<Record<AuthField, string>>, mode: 'login' | 'register'): AuthResult | null {
    for (const field of ['name', 'email', 'password'] as const) {
      const value = values[field];
      if (value === undefined) continue;
      const message = this.validateField(field, value, mode);
      if (message) return { ok: false, field, message };
    }
    return null;
  }

  private fail(field: AuthField, key: string): AuthResult {
    return { ok: false, field, message: this.i18n.t(key) };
  }

  private findAccount(email: string): StoredAccount | undefined {
    const normalized = email.trim().toLowerCase();
    return this.loadAccounts().find(a => a.email === normalized);
  }

  private loadAccounts(): StoredAccount[] {
    const stored = this.storage.getItem<StoredAccount[]>(this.ACCOUNTS_KEY, []);
    return Array.isArray(stored) ? stored : [];
  }

  private saveAccounts(accounts: StoredAccount[]): void {
    this.storage.setItem(this.ACCOUNTS_KEY, accounts);
  }

  private startSession(account: StoredAccount): void {
    // Another account signing in on this browser gets its own profile instead of the previous one's
    if (this.userService.currentUser().email !== account.email) {
      this.userService.createProfile({ name: account.name, email: account.email });
    }
    this.saveSession({
      id: account.id,
      name: account.name,
      email: account.email,
      avatarUrl: this.avatarFor(account.name),
      token: this.generateToken(account.provider),
      createdAt: new Date().toISOString()
    });
  }

  private avatarFor(name: string): string {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=6366f1&color=fff&size=120`;
  }

  private async hash(password: string, salt: string): Promise<string> {
    const bytes = new TextEncoder().encode(`${salt}:${password}`);
    const digest = await crypto.subtle.digest('SHA-256', bytes);
    return Array.from(new Uint8Array(digest), b => b.toString(16).padStart(2, '0')).join('');
  }

  private randomHex(byteCount: number): string {
    const bytes = crypto.getRandomValues(new Uint8Array(byteCount));
    return Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
  }

  private loadSession(): AuthSession | null {
    const stored = this.storage.getItem<AuthSession | null>(this.AUTH_KEY, null);
    if (!stored) {
      return null;
    }
    if (!stored.token || typeof stored.token !== 'string' || !stored.token.startsWith('jwt-')) {
      this.storage.removeItem(this.AUTH_KEY);
      return null;
    }
    if (!stored.createdAt) {
      this.storage.removeItem(this.AUTH_KEY);
      return null;
    }
    const createdTime = new Date(stored.createdAt).getTime();
    if (Number.isNaN(createdTime) || Date.now() - createdTime > this.SESSION_MAX_AGE_MS) {
      this.storage.removeItem(this.AUTH_KEY);
      return null;
    }

    return stored;
  }

  private saveSession(session: AuthSession): void {
    this.storage.setItem(this.AUTH_KEY, session);
    this.session.set(session);
  }

  private generateToken(suffix = 'mock'): string {
    const uuid = typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 10);
    return `jwt-${suffix}-${uuid}-${random}-${Date.now().toString(36)}`;
  }

  private generateSecureId(): string {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID().slice(0, 8);
    }
    return Math.random().toString(36).substring(2, 8) + Math.random().toString(36).substring(2, 6);
  }
}
