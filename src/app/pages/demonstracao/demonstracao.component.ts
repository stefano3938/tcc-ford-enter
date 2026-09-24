import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { I18nService } from '../../core/services/i18n.service';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { ParticleFieldComponent } from '../../shared/components/particle-field/particle-field.component';
import { PublicShellComponent } from '../../shared/layout/public-shell/public-shell.component';
import { DemoBoardComponent } from './components/demo-board/demo-board.component';

@Component({
  selector: 'rm-demonstracao',
  standalone: true,
  imports: [ButtonComponent, DemoBoardComponent, ParticleFieldComponent, PublicShellComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './demonstracao.component.html',
  styleUrl: './demonstracao.component.css'
})
export class DemonstracaoComponent {
  readonly authService = inject(AuthService);
  readonly i18n = inject(I18nService);
  private readonly router = inject(Router);

  onStartNow(): void {
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
    } else {
      this.router.navigate(['/login']);
    }
  }
}
