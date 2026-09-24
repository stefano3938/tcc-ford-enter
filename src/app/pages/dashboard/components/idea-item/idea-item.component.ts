import { ChangeDetectionStrategy, Component, inject, input, output, signal } from '@angular/core';
import { Idea } from '../../../../core/models/idea.model';
import { IdeaService } from '../../../../core/services/idea.service';
import { I18nService } from '../../../../core/services/i18n.service';
import { AiService } from '../../../../core/services/ai.service';
import { BadgeComponent } from '../../../../shared/components/badge/badge.component';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { CardComponent } from '../../../../shared/components/card/card.component';
import { IconComponent } from '../../../../shared/components/icon/icon.component';

@Component({
  selector: 'rm-idea-item',
  standalone: true,
  imports: [BadgeComponent, ButtonComponent, CardComponent, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './idea-item.component.html',
  styleUrl: './idea-item.component.css'
})
export class IdeaItemComponent {
  readonly i18n = inject(I18nService);
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
      description: this.i18n.t('idea.derived', { title: this.idea().title }),
      status: 'todo' as const,
      priority: (idx === 0 ? 'high' : 'medium') as any,
      tags: [...this.idea().tags, 'Decomposição-IA'],
      estimatedMinutes: 30
    }));

    this.aiService.convertSuggestedTasksToLive(mapped);
  }
}
