import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { I18nService } from '../../core/services/i18n.service';
import { AppPreviewComponent, AppPreviewVariant } from '../../shared/components/app-preview/app-preview.component';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { IconComponent, IconName } from '../../shared/components/icon/icon.component';
import { ParticleFieldComponent } from '../../shared/components/particle-field/particle-field.component';
import { RevealDirective } from '../../shared/directives/reveal.directive';
import { PublicShellComponent } from '../../shared/layout/public-shell/public-shell.component';

@Component({
  selector: 'rm-recursos',
  standalone: true,
  imports: [AppPreviewComponent, ButtonComponent, IconComponent, ParticleFieldComponent, PublicShellComponent, RevealDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './recursos.component.html',
  styleUrl: './recursos.component.css'
})
export class RecursosComponent {
  readonly i18n = inject(I18nService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  /** In the order work actually moves: capture an idea, organise it, let the assistant plan it */
  readonly features: ReadonlyArray<{ key: string; icon: IconName; preview: AppPreviewVariant }> = [
    { key: 'ideas', icon: 'lightbulb', preview: 'ideas' },
    { key: 'kanban', icon: 'kanban', preview: 'kanban' },
    { key: 'assistant', icon: 'sparkles', preview: 'assistant' }
  ];

  readonly more: ReadonlyArray<{ key: string; icon: IconName }> = [
    { key: 'progress', icon: 'check-circle' },
    { key: 'trust', icon: 'shield' }
  ];

  goTo(path: string): void {
    this.router.navigate([path]);
  }

  onStartNow(): void {
    this.router.navigate([this.authService.isAuthenticated() ? '/dashboard' : '/login']);
  }
}
