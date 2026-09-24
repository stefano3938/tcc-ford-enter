import { ChangeDetectionStrategy, Component, computed, inject, input, output, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { TaskService } from '../../../core/services/task.service';
import { IdeaService } from '../../../core/services/idea.service';
import { UserService } from '../../../core/services/user.service';
import { AuthService } from '../../../core/services/auth.service';
import { BadgeComponent } from '../badge/badge.component';
import { ButtonComponent } from '../button/button.component';
import { IconComponent } from '../icon/icon.component';
import { I18nService } from '../../../core/services/i18n.service';

@Component({
  selector: 'rm-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, BadgeComponent, ButtonComponent, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent {
  readonly i18n = inject(I18nService);
  readonly taskService = inject(TaskService);
  readonly ideaService = inject(IdeaService);
  readonly userService = inject(UserService);
  readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly isOpenMobile = input<boolean>(false);
  readonly closeMobile = output<void>();

  readonly showAllTags = signal<boolean>(false);
  readonly visibleTags = computed(() => this.showAllTags() ? this.taskService.allTags() : this.taskService.allTags().slice(0, 5));

  toggleShowAllTags(): void {
    this.showAllTags.update(v => !v);
  }

  setFilter(status: any, priority: any): void {
    this.taskService.statusFilter.set(status);
    this.taskService.priorityFilter.set(priority);
    this.taskService.tagFilter.set('all');
    this.taskService.searchQuery.set('');
    this.router.navigate(['/dashboard']);
    this.closeMobile.emit();
  }

  clearAllFilters(): void {
    this.taskService.searchQuery.set('');
    this.taskService.statusFilter.set('all');
    this.taskService.priorityFilter.set('all');
    this.taskService.tagFilter.set('all');
  }

  toggleTag(tag: string): void {
    if (this.taskService.tagFilter() === tag) {
      this.taskService.tagFilter.set('all');
    } else {
      this.taskService.tagFilter.set(tag);
    }
    this.router.navigate(['/dashboard']);
    this.closeMobile.emit();
  }
}
