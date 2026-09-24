import { ChangeDetectionStrategy, Component, inject, input, output, signal } from '@angular/core';
import { Idea } from '../../../../core/models/idea.model';
import { IdeaService } from '../../../../core/services/idea.service';
import { AiService } from '../../../../core/services/ai.service';
import { BadgeComponent } from '../../../../shared/components/badge/badge.component';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { CardComponent } from '../../../../shared/components/card/card.component';

@Component({
  selector: 'rm-idea-item',
  standalone: true,
  imports: [BadgeComponent, ButtonComponent, CardComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <rm-card class="rm-idea-card" [glow]="idea().isExpandedByAi">
      <div class="rm-idea-header">
        <div class="rm-idea-title-area">
          <h4 class="rm-idea-title">{{ idea().title }}</h4>
          <div class="rm-idea-badges">
            <rm-badge type="neutral" [label]="idea().category.toUpperCase()"></rm-badge>
            @if (idea().isExpandedByAi) {
              <rm-badge type="ai" icon="pi-sparkles" label="EXPANDIDA"></rm-badge>
            }
          </div>
        </div>

        <div class="rm-idea-actions">
          <button
            type="button"
            class="rm-idea-icon-btn"
            (click)="edit.emit(idea())"
            title="Editar ideia"
            aria-label="Editar ideia"
          >
            <i class="pi pi-pencil" aria-hidden="true"></i>
          </button>
          <button
            type="button"
            class="rm-idea-icon-btn rm-idea-icon-btn--delete"
            (click)="ideaService.deleteIdea(idea().id)"
            title="Excluir ideia"
            aria-label="Excluir ideia"
          >
            <i class="pi pi-trash" aria-hidden="true"></i>
          </button>
        </div>
      </div>

      <p class="rm-idea-summary">{{ idea().summary }}</p>
      <div class="rm-idea-tags">
        @for (tag of idea().tags; track tag) {
          <span class="rm-idea-tag">{{ tag }}</span>
        }
      </div>
      @if (idea().isExpandedByAi && idea().aiSuggestedBreakdown; as breakdown) {
        <div class="rm-idea-breakdown">
          <div class="rm-breakdown-header">
            <i class="pi pi-sparkles text-ai" aria-hidden="true"></i>
            <span class="rm-breakdown-title">Análise Estratégica & Decomposição por IA</span>
          </div>

          <p class="rm-breakdown-overview">{{ breakdown.overview }}</p>

          <div class="rm-breakdown-steps">
            <span class="rm-breakdown-section-title">Passos Acionáveis Recomendados:</span>
            <ul class="rm-steps-list">
              @for (step of breakdown.actionableSteps; track step) {
                <li class="rm-step-item">
                  <i class="pi pi-arrow-right" aria-hidden="true"></i>
                  <span>{{ step }}</span>
                </li>
              }
            </ul>
          </div>

          <div class="rm-breakdown-risks">
            <span class="rm-breakdown-section-title text-urgent">Possíveis Riscos a Mitigar:</span>
            <ul class="rm-risks-list">
              @for (risk of breakdown.potentialRisks; track risk) {
                <li class="rm-risk-item">
                  <i class="pi pi-exclamation-triangle" aria-hidden="true"></i>
                  <span>{{ risk }}</span>
                </li>
              }
            </ul>
          </div>

          <div class="rm-breakdown-footer">
            <rm-button
              variant="ai"
              size="sm"
              icon="pi-plus"
              (clicked)="convertStepsToTasks()"
            >
              Converter Passos em Tarefas Reais
            </rm-button>
          </div>
        </div>
      } @else {

        <div class="rm-idea-footer">
          <rm-button
            variant="outline"
            size="sm"
            icon="pi-sparkles"
            [loading]="isExpanding()"
            (clicked)="expandWithAi()"
          >
            Expandir com RedmindMe IA
          </rm-button>
        </div>
      }
    </rm-card>
  `,
  styles: [`
    .rm-idea-card {
      margin-bottom: 14px;
    }

    .rm-idea-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 12px;
    }

    .rm-idea-title-area {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .rm-idea-title {
      font-size: 15px;
      font-weight: 600;
      color: var(--rm-text-primary);
      letter-spacing: -0.01em;
      line-height: 1.35;
    }

    .rm-idea-badges {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .rm-idea-actions {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .rm-idea-icon-btn {
      width: 28px;
      height: 28px;
      border-radius: var(--rm-radius-sm);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--rm-text-muted);
      font-size: 12px;
      transition: all var(--rm-transition-fast);

      &:hover {
        background: var(--rm-bg-hover);
        color: var(--rm-text-primary);
      }
    }

    .rm-idea-icon-btn--delete:hover {
      background: rgba(244, 63, 94, 0.15);
      color: var(--rm-urgent);
    }

    .rm-idea-summary {
      font-size: 13px;
      color: var(--rm-text-secondary);
      line-height: 1.45;
    }

    .rm-idea-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }

    .rm-idea-tag {
      font-size: 11px;
      color: var(--rm-text-muted);
      background: var(--rm-bg-hover);
      padding: 2px 7px;
      border-radius: var(--rm-radius-sm);
    }

    .rm-idea-footer {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      padding-top: 8px;
      border-top: 1px solid var(--rm-border-subtle);
    }
    .rm-idea-breakdown {
      margin-top: 10px;
      padding: 16px;
      background: var(--rm-bg-surface);
      border: 1px solid rgba(139, 92, 246, 0.3);
      border-radius: var(--rm-radius-md);
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .rm-breakdown-header {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .rm-breakdown-title {
      font-size: 12.5px;
      font-weight: 700;
      color: #c084fc;
      letter-spacing: -0.01em;
    }

    .rm-breakdown-overview {
      font-size: 12.5px;
      color: var(--rm-text-primary);
      line-height: 1.4;
    }

    .rm-breakdown-section-title {
      font-size: 11.5px;
      font-weight: 600;
      color: var(--rm-text-secondary);
      display: block;
      margin-bottom: 6px;
    }

    .rm-steps-list,
    .rm-risks-list {
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .rm-step-item,
    .rm-risk-item {
      display: flex;
      align-items: flex-start;
      gap: 8px;
      font-size: 12.5px;
      line-height: 1.4;
      color: var(--rm-text-primary);

      i {
        font-size: 10px;
        margin-top: 4px;
        flex-shrink: 0;
      }
    }

    .rm-step-item i { color: var(--rm-accent); }
    .rm-risk-item i { color: var(--rm-urgent); }

    .rm-breakdown-footer {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      padding-top: 8px;
      border-top: 1px solid var(--rm-border-subtle);
    }

    .text-ai { color: #c084fc; }
    .text-urgent { color: var(--rm-urgent); }
  `]
})
export class IdeaItemComponent {
  readonly ideaService = inject(IdeaService);
  private readonly aiService = inject(AiService);

  readonly idea = input.required<Idea>();
  readonly edit = output<Idea>();

  readonly isExpanding = signal<boolean>(false);

  async expandWithAi(): Promise<void> {
    this.isExpanding.set(true);
    try {
      const breakdown = await this.aiService.expandIdea(this.idea());
      this.ideaService.attachAiBreakdown(this.idea().id, breakdown);
    } catch {

    } finally {
      this.isExpanding.set(false);
    }
  }

  convertStepsToTasks(): void {
    const breakdown = this.idea().aiSuggestedBreakdown;
    if (!breakdown) return;

    const mapped = breakdown.actionableSteps.map((step, idx) => ({
      title: step,
      description: `Derivado da ideia "${this.idea().title}".`,
      status: 'todo' as const,
      priority: (idx === 0 ? 'high' : 'medium') as any,
      tags: [...this.idea().tags, 'Decomposição-IA'],
      estimatedMinutes: 30
    }));

    this.aiService.convertSuggestedTasksToLive(mapped);
  }
}
