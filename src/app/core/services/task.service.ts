import { Injectable, computed, effect, inject, signal, untracked } from '@angular/core';
import { StorageService } from './storage.service';
import { UserService } from './user.service';
import { ToastService } from './toast.service';
import { I18nService } from './i18n.service';
import { Task, TaskPriority, TaskStatus } from '../models/task.model';
import { INITIAL_MOCK_TASKS } from '../mock-data/tasks.mock';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private readonly storage = inject(StorageService);
  private readonly userService = inject(UserService);
  private readonly toast = inject(ToastService);
  private readonly i18n = inject(I18nService);
  private readonly TASKS_KEY = 'redmindme_tasks_list';
  readonly tasks = signal<Task[]>(this.loadTasks());
  readonly searchQuery = signal<string>('');
  private readonly debouncedSearchQuery = signal<string>('');

  readonly debouncedQuery = this.debouncedSearchQuery.asReadonly();
  readonly statusFilter = signal<TaskStatus | 'all'>('all');
  readonly priorityFilter = signal<TaskPriority | 'all'>('all');
  readonly tagFilter = signal<string | 'all'>('all');

  constructor() {
    let debounceTimer: ReturnType<typeof setTimeout> | null = null;
    effect((onCleanup) => {
      const raw = this.searchQuery();

      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        untracked(() => this.debouncedSearchQuery.set(raw));
      }, 250);
      onCleanup(() => {
        if (debounceTimer) clearTimeout(debounceTimer);
      });
    });
    this.userService.setTasksCount(this.tasks().length);
    effect(() => {
      this.userService.setTasksCount(this.tasks().length);
    });
  }

  private generateId(prefix = 'tsk'): string {
    try {
      if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
        return `${prefix}-${crypto.randomUUID()}`;
      }
    } catch {
      // fall through to the time-based id
    }
    return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  }

  readonly allTags = computed(() => {
    const set = new Set<string>();
    for (const task of this.tasks()) {
      for (const tag of task.tags) set.add(tag);
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  });

  readonly totalCount = computed(() => this.tasks().length);

  readonly todoCount = computed(() =>
    this.tasks().filter(t => t.status === 'todo').length
  );

  readonly inProgressCount = computed(() =>
    this.tasks().filter(t => t.status === 'in-progress').length
  );

  readonly doneCount = computed(() =>
    this.tasks().filter(t => t.status === 'done').length
  );

  readonly urgentCount = computed(() =>
    this.tasks().filter(t => t.priority === 'urgent' && t.status !== 'done').length
  );

  readonly completionPercentage = computed(() => {
    const total = this.totalCount();
    if (total === 0) return 0;
    return Math.round((this.doneCount() / total) * 100);
  });

  readonly filteredTasks = computed(() => {
    const query = this.debouncedSearchQuery().toLowerCase().trim().replace(/^#/, '');
    const status = this.statusFilter();
    const priority = this.priorityFilter();
    const tag = this.tagFilter();

    return this.tasks().filter(task => {
      if (query) {
        const matchesTitle = task.title.toLowerCase().includes(query);
        const matchesDesc = (task.description || '').toLowerCase().includes(query);
        const matchesTag = task.tags.some(t => t.toLowerCase().includes(query));
        if (!matchesTitle && !matchesDesc && !matchesTag) return false;
      }
      if (status !== 'all' && task.status !== status) return false;
      if (priority !== 'all' && task.priority !== priority) return false;
      if (tag !== 'all' && !task.tags.includes(tag)) return false;

      return true;
    });
  });

  /**
   * True when a new task fits in the plan. When it doesn't, the paywall opens right away,
   * so the user never fills a form that can't be saved.
   */
  ensureCanAdd(): boolean {
    const max = this.userService.currentUser().quotas.tasksMax;
    if (this.userService.isPro() || this.tasks().length < max) return true;
    this.userService.openPaywall(this.i18n.t('paywall.reason.tasks', { count: max }));
    return false;
  }

  addTask(data: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Task | null {
    if (!this.ensureCanAdd()) return null;

    const now = new Date().toISOString();
    const newTask: Task = {
      ...data,
      id: this.generateId('tsk'),
      createdAt: now,
      updatedAt: now
    };

    this.tasks.update(list => [newTask, ...list]);
    this.saveTasks();
    this.toast.success(this.i18n.t('toast.task.created'), newTask.title);
    return newTask;
  }

  updateTask(id: string, changes: Partial<Omit<Task, 'id' | 'createdAt'>>, options: { silent?: boolean } = {}): void {
    const now = new Date().toISOString();
    this.tasks.update(list =>
      list.map(t => (t.id === id ? { ...t, ...changes, updatedAt: now } : t))
    );
    this.saveTasks();
    if (!options.silent) {
      this.toast.success(this.i18n.t('toast.task.updated'));
    }
  }

  /**
   * The checkbox means "done": ticking completes the task, unticking reopens it as to-do.
   * "In progress" is set from the task form or by moving it on the board.
   */
  toggleDone(id: string): void {
    const task = this.tasks().find(t => t.id === id);
    if (!task) return;

    if (task.status === 'done') {
      this.updateTask(id, { status: 'todo' }, { silent: true });
      return;
    }
    const previous = task.status;
    this.updateTask(id, { status: 'done' }, { silent: true });
    this.toast.success(this.i18n.t('toast.task.done'), task.title, {
      label: this.i18n.t('common.undo'),
      run: () => this.updateTask(id, { status: previous }, { silent: true })
    });
  }

  setStatus(id: string, status: TaskStatus): void {
    this.updateTask(id, { status }, { silent: true });
  }

  deleteTask(id: string): void {
    const list = this.tasks();
    const index = list.findIndex(t => t.id === id);
    if (index === -1) return;
    const task = list[index];

    this.tasks.update(current => current.filter(t => t.id !== id));
    this.saveTasks();
    this.toast.info(this.i18n.t('toast.task.deleted'), task.title, {
      label: this.i18n.t('common.undo'),
      run: () => this.restoreTask(task, index)
    });
  }

  private restoreTask(task: Task, index: number): void {
    if (this.tasks().some(t => t.id === task.id)) return;
    this.tasks.update(current => {
      const next = [...current];
      next.splice(Math.min(index, next.length), 0, task);
      return next;
    });
    this.saveTasks();
  }

  /** Adds tasks suggested by the AI. Returns how many were actually added. */
  addMultipleTasks(newTasks: Array<Omit<Task, 'id' | 'createdAt' | 'updatedAt'>>): number {
    const isPro = this.userService.isPro();
    const currentCount = this.tasks().length;
    const maxAllowed = this.userService.currentUser().quotas.tasksMax;

    if (!isPro) {
      const remaining = Math.max(0, maxAllowed - currentCount);
      if (remaining <= 0) {
        this.userService.openPaywall(this.i18n.t('paywall.reason.tasks', { count: maxAllowed }));
        return 0;
      }
      if (newTasks.length > remaining) {
        this.userService.openPaywall(
          this.i18n.t('paywall.reason.partial', { added: remaining, total: newTasks.length, count: maxAllowed })
        );
        newTasks = newTasks.slice(0, remaining);
      }
    }

    const now = new Date().toISOString();
    const mapped: Task[] = newTasks.map((t) => ({
      ...t,
      id: this.generateId('tsk-ai'),
      createdAt: now,
      updatedAt: now,
      isAiGenerated: true
    }));

    this.tasks.update(list => [...mapped, ...list]);
    this.saveTasks();
    this.toast.ai(this.i18n.t('toast.task.aiAdded', { count: mapped.length }));
    return mapped.length;
  }

  resetToMock(): void {
    this.tasks.set(INITIAL_MOCK_TASKS);
    this.saveTasks();
  }

  private loadTasks(): Task[] {
    return this.storage.getItem<Task[]>(this.TASKS_KEY, INITIAL_MOCK_TASKS);
  }

  private saveTasks(): void {
    try {
      this.storage.setItem(this.TASKS_KEY, this.tasks());
    } catch {
      this.toast.warning(this.i18n.t('toast.saveError'), this.i18n.t('toast.saveError.body'));
    }
  }
}
