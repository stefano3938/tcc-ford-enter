import { Injectable, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { StorageService } from './storage.service';
import { ToastService } from './toast.service';
import { UserService } from './user.service';

export interface AuthSession {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  token: string;
  createdAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly storage = inject(StorageService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);
  private readonly userService = inject(UserService);

  private readonly AUTH_KEY = 'redmindme_auth_session';
  private readonly SESSION_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;
  private readonly EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  readonly session = signal<AuthSession | null>(this.loadSession());
  readonly isAuthenticated = computed(() => this.session() !== null && !!this.session()?.token);

  login(email: string, password: string): boolean {
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      this.toast.error('Erro de Autenticação', 'Preencha todos os campos obrigatórios.');
      return false;
    }

    if (!this.EMAIL_REGEX.test(trimmedEmail)) {
      this.toast.error('Erro de Autenticação', 'Informe um e-mail válido.');
      return false;
    }
    const existing = this.userService.currentUser();
    const sameEmail = existing.email.toLowerCase() === trimmedEmail.toLowerCase() && existing.name !== 'Visitante';
    const rawName = sameEmail ? existing.name : trimmedEmail.split('@')[0];
    const name = rawName.charAt(0).toUpperCase() + rawName.slice(1);
    const avatarUrl = sameEmail && existing.avatarUrl ? existing.avatarUrl : `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=6366f1&color=fff&size=120`;

    const userSession: AuthSession = {
      id: 'usr-' + this.generateSecureId(),
      name,
      email: trimmedEmail,
      avatarUrl,
      token: this.generateToken(),
      createdAt: new Date().toISOString()
    };

    this.saveSession(userSession);

    if (!sameEmail) {
      this.userService.createProfile({ name, email: trimmedEmail });
    }
    this.toast.success('Bem-vindo de volta!', `Sessão iniciada como ${userSession.email}`);
    return true;
  }

  register(name: string, email: string, password: string): boolean {
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    if (!trimmedName || !trimmedEmail || !password) {
      this.toast.error('Erro no cadastro', 'Preencha nome, e-mail e senha.');
      return false;
    }
    if (trimmedName.length < 2) {
      this.toast.error('Erro no cadastro', 'Nome deve ter pelo menos 2 caracteres.');
      return false;
    }
    if (!this.EMAIL_REGEX.test(trimmedEmail)) {
      this.toast.error('Erro no cadastro', 'Informe um e-mail válido.');
      return false;
    }
    if (password.length < 6) {
      this.toast.error('Erro no cadastro', 'Senha deve ter pelo menos 6 caracteres.');
      return false;
    }

    const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(trimmedName)}&background=6366f1&color=fff&size=120`;
    const userSession: AuthSession = {
      id: 'usr-' + this.generateSecureId(),
      name: trimmedName,
      email: trimmedEmail,
      avatarUrl,
      token: this.generateToken(),
      createdAt: new Date().toISOString()
    };

    this.saveSession(userSession);
    this.userService.createProfile({ name: trimmedName, email: trimmedEmail });
    this.toast.success('Conta criada!', `Bem-vindo, ${trimmedName}!`);
    return true;
  }

  quickDemoLogin(): void {
    const demoSession: AuthSession = {
      id: 'usr-demo-stefano',
      name: 'Stefano',
      email: 'stefano@redmind.me',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
      token: this.generateToken('demo'),
      createdAt: new Date().toISOString()
    };

    this.saveSession(demoSession);
    this.toast.success('Bem-vindo!', 'Sessão iniciada com sucesso.');
    this.router.navigate(['/dashboard']);
  }

  logout(): void {
    this.storage.removeItem(this.AUTH_KEY);
    this.session.set(null);
    this.toast.info('Sessão encerrada', 'Você saiu da sua conta.');
    this.router.navigate(['/login']);
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
