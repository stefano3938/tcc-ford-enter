import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthField, AuthService, PASSWORD_MIN_LENGTH } from '../../core/services/auth.service';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { LangSwitcherComponent } from '../../shared/components/lang-switcher/lang-switcher.component';
import { GoogleAccountPickerComponent } from '../../shared/components/google-account-picker/google-account-picker.component';
import { I18nService } from '../../core/services/i18n.service';
import { ParticleFieldComponent } from '../../shared/components/particle-field/particle-field.component';

@Component({
  selector: 'rm-login',
  standalone: true,
  imports: [RouterLink, IconComponent, ButtonComponent, LangSwitcherComponent, GoogleAccountPickerComponent, ParticleFieldComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  readonly authService = inject(AuthService);
  readonly i18n = inject(I18nService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly passwordMin = PASSWORD_MIN_LENGTH;
  readonly activeTab = signal<'login' | 'register'>('login');
  readonly nameInput = signal<string>('');
  readonly emailInput = signal<string>('');
  readonly passwordInput = signal<string>('');
  readonly showPassword = signal<boolean>(false);
  readonly isLoading = signal<boolean>(false);
  readonly googleOpen = signal<boolean>(false);
  readonly errors = signal<Partial<Record<AuthField, string>>>({});

  setTab(tab: 'login' | 'register'): void {
    this.activeTab.set(tab);
    this.errors.set({});
  }

  toggleShowPassword(): void {
    this.showPassword.update(v => !v);
  }

  /** Clears the field's error while the user is fixing it. */
  onFieldInput(field: AuthField, value: string): void {
    this.fieldSignal(field).set(value);
    if (this.errors()[field]) {
      this.setError(field, null);
    }
  }

  /** Validates a field once the user leaves it, but never flags a field they haven't typed in yet. */
  onFieldBlur(field: AuthField): void {
    const value = this.fieldSignal(field)();
    if (!value) return;
    this.setError(field, this.authService.validateField(field, value, this.activeTab()));
  }

  errorFor(field: AuthField): string | null {
    return this.errors()[field] ?? null;
  }

  async onSubmit(event: Event): Promise<void> {
    event.preventDefault();
    if (this.isLoading()) return;
    this.isLoading.set(true);

    const result = this.activeTab() === 'register'
      ? await this.authService.register(this.nameInput(), this.emailInput(), this.passwordInput())
      : await this.authService.login(this.emailInput(), this.passwordInput());

    this.isLoading.set(false);

    if (!result.ok) {
      this.errors.set({ [result.field]: result.message });
      document.getElementById(`auth-${result.field}`)?.focus();
      return;
    }
    this.goToApp();
  }

  goToApp(): void {
    const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
    this.router.navigateByUrl(returnUrl);
  }

  private fieldSignal(field: AuthField) {
    return { name: this.nameInput, email: this.emailInput, password: this.passwordInput }[field];
  }

  private setError(field: AuthField, message: string | null): void {
    this.errors.update(current => {
      const next = { ...current };
      if (message) next[field] = message;
      else delete next[field];
      return next;
    });
  }
}
