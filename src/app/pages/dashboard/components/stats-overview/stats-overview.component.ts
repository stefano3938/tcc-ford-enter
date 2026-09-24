import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TaskService } from '../../../../core/services/task.service';
import { I18nService } from '../../../../core/services/i18n.service';
import { IdeaService } from '../../../../core/services/idea.service';

@Component({
  selector: 'rm-stats-overview',
  standalone: true,
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './stats-overview.component.html',
  styleUrl: './stats-overview.component.css'
})
export class StatsOverviewComponent {
  readonly i18n = inject(I18nService);
  readonly taskService = inject(TaskService);
  readonly ideaService = inject(IdeaService);
}
