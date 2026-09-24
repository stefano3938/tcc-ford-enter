import { ChangeDetectionStrategy, Component, OnDestroy, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { I18nService } from '../../core/services/i18n.service';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { BadgeComponent } from '../../shared/components/badge/badge.component';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { PublicShellComponent } from '../../shared/layout/public-shell/public-shell.component';

@Component({
  selector: 'rm-demonstracao',
  standalone: true,
  imports: [ButtonComponent, BadgeComponent, IconComponent, PublicShellComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './demonstracao.component.html',
  styleUrl: './demonstracao.component.css'
})
export class DemonstracaoComponent implements OnDestroy {
  readonly authService = inject(AuthService);
  readonly i18n = inject(I18nService);
  private readonly router = inject(Router);
  readonly demoIndex = signal(1);
  private demoTimer: ReturnType<typeof setInterval> | undefined;

  constructor() {
    this.demoTimer = setInterval(() => {
      if (typeof document !== 'undefined' && document.hidden) return;
      this.demoIndex.update(index => (index + 1) % 9);
    }, 2200);
  }

  ngOnDestroy(): void {
    if (this.demoTimer !== undefined) {
      clearInterval(this.demoTimer);
    }
  }

  onStartNow(): void {
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
    } else {
      this.router.navigate(['/login']);
    }
  }
}
