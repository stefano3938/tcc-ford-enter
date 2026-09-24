import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TaskService } from '../../../../core/services/task.service';
import { IdeaService } from '../../../../core/services/idea.service';
import { CardComponent } from '../../../../shared/components/card/card.component';
import { BadgeComponent } from '../../../../shared/components/badge/badge.component';

@Component({
  selector: 'rm-stats-overview',
  standalone: true,
  imports: [CardComponent, BadgeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="rm-stats-grid">

      <rm-card class="rm-stat-card">
        <div class="rm-stat-card__inner">
          <div class="rm-stat-card__header">
            <span class="rm-stat-card__label">PRODUÇÃO TOTAL</span>
            <rm-badge type="neutral" [label]="taskService.totalCount() + ' itens'"></rm-badge>
          </div>
          <div class="rm-stat-card__value-row">
            <span class="rm-stat-card__value">{{ taskService.completionPercentage() }}%</span>
            <span class="rm-stat-card__sublabel">conclusão geral</span>
          </div>
          <div class="rm-stat-card__bar">
            <div class="rm-stat-card__fill" [style.width.%]="taskService.completionPercentage()"></div>
          </div>
        </div>
      </rm-card>
      <rm-card class="rm-stat-card" [glow]="taskService.urgentCount() > 0">
        <div class="rm-stat-card__inner">
          <div class="rm-stat-card__header">
            <span class="rm-stat-card__label">PRIORIDADE MÁXIMA</span>
            <rm-badge type="urgent" label="URGENTE"></rm-badge>
          </div>
          <div class="rm-stat-card__value-row">
            <span class="rm-stat-card__value text-urgent">{{ taskService.urgentCount() }}</span>
            <span class="rm-stat-card__sublabel">requerem atenção</span>
          </div>
          <p class="rm-stat-card__caption">
            @if (taskService.urgentCount() > 0) {
              Foque nestes itens antes das demais tarefas.
            } @else {
              Nenhuma pendência urgente no momento.
            }
          </p>
        </div>
      </rm-card>
      <rm-card class="rm-stat-card">
        <div class="rm-stat-card__inner">
          <div class="rm-stat-card__header">
            <span class="rm-stat-card__label">EM EXECUÇÃO</span>
            <rm-badge type="in-progress" label="ANDAMENTO"></rm-badge>
          </div>
          <div class="rm-stat-card__value-row">
            <span class="rm-stat-card__value text-progress">{{ taskService.inProgressCount() }}</span>
            <span class="rm-stat-card__sublabel">tarefas ativas</span>
          </div>
          <p class="rm-stat-card__caption">
            {{ taskService.todoCount() }} ainda na fila para iniciar.
          </p>
        </div>
      </rm-card>
      <rm-card class="rm-stat-card">
        <div class="rm-stat-card__inner">
          <div class="rm-stat-card__header">
            <span class="rm-stat-card__label">BANCO DE IDEIAS</span>
            <rm-badge type="ai" label="IA READY"></rm-badge>
          </div>
          <div class="rm-stat-card__value-row">
            <span class="rm-stat-card__value text-ai">{{ ideaService.totalIdeas() }}</span>
            <span class="rm-stat-card__sublabel">ideias salvas</span>
          </div>
          <p class="rm-stat-card__caption">
            {{ ideaService.expandedCount() }} já desdobradas pela inteligência.
          </p>
        </div>
      </rm-card>
    </div>
  `,
  styles: [`
    .rm-stats-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 14px;
      margin-bottom: 24px;

      @media (max-width: 1100px) {
        grid-template-columns: repeat(2, 1fr);
      }

      @media (max-width: 600px) {
        grid-template-columns: 1fr;
      }
    }

    .rm-stat-card__inner {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .rm-stat-card__header {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .rm-stat-card__label {
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.05em;
      color: var(--rm-text-muted);
    }

    .rm-stat-card__value-row {
      display: flex;
      align-items: baseline;
      gap: 8px;
    }

    .rm-stat-card__value {
      font-size: 26px;
      font-weight: 800;
      color: var(--rm-text-primary);
      letter-spacing: -0.02em;
      line-height: 1.1;
    }

    .rm-stat-card__sublabel {
      font-size: 12px;
      color: var(--rm-text-secondary);
    }

    .rm-stat-card__bar {
      height: 4px;
      background: var(--rm-bg-hover);
      border-radius: var(--rm-radius-full);
      overflow: hidden;
      margin-top: 4px;
    }

    .rm-stat-card__fill {
      height: 100%;
      background: var(--rm-done);
      border-radius: var(--rm-radius-full);
      transition: width var(--rm-transition-base);
    }

    .rm-stat-card__caption {
      font-size: 12px;
      color: var(--rm-text-secondary);
      line-height: 1.3;
    }

    .text-urgent { color: var(--rm-urgent) !important; }
    .text-progress { color: var(--rm-in-progress) !important; }
    .text-ai { color: #c084fc !important; }
  `]
})
export class StatsOverviewComponent {
  readonly taskService = inject(TaskService);
  readonly ideaService = inject(IdeaService);
}
