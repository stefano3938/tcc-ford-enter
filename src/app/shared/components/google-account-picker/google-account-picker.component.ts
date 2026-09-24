import { ChangeDetectionStrategy, Component, inject, model, output, signal } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { I18nService } from '../../../core/services/i18n.service';
import { ModalComponent } from '../modal/modal.component';
import { InputComponent } from '../input/input.component';
import { ButtonComponent } from '../button/button.component';
import { AvatarComponent } from '../avatar/avatar.component';

interface DemoGoogleAccount {
  name: string;
  email: string;
}

/**
 * Simulated "Sign in with Google" account chooser. There is no backend or OAuth client,
 * so picking an account signs it in locally through AuthService.loginWithGoogle().
 */
@Component({
  selector: 'rm-google-account-picker',
  standalone: true,
  imports: [ModalComponent, InputComponent, ButtonComponent, AvatarComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './google-account-picker.component.html',
  styleUrl: './google-account-picker.component.css'
})
export class GoogleAccountPickerComponent {
  private readonly auth = inject(AuthService);
  readonly i18n = inject(I18nService);

  readonly isOpen = model<boolean>(false);
  readonly signedIn = output<void>();

  // Demo data, not interface copy
  readonly accounts: DemoGoogleAccount[] = [
    { name: 'Ana Souza', email: 'ana.souza@gmail.com' },
    { name: 'Lucas Pereira', email: 'lucas.pereira@gmail.com' }
  ];

  readonly useOther = signal(false);
  readonly otherName = signal('');
  readonly otherEmail = signal('');
  readonly nameError = signal<string | null>(null);
  readonly emailError = signal<string | null>(null);

  choose(account: DemoGoogleAccount): void {
    const result = this.auth.loginWithGoogle(account);
    if (result.ok) {
      this.close();
      this.signedIn.emit();
    }
  }

  continueWithOther(): void {
    const result = this.auth.loginWithGoogle({ name: this.otherName(), email: this.otherEmail() });
    if (result.ok) {
      this.close();
      this.signedIn.emit();
      return;
    }
    this.nameError.set(result.field === 'name' ? result.message : null);
    this.emailError.set(result.field === 'email' ? result.message : null);
  }

  close(): void {
    this.isOpen.set(false);
    this.useOther.set(false);
    this.otherName.set('');
    this.otherEmail.set('');
    this.nameError.set(null);
    this.emailError.set(null);
  }
}
