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
import { ModalComponent } from '../../../../shared/components/modal/modal.component';
import { InputComponent } from '../../../../shared/components/input/input.component';
import { ButtonComponent } from '../../../../shared/components/button/button.component';

@Component({
  selector: 'rm-task-form-modal',
  standalone: true,
  imports: [ModalComponent, InputComponent, ButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <rm-modal
      [isOpen]="isOpen()"
      [title]="editingTask() ? 'Editar Tarefa' : 'Nova Tarefa'"
      [subtitle]="editingTask() ? 'Atualize os detalhes da tarefa selecionada.' : 'Adicione uma nova tarefa ao seu fluxo de trabalho.'"
      maxWidth="540px"
      (closed)="onClose()"
    >
      <form (submit)="onSubmit($event)" class="rm-form-grid">

        <rm-input
          label="Título da Tarefa"
          placeholder="Ex: Refatorar store com Signals"
          [(value)]="title"
          [required]="true"
          [errorMessage]="titleError()"
          prefixIcon="edit"
        ></rm-input>
        <rm-input
          label="Descrição / Critérios de Aceite"
          placeholder="Descreva detalhes, dependências ou contexto..."
          [(value)]="description"
          [multiline]="true"
          [rows]="2"
        ></rm-input>
        <div class="rm-form-row">
          <div class="rm-form-group">
            <label class="rm-form-label">Status</label>
            <select
              class="rm-select"
              [value]="status()"
              (change)="status.set($any($event.target).value)"
            >
              <option value="todo">A Fazer</option>
              <option value="in-progress">Em Andamento</option>
              <option value="done">Concluída</option>
            </select>
          </div>

          <div class="rm-form-group">
            <label class="rm-form-label">Prioridade</label>
            <select
              class="rm-select"
              [value]="priority()"
              (change)="priority.set($any($event.target).value)"
            >
              <option value="low">Baixa</option>
              <option value="medium">Média</option>
              <option value="high">Alta</option>
              <option value="urgent">Urgente</option>
            </select>
          </div>
        </div>
        <div class="rm-form-row">
          <div class="rm-form-group">
            <label class="rm-form-label">Data de Entrega</label>
            <input
              type="date"
              class="rm-date-input"
              [value]="dueDate()"
              (input)="dueDate.set($any($event.target).value)"
            />
          </div>

          <div class="rm-form-group">
            <label class="rm-form-label">Tempo Estimado (min)</label>
            <input
              type="number"
              class="rm-number-input"
              placeholder="30"
              min="5"
              step="5"
              [value]="estimatedMinutes()"
              (input)="estimatedMinutes.set(+$any($event.target).value)"
            />
          </div>
        </div>
        <div class="rm-form-group">
          <label class="rm-form-label">Tags</label>
          @if (selectedTags().length > 0) {
            <div class="rm-selected-tags">
              @for (tag of selectedTags(); track tag) {
                <span class="rm-tag-chip active">{{ tag }}<button type="button" class="rm-tag-remove" (click)="removeTag(tag)" aria-label="Remover tag {{ tag }}"><span aria-hidden="true">×</span></button></span>
              }
            </div>
          }
          <div class="rm-tags-select-row">
            <div class="rm-select-wrap">
              <select
                class="rm-select"
                [value]="''"
                (change)="addTagFromSelect($any($event.target).value); $any($event.target).value=''"
                aria-label="Selecionar tag existente"
              >
                <option value="" disabled selected>Selecionar tag...</option>
                @for (tag of availableTags(); track tag) {
                  <option [value]="tag">{{ tag }}</option>
                }
                @if (availableTags().length === 0) {
                  <option value="" disabled>Nenhuma tag disponível</option>
                }
              </select>
              <span class="rm-select-arrow" aria-hidden="true">▾</span>
            </div>
          </div>
        </div>
      </form>

      <div modal-footer class="rm-modal-actions">
        <rm-button variant="subtle" (clicked)="onClose()">
          Cancelar
        </rm-button>
        <rm-button
          variant="primary"
          [icon]="editingTask() ? 'check' : 'plus'"
          (clicked)="saveTask()"
        >
          {{ editingTask() ? 'Salvar Alterações' : 'Criar Tarefa' }}
        </rm-button>
      </div>
    </rm-modal>
  `,
  styles: [`
    .rm-form-grid {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .rm-form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;

      @media (max-width: 500px) {
        grid-template-columns: 1fr;
      }
    }

    .rm-form-group {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .rm-form-label {
      font-size: 11.5px;
      font-weight: 600;
      color: var(--rm-text-secondary);
    }

    .rm-select,
    .rm-date-input,
    .rm-number-input {
      width: 100%;
      height: 36px;
      padding: 0 10px;
      background: var(--rm-bg-surface);
      border: 1px solid var(--rm-border-base);
      border-radius: var(--rm-radius-md);
      color: var(--rm-text-primary);
      font-size: 13px;
      outline: none;
      transition: all var(--rm-transition-fast);

      &:focus {
        border-color: var(--rm-accent);
        box-shadow: 0 0 0 3px var(--rm-accent-light);
      }
    }

    .rm-select option {
      background: var(--rm-bg-surface);
      color: var(--rm-text-primary);
    }

    .rm-selected-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin-bottom: 4px;
    }

    .rm-tags-select-row {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
      align-items: flex-end;
    }

    .rm-select-wrap {
      position: relative;
      flex: 1;
      min-width: 180px;
    }

    .rm-select-arrow {
      position: absolute;
      right: 10px;
      top: 50%;
      transform: translateY(-50%);
      pointer-events: none;
      color: var(--rm-text-muted);
      font-size: 11px;
    }

    .rm-new-tag-row {
      display: flex;
      gap: 8px;
      flex: 1;
      min-width: 200px;
    }

    .rm-text-input--sm {
      height: 36px;
    }

    .rm-btn-add-tag {
      height: 36px;
      padding: 0 14px;
      background: var(--rm-bg-hover);
      border: 1px solid var(--rm-border-base);
      border-radius: var(--rm-radius-md);
      font-size: 12px;
      font-weight: 600;
      color: var(--rm-text-primary);
      cursor: pointer;
      white-space: nowrap;
      transition: all var(--rm-transition-fast);
      &:hover{ background: var(--rm-bg-active); border-color: var(--rm-border-strong); }
    }

    .rm-form-hint {
      font-size: 11px;
      color: var(--rm-text-muted);
      margin-top: 2px;
    }

    .rm-tag-remove {
      background: none;
      border: none;
      color: inherit;
      cursor: pointer;
      margin-left: 4px;
      padding: 0 2px;
      font-size: 12px;
      line-height: 1;
      opacity: 0.8;
      &:hover{ opacity: 1; }
    }

    @media (max-width: 480px) {
      .rm-tags-select-row { flex-direction: column; align-items: stretch; }
      .rm-select-wrap, .rm-new-tag-row { min-width: 0; width: 100%; }
      .rm-new-tag-row { flex-direction: column; }
      .rm-text-input--sm, .rm-btn-add-tag { width: 100%; }
    }

    .rm-modal-actions {
      display: flex;
      align-items: center;
      gap: 10px;
    }
  `]
})
export class TaskFormModalComponent {
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
      this.titleError.set('O título da tarefa é obrigatório.');
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
