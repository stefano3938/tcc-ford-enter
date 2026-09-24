import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { Task } from '../../../../core/models/task.model';
import { TaskService } from '../../../../core/services/task.service';
import { I18nService } from '../../../../core/services/i18n.service';
import { BadgeComponent } from '../../../../shared/components/badge/badge.component';
import { IconComponent } from '../../../../shared/components/icon/icon.component';

@Component({
  selector: 'rm-task-item',
  standalone: true,
  imports: [BadgeComponent, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './task-item.component.html',
  styleUrl: './task-item.component.css'
})
export class TaskItemComponent {
  readonly i18n = inject(I18nService);
  readonly taskService = inject(TaskService);
  readonly task = input.required<Task>();
  readonly edit = output<Task>();

  statusLabel(status: string): string {
    const keys: Record<string, string> = { todo: 'dash.todo', 'in-progress': 'dash.doing', done: 'status.done' };
    const key = keys[status];
    return key ? this.i18n.t(key) : status;
  }
}
