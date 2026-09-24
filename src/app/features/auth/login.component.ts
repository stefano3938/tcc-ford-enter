import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { LangSwitcherComponent } from '../../shared/components/lang-switcher/lang-switcher.component';
import { I18nService } from '../../core/services/i18n.service';

@Component({
  selector: 'rm-login',
  standalone: true,
  imports: [RouterLink, IconComponent, ButtonComponent, LangSwitcherComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="rm-auth-page">

      <a routerLink="/home" class="rm-auth-back-link">
        <rm-icon name="arrow-left" [size]="14"></rm-icon>
        <span>{{ i18n.t('auth.back') }}</span>
      </a>

      <div class="rm-auth-lang">
        <rm-lang-switcher></rm-lang-switcher>
      </div>

      <div class="rm-auth-card glass-panel">

        <div class="rm-auth-header">
          <div class="rm-auth-logo">
            <img src="assets/favicon-plate-64.png" alt="" width="40" height="40" />
          </div>
          <h2 class="rm-auth-title">
            {{ activeTab() === 'login' ? i18n.t('auth.welcome') : i18n.t('auth.registerTitle') }}
          </h2>
          <p class="rm-auth-subtitle">
            {{ i18n.t('auth.subtitle2') }}
          </p>
        </div>
        <div class="rm-auth-tabs">
          <button
            type="button"
            class="rm-auth-tab"
            [class.active]="activeTab() === 'login'"
            (click)="activeTab.set('login')"
          >
            {{ i18n.t('auth.tabLogin') }}
          </button>
          <button
            type="button"
            class="rm-auth-tab"
            [class.active]="activeTab() === 'register'"
            (click)="activeTab.set('register')"
          >
            {{ i18n.t('auth.tabRegister') }}
          </button>
        </div>
        <form (submit)="onSubmit($event)" class="rm-auth-form">
          @if (activeTab() === 'register') {
            <div class="rm-field-group">
              <label class="rm-label" for="auth-name">{{ i18n.t('auth.name') }}</label>
              <div class="rm-input-wrap">
                <rm-icon name="user" [size]="14" class="rm-field-prefix"></rm-icon>
                <input
                  id="auth-name"
                  type="text"
                  [placeholder]="i18n.t('auth.namePlaceholder')"
                  class="rm-text-input"
                  [value]="nameInput()"
                  (input)="nameInput.set($any($event.target).value)"
                  required
                />
              </div>
            </div>
          }

          <div class="rm-field-group">
            <label class="rm-label" for="auth-email">{{ i18n.t('auth.email') }}</label>
            <div class="rm-input-wrap">
              <rm-icon name="mail" [size]="14" class="rm-field-prefix"></rm-icon>
              <input
                id="auth-email"
                type="email"
                placeholder="seu@email.com"
                class="rm-text-input"
                [value]="emailInput()"
                (input)="emailInput.set($any($event.target).value)"
                required
              />
            </div>
          </div>

          <div class="rm-field-group">
            <div class="rm-label-row">
              <label class="rm-label" for="auth-password">{{ i18n.t('auth.password') }}</label>
            </div>
            <div class="rm-input-wrap">
              <rm-icon name="lock" [size]="14" class="rm-field-prefix"></rm-icon>
              <input
                id="auth-password"
                [type]="showPassword() ? 'text' : 'password'"
                placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;"
                class="rm-text-input"
                [value]="passwordInput()"
                (input)="passwordInput.set($any($event.target).value)"
                required
              />
              <button
                type="button"
                class="rm-password-toggle"
                (click)="toggleShowPassword()"
                [attr.aria-label]="showPassword() ? i18n.t('auth.hidePass') : i18n.t('auth.showPass')"
              >
                <rm-icon [name]="showPassword() ? 'eye-off' : 'eye'" [size]="14"></rm-icon>
              </button>
            </div>
          </div>

          <rm-button
            type="submit"
            variant="primary"
            size="lg"
            [icon]="activeTab() === 'login' ? 'log-in' : 'check'"
            [loading]="isLoading()"
          >
            {{ activeTab() === 'login' ? i18n.t('auth.submit') : i18n.t('auth.create') }}
          </rm-button>
        </form>

        <div class="rm-security-note">
          <rm-icon name="shield" [size]="12"></rm-icon>
          <span>{{ i18n.t('auth.security') }}</span>
        </div>
        <p class="rm-auth-legal">
          {{ i18n.t('auth.legal') }} <a routerLink="/privacidade">{{ i18n.t('auth.terms') }}</a> e <a routerLink="/privacidade">{{ i18n.t('auth.privacyPolicy') }}</a> (LGPD).
        </p>
      </div>
    </div>
  `,
  styles: [`
    .rm-auth-page {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 30px 20px;
      background: var(--rm-bg-canvas);
      position: relative;
    }

    .rm-auth-back-link {
      position: absolute;
      top: 28px;
      left: 32px;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      font-weight: 500;
      color: var(--rm-text-secondary);
      transition: color var(--rm-transition-fast);

      &:hover {
        color: var(--rm-text-primary);
      }

      @media (max-width: 600px) {
        position: static;
        margin-bottom: 20px;
        align-self: flex-start;
      }
    }

    .rm-auth-lang {
      position: absolute;
      top: 28px;
      right: 32px;
      @media (max-width: 600px) {
        position: static;
        align-self: flex-end;
        margin-bottom: 12px;
      }
    }

    .rm-auth-card {
      width: 100%;
      max-width: 440px;
      background: var(--rm-bg-surface);
      border: 1px solid var(--rm-border-base);
      border-radius: var(--rm-radius-xl);
      padding: 32px;
      box-shadow: 0 16px 40px -10px rgba(0, 0, 0, 0.12);
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .rm-auth-header {
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
    }

    .rm-auth-logo {
      width: 44px;
      height: 44px;
      border-radius: var(--rm-radius-lg);
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 14px rgba(99, 102, 241, 0.25);
      margin-bottom: 4px;
    }

    .rm-auth-logo img { width: 100%; height: 100%; object-fit: cover; display: block; }

    .rm-auth-title {
      font-size: 22px;
      font-weight: 800;
      letter-spacing: -0.02em;
      color: var(--rm-text-primary);
    }

    .rm-auth-subtitle {
      font-size: 13px;
      color: var(--rm-text-secondary);
      line-height: 1.4;
    }
    .rm-demo-evaluation-box {
      background: rgba(99, 102, 241, 0.06);
      border: 1px solid rgba(99, 102, 241, 0.2);
      border-radius: var(--rm-radius-lg);
      padding: 14px 16px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      text-align: center;

      rm-button {
        width: 100%;
      }
    }

    .rm-demo-badge-row {
      display: flex;
      justify-content: center;
    }

    .rm-evaluation-pill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 10.5px;
      font-weight: 700;
      letter-spacing: 0.05em;
      color: var(--rm-accent);
      background: var(--rm-accent-light);
      padding: 3px 8px;
      border-radius: var(--rm-radius-full);
    }

    .rm-demo-desc {
      font-size: 12px;
      color: var(--rm-text-secondary);
      line-height: 1.35;
    }

    .rm-auth-divider {
      position: relative;
      text-align: center;
      margin: 4px 0;

      &::before {
        content: '';
        position: absolute;
        top: 50%;
        left: 0;
        right: 0;
        height: 1px;
        background: var(--rm-border-subtle);
      }

      span {
        position: relative;
        background: var(--rm-bg-surface);
        padding: 0 12px;
        font-size: 10.5px;
        font-weight: 700;
        letter-spacing: 0.05em;
        color: var(--rm-text-muted);
      }
    }

    .rm-auth-tabs {
      display: flex;
      background: var(--rm-bg-hover);
      padding: 3px;
      border-radius: var(--rm-radius-md);
      gap: 3px;
    }

    .rm-auth-tab {
      flex: 1;
      padding: 8px 12px;
      font-size: 13px;
      font-weight: 600;
      color: var(--rm-text-secondary);
      border-radius: var(--rm-radius-sm);
      transition: all var(--rm-transition-fast);

      &.active {
        background: var(--rm-bg-surface);
        color: var(--rm-text-primary);
        box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
      }
    }

    .rm-auth-form {
      display: flex;
      flex-direction: column;
      gap: 16px;

      rm-button {
        width: 100%;
        margin-top: 4px;
      }
    }

    .rm-field-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .rm-label-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .rm-label {
      font-size: 12.5px;
      font-weight: 600;
      color: var(--rm-text-secondary);
    }

    .rm-forgot-link {
      font-size: 11.5px;
      color: var(--rm-accent);
      cursor: pointer;
      &:hover {
        text-decoration: underline;
      }
    }

    .rm-input-wrap {
      position: relative;
      display: flex;
      align-items: center;
    }

    .rm-field-prefix {
      position: absolute;
      left: 12px;
      color: var(--rm-text-muted);
      pointer-events: none;
    }

    .rm-text-input {
      width: 100%;
      height: 42px;
      padding: 0 14px 0 36px;
      background: var(--rm-bg-canvas);
      border: 1px solid var(--rm-border-base);
      border-radius: var(--rm-radius-md);
      color: var(--rm-text-primary);
      font-size: 13.5px;
      outline: none;
      transition: all var(--rm-transition-fast);

      &:focus {
        border-color: var(--rm-accent);
        box-shadow: 0 0 0 3px var(--rm-accent-light);
      }
    }

    .rm-password-toggle {
      position: absolute;
      right: 12px;
      color: var(--rm-text-muted);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 4px;
      border-radius: var(--rm-radius-sm);
      transition: color var(--rm-transition-fast);

      &:hover {
        color: var(--rm-text-primary);
      }
    }

    .rm-security-note {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 11px;
      color: var(--rm-text-muted);
      line-height: 1.35;
      padding-top: 8px;
      border-top: 1px solid var(--rm-border-subtle);
    }
  `]
})
export class LoginComponent {
  readonly authService = inject(AuthService);
  readonly i18n = inject(I18nService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly activeTab = signal<'login' | 'register'>('login');
  readonly nameInput = signal<string>('');
  readonly emailInput = signal<string>('');
  readonly passwordInput = signal<string>('');
  readonly showPassword = signal<boolean>(false);
  readonly isLoading = signal<boolean>(false);

  toggleShowPassword(): void {
    this.showPassword.update(v => !v);
  }

  onQuickDemo(): void {
    this.authService.quickDemoLogin();
    const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
    this.router.navigateByUrl(returnUrl);
  }

  onSubmit(event: Event): void {
    event.preventDefault();
    this.isLoading.set(true);

    setTimeout(() => {
      const isRegister = this.activeTab() === 'register';
      const success = isRegister
        ? this.authService.register(this.nameInput(), this.emailInput(), this.passwordInput())
        : this.authService.login(this.emailInput(), this.passwordInput());

      this.isLoading.set(false);

      if (success) {
        const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
        this.router.navigateByUrl(returnUrl);
      }
    }, 450);
  }
}
