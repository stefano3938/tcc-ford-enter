import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  model,
  signal
} from '@angular/core';
import { Task, TaskPriority, TaskStatus } from '../../../../core/models/task.model';
import { TaskService } from '../../../../core/services/task.service';
import { I18nService } from '../../../../core/services/i18n.service';
import { ModalComponent } from '../../../../shared/components/modal/modal.component';
import { InputComponent } from '../../../../shared/components/input/input.component';
import { ButtonComponent } from '../../../../shared/components/button/button.component';

@Component({
  selector: 'rm-task-form-modal',
  standalone: true,
  imports: [ModalComponent, InputComponent, ButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './task-form-modal.component.html',
  styleUrl: './task-form-modal.component.css'
})
export class TaskFormModalComponent {
  readonly i18n = inject(I18nService);
  private readonly taskService = inject(TaskService);

  readonly isOpen = model<boolean>(false);
  readonly editingTask = input<Task | null>(null);
  readonly title = signal<string>('');
  readonly description = signal<string>('');
  readonly status = signal<TaskStatus>('todo');
  readonly priority = signal<TaskPriority>('medium');
  readonly dueDate = signal<string>('');
  readonly estimatedMinutes = signal<number>(30);
  readonly selectedTags = signal<string[]>([]);
  readonly newTagInput = signal<string>('');
  readonly titleError = signal<string | undefined>(undefined);

  readonly availableTags = computed(() => {
    const all = this.taskService.allTags();
    const selected = this.selectedTags();
    return all.filter(t => !selected.includes(t));
  });

  constructor() {
    effect(() => {
      const task = this.editingTask();
      if (task) {
        this.title.set(task.title);
        this.description.set(task.description || '');
        this.status.set(task.status);
        this.priority.set(task.priority);
        this.dueDate.set(task.dueDate || '');
        this.estimatedMinutes.set(task.estimatedMinutes || 30);
        this.selectedTags.set([...task.tags]);
        this.newTagInput.set('');
      } else {
        this.resetForm();
      }
    });
  }

  addTagFromSelect(tag: string): void {
    const t = tag.trim().replace(/^#/, '');
    if (!t || this.selectedTags().includes(t)) return;
    this.selectedTags.update(list => [...list, t]);
  }

  addNewTag(): void {
    const t = this.newTagInput().trim().replace(/^#/, '');
    if (!t || this.selectedTags().includes(t)) return;
    this.selectedTags.update(list => [...list, t]);
    this.newTagInput.set('');
  }

  removeTag(tag: string): void {
    this.selectedTags.update(list => list.filter(t => t !== tag));
  }

  onSubmit(event: Event): void {
    event.preventDefault();
    this.saveTask();
  }

  saveTask(): void {
    const rawTitle = this.title().trim();
    if (!rawTitle) {
      this.titleError.set(this.i18n.t('task.form.titleRequired'));
      return;
    }
    this.titleError.set(undefined);

    const parsedTags = this.selectedTags().map(t => t.trim()).filter(t => t.length > 0);

    const existing = this.editingTask();
    if (existing) {
      this.taskService.updateTask(existing.id, {
        title: rawTitle,
        description: this.description().trim() || undefined,
        status: this.status(),
        priority: this.priority(),
        dueDate: this.dueDate() || undefined,
        estimatedMinutes: this.estimatedMinutes() || undefined,
        tags: parsedTags
      });
    } else {
      this.taskService.addTask({
        title: rawTitle,
        description: this.description().trim() || undefined,
        status: this.status(),
        priority: this.priority(),
        dueDate: this.dueDate() || undefined,
        estimatedMinutes: this.estimatedMinutes() || undefined,
        tags: parsedTags.length > 0 ? parsedTags : ['Geral']
      });
    }

    this.onClose();
  }

  onClose(): void {
    this.isOpen.set(false);
    this.resetForm();
  }

  private resetForm(): void {
    this.title.set('');
    this.description.set('');
    this.status.set('todo');
    this.priority.set('medium');
    this.dueDate.set('');
    this.estimatedMinutes.set(30);
    this.selectedTags.set([]);
    this.newTagInput.set('');
    this.titleError.set(undefined);
  }
}
