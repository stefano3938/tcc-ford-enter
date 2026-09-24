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
  template: `
    <div
      class="rm-task-item"
      [class.rm-task-item--done]="task().status === 'done'"
      [class.rm-task-item--urgent]="task().priority === 'urgent' && task().status !== 'done'"
    >

      <button
        type="button"
        class="rm-task-checkbox"
        role="checkbox"
        [attr.aria-checked]="task().status === 'done'"
        [attr.aria-label]="'Alternar status da tarefa ' + task().title"
        [class.rm-task-checkbox--checked]="task().status === 'done'"
        [class.rm-task-checkbox--in-progress]="task().status === 'in-progress'"
        (click)="taskService.toggleStatus(task().id)"
      >
        @if (task().status === 'done') {
          <rm-icon name="check" [size]="12"></rm-icon>
        } @else if (task().status === 'in-progress') {
          <span class="rm-task-checkbox__dot" aria-hidden="true"></span>
        }
      </button>
      <div class="rm-task-main" (click)="edit.emit(task())">
        <div class="rm-task-header-row">
          <h4 class="rm-task-title">{{ task().title }}</h4>

          <div class="rm-task-badges">
            @if (task().isAiGenerated) {
              <rm-badge type="ai" icon="sparkles" label="IA"></rm-badge>
            }
            <rm-badge [type]="task().priority" [label]="task().priority.toUpperCase()"></rm-badge>
            <rm-badge [type]="task().status" [label]="statusLabel(task().status)"></rm-badge>
          </div>
        </div>

        @if (task().description) {
          <p class="rm-task-desc">{{ task().description }}</p>
        }

        <div class="rm-task-meta-row">
          @if (task().dueDate) {
            <span class="rm-task-meta rm-task-meta--date">
              <rm-icon name="calendar" [size]="12"></rm-icon>
              <span>{{ task().dueDate }}</span>
            </span>
          }

          @if (task().estimatedMinutes) {
            <span class="rm-task-meta">
              <rm-icon name="clock" [size]="12"></rm-icon>
              <span>{{ task().estimatedMinutes }} min</span>
            </span>
          }
          <div class="rm-task-tags">
            @for (tag of task().tags; track tag) {
              <span class="rm-task-tag">{{ tag }}</span>
            }
          </div>
        </div>
      </div>
      <div class="rm-task-actions">
        <button
          type="button"
          class="rm-task-action-btn"
          (click)="edit.emit(task())"
          title="Editar tarefa"
          aria-label="Editar tarefa"
        >
          <rm-icon name="edit" [size]="13"></rm-icon>
        </button>

        <button
          type="button"
          class="rm-task-action-btn rm-task-action-btn--delete"
          (click)="taskService.deleteTask(task().id)"
          title="Excluir tarefa"
          aria-label="Excluir tarefa"
        >
          <rm-icon name="trash" [size]="13"></rm-icon>
        </button>
      </div>
    </div>
  `,
  styles: [`
    .rm-task-item {
      display: flex;
      align-items: flex-start;
      gap: 14px;
      padding: 14px 16px;
      background: var(--rm-bg-card);
      border: 1px solid var(--rm-border-base);
      border-radius: var(--rm-radius-md);
      transition: all var(--rm-transition-fast);
      position: relative;

      &:hover {
        border-color: var(--rm-border-strong);
        background: var(--rm-bg-elevated);
        box-shadow: 0 4px 14px -2px rgba(0, 0, 0, 0.08);
      }
    }

    .rm-task-item--urgent {
      border-left: 3px solid var(--rm-urgent);
    }

    .rm-task-item--done {
      opacity: 0.65;
      .rm-task-title {
        text-decoration: line-through;
        color: var(--rm-text-muted);
      }
    }

    .rm-task-checkbox {
      width: 20px;
      height: 20px;
      border-radius: 6px;
      border: 1.5px solid var(--rm-border-strong);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-top: 2px;
      flex-shrink: 0;
      transition: all var(--rm-transition-fast);
      background: transparent;
      color: #ffffff;

      &:hover {
        border-color: var(--rm-accent);
      }
    }

    .rm-task-checkbox--checked {
      background: var(--rm-done);
      border-color: var(--rm-done);
    }

    .rm-task-checkbox--in-progress {
      border-color: var(--rm-in-progress);
    }

    .rm-task-checkbox__dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: var(--rm-in-progress);
    }

    .rm-task-main {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 6px;
      cursor: pointer;
    }

    .rm-task-header-row {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 12px;
      flex-wrap: wrap;
    }

    .rm-task-title {
      font-size: 14px;
      font-weight: 600;
      color: var(--rm-text-primary);
      line-height: 1.35;
      letter-spacing: -0.01em;
    }

    .rm-task-badges {
      display: flex;
      align-items: center;
      gap: 6px;
      flex-shrink: 0;
    }

    .rm-task-desc {
      font-size: 12.5px;
      color: var(--rm-text-secondary);
      line-height: 1.4;
    }

    .rm-task-meta-row {
      display: flex;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;
      margin-top: 2px;
    }

    .rm-task-meta {
      font-size: 11.5px;
      color: var(--rm-text-muted);
      display: flex;
      align-items: center;
      gap: 5px;
    }

    .rm-task-meta--date {
      color: var(--rm-text-secondary);
    }

    .rm-task-tags {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .rm-task-tag {
      font-size: 11px;
      color: var(--rm-text-muted);
      background: var(--rm-bg-hover);
      padding: 1px 6px;
      border-radius: var(--rm-radius-sm);
    }

    .rm-task-actions {
      display: flex;
      align-items: center;
      gap: 4px;
      opacity: 0.7;
      transition: opacity var(--rm-transition-fast);

      &:hover {
        opacity: 1;
      }
    }

    .rm-task-action-btn {
      width: 28px;
      height: 28px;
      border-radius: var(--rm-radius-sm);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--rm-text-muted);
      transition: all var(--rm-transition-fast);

      &:hover {
        background: var(--rm-bg-hover);
        color: var(--rm-text-primary);
      }
    }

    .rm-task-action-btn--delete:hover {
      background: rgba(244, 63, 94, 0.1);
      color: var(--rm-urgent);
    }
  `]
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
