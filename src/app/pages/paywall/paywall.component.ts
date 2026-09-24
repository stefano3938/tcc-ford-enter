import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../../core/services/user.service';
import { AuthService } from '../../core/services/auth.service';
import { I18nService } from '../../core/services/i18n.service';
import { PricingPlan } from '../../core/models/user.model';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { BadgeComponent } from '../../shared/components/badge/badge.component';
import { CardComponent } from '../../shared/components/card/card.component';
import { ParticleFieldComponent } from '../../shared/components/particle-field/particle-field.component';
import { PublicShellComponent } from '../../shared/layout/public-shell/public-shell.component';
import { IconComponent } from '../../shared/components/icon/icon.component';

@Component({
  selector: 'rm-paywall',
  standalone: true,
  imports: [ButtonComponent, BadgeComponent, CardComponent, IconComponent, ParticleFieldComponent, PublicShellComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './paywall.component.html',
  styleUrl: './paywall.component.css'
})
export class PaywallComponent {
  readonly userService = inject(UserService);
  readonly authService = inject(AuthService);
  readonly i18n = inject(I18nService);
  private readonly router = inject(Router);

  readonly billing = signal<'monthly' | 'yearly'>('yearly');
  readonly isProcessing = signal<boolean>(false);
  readonly planToSelect = signal<string>('');

  readonly comparisonRows: ReadonlyArray<{ feature: string; cells: ReadonlyArray<string | boolean>; pro: number }> = [
    { feature: 'pay.row.tasks', cells: ['pay.cell.8tasks', 'pay.cell.unlimited', 'pay.cell.unlimited'], pro: 1 },
    { feature: 'pay.row.ideas', cells: ['pay.cell.4ideas', 'pay.cell.unlimited', 'pay.cell.unlimited'], pro: 1 },
    { feature: 'pay.row.ai', cells: ['pay.cell.3perday', 'pay.cell.unlimited', 'pay.cell.unlimited'], pro: 1 },
    { feature: 'pay.row.decompose', cells: [false, true, true], pro: 1 },
    { feature: 'pay.row.views', cells: [true, true, true], pro: 1 },
    { feature: 'pay.row.storage', cells: [true, true, true], pro: 1 },
    { feature: 'pay.row.workspaces', cells: [false, false, true], pro: 2 }
  ];

  readonly faqs: ReadonlyArray<{ q: string; a: string }> = [
    { q: 'pay.faq1.q', a: 'pay.faq1.a' },
    { q: 'pay.faq2.q', a: 'pay.faq2.a' },
    { q: 'pay.faq3.q', a: 'pay.faq3.a' }
  ];

  isCurrentPlan(planId: string): boolean {
    return this.userService.currentUser().plan === planId;
  }

  selectPlan(planId: 'free' | 'pro' | 'team'): void {
    this.planToSelect.set(planId);
    this.isProcessing.set(true);

    setTimeout(() => {
      if (planId === 'pro') {
        this.userService.upgradeToPro();
      } else if (planId === 'free') {
        this.userService.downgradeToFree();
      }
      this.isProcessing.set(false);
      // Keep the user inside the app instead of stranding them on a dead plan screen.
      if (this.authService.isAuthenticated()) {
        this.router.navigate(['/dashboard']);
      }
    }, 600);
  }
}
