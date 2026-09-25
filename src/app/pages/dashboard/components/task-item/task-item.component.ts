import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { Task } from '../../../../core/models/task.model';
import { TaskService } from '../../../../core/services/task.service';
import { I18nService, LangCode } from '../../../../core/services/i18n.service';
import { BadgeComponent } from '../../../../shared/components/badge/badge.component';
import { IconComponent } from '../../../../shared/components/icon/icon.component';

const LOCALES: Record<LangCode, string> = { pt: 'pt-BR', en: 'en-US', es: 'es-ES' };

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

  /** "25 set" in the reader's language instead of the raw "2026-09-25"; flags overdue open tasks */
  readonly due = computed(() => {
    const raw = this.task().dueDate;
    if (!raw) return null;

    const [year, month, day] = raw.split('-').map(Number);
    if (!year || !month || !day) return { iso: raw, label: raw, overdue: false };

    // Built from parts, so the date never shifts a day with the user's time zone
    const date = new Date(year, month - 1, day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const label = new Intl.DateTimeFormat(LOCALES[this.i18n.lang()], {
      day: 'numeric',
      month: 'short',
      ...(year !== today.getFullYear() ? { year: 'numeric' as const } : {})
    }).format(date);

    return { iso: raw, label, overdue: date < today && this.task().status !== 'done' };
  });

  /** in-progress is the "mixed" state of the three-way checkbox */
  readonly ariaChecked = computed(() => {
    const status = this.task().status;
    return status === 'done' ? 'true' : status === 'in-progress' ? 'mixed' : 'false';
  });
}
