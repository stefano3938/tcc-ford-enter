import { Injectable, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { I18nService } from './i18n.service';

/**
 * The one "get started" call to action used across the public pages.
 * Signed-out visitors go to sign-up; signed-in users go straight to their dashboard.
 */
@Injectable({ providedIn: 'root' })
export class StartCtaService {
  private readonly auth = inject(AuthService);
  private readonly i18n = inject(I18nService);
  private readonly router = inject(Router);

  readonly label = computed(() =>
    this.auth.isAuthenticated() ? this.i18n.t('cta.dashboard') : this.i18n.t('cta.start')
  );

  go(): void {
    if (this.auth.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
    } else {
      this.router.navigate(['/login'], { queryParams: { tab: 'register' } });
    }
  }

  login(): void {
    this.router.navigate(['/login']);
  }
}
