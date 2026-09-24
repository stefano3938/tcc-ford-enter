import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { UserService } from '../../core/services/user.service';
import { AuthService } from '../../core/services/auth.service';
import { ThemeService } from '../../core/services/theme.service';
import { I18nService } from '../../core/services/i18n.service';
import { PricingPlan } from '../../core/models/user.model';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { BadgeComponent } from '../../shared/components/badge/badge.component';
import { CardComponent } from '../../shared/components/card/card.component';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { LangSwitcherComponent } from '../../shared/components/lang-switcher/lang-switcher.component';

@Component({
  selector: 'rm-paywall',
  standalone: true,
  imports: [RouterLink, ButtonComponent, BadgeComponent, CardComponent, IconComponent, LangSwitcherComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="rm-pricing-page">
      <header class="rm-pricing-nav">
        <a routerLink="/home" class="rm-pricing-brand">
          <span class="rm-pricing-logo"><img src="assets/favicon-plate-64.png" alt="" width="30" height="30" /></span>
          <span class="rm-pricing-brand__text">Remind<span class="rm-pricing-brand__accent">Me</span></span>
        </a>
        <div class="rm-pricing-nav__actions">
          <rm-lang-switcher></rm-lang-switcher>
          <button
            type="button"
            class="rm-pricing-theme"
            (click)="themeService.toggleTheme()"
            [attr.aria-label]="themeService.theme() === 'dark' ? i18n.t('nav.theme.light') : i18n.t('nav.theme.dark')"
            [title]="themeService.theme() === 'dark' ? i18n.t('nav.theme.light') : i18n.t('nav.theme.dark')"
          >
            @if (themeService.theme() === 'dark') { <rm-icon name="sun" [size]="15"></rm-icon> }
            @else { <rm-icon name="moon" [size]="15"></rm-icon> }
          </button>
          @if (authService.isAuthenticated()) {
            <a routerLink="/dashboard" class="rm-pricing-back">
              <rm-icon name="arrow-left" [size]="14"></rm-icon>
              <span>{{ i18n.t('nav.backApp') }}</span>
            </a>
          } @else {
            <a routerLink="/login" class="rm-pricing-back">
              <rm-icon name="arrow-left" [size]="14"></rm-icon>
              <span>{{ i18n.t('nav.login') }}</span>
            </a>
          }
        </div>
      </header>

      <div class="rm-pricing-hero rm-page-hero">
        <span class="ai-pill">{{ i18n.t('pay.badge') }}</span>
        <h1 class="rm-pricing-hero__title">{{ i18n.t('pay.heroShort') }}</h1>
        <p class="rm-pricing-hero__subtitle">
          {{ i18n.t('pay.subtitle') }}
        </p>
        <div class="rm-billing-toggle">
          <button
            type="button"
            class="rm-toggle-option"
            [class.active]="billing() === 'monthly'"
            (click)="billing.set('monthly')"
          >
            {{ i18n.t('pay.monthly') }}
          </button>
          <button
            type="button"
            class="rm-toggle-option"
            [class.active]="billing() === 'yearly'"
            (click)="billing.set('yearly')"
          >
            {{ i18n.t('pay.yearly') }}
            <span class="rm-save-tag">-20% OFF</span>
          </button>
        </div>
      </div>
      <div class="rm-plans-grid rm-page-grid">
        @for (plan of userService.pricingPlans; track plan.id) {
          <rm-card
            class="rm-plan-card"
            [glow]="!!plan.isPopular"
            [lift]="false"
            [class.rm-plan-card--popular]="plan.isPopular"
            [class.rm-plan-card--current]="isCurrentPlan(plan.id)"
          >
            <div class="rm-plan-header">
              <div class="rm-plan-title-wrap">
                <h3 class="rm-plan-title">{{ plan.name }}</h3>
                @if (plan.isPopular) {
                  <rm-badge type="pro" label="MAIS POPULAR"></rm-badge>
                }
              </div>
              <p class="rm-plan-desc">{{ plan.description }}</p>
            </div>
            <div class="rm-plan-pricing-box">
              @if (plan.priceMonthly === 0) {
                <span class="rm-plan-free-text">{{ i18n.t('pay.freeWord') }}</span>
                <span class="rm-plan-period">{{ i18n.t('pay.forever') }}</span>
              } @else {
                <div class="rm-price-amount">
                  <span class="rm-currency">R$</span>
                  <span class="rm-amount">
                    {{ billing() === 'yearly' ? plan.priceYearly : plan.priceMonthly }}
                  </span>
                  <span class="rm-period">{{ i18n.t('pay.perMonth') }}</span>
                </div>
                @if (billing() === 'yearly') {
                  <span class="rm-billing-note">{{ i18n.t('pay.billedYearly', { amount: plan.priceYearly * 12 }) }}</span>
                }
              }
            </div>
            <div class="rm-plan-cta">
              @if (isCurrentPlan(plan.id)) {
                <rm-button
                  variant="subtle"
                  size="lg"
                  [disabled]="true"
                >
                  <i class="pi pi-check" aria-hidden="true"></i>
                  {{ i18n.t('pay.current') }}
                </rm-button>
              } @else if (plan.id === 'pro') {
                <rm-button
                  variant="ai"
                  size="lg"
                  icon="pi-bolt"
                  [loading]="isProcessing() && planToSelect() === 'pro'"
                  (clicked)="selectPlan('pro')"
                >
                  {{ plan.ctaLabel }}
                </rm-button>
              } @else if (plan.id === 'free') {
                <rm-button
                  variant="outline"
                  size="lg"
                  (clicked)="selectPlan('free')"
                >
                  {{ i18n.t('pay.backToFree') }}
                </rm-button>
              } @else {
                <rm-button
                  variant="secondary"
                  size="lg"
                  (clicked)="selectPlan('team')"
                >
                  {{ plan.ctaLabel }}
                </rm-button>
              }
            </div>

            <div class="rm-plan-divider"></div>
            <div class="rm-plan-features">
              <span class="rm-features-label">{{ i18n.t('pay.includes') }}</span>
              <ul class="rm-features-items">
                @for (feat of plan.features; track feat) {
                  <li class="rm-feature-item">
                    <i class="pi pi-check text-done" aria-hidden="true"></i>
                    <span>{{ feat }}</span>
                  </li>
                }
              </ul>
            </div>
          </rm-card>
        }
      </div>
      <div class="rm-comparison-section rm-page-section">
        <h3 class="rm-comparison-title">{{ i18n.t('pay.compare') }}</h3>

        <div class="rm-table-wrapper glass-panel">
          <table class="rm-comparison-table">
            <thead>
              <tr>
                <th class="col-feature">{{ i18n.t('pay.feature') }}</th>
                <th class="col-plan">Starter</th>
                <th class="col-plan text-pro">RemindMe Pro</th>
                <th class="col-plan">Team Studio</th>
              </tr>
            </thead>
            <tbody>
              @for (row of comparisonRows; track row.feature) {
                <tr>
                  <td>{{ i18n.t(row.feature) }}</td>
                  @for (cell of row.cells; track $index) {
                    @if (cell === true) {
                      <td [class.text-done]="true" [class.font-bold]="true"><i class="pi pi-check" aria-hidden="true"></i></td>
                    } @else if (cell === false) {
                      <td>—</td>
                    } @else {
                      <td [class.text-pro]="row.pro === $index" [class.font-bold]="row.pro === $index">{{ i18n.t(cell) }}</td>
                    }
                  }
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
      <div class="rm-faq-section rm-page-section">
        <h3 class="rm-faq-title">{{ i18n.t('pay.faqTitle') }}</h3>
        <div class="rm-faq-grid">
          @for (faq of faqs; track faq.q) {
            <div class="rm-faq-item">
              <h4 class="rm-faq-q">{{ i18n.t(faq.q) }}</h4>
              <p class="rm-faq-a">{{ i18n.t(faq.a) }}</p>
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .rm-pricing-page {
      display: flex;
      flex-direction: column;
      padding-bottom: 60px;
    }

    /* The hover lift itself lives in app.css: the visible surface is the
       inner .rm-card rendered by <rm-card>, which page-scoped CSS can't reach. */
    .rm-plan-card {
      transition: transform 220ms cubic-bezier(0.23, 1, 0.32, 1),
        box-shadow 220ms cubic-bezier(0.23, 1, 0.32, 1),
        border-color 220ms ease-out;
    }

    .rm-pricing-nav {
      position: sticky;
      top: 0;
      z-index: 100;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      padding: 12px 20px;
      padding-top: max(12px, env(safe-area-inset-top));
      background: var(--rm-bg-glass);
      -webkit-backdrop-filter: blur(18px) saturate(1.5);
      backdrop-filter: blur(18px) saturate(1.5);
      border-bottom: 1px solid var(--rm-border-base);
    }

    .rm-pricing-brand { display: flex; align-items: center; gap: 10px; min-width: 0; }
    .rm-pricing-logo { width: 30px; height: 30px; border-radius: var(--rm-radius-md); overflow: hidden; flex-shrink: 0; display: flex; }
    .rm-pricing-logo img { width: 100%; height: 100%; object-fit: cover; display: block; }
    .rm-pricing-brand__text { font-size: 17px; font-weight: 700; letter-spacing: -0.02em; white-space: nowrap; }
    .rm-pricing-brand__accent { color: var(--rm-accent); }
    .rm-pricing-nav__actions { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }

    .rm-pricing-theme {
      width: 36px; height: 36px; border-radius: var(--rm-radius-md);
      background: var(--rm-bg-hover); border: 1px solid var(--rm-border-base);
      color: var(--rm-text-secondary); display: flex; align-items: center; justify-content: center;
      transition: background var(--rm-transition-fast), color var(--rm-transition-fast);
      &:active { transform: scale(0.94); }
    }

    .rm-pricing-back {
      display: inline-flex; align-items: center; gap: 6px;
      height: 36px; padding: 0 14px; border-radius: var(--rm-radius-md);
      background: var(--rm-accent); color: #fff;
      font-size: 13.5px; font-weight: 600; white-space: nowrap;
      transition: filter var(--rm-transition-fast), transform 160ms cubic-bezier(0.23, 1, 0.32, 1);
      &:active { transform: scale(0.97); }
    }

    @media (hover: hover) and (pointer: fine) {
      .rm-pricing-theme:hover { background: var(--rm-bg-active); color: var(--rm-text-primary); }
      .rm-pricing-back:hover { filter: brightness(1.08); }
    }

    @media (max-width: 480px) {
      .rm-pricing-nav { padding: 10px 12px; gap: 8px; }
      .rm-pricing-brand__text { font-size: 15px; }
      .rm-pricing-back span { display: none; }
      .rm-pricing-back { padding: 0 10px; }
    }

    .rm-pricing-hero {
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 14px;
      padding: 20px 0 10px;
    }

    .rm-pricing-hero__title {
      font-size: clamp(24px, 4.2vw, 32px);
      font-weight: 800;
      color: var(--rm-text-primary);
      letter-spacing: -0.03em;
      max-width: 680px;
      line-height: 1.2;
      margin: 0;
      text-wrap: balance;
    }

    .rm-pricing-hero__subtitle {
      font-size: 15px;
      color: var(--rm-text-secondary);
      max-width: 580px;
      line-height: 1.5;
    }

    .rm-billing-toggle {
      display: flex;
      background: var(--rm-bg-hover);
      padding: 4px;
      border-radius: var(--rm-radius-md);
      gap: 4px;
      margin-top: 10px;
    }

    .rm-toggle-option {
      padding: 8px 18px;
      font-size: 13px;
      font-weight: 500;
      color: var(--rm-text-secondary);
      border-radius: var(--rm-radius-sm);
      display: flex;
      align-items: center;
      gap: 8px;
      transition: all var(--rm-transition-fast);

      &.active {
        background: var(--rm-bg-elevated);
        color: var(--rm-text-primary);
        font-weight: 600;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
      }
    }

    .rm-save-tag {
      font-size: 10px;
      font-weight: 700;
      background: rgba(16, 185, 129, 0.15);
      color: var(--rm-done);
      padding: 2px 6px;
      border-radius: var(--rm-radius-full);
    }
    .rm-page-hero,
    .rm-page-grid,
    .rm-page-section {
      width: 100%;
      max-width: 1100px;
      margin-left: auto;
      margin-right: auto;
      padding-left: clamp(16px, 4vw, 32px);
      padding-right: clamp(16px, 4vw, 32px);
      box-sizing: border-box;
    }

    .rm-pricing-page > * + * {
      margin-block-start: clamp(32px, 5vw, 56px);
    }

    .rm-plans-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 20px;
      align-items: stretch;

      @media (max-width: 1000px) {
        grid-template-columns: 1fr;
      }
    }

    .rm-plan-card {
      display: flex;
      flex-direction: column;
      height: 100%;
    }

    .rm-plan-card--popular {
      border-color: rgba(139, 92, 246, 0.4);
      background: linear-gradient(180deg, rgba(139, 92, 246, 0.05) 0%, var(--rm-bg-card) 40%);
    }

    .rm-plan-header {
      display: flex;
      flex-direction: column;
      gap: 8px;
      min-height: 80px;
    }

    .rm-plan-title-wrap {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .rm-plan-title {
      font-size: 18px;
      font-weight: 700;
      color: var(--rm-text-primary);
    }

    .rm-plan-desc {
      font-size: 12.5px;
      color: var(--rm-text-secondary);
      line-height: 1.4;
    }

    .rm-plan-pricing-box {
      margin: 16px 0 20px;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .rm-price-amount {
      display: flex;
      align-items: baseline;
      gap: 4px;
    }

    .rm-currency {
      font-size: 16px;
      font-weight: 600;
      color: var(--rm-text-secondary);
    }

    .rm-amount {
      font-size: 36px;
      font-weight: 800;
      letter-spacing: -0.03em;
      color: var(--rm-text-primary);
    }

    .rm-period {
      font-size: 13px;
      color: var(--rm-text-muted);
    }

    .rm-plan-free-text {
      font-size: 32px;
      font-weight: 800;
      color: var(--rm-text-primary);
    }

    .rm-billing-note {
      font-size: 11.5px;
      color: var(--rm-text-muted);
    }

    .rm-plan-cta {
      margin-bottom: 20px;
      rm-button {
        width: 100%;
      }
    }

    .rm-plan-divider {
      height: 1px;
      background: var(--rm-border-subtle);
      margin-bottom: 18px;
    }

    .rm-plan-features {
      display: flex;
      flex-direction: column;
      gap: 12px;
      flex: 1;
    }

    .rm-features-label {
      font-size: 11.5px;
      font-weight: 700;
      letter-spacing: 0.04em;
      color: var(--rm-text-muted);
    }

    .rm-features-items {
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .rm-feature-item {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      font-size: 12.5px;
      color: var(--rm-text-primary);
      line-height: 1.4;

      i {
        font-size: 11px;
        margin-top: 4px;
        flex-shrink: 0;
      }
    }

    .text-done { color: var(--rm-done); }
    .text-pro { color: #f59e0b; }
    .font-bold { font-weight: 600; }
    .rm-comparison-section {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .rm-comparison-title {
      font-size: 18px;
      font-weight: 700;
      color: var(--rm-text-primary);
    }

    .rm-table-wrapper {
      border-radius: var(--rm-radius-lg);
      overflow-x: auto;
    }

    .rm-comparison-table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
      font-size: 13px;

      th, td {
        padding: 14px 18px;
        border-bottom: 1px solid var(--rm-border-subtle);
      }

      th {
        font-size: 12px;
        font-weight: 700;
        letter-spacing: 0.04em;
        color: var(--rm-text-muted);
        background: var(--rm-bg-surface);
      }

      tr:last-child td {
        border-bottom: none;
      }
    }
    .rm-faq-section {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .rm-faq-title {
      font-size: 18px;
      font-weight: 700;
      color: var(--rm-text-primary);
    }

    .rm-faq-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;

      @media (max-width: 900px) {
        grid-template-columns: 1fr;
      }
    }

    .rm-faq-item {
      padding: 18px;
      background: var(--rm-bg-card);
      border: 1px solid var(--rm-border-base);
      border-radius: var(--rm-radius-md);
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .rm-faq-q {
      font-size: 14px;
      font-weight: 600;
      color: var(--rm-text-primary);
    }

    .rm-faq-a {
      font-size: 12.5px;
      color: var(--rm-text-secondary);
      line-height: 1.45;

      code {
        font-family: var(--rm-font-mono);
        background: var(--rm-bg-hover);
        padding: 2px 5px;
        border-radius: 4px;
        font-size: 11px;
      }
    }
  `]
})
export class PaywallComponent {
  readonly userService = inject(UserService);
  readonly authService = inject(AuthService);
  readonly themeService = inject(ThemeService);
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
    { feature: 'pay.row.focus', cells: [false, true, true], pro: 1 },
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
