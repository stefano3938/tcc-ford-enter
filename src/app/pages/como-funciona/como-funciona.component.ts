import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { I18nService } from '../../core/services/i18n.service';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { IconComponent, IconName } from '../../shared/components/icon/icon.component';
import { PublicShellComponent } from '../../shared/layout/public-shell/public-shell.component';

@Component({
  selector: 'rm-como-funciona',
  standalone: true,
  imports: [ButtonComponent, IconComponent, PublicShellComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './como-funciona.component.html',
  styleUrl: './como-funciona.component.css'
})
export class ComoFuncionaComponent {
  readonly authService = inject(AuthService);
  readonly i18n = inject(I18nService);
  private readonly router = inject(Router);

  readonly steps: ReadonlyArray<{ key: string; icon: IconName }> = [
    { key: '1', icon: 'lightbulb' },
    { key: '2', icon: 'kanban' },
    { key: '3', icon: 'sparkles' }
  ];

  onStartNow(): void {
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
    } else {
      this.router.navigate(['/login']);
    }
  }
}
