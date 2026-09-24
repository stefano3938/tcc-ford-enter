import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { StorageService } from './storage.service';
import { UserService } from './user.service';
import { ToastService } from './toast.service';
import { Idea, IdeaCategory } from '../models/idea.model';
import { INITIAL_MOCK_IDEAS } from '../mock-data/ideas.mock';

@Injectable({
  providedIn: 'root'
})
export class IdeaService {
  private readonly storage = inject(StorageService);
  private readonly userService = inject(UserService);
  private readonly toast = inject(ToastService);
  private readonly IDEAS_KEY = 'redmindme_ideas_list';

  readonly ideas = signal<Idea[]>(this.loadIdeas());
  readonly categoryFilter = signal<IdeaCategory | 'all'>('all');

  constructor() {
    this.userService.setIdeasCount(this.ideas().length);
    effect(() => {
      this.userService.setIdeasCount(this.ideas().length);
    });
  }

  private generateId(): string {
    try {
      if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
        return `idea-${crypto.randomUUID()}`;
      }
    } catch {

    }
    return `idea-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  }

  readonly totalIdeas = computed(() => this.ideas().length);

  readonly expandedCount = computed(() =>
    this.ideas().filter(i => i.isExpandedByAi).length
  );

  readonly filteredIdeas = computed(() => {
    const category = this.categoryFilter();
    if (category === 'all') return this.ideas();
    return this.ideas().filter(i => i.category === category);
  });

  addIdea(data: Omit<Idea, 'id' | 'createdAt' | 'isExpandedByAi'>): Idea | null {
    const isPro = this.userService.isPro();
    const currentCount = this.ideas().length;
    const maxAllowed = this.userService.currentUser().quotas.ideasMax;

    if (!isPro && currentCount >= maxAllowed) {
      this.userService.openPaywall(
        `Limite de ${maxAllowed} ideias atingido no plano Starter. Faça upgrade para ideias ilimitadas.`
      );
      return null;
    }

    const newIdea: Idea = {
      ...data,
      id: this.generateId(),
      createdAt: new Date().toISOString(),
      isExpandedByAi: false
    };

    this.ideas.update(list => [newIdea, ...list]);
    this.saveIdeas();
    this.toast.success('Ideia registrada!', newIdea.title);
    return newIdea;
  }

  updateIdea(id: string, changes: Partial<Omit<Idea, 'id' | 'createdAt'>>): void {
    this.ideas.update(list =>
      list.map(i => (i.id === id ? { ...i, ...changes } : i))
    );
    this.saveIdeas();
    this.toast.info('Ideia atualizada');
  }

  deleteIdea(id: string): void {
    const idea = this.ideas().find(i => i.id === id);
    this.ideas.update(list => list.filter(i => i.id !== id));
    this.saveIdeas();
    if (idea) {
      this.toast.warning('Ideia removida', idea.title);
    }
  }

  attachAiBreakdown(
    ideaId: string,
    breakdown: NonNullable<Idea['aiSuggestedBreakdown']>
  ): void {
    this.ideas.update(list =>
      list.map(i =>
        i.id === ideaId
          ? { ...i, isExpandedByAi: true, aiSuggestedBreakdown: breakdown }
          : i
      )
    );
    this.saveIdeas();
    this.toast.ai('Ideia expandida com sucesso com IA!');
  }

  resetToMock(): void {
    this.ideas.set(INITIAL_MOCK_IDEAS);
    this.saveIdeas();
    this.toast.info('Ideias restauradas para o padrão.');
  }

  private loadIdeas(): Idea[] {
    return this.storage.getItem<Idea[]>(this.IDEAS_KEY, INITIAL_MOCK_IDEAS);
  }

  private saveIdeas(): void {
    try {
      this.storage.setItem(this.IDEAS_KEY, this.ideas());
    } catch (error: unknown) {
      const isQuotaExceeded =
        error instanceof DOMException &&
        (error.name === 'QuotaExceededError' || error.name === 'NS_ERROR_DOM_QUOTA_REACHED' || (error as { code?: number }).code === 22);
      if (isQuotaExceeded) {
        this.toast.warning('Armazenamento cheio', 'Não foi possível salvar as ideias. Limite local excedido.');
      } else {
        this.toast.warning('Erro ao salvar', 'Não foi possível persistir as ideias.');
      }
    }
  }
}
