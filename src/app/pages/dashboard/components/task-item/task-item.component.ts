import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { Task } from '../../../../core/models/task.model';
import { TaskService } from '../../../../core/services/task.service';
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
  readonly taskService = inject(TaskService);
  readonly task = input.required<Task>();
  readonly edit = output<Task>();

  statusLabel(status: string): string {
    switch (status) {
      case 'todo': return 'A FAZER';
      case 'in-progress': return 'EM ANDAMENTO';
      case 'done': return 'CONCLUÍDO';
      default: return status.toUpperCase();
    }
  }
}
