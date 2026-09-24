import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Task, TaskPriority, TaskStatus } from '../../core/models/task.model';
import { Idea, IdeaCategory } from '../../core/models/idea.model';
import { TaskService } from '../../core/services/task.service';
import { IdeaService } from '../../core/services/idea.service';
import { I18nService } from '../../core/services/i18n.service';
import { StatsOverviewComponent } from './components/stats-overview/stats-overview.component';
import { TaskItemComponent } from './components/task-item/task-item.component';
import { IdeaItemComponent } from './components/idea-item/idea-item.component';
import { TaskFormModalComponent } from './components/task-form-modal/task-form-modal.component';
import { IdeaFormModalComponent } from './components/idea-form-modal/idea-form-modal.component';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { BadgeComponent } from '../../shared/components/badge/badge.component';
import { InputComponent } from '../../shared/components/input/input.component';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { LoadingSkeletonComponent } from '../../shared/components/loading-skeleton/loading-skeleton.component';

@Component({
  selector: 'rm-dashboard',
  standalone: true,
  imports: [
    StatsOverviewComponent,
    TaskItemComponent,
    IdeaItemComponent,
    TaskFormModalComponent,
    IdeaFormModalComponent,
    ButtonComponent,
    BadgeComponent,
    InputComponent,
    IconComponent,
    EmptyStateComponent,
    LoadingSkeletonComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="rm-dashboard">

      <rm-stats-overview></rm-stats-overview>
      <div class="rm-dashboard-toolbar">

        <div class="rm-tab-group">
          <button
            type="button"
            class="rm-tab-btn"
            [class.active]="activeTab() === 'tasks'"
            (click)="activeTab.set('tasks')"
          >
            <rm-icon name="check-square" [size]="14"></rm-icon>
            <span>{{ i18n.t('dash.tab.tasks') }}</span>
            <span class="rm-tab-count">{{ taskService.totalCount() }}</span>
          </button>

          <button
            type="button"
            class="rm-tab-btn"
            [class.active]="activeTab() === 'ideas'"
            (click)="activeTab.set('ideas')"
          >
            <rm-icon name="lightbulb" [size]="14"></rm-icon>
            <span>{{ i18n.t('dash.tab.ideas') }}</span>
            <span class="rm-tab-count">{{ ideaService.totalIdeas() }}</span>
          </button>
        </div>
        <div class="rm-toolbar-actions">
          @if (activeTab() === 'tasks') {

            <div class="rm-view-mode-toggle">
              <button
                type="button"
                class="rm-view-btn"
                [class.active]="viewMode() === 'list'"
                (click)="viewMode.set('list')"
                [title]="i18n.t('dash.view.list')"
                [attr.aria-label]="i18n.t('dash.view.list')"
              >
                <rm-icon name="list" [size]="14"></rm-icon>
              </button>
              <button
                type="button"
                class="rm-view-btn"
                [class.active]="viewMode() === 'kanban'"
                (click)="viewMode.set('kanban')"
                [title]="i18n.t('dash.view.kanban')"
                [attr.aria-label]="i18n.t('dash.view.kanban')"
              >
                <rm-icon name="kanban" [size]="14"></rm-icon>
              </button>
            </div>

            <rm-button
              variant="primary"
              size="md"
              icon="plus"
              (clicked)="openNewTaskModal()"
            >
              Nova Tarefa
            </rm-button>
          } @else {
            <rm-button
              variant="primary"
              size="md"
              icon="plus"
              (clicked)="openNewIdeaModal()"
            >
              Nova Ideia
            </rm-button>
          }

          <rm-button
            variant="subtle"
            size="sm"
            icon="refresh"
            (clicked)="resetMocks()"
            [title]="i18n.t('dash.reset')"
          >
            Reset
          </rm-button>
        </div>
      </div>
      @if (activeTab() === 'tasks') {

        <div class="rm-filter-bar">
          <div class="rm-filter-search">
            <rm-input
              [placeholder]="i18n.t('dash.search')"
              [clearable]="true"
              prefixIcon="search"
              [value]="taskService.searchQuery()"
              (valueChange)="taskService.searchQuery.set($event)"
            ></rm-input>
          </div>

          <div class="rm-filter-selects">
            <select
              class="rm-mini-select"
              [value]="taskService.statusFilter()"
              (change)="taskService.statusFilter.set($any($event.target).value)"
            >
              <option value="all">{{ i18n.t('dash.status.all') }}</option>
              <option value="todo">{{ i18n.t('dash.todo') }}</option>
              <option value="in-progress">{{ i18n.t('dash.doing') }}</option>
              <option value="done">{{ i18n.t('dash.done') }}</option>
            </select>

            <select
              class="rm-mini-select"
              [value]="taskService.priorityFilter()"
              (change)="taskService.priorityFilter.set($any($event.target).value)"
            >
              <option value="all">{{ i18n.t('dash.priority.all') }}</option>
              <option value="urgent">{{ i18n.t('priority.urgent') }}</option>
              <option value="high">{{ i18n.t('priority.high') }}</option>
              <option value="medium">{{ i18n.t('priority.medium') }}</option>
              <option value="low">{{ i18n.t('priority.low') }}</option>
            </select>
          </div>
        </div>
        @if (hasActiveFilters()) {
          <div class="rm-active-filters-bar">
            <span class="rm-active-filters-badge">
              <rm-icon name="filter" [size]="12"></rm-icon>
              {{ i18n.t('dash.filters.active') }}
            </span>
            <span class="rm-active-filters-count">{{ taskService.filteredTasks().length }} / {{ taskService.totalCount() }}</span>
            <button type="button" class="rm-clear-filters-btn" (click)="clearAllFilters()" [attr.aria-label]="i18n.t('dash.filters.clearAll')">
              <rm-icon name="x" [size]="12"></rm-icon>
              {{ i18n.t('dash.filters.clear') }}
            </button>
          </div>
        }
        @if (viewMode() === 'list') {
          @if (isLoading()) {
            <rm-loading-skeleton variant="card" [count]="3"></rm-loading-skeleton>
          } @else {
            <div class="rm-tasks-list">
              @if (taskService.filteredTasks().length > 0) {
                @for (task of taskService.filteredTasks(); track task.id) {
                  <rm-task-item
                    [task]="task"
                    (edit)="openEditTaskModal($event)"
                  ></rm-task-item>
                }
              } @else {
                @if (isFilteredEmpty()) {
                  <div class="rm-filtered-empty">
                    <div class="rm-filtered-empty__head">
                      <span class="rm-active-filters-badge">
                        <rm-icon name="filter" [size]="12"></rm-icon>
                        Filtros ativos
                      </span>
                    </div>
                    <rm-empty-state
                      icon="list"
                      title="Nenhuma tarefa corresponde aos filtros"
                      description="Nenhum resultado para os filtros atuais. Limpe os filtros ou ajuste a busca."
                      actionLabel="Limpar filtros"
                      actionIcon="x"
                      (action)="clearAllFilters()"
                    ></rm-empty-state>
                  </div>
                } @else {
                  <rm-empty-state
                    icon="list"
                    title="Nenhuma tarefa encontrada"
                    description="Tente alterar os filtros ou crie uma nova tarefa para começar."
                    actionLabel="Criar Tarefa"
                    actionIcon="plus"
                    (action)="openNewTaskModal()"
                  ></rm-empty-state>
                }
              }
            </div>
          }
        }
        @if (viewMode() === 'kanban') {
          @if (isLoading()) {
            <div class="rm-kanban-board">
              <rm-loading-skeleton variant="kanban-col" [count]="3"></rm-loading-skeleton>
            </div>
          } @else {
          @if (hasActiveFilters()) {
            <div class="rm-kanban-filter-notice">
              <span class="rm-active-filters-badge">
                <rm-icon name="filter" [size]="12"></rm-icon>
                Filtros ativos — Visão Kanban filtrada
              </span>
              <button type="button" class="rm-clear-filters-btn" (click)="clearAllFilters()" aria-label="Limpar filtros da visão Kanban">
                <rm-icon name="x" [size]="12"></rm-icon>
                Limpar filtros
              </button>
            </div>
          }
          <div class="rm-kanban-board">

            <div class="rm-kanban-col">
              <div class="rm-kanban-col__header">
                <div class="rm-kanban-col__title-wrap">
                  <span class="rm-kanban-dot rm-kanban-dot--todo"></span>
                  <span class="rm-kanban-col__title">{{ i18n.t('dash.todo') }}</span>
                </div>
                <rm-badge type="todo" [label]="getTasksByStatus('todo').length + ''"></rm-badge>
              </div>

              <div class="rm-kanban-col__list">
                @for (task of getTasksByStatus('todo'); track task.id) {
                  <rm-task-item [task]="task" (edit)="openEditTaskModal($event)"></rm-task-item>
                } @empty {
                  @if (hasActiveFilters()) {
                    <div class="rm-kanban-empty rm-kanban-empty--filtered">Nenhuma tarefa — filtros ativos</div>
                  } @else {
                    <div class="rm-kanban-empty">Nenhuma tarefa a iniciar</div>
                  }
                }
              </div>
            </div>
            <div class="rm-kanban-col">
              <div class="rm-kanban-col__header">
                <div class="rm-kanban-col__title-wrap">
                  <span class="rm-kanban-dot rm-kanban-dot--progress"></span>
                  <span class="rm-kanban-col__title">Em Andamento</span>
                </div>
                <rm-badge type="in-progress" [label]="getTasksByStatus('in-progress').length + ''"></rm-badge>
              </div>

              <div class="rm-kanban-col__list">
                @for (task of getTasksByStatus('in-progress'); track task.id) {
                  <rm-task-item [task]="task" (edit)="openEditTaskModal($event)"></rm-task-item>
                } @empty {
                  @if (hasActiveFilters()) {
                    <div class="rm-kanban-empty rm-kanban-empty--filtered">Nenhuma tarefa — filtros ativos</div>
                  } @else {
                    <div class="rm-kanban-empty">Nenhuma tarefa em andamento</div>
                  }
                }
              </div>
            </div>
            <div class="rm-kanban-col">
              <div class="rm-kanban-col__header">
                <div class="rm-kanban-col__title-wrap">
                  <span class="rm-kanban-dot rm-kanban-dot--done"></span>
                  <span class="rm-kanban-col__title">{{ i18n.t('dash.done') }}</span>
                </div>
                <rm-badge type="done" [label]="getTasksByStatus('done').length + ''"></rm-badge>
              </div>

              <div class="rm-kanban-col__list">
                @for (task of getTasksByStatus('done'); track task.id) {
                  <rm-task-item [task]="task" (edit)="openEditTaskModal($event)"></rm-task-item>
                } @empty {
                  @if (hasActiveFilters()) {
                    <div class="rm-kanban-empty rm-kanban-empty--filtered">Nenhuma tarefa — filtros ativos</div>
                  } @else {
                    <div class="rm-kanban-empty">Nenhuma tarefa concluída ainda</div>
                  }
                }
              </div>
            </div>
          </div>
        }
      }
      }
      @if (activeTab() === 'ideas') {

        <div class="rm-category-filter-bar">
          <button
            type="button"
            class="rm-category-chip"
            [class.active]="ideaService.categoryFilter() === 'all'"
            (click)="ideaService.categoryFilter.set('all')"
          >
            Todas ({{ ideaService.totalIdeas() }})
          </button>
          <button
            type="button"
            class="rm-category-chip"
            [class.active]="ideaService.categoryFilter() === 'product'"
            (click)="ideaService.categoryFilter.set('product')"
          >
            <rm-icon name="box" [size]="12"></rm-icon>
            <span>Produto</span>
          </button>
          <button
            type="button"
            class="rm-category-chip"
            [class.active]="ideaService.categoryFilter() === 'workflow'"
            (click)="ideaService.categoryFilter.set('workflow')"
          >
            <rm-icon name="layers" [size]="12"></rm-icon>
            <span>Fluxo</span>
          </button>
          <button
            type="button"
            class="rm-category-chip"
            [class.active]="ideaService.categoryFilter() === 'research'"
            (click)="ideaService.categoryFilter.set('research')"
          >
            <rm-icon name="layers" [size]="12"></rm-icon>
            <span>Pesquisa</span>
          </button>
          <button
            type="button"
            class="rm-category-chip"
            [class.active]="ideaService.categoryFilter() === 'creative'"
            (click)="ideaService.categoryFilter.set('creative')"
          >
            <rm-icon name="lightbulb" [size]="12"></rm-icon>
            <span>Criativo</span>
          </button>
        </div>

        @if (isLoading()) {
          <rm-loading-skeleton variant="card" [count]="3"></rm-loading-skeleton>
        } @else {
          <div class="rm-ideas-list">
            @for (idea of ideaService.filteredIdeas(); track idea.id) {
              <rm-idea-item [idea]="idea" (edit)="openEditIdeaModal($event)"></rm-idea-item>
            } @empty {
              <rm-empty-state
                icon="lightbulb"
                title="Nenhuma ideia nesta categoria"
                description="Registre seus insights antes que eles desapareçam."
                actionLabel="Registrar Ideia"
                actionIcon="plus"
                (action)="openNewIdeaModal()"
              ></rm-empty-state>
            }
          </div>
        }
      }
      <rm-task-form-modal
        [isOpen]="isTaskModalOpen()"
        [editingTask]="editingTask()"
        (isOpenChange)="isTaskModalOpen.set($event)"
      ></rm-task-form-modal>

      <rm-idea-form-modal
        [isOpen]="isIdeaModalOpen()"
        [editingIdea]="editingIdea()"
        (isOpenChange)="isIdeaModalOpen.set($event)"
      ></rm-idea-form-modal>
    </div>
  `,
  styles: [`
    .rm-dashboard {
      display: flex;
      flex-direction: column;
      gap: 20px;
      padding-bottom: 40px;
    }

    .rm-dashboard-toolbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      flex-wrap: wrap;
      min-width: 0;
      @media (max-width: 375px) {
        gap: 10px;
      }
    }

    .rm-tab-group {
      display: flex;
      background: var(--rm-bg-hover);
      padding: 3px;
      border-radius: var(--rm-radius-md);
      gap: 3px;
    }

    .rm-tab-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 7px 14px;
      font-size: 13px;
      font-weight: 500;
      color: var(--rm-text-secondary);
      border-radius: var(--rm-radius-sm);
      transition: all var(--rm-transition-fast);

      &:hover {
        color: var(--rm-text-primary);
      }

      &.active {
        background: var(--rm-bg-surface);
        color: var(--rm-text-primary);
        font-weight: 600;
        box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
      }
    }

    .rm-tab-count {
      font-size: 11px;
      font-weight: 700;
      background: var(--rm-bg-hover);
      padding: 1px 6px;
      border-radius: var(--rm-radius-full);
      color: var(--rm-text-secondary);
    }

    .rm-toolbar-actions {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .rm-view-mode-toggle {
      display: flex;
      background: var(--rm-bg-hover);
      padding: 3px;
      border-radius: var(--rm-radius-md);
      gap: 2px;
    }

    .rm-view-btn {
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--rm-text-muted);
      border-radius: var(--rm-radius-sm);
      transition: all var(--rm-transition-fast);

      &:hover {
        color: var(--rm-text-primary);
      }

      &.active {
        background: var(--rm-bg-surface);
        color: var(--rm-accent);
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
      }
    }
    .rm-filter-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 14px;
      flex-wrap: wrap;
      min-width: 0;
    }

    .rm-filter-search {
      flex: 1 1 260px;
      min-width: 0;
      @media (max-width: 375px) {
        min-width: 0;
        flex-basis: 100%;
      }
    }

    .rm-filter-selects {
      display: flex;
      align-items: center;
      gap: 10px;
      flex-wrap: wrap;
      min-width: 0;
      @media (max-width: 375px) {
        width: 100%;
        .rm-mini-select { flex: 1 1 120px; min-width: 0; }
      }
    }

    .rm-mini-select {
      height: 38px;
      padding: 0 12px;
      background: var(--rm-bg-surface);
      border: 1px solid var(--rm-border-base);
      border-radius: var(--rm-radius-md);
      color: var(--rm-text-secondary);
      font-size: 12.5px;
      outline: none;
      transition: all var(--rm-transition-fast);

      &:focus {
        border-color: var(--rm-accent);
      }
    }
    .rm-tasks-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .rm-kanban-board {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;

      @media (max-width: 768px) {
        grid-template-columns: 1fr;
      }
    }

    .rm-kanban-col {
      background: var(--rm-bg-surface);
      border: 1px solid var(--rm-border-base);
      border-radius: var(--rm-radius-lg);
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      min-height: 400px;
    }

    .rm-kanban-col__header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-bottom: 10px;
      border-bottom: 1px solid var(--rm-border-subtle);
    }

    .rm-kanban-col__title-wrap {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .rm-kanban-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
    }

    .rm-kanban-dot--todo { background: var(--rm-todo); }
    .rm-kanban-dot--progress { background: var(--rm-in-progress); }
    .rm-kanban-dot--done { background: var(--rm-done); }

    .rm-kanban-col__title {
      font-size: 13.5px;
      font-weight: 700;
      color: var(--rm-text-primary);
    }

    .rm-kanban-col__list {
      display: flex;
      flex-direction: column;
      gap: 10px;
      flex: 1;
    }

    .rm-kanban-empty {
      padding: 24px 16px;
      text-align: center;
      font-size: 12px;
      color: var(--rm-text-muted);
      border: 1px dashed var(--rm-border-strong);
      border-radius: var(--rm-radius-md);
      margin-top: 10px;
    }

    .rm-kanban-empty--filtered {
      border-style: solid;
      background: var(--rm-bg-hover);
      color: var(--rm-text-secondary);
    }

    .rm-active-filters-bar,
    .rm-kanban-filter-notice {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 14px;
      background: rgba(99, 102, 241, 0.08);
      border: 1px solid rgba(99, 102, 241, 0.18);
      border-radius: var(--rm-radius-md);
      flex-wrap: wrap;
    }

    .rm-active-filters-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      color: var(--rm-accent);
      background: rgba(99, 102, 241, 0.12);
      padding: 4px 8px;
      border-radius: var(--rm-radius-full);
    }

    .rm-active-filters-count {
      font-size: 11.5px;
      color: var(--rm-text-muted);
    }

    .rm-clear-filters-btn {
      margin-left: auto;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      font-weight: 600;
      color: var(--rm-accent);
      background: var(--rm-bg-surface);
      border: 1px solid rgba(99, 102, 241, 0.25);
      padding: 6px 12px;
      border-radius: var(--rm-radius-full);
      transition: all var(--rm-transition-fast);

      &:hover {
        background: var(--rm-accent);
        color: #fff;
      }
    }

    .rm-filtered-empty {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .rm-filtered-empty__head {
      display: flex;
      justify-content: center;
    }
    .rm-category-filter-bar {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }

    .rm-category-chip {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 6px 14px;
      background: var(--rm-bg-hover);
      border: 1px solid var(--rm-border-base);
      border-radius: var(--rm-radius-full);
      color: var(--rm-text-secondary);
      font-size: 12px;
      font-weight: 500;
      transition: all var(--rm-transition-fast);

      &:hover {
        color: var(--rm-text-primary);
        border-color: var(--rm-border-strong);
      }

      &.active {
        background: var(--rm-accent);
        color: #ffffff;
        border-color: var(--rm-accent);
      }
    }

    .rm-ideas-list {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
  `]
})
export class DashboardComponent {
  readonly i18n = inject(I18nService);
  readonly taskService = inject(TaskService);
  readonly ideaService = inject(IdeaService);

  readonly activeTab = signal<'tasks' | 'ideas'>('tasks');
  readonly viewMode = signal<'list' | 'kanban'>('list');
  readonly isLoading = signal<boolean>(true);

  readonly isTaskModalOpen = signal<boolean>(false);
  readonly editingTask = signal<Task | null>(null);

  readonly isIdeaModalOpen = signal<boolean>(false);
  readonly editingIdea = signal<Idea | null>(null);

  readonly hasActiveFilters = computed(() => {
    return (
      this.taskService.searchQuery().trim() !== '' ||
      this.taskService.statusFilter() !== 'all' ||
      this.taskService.priorityFilter() !== 'all' ||
      this.taskService.tagFilter() !== 'all'
    );
  });

  readonly isFilteredEmpty = computed(() => {
    return (
      this.taskService.filteredTasks().length === 0 &&
      this.taskService.tasks().length > 0 &&
      this.hasActiveFilters()
    );
  });

  constructor() {

    setTimeout(() => this.isLoading.set(false), 750);
  }

  getTasksByStatus(status: TaskStatus): Task[] {

    return this.taskService.filteredTasks().filter(t => t.status === status);
  }

  clearAllFilters(): void {
    this.taskService.searchQuery.set('');
    this.taskService.statusFilter.set('all');
    this.taskService.priorityFilter.set('all');
    this.taskService.tagFilter.set('all');
  }

  openNewTaskModal(): void {
    this.editingTask.set(null);
    this.isTaskModalOpen.set(true);
  }

  openEditTaskModal(task: Task): void {
    this.editingTask.set(task);
    this.isTaskModalOpen.set(true);
  }

  openNewIdeaModal(): void {
    this.editingIdea.set(null);
    this.isIdeaModalOpen.set(true);
  }

  openEditIdeaModal(idea: Idea): void {
    this.editingIdea.set(idea);
    this.isIdeaModalOpen.set(true);
  }

  resetMocks(): void {
    this.isLoading.set(true);
    this.taskService.resetToMock();
    this.ideaService.resetToMock();
    setTimeout(() => this.isLoading.set(false), 600);
  }
}
