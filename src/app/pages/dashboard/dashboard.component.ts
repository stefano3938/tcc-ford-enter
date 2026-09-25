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
    InputComponent,
    IconComponent,
    EmptyStateComponent,
    LoadingSkeletonComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
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
