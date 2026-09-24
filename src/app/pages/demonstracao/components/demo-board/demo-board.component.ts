import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { I18nService } from '../../../../core/services/i18n.service';
import { IconComponent } from '../../../../shared/components/icon/icon.component';

type Status = 'todo' | 'doing' | 'done';
type Priority = 'urgent' | 'high' | 'medium' | 'low';
type Filter = 'all' | 'urgent' | 'doing';

interface DemoTask {
  readonly id: number;
  readonly title: string;
  readonly priority: Priority;
  readonly status: Status;
  readonly tags: ReadonlyArray<string>;
  readonly time?: string;
}

/** Demo content (not interface text): the same board the rest of the site shows */
const SEED: ReadonlyArray<DemoTask> = [
  { id: 1, title: 'Revisar proposta comercial Q4', priority: 'high', status: 'todo', tags: ['Planejamento', 'Q4'], time: '30 min' },
  { id: 2, title: 'Definir escopo do MVP de onboarding', priority: 'medium', status: 'todo', tags: ['Produto', 'MVP'], time: '45 min' },
  { id: 3, title: 'Agendar entrevistas com 5 usuários', priority: 'low', status: 'todo', tags: ['Pesquisa'] },
  { id: 4, title: 'Refinar fluxo de onboarding', priority: 'urgent', status: 'doing', tags: ['Produto', 'UX'], time: '45 min' },
  { id: 5, title: 'Sincronizar design tokens', priority: 'medium', status: 'doing', tags: ['Design System'], time: '20 min' },
  { id: 6, title: 'Validar acessibilidade dos modais', priority: 'urgent', status: 'doing', tags: ['A11y'] },
  { id: 7, title: 'Mapear jornada do usuário', priority: 'medium', status: 'done', tags: ['Pesquisa'] },
  { id: 8, title: 'Entrevistar 5 usuários beta', priority: 'low', status: 'done', tags: ['Entrevista'] },
  { id: 9, title: 'Criar parser de datas', priority: 'high', status: 'done', tags: ['Automação'] }
];

const NEXT_STATUS: Record<Status, Status> = { todo: 'doing', doing: 'done', done: 'todo' };

/**
 * A playable copy of the board for the demo page. Everything lives in memory:
 * it never touches the real app data, and a reload (or "Restore") starts over.
 */
@Component({
  selector: 'rm-demo-board',
  standalone: true,
  imports: [IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './demo-board.component.html',
  styleUrl: './demo-board.component.css'
})
export class DemoBoardComponent {
  readonly i18n = inject(I18nService);

  readonly priorities: ReadonlyArray<Priority> = ['urgent', 'high', 'medium', 'low'];
  readonly columns: ReadonlyArray<{ key: Status; label: string; icon: 'list' | 'clock' | 'check-circle'; empty: string }> = [
    { key: 'todo', label: 'dash.todo', icon: 'list', empty: 'dash.kanban.emptyTodo' },
    { key: 'doing', label: 'dash.doing', icon: 'clock', empty: 'dash.kanban.emptyDoing' },
    { key: 'done', label: 'dash.done', icon: 'check-circle', empty: 'dash.kanban.emptyDone' }
  ];

  readonly tasks = signal<ReadonlyArray<DemoTask>>(SEED);
  readonly query = signal('');
  readonly filter = signal<Filter>('all');
  readonly draftTitle = signal('');
  readonly draftPriority = signal<Priority>('medium');
  /** The card just created or moved, so it can play its entrance */
  readonly lastTouched = signal<number | null>(null);

  private nextId = SEED.length + 1;

  readonly isFiltering = computed(() => this.filter() !== 'all' || this.query().trim() !== '');

  readonly visible = computed(() => {
    const term = this.query().trim().toLowerCase().replace(/^#/, '');
    const filter = this.filter();
    return this.tasks().filter(task => {
      if (filter === 'urgent' && task.priority !== 'urgent') return false;
      if (filter === 'doing' && task.status !== 'doing') return false;
      if (!term) return true;
      return task.title.toLowerCase().includes(term) || task.tags.some(tag => tag.toLowerCase().includes(term));
    });
  });

  readonly byColumn = computed(() => {
    const groups: Record<Status, DemoTask[]> = { todo: [], doing: [], done: [] };
    for (const task of this.visible()) groups[task.status].push(task);
    return groups;
  });

  readonly total = computed(() => this.tasks().length);
  readonly doneCount = computed(() => this.tasks().filter(task => task.status === 'done').length);
  readonly urgentOpen = computed(() => this.tasks().filter(task => task.priority === 'urgent' && task.status !== 'done').length);
  readonly progress = computed(() => (this.total() ? Math.round((this.doneCount() / this.total()) * 100) : 0));

  addTask(event: Event): void {
    event.preventDefault();
    const title = this.draftTitle().trim();
    if (!title) return;
    const task: DemoTask = { id: this.nextId++, title, priority: this.draftPriority(), status: 'todo', tags: [] };
    this.tasks.update(list => [task, ...list]);
    this.draftTitle.set('');
    this.lastTouched.set(task.id);
    // Make sure the new card is not hidden by an active search or filter
    this.query.set('');
    this.filter.set('all');
  }

  advance(task: DemoTask): void {
    this.tasks.update(list => list.map(item => (item.id === task.id ? { ...item, status: NEXT_STATUS[item.status] } : item)));
    this.lastTouched.set(task.id);
  }

  remove(task: DemoTask): void {
    this.tasks.update(list => list.filter(item => item.id !== task.id));
  }

  reset(): void {
    this.tasks.set(SEED);
    this.query.set('');
    this.filter.set('all');
    this.draftTitle.set('');
    this.draftPriority.set('medium');
    this.lastTouched.set(null);
    this.nextId = SEED.length + 1;
  }

  setFilter(filter: Filter): void {
    this.filter.set(this.filter() === filter && filter !== 'all' ? 'all' : filter);
  }

  onInput(target: EventTarget | null, into: 'query' | 'draft'): void {
    const value = (target as HTMLInputElement | null)?.value ?? '';
    (into === 'query' ? this.query : this.draftTitle).set(value);
  }

  onPriority(target: EventTarget | null): void {
    this.draftPriority.set(((target as HTMLSelectElement | null)?.value ?? 'medium') as Priority);
  }
}
