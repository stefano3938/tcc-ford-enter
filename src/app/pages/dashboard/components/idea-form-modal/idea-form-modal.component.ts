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
  templateUrl: './idea-form-modal.component.html',
  styleUrl: './idea-form-modal.component.css'
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
