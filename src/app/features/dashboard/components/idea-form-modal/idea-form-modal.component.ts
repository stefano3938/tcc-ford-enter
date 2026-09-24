import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  input,
  model,
  signal
} from '@angular/core';
import { Idea, IdeaCategory } from '../../../../core/models/idea.model';
import { IdeaService } from '../../../../core/services/idea.service';
import { ModalComponent } from '../../../../shared/components/modal/modal.component';
import { InputComponent } from '../../../../shared/components/input/input.component';
import { ButtonComponent } from '../../../../shared/components/button/button.component';

@Component({
  selector: 'rm-idea-form-modal',
  standalone: true,
  imports: [ModalComponent, InputComponent, ButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <rm-modal
      [isOpen]="isOpen()"
      [title]="editingIdea() ? 'Editar Ideia' : 'Registrar Nova Ideia'"
      [subtitle]="editingIdea() ? 'Ajuste os conceitos e tags da ideia.' : 'Capture insights rapidamente para posterior desdobramento com IA.'"
      maxWidth="520px"
      (closed)="onClose()"
    >
      <form (submit)="onSubmit($event)" class="rm-form-grid">

        <rm-input
          label="Título da Ideia"
          placeholder="Ex: Modo Foco Linear estilo Dynamic Island"
          [(value)]="title"
          [required]="true"
          [errorMessage]="titleError()"
          prefixIcon="pi-lightbulb"
        ></rm-input>
        <div class="rm-form-group">
          <label class="rm-form-label">Categoria Estratégica</label>
          <select
            class="rm-select"
            [value]="category()"
            (change)="category.set($any($event.target).value)"
          >
            <option value="product">Produto / Feature</option>
            <option value="workflow">Fluxo de Trabalho</option>
            <option value="research">Pesquisa / Estudo</option>
            <option value="creative">Criativo</option>
            <option value="personal">Pessoal</option>
          </select>
        </div>
        <rm-input
          label="Resumo do Conceito"
          placeholder="Explique o valor, o problema que resolve ou o insight principal..."
          [(value)]="summary"
          [multiline]="true"
          [rows]="4"
          [required]="true"
          [errorMessage]="summaryError()"
        ></rm-input>
        <rm-input
          label="Tags (separadas por vírgula)"
          placeholder="IA, UX, Produtividade"
          [(value)]="tagsString"
          prefixIcon="pi-tag"
        ></rm-input>
      </form>

      <div modal-footer class="rm-modal-actions">
        <rm-button variant="subtle" (clicked)="onClose()">
          Cancelar
        </rm-button>
        <rm-button
          variant="primary"
          [icon]="editingIdea() ? 'pi-check' : 'pi-plus'"
          (clicked)="saveIdea()"
        >
          {{ editingIdea() ? 'Salvar Ideia' : 'Registrar Ideia' }}
        </rm-button>
      </div>
    </rm-modal>
  `,
  styles: [`
    .rm-form-grid {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .rm-form-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .rm-form-label {
      font-size: 12.5px;
      font-weight: 500;
      color: var(--rm-text-secondary);
    }

    .rm-select {
      width: 100%;
      height: 40px;
      padding: 0 12px;
      background: var(--rm-bg-surface);
      border: 1px solid var(--rm-border-base);
      border-radius: var(--rm-radius-md);
      color: var(--rm-text-primary);
      font-size: 13.5px;
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

    .rm-modal-actions {
      display: flex;
      align-items: center;
      gap: 10px;
    }
  `]
})
export class IdeaFormModalComponent {
  private readonly ideaService = inject(IdeaService);

  readonly isOpen = model<boolean>(false);
  readonly editingIdea = input<Idea | null>(null);

  readonly title = signal<string>('');
  readonly summary = signal<string>('');
  readonly category = signal<IdeaCategory>('product');
  readonly tagsString = signal<string>('');

  readonly titleError = signal<string | undefined>(undefined);
  readonly summaryError = signal<string | undefined>(undefined);

  constructor() {
    effect(() => {
      const idea = this.editingIdea();
      if (idea) {
        this.title.set(idea.title);
        this.summary.set(idea.summary);
        this.category.set(idea.category);
        this.tagsString.set(idea.tags.join(', '));
      } else {
        this.resetForm();
      }
    });
  }

  onSubmit(event: Event): void {
    event.preventDefault();
    this.saveIdea();
  }

  saveIdea(): void {
    const rawTitle = this.title().trim();
    const rawSummary = this.summary().trim();

    let hasError = false;
    if (!rawTitle) {
      this.titleError.set('O título da ideia é obrigatório.');
      hasError = true;
    } else {
      this.titleError.set(undefined);
    }

    if (!rawSummary) {
      this.summaryError.set('O resumo é obrigatório.');
      hasError = true;
    } else {
      this.summaryError.set(undefined);
    }

    if (hasError) return;

    const parsedTags = this.tagsString()
      .split(',')
      .map(t => t.trim().replace(/^#/, ''))
      .filter(t => t.length > 0);

    const existing = this.editingIdea();
    if (existing) {
      this.ideaService.updateIdea(existing.id, {
        title: rawTitle,
        summary: rawSummary,
        category: this.category(),
        tags: parsedTags
      });
    } else {
      this.ideaService.addIdea({
        title: rawTitle,
        summary: rawSummary,
        category: this.category(),
        tags: parsedTags.length > 0 ? parsedTags : ['Ideação']
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
    this.summary.set('');
    this.category.set('product');
    this.tagsString.set('');
    this.titleError.set(undefined);
    this.summaryError.set(undefined);
  }
}
