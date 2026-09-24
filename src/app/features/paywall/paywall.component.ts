import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { UserService } from '../../core/services/user.service';
import { PricingPlan } from '../../core/models/user.model';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { BadgeComponent } from '../../shared/components/badge/badge.component';
import { CardComponent } from '../../shared/components/card/card.component';

@Component({
  selector: 'rm-paywall',
  standalone: true,
  imports: [ButtonComponent, BadgeComponent, CardComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="rm-pricing-page">

      <div class="rm-pricing-hero">
        <span class="ai-pill">PLANOS E MONETIZAÇÃO</span>
        <h1 class="rm-pricing-hero__title">Poder sem atrito para quem executa em alto nível</h1>
        <p class="rm-pricing-hero__subtitle">
          Escolha o plano ideal para orquestrar suas ideias, tarefas diárias e projetos de longo prazo com inteligência artificial.
        </p>
        <div class="rm-billing-toggle">
          <button
            type="button"
            class="rm-toggle-option"
            [class.active]="billing() === 'monthly'"
            (click)="billing.set('monthly')"
          >
            Faturamento Mensal
          </button>
          <button
            type="button"
            class="rm-toggle-option"
            [class.active]="billing() === 'yearly'"
            (click)="billing.set('yearly')"
          >
            Faturamento Anual
            <span class="rm-save-tag">-20% OFF</span>
          </button>
        </div>
      </div>
      <div class="rm-plans-grid">
        @for (plan of userService.pricingPlans; track plan.id) {
          <rm-card
            class="rm-plan-card"
            [glow]="!!plan.isPopular"
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
                <span class="rm-plan-free-text">Gratuito</span>
                <span class="rm-plan-period">para sempre</span>
              } @else {
                <div class="rm-price-amount">
                  <span class="rm-currency">R$</span>
                  <span class="rm-amount">
                    {{ billing() === 'yearly' ? plan.priceYearly : plan.priceMonthly }}
                  </span>
                  <span class="rm-period">/mês</span>
                </div>
                @if (billing() === 'yearly') {
                  <span class="rm-billing-note">Faturado anualmente (R$ {{ plan.priceYearly * 12 }}/ano)</span>
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
                  Seu Plano Atual
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
                  Voltar para Starter
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
              <span class="rm-features-label">Recursos inclusos:</span>
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
      <div class="rm-comparison-section">
        <h3 class="rm-comparison-title">Comparação Detalhada de Capacidades</h3>

        <div class="rm-table-wrapper glass-panel">
          <table class="rm-comparison-table">
            <thead>
              <tr>
                <th class="col-feature">Recurso</th>
                <th class="col-plan">Starter</th>
                <th class="col-plan text-pro">RedmindMe Pro</th>
                <th class="col-plan">Team Studio</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Tarefas Ativas</td>
                <td>8 tarefas</td>
                <td class="text-pro font-bold">Ilimitadas</td>
                <td>Ilimitadas</td>
              </tr>
              <tr>
                <td>Banco de Ideias</td>
                <td>4 ideias</td>
                <td class="text-pro font-bold">Ilimitadas</td>
                <td>Ilimitadas</td>
              </tr>
              <tr>
                <td>Consultas de IA Generativa</td>
                <td>3 / dia</td>
                <td class="text-pro font-bold">Ilimitadas</td>
                <td>Ilimitadas</td>
              </tr>
              <tr>
                <td>Decomposição de Ideias em Tarefas</td>
                <td>—</td>
                <td class="text-done font-bold"><i class="pi pi-check"></i></td>
                <td class="text-done font-bold"><i class="pi pi-check"></i></td>
              </tr>
              <tr>
                <td>Visualização em Kanban & Lista</td>
                <td><i class="pi pi-check text-done"></i></td>
                <td class="text-done font-bold"><i class="pi pi-check"></i></td>
                <td class="text-done font-bold"><i class="pi pi-check"></i></td>
              </tr>
              <tr>
                <td>Priorização Inteligente de Foco</td>
                <td>—</td>
                <td class="text-done font-bold"><i class="pi pi-check"></i></td>
                <td class="text-done font-bold"><i class="pi pi-check"></i></td>
              </tr>
              <tr>
                <td>Armazenamento Local Seguro</td>
                <td><i class="pi pi-check text-done"></i></td>
                <td><i class="pi pi-check text-done"></i></td>
                <td><i class="pi pi-check text-done"></i></td>
              </tr>
              <tr>
                <td>Workspaces para Times</td>
                <td>—</td>
                <td>—</td>
                <td class="text-done font-bold"><i class="pi pi-check"></i></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div class="rm-faq-section">
        <h3 class="rm-faq-title">Perguntas Frequentes</h3>
        <div class="rm-faq-grid">
          <div class="rm-faq-item">
            <h4 class="rm-faq-q">Como os dados são salvos?</h4>
            <p class="rm-faq-a">
              Seus dados ficam armazenados com segurança diretamente no seu navegador, garantindo privacidade total e acesso instantâneo sem dependência de servidores externos. Você mantém o controle completo das suas informações.
            </p>
          </div>

          <div class="rm-faq-item">
            <h4 class="rm-faq-q">O que acontece ao atingir o limite no plano Starter?</h4>
            <p class="rm-faq-a">
              Ao atingir o limite do plano Starter, o aplicativo apresenta a opção de upgrade para o Pro, desbloqueando tarefas, ideias e consultas de IA ilimitadas com um único clique.
            </p>
          </div>

          <div class="rm-faq-item">
            <h4 class="rm-faq-q">Como funciona o assistente de IA?</h4>
            <p class="rm-faq-a">
              O RedmindMe Copilot analisa suas metas e gera respostas em tempo real, transformando objetivos em tarefas estruturadas e prontas para o seu quadro Kanban.
            </p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .rm-pricing-page {
      display: flex;
      flex-direction: column;
      gap: 40px;
      padding-bottom: 60px;
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
      font-size: 32px;
      font-weight: 800;
      color: var(--rm-text-primary);
      letter-spacing: -0.03em;
      max-width: 680px;
      line-height: 1.2;

      @media (max-width: 600px) {
        font-size: 24px;
      }
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
      margin-top: 20px;
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
      margin-top: 10px;
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

  readonly billing = signal<'monthly' | 'yearly'>('yearly');
  readonly isProcessing = signal<boolean>(false);
  readonly planToSelect = signal<string>('');

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
    }, 600);
  }
}
