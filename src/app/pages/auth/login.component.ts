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
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
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
