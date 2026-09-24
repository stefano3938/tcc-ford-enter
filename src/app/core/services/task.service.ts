import { Injectable, computed, effect, inject, signal, untracked } from '@angular/core';
import { StorageService } from './storage.service';
import { UserService } from './user.service';
import { ToastService } from './toast.service';
import { Task, TaskPriority, TaskStatus } from '../models/task.model';
import { INITIAL_MOCK_TASKS } from '../mock-data/tasks.mock';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private readonly storage = inject(StorageService);
  private readonly userService = inject(UserService);
  private readonly toast = inject(ToastService);
  private readonly TASKS_KEY = 'redmindme_tasks_list';
  readonly tasks = signal<Task[]>(this.loadTasks());
  readonly searchQuery = signal<string>('');
  private readonly debouncedSearchQuery = signal<string>('');

  readonly debouncedQuery = this.debouncedSearchQuery.asReadonly();
  readonly statusFilter = signal<TaskStatus | 'all'>('all');
  readonly priorityFilter = signal<TaskPriority | 'all'>('all');
  readonly tagFilter = signal<string | 'all'>('all');
  private cachedTags: string[] = [];
  private cachedTagsRef: Task[] | null = null;

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

    }
    return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  }
  readonly allTags = computed(() => {
    const tasks = this.tasks();

    if (this.cachedTagsRef === tasks && this.cachedTags.length > 0) {

      return this.cachedTags;
    }
    const set = new Set<string>();
    for (let i = 0; i < tasks.length; i++) {
      const tags = tasks[i].tags;
      for (let j = 0; j < tags.length; j++) set.add(tags[j]);
    }
    const result = Array.from(set);
    this.cachedTags = result;
    this.cachedTagsRef = tasks;
    return result;
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
    const query = this.debouncedSearchQuery().toLowerCase().trim();
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

  addTask(data: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Task | null {

    const isPro = this.userService.isPro();
    const currentCount = this.tasks().length;
    const maxAllowed = this.userService.currentUser().quotas.tasksMax;

    if (!isPro && currentCount >= maxAllowed) {
      this.userService.openPaywall(
        `Limite de ${maxAllowed} tarefas atingido no plano Starter. Faça upgrade para tarefas infinitas.`
      );
      return null;
    }

    const now = new Date().toISOString();
    const newTask: Task = {
      ...data,
      id: this.generateId('tsk'),
      createdAt: now,
      updatedAt: now
    };

    this.tasks.update(list => [newTask, ...list]);
    this.saveTasks();
    this.toast.success('Tarefa criada com sucesso', newTask.title);
    return newTask;
  }

  updateTask(id: string, changes: Partial<Omit<Task, 'id' | 'createdAt'>>): void {
    const now = new Date().toISOString();
    this.tasks.update(list =>
      list.map(t => (t.id === id ? { ...t, ...changes, updatedAt: now } : t))
    );
    this.saveTasks();
    this.toast.info('Tarefa atualizada');
  }

  toggleStatus(id: string): void {
    const task = this.tasks().find(t => t.id === id);
    if (!task) return;

    let nextStatus: TaskStatus;
    if (task.status === 'todo') nextStatus = 'in-progress';
    else if (task.status === 'in-progress') nextStatus = 'done';
    else nextStatus = 'todo';

    this.updateTask(id, { status: nextStatus });
    if (nextStatus === 'done') {
      this.toast.success('Tarefa concluída com sucesso!', task.title);
    }
  }

  deleteTask(id: string): void {
    const task = this.tasks().find(t => t.id === id);
    this.tasks.update(list => list.filter(t => t.id !== id));
    this.saveTasks();
    if (task) {
      this.toast.warning('Tarefa removida', task.title);
    }
  }

  addMultipleTasks(newTasks: Array<Omit<Task, 'id' | 'createdAt' | 'updatedAt'>>): void {
    const isPro = this.userService.isPro();
    const currentCount = this.tasks().length;
    const maxAllowed = this.userService.currentUser().quotas.tasksMax;

    if (!isPro) {
      const remaining = Math.max(0, maxAllowed - currentCount);
      if (remaining <= 0) {
        this.userService.openPaywall(
          `Limite de ${maxAllowed} tarefas atingido no plano Starter. Faça upgrade para tarefas infinitas.`
        );
        this.toast.warning('Limite de tarefas atingido', `Você já possui ${currentCount}/${maxAllowed} tarefas.`);
        return;
      }
      if (newTasks.length > remaining) {
        const allowed = newTasks.slice(0, remaining);
        this.userService.openPaywall(
          `Apenas ${remaining} de ${newTasks.length} tarefas puderam ser adicionadas (limite ${maxAllowed}). Faça upgrade para tarefas infinitas.`
        );
        this.toast.warning('Limite parcialmente atingido', `Apenas ${remaining} tarefas foram inseridas. Faça upgrade para adicionar todas.`);

        newTasks = allowed;
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
    this.toast.ai(`${mapped.length} tarefas geradas pela IA inseridas no seu fluxo!`);
  }

  resetToMock(): void {
    this.tasks.set(INITIAL_MOCK_TASKS);
    this.saveTasks();
    this.toast.info('Dados de tarefas restaurados para o padrão.');
  }

  private loadTasks(): Task[] {
    return this.storage.getItem<Task[]>(this.TASKS_KEY, INITIAL_MOCK_TASKS);
  }

  private saveTasks(): void {
    try {
      const tasks = this.tasks();

      try {
        const serialized = JSON.stringify(tasks);

        const MAX_SERIALIZED = 2_500_000;
        if (serialized.length > MAX_SERIALIZED) {
          const truncated = tasks.slice(0, 250);
          this.storage.setItem(this.TASKS_KEY, truncated);
          this.toast.warning('Armazenamento otimizado', 'Lista muito grande — mantidas apenas as 250 tarefas mais recentes.');
          return;
        }
      } catch {

      }
      this.storage.setItem(this.TASKS_KEY, this.tasks());
    } catch (error: unknown) {
      const isQuotaExceeded =
        error instanceof DOMException &&
        (error.name === 'QuotaExceededError' || error.name === 'NS_ERROR_DOM_QUOTA_REACHED' || (error as { code?: number }).code === 22);
      if (isQuotaExceeded) {
        this.toast.warning('Armazenamento cheio', 'Não foi possível salvar as tarefas. Limite local excedido.');
      } else {
        this.toast.warning('Erro ao salvar', 'Não foi possível persistir as tarefas.');
      }
    }
  }
}
