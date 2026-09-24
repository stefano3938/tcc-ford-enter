import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { StorageService } from './storage.service';
import { UserService } from './user.service';
import { ToastService } from './toast.service';
import { I18nService } from './i18n.service';
import { Idea, IdeaCategory } from '../models/idea.model';
import { INITIAL_MOCK_IDEAS } from '../mock-data/ideas.mock';

@Injectable({
  providedIn: 'root'
})
export class IdeaService {
  private readonly storage = inject(StorageService);
  private readonly userService = inject(UserService);
  private readonly toast = inject(ToastService);
  private readonly i18n = inject(I18nService);
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
      // fall through to the time-based id
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

  countByCategory(category: IdeaCategory): number {
    return this.ideas().filter(i => i.category === category).length;
  }

  /** Opens the paywall up front when the plan is full, instead of after the form is filled. */
  ensureCanAdd(): boolean {
    const max = this.userService.currentUser().quotas.ideasMax;
    if (this.userService.isPro() || this.ideas().length < max) return true;
    this.userService.openPaywall(this.i18n.t('paywall.reason.ideas', { count: max }));
    return false;
  }

  addIdea(data: Omit<Idea, 'id' | 'createdAt' | 'isExpandedByAi'>): Idea | null {
    if (!this.ensureCanAdd()) return null;

    const newIdea: Idea = {
      ...data,
      id: this.generateId(),
      createdAt: new Date().toISOString(),
      isExpandedByAi: false
    };

    this.ideas.update(list => [newIdea, ...list]);
    this.saveIdeas();
    this.toast.success(this.i18n.t('toast.idea.created'), newIdea.title);
    return newIdea;
  }

  updateIdea(id: string, changes: Partial<Omit<Idea, 'id' | 'createdAt'>>, options: { silent?: boolean } = {}): void {
    this.ideas.update(list =>
      list.map(i => (i.id === id ? { ...i, ...changes } : i))
    );
    this.saveIdeas();
    if (!options.silent) {
      this.toast.success(this.i18n.t('toast.idea.updated'));
    }
  }

  deleteIdea(id: string): void {
    const list = this.ideas();
    const index = list.findIndex(i => i.id === id);
    if (index === -1) return;
    const idea = list[index];

    this.ideas.update(current => current.filter(i => i.id !== id));
    this.saveIdeas();
    this.toast.info(this.i18n.t('toast.idea.deleted'), idea.title, {
      label: this.i18n.t('common.undo'),
      run: () => {
        if (this.ideas().some(i => i.id === idea.id)) return;
        this.ideas.update(current => {
          const next = [...current];
          next.splice(Math.min(index, next.length), 0, idea);
          return next;
        });
        this.saveIdeas();
      }
    });
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
    this.toast.ai(this.i18n.t('toast.idea.expanded'));
  }

  markConverted(ideaId: string): void {
    this.updateIdea(ideaId, { convertedToTasks: true }, { silent: true });
  }

  resetToMock(): void {
    this.ideas.set(INITIAL_MOCK_IDEAS);
    this.saveIdeas();
  }

  private loadIdeas(): Idea[] {
    return this.storage.getItem<Idea[]>(this.IDEAS_KEY, INITIAL_MOCK_IDEAS);
  }

  private saveIdeas(): void {
    try {
      this.storage.setItem(this.IDEAS_KEY, this.ideas());
    } catch {
      this.toast.warning(this.i18n.t('toast.saveError'), this.i18n.t('toast.saveError.body'));
    }
  }
}
