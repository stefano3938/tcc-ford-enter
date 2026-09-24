import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { UserService } from '../../../core/services/user.service';
import { ModalComponent } from '../modal/modal.component';
import { ButtonComponent } from '../button/button.component';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'rm-paywall-modal',
  standalone: true,
  imports: [ModalComponent, ButtonComponent, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <rm-modal
      [isOpen]="userService.isPaywallOpen()"
      maxWidth="620px"
      (closed)="userService.closePaywall()"
    >
      <div class="rm-paywall-hero">
        <div class="rm-paywall-hero__icon">
          <rm-icon name="crown" [size]="26"></rm-icon>
        </div>
        <span class="ai-pill">
          <rm-icon name="sparkles" [size]="12"></rm-icon>
          <span>DESBLOQUEIO DE PERFORMANCE</span>
        </span>
        <h2 class="rm-paywall-hero__title">Pense, organize e execute sem limites com RedmindMe Pro</h2>
        <p class="rm-paywall-hero__reason">{{ userService.paywallTriggerReason() }}</p>
      </div>
      <div class="rm-billing-switch">
        <button
          type="button"
          class="rm-billing-btn"
          [class.active]="billingCycle() === 'monthly'"
          (click)="billingCycle.set('monthly')"
        >
          Mensal
        </button>
        <button
          type="button"
          class="rm-billing-btn"
          [class.active]="billingCycle() === 'yearly'"
          (click)="billingCycle.set('yearly')"
        >
          Anual
          <span class="rm-discount-badge">-20% OFF</span>
        </button>
      </div>
      <div class="rm-plan-highlight">
        <div class="rm-plan-highlight__header">
          <div>
            <h3 class="rm-plan-name">RedmindMe Pro</h3>
            <p class="rm-plan-sub">Acesso completo para indivíduos e criadores de alto impacto</p>
          </div>
          <div class="rm-plan-price">
            <span class="rm-plan-price__currency">R$</span>
            <span class="rm-plan-price__val">{{ billingCycle() === 'yearly' ? '24' : '29' }}</span>
            <span class="rm-plan-price__period">/mês</span>
          </div>
        </div>

        <div class="rm-plan-features-list">
          <div class="rm-feature-row">
            <rm-icon name="check" [size]="14" class="text-done"></rm-icon>
            <span><strong>Tarefas Ilimitadas:</strong> crie quantos fluxos e backlogs desejar</span>
          </div>
          <div class="rm-feature-row">
            <rm-icon name="check" [size]="14" class="text-done"></rm-icon>
            <span><strong>Banco de Ideias Sem Limites:</strong> anote insights a qualquer instante</span>
          </div>
          <div class="rm-feature-row">
            <rm-icon name="sparkles" [size]="14" class="text-ai"></rm-icon>
            <span><strong>IA Generativa Ilimitada:</strong> sem restrição de 3 consultas/dia</span>
          </div>
          <div class="rm-feature-row">
            <rm-icon name="check" [size]="14" class="text-done"></rm-icon>
            <span><strong>Decomposição de Ideias em 1-Clique:</strong> converte planos em tarefas reais</span>
          </div>
          <div class="rm-feature-row">
            <rm-icon name="check" [size]="14" class="text-done"></rm-icon>
            <span><strong>Priorização Inteligente:</strong> sugestões contextuais de foco diário</span>
          </div>
        </div>
      </div>

      <div modal-footer class="rm-paywall-footer">
        <rm-button
          variant="subtle"
          (clicked)="userService.closePaywall()"
        >
          Continuar no Starter
        </rm-button>

        <rm-button
          variant="ai"
          size="lg"
          icon="zap"
          [loading]="isUpgrading()"
          (clicked)="confirmUpgrade()"
        >
          Ativar RedmindMe Pro Agora
        </rm-button>
      </div>
    </rm-modal>
  `,
  styles: [`
    .rm-paywall-hero {
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 10px;
      padding: 10px 0 16px;
    }

    .rm-paywall-hero__icon {
      width: 52px;
      height: 52px;
      border-radius: var(--rm-radius-lg);
      background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
      color: #000000;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 20px rgba(245, 158, 11, 0.35);
      margin-bottom: 4px;
    }

    .rm-paywall-hero__title {
      font-size: 20px;
      font-weight: 700;
      color: var(--rm-text-primary);
      letter-spacing: -0.02em;
      line-height: 1.3;
    }

    .rm-paywall-hero__reason {
      font-size: 13px;
      color: var(--rm-text-secondary);
      max-width: 460px;
      line-height: 1.4;
    }

    .rm-billing-switch {
      display: flex;
      background: var(--rm-bg-hover);
      padding: 4px;
      border-radius: var(--rm-radius-md);
      align-self: center;
      gap: 4px;
      margin: 4px auto 14px;
    }

    .rm-billing-btn {
      padding: 6px 16px;
      font-size: 12.5px;
      font-weight: 500;
      color: var(--rm-text-secondary);
      border-radius: var(--rm-radius-sm);
      display: flex;
      align-items: center;
      gap: 6px;
      transition: all var(--rm-transition-fast);

      &.active {
        background: var(--rm-bg-elevated);
        color: var(--rm-text-primary);
        font-weight: 600;
        box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
      }
    }

    .rm-discount-badge {
      font-size: 10px;
      font-weight: 700;
      background: rgba(16, 185, 129, 0.15);
      color: var(--rm-done);
      padding: 2px 5px;
      border-radius: var(--rm-radius-full);
    }

    .rm-plan-highlight {
      background: var(--rm-bg-surface);
      border: 1px solid var(--rm-border-glow);
      border-radius: var(--rm-radius-lg);
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 16px;
      box-shadow: 0 0 25px rgba(99, 102, 241, 0.12);
    }

    .rm-plan-highlight__header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 16px;
      border-bottom: 1px solid var(--rm-border-subtle);
      padding-bottom: 14px;
    }

    .rm-plan-name {
      font-size: 17px;
      font-weight: 700;
      color: var(--rm-text-primary);
    }

    .rm-plan-sub {
      font-size: 12.5px;
      color: var(--rm-text-secondary);
      margin-top: 2px;
    }

    .rm-plan-price {
      display: flex;
      align-items: baseline;
      gap: 2px;
    }

    .rm-plan-price__currency {
      font-size: 14px;
      font-weight: 600;
      color: var(--rm-text-secondary);
    }

    .rm-plan-price__val {
      font-size: 28px;
      font-weight: 800;
      color: var(--rm-text-primary);
      letter-spacing: -0.02em;
    }

    .rm-plan-price__period {
      font-size: 12px;
      color: var(--rm-text-muted);
    }

    .rm-plan-features-list {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .rm-feature-row {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 13px;
      color: var(--rm-text-primary);
    }

    .text-done { color: var(--rm-done); }
    .text-ai { color: var(--rm-accent); }

    .rm-paywall-footer {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
  `]
})
export class PaywallModalComponent {
  readonly userService = inject(UserService);
  readonly billingCycle = signal<'monthly' | 'yearly'>('yearly');
  readonly isUpgrading = signal<boolean>(false);

  confirmUpgrade(): void {
    this.isUpgrading.set(true);
    setTimeout(() => {
      this.userService.upgradeToPro();
      this.isUpgrading.set(false);
    }, 600);
  }
}
