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
  template: `
    @if (isOpenMobile()) {
      <div class="rm-sidebar-backdrop" (click)="closeMobile.emit()"></div>
    }

    <aside class="rm-sidebar glass-panel" [class.rm-sidebar--open-mobile]="isOpenMobile()">

      <nav class="rm-nav-group">
        <span class="rm-nav-group__title">{{ i18n.t('nav.group.productivity') }}</span>

        <a
          routerLink="/dashboard"
          routerLinkActive="active"
          [routerLinkActiveOptions]="{ exact: true }"
          class="rm-nav-item"
          (click)="closeMobile.emit()"
        >
          <div class="rm-nav-item__main">
            <rm-icon name="check-square" [size]="15" class="rm-nav-item__icon"></rm-icon>
            <span>{{ i18n.t('nav.dashboard') }}</span>
          </div>
          <span class="rm-nav-item__count">{{ taskService.todoCount() }}</span>
        </a>

        <a
          routerLink="/ai-assistant"
          routerLinkActive="active"
          class="rm-nav-item rm-nav-item--ai"
          (click)="closeMobile.emit()"
        >
          <div class="rm-nav-item__main">
            <rm-icon name="message-square" [size]="15" class="rm-nav-item__icon"></rm-icon>
            <span>{{ i18n.t('ai.title') }}</span>
          </div>
          <rm-badge type="ai" label="COPILOT"></rm-badge>
        </a>

        <a
          routerLink="/planos"
          routerLinkActive="active"
          class="rm-nav-item"
          (click)="closeMobile.emit()"
        >
          <div class="rm-nav-item__main">
            <rm-icon name="crown" [size]="15" class="rm-nav-item__icon"></rm-icon>
            <span>{{ i18n.t('nav.pricing') }}</span>
          </div>
          @if (!userService.isPro()) {
            <rm-badge type="pro" label="PRO"></rm-badge>
          }
        </a>
      </nav>
      <div class="rm-nav-group">
        <span class="rm-nav-group__title">{{ i18n.t('nav.group.filters') }}</span>

        <button
          type="button"
          class="rm-filter-btn"
          [class.active]="taskService.statusFilter() === 'all' && taskService.priorityFilter() === 'all'"
          (click)="setFilter('all', 'all')"
        >
          <div class="rm-nav-item__main">
            <rm-icon name="list" [size]="14" class="rm-nav-item__icon"></rm-icon>
            <span>{{ i18n.t('nav.filter.allTasks') }}</span>
          </div>
          <span class="rm-nav-item__count">{{ taskService.totalCount() }}</span>
        </button>

        <button
          type="button"
          class="rm-filter-btn"
          [class.active]="taskService.priorityFilter() === 'urgent'"
          (click)="setFilter('all', 'urgent')"
        >
          <div class="rm-nav-item__main">
            <rm-icon name="flame" [size]="14" class="rm-nav-item__icon text-urgent"></rm-icon>
            <span>{{ i18n.t('dash.filter.urgent') }}</span>
          </div>
          <span class="rm-nav-item__count text-urgent">{{ taskService.urgentCount() }}</span>
        </button>

        <button
          type="button"
          class="rm-filter-btn"
          [class.active]="taskService.statusFilter() === 'in-progress'"
          (click)="setFilter('in-progress', 'all')"
        >
          <div class="rm-nav-item__main">
            <rm-icon name="clock" [size]="14" class="rm-nav-item__icon text-progress"></rm-icon>
            <span>{{ i18n.t('dash.doing') }}</span>
          </div>
          <span class="rm-nav-item__count">{{ taskService.inProgressCount() }}</span>
        </button>

        <button
          type="button"
          class="rm-filter-btn"
          [class.active]="taskService.statusFilter() === 'done'"
          (click)="setFilter('done', 'all')"
        >
          <div class="rm-nav-item__main">
            <rm-icon name="check-circle" [size]="14" class="rm-nav-item__icon text-done"></rm-icon>
            <span>{{ i18n.t('dash.done') }}</span>
          </div>
          <span class="rm-nav-item__count">{{ taskService.doneCount() }}</span>
        </button>
      </div>
      @if (taskService.allTags().length > 0) {
        <div class="rm-nav-group">
          <div class="rm-tags-header">
            <span class="rm-nav-group__title" style="padding-bottom:0">TAGS</span>
            @if (taskService.allTags().length > 5) {
              <button type="button" class="rm-tags-toggle" (click)="toggleShowAllTags()" [attr.aria-label]="showAllTags() ? 'Recolher tags' : 'Mostrar todas as tags'" [attr.aria-expanded]="showAllTags()">
                <rm-icon [name]="showAllTags() ? 'chevron-left' : 'chevron-right'" [size]="12"></rm-icon>
                <span>{{ showAllTags() ? 'menos' : taskService.allTags().length + ' tags' }}</span>
              </button>
            }
          </div>
          <div class="rm-tags-cloud">
            @for (tag of visibleTags(); track tag) {
              <button
                type="button"
                class="rm-tag-chip"
                [class.active]="taskService.tagFilter() === tag"
                (click)="toggleTag(tag)"
              >
                {{ tag }}
              </button>
            }
          </div>
        </div>
      }

      <div class="rm-sidebar__spacer"></div>
      <div class="rm-quota-widget">
        @if (userService.isPro()) {
          <div class="rm-pro-badge-card">
            <div class="rm-pro-badge-card__header">
              <rm-icon name="shield" [size]="14" class="text-pro"></rm-icon>
              <span class="rm-pro-badge-card__title">{{ i18n.t('nav.proActive') }}</span>
            </div>
            <p class="rm-pro-badge-card__desc">Tarefas, ideias e IA sem limites.</p>
          </div>
        } @else {
          <div class="rm-free-quota-card">
            <div class="rm-free-quota-card__header">
              <span class="rm-free-quota-card__title">Plano Starter</span>
              <span class="rm-free-quota-card__val">{{ taskService.totalCount() }}/{{ userService.currentUser().quotas.tasksMax }}</span>
            </div>
            <div class="rm-progress-track">
              <div
                class="rm-progress-fill"
                [style.width.%]="(taskService.totalCount() / userService.currentUser().quotas.tasksMax) * 100"
              ></div>
            </div>

            <p class="rm-free-quota-card__note">
              {{ userService.currentUser().quotas.tasksMax - taskService.totalCount() }} tarefas restantes
            </p>

            <rm-button
              variant="ai"
              size="sm"
              icon="arrow-right"
              (clicked)="userService.openPaywall('Desbloqueie tarefas, ideias e IA generativa infinitas com o Pro.')"
            >
              Liberar Ilimitado
            </rm-button>
          </div>
        }
        <button
          type="button"
          class="rm-sidebar-logout-btn"
          (click)="authService.logout()"
        >
          <rm-icon name="log-out" [size]="14"></rm-icon>
          <span>Sair da Conta</span>
        </button>
      </div>
    </aside>
  `,
  styles: [`
    .rm-sidebar {
      width: 250px;
      height: calc(100vh - 60px);
      position: sticky;
      top: 60px;
      display: flex;
      flex-direction: column;
      padding: 20px 16px;
      border-right: 1px solid var(--rm-border-base);
      overflow-y: auto;
      gap: 18px;
      flex-shrink: 0;

      @media (max-width: 900px) {
        position: fixed;
        left: 0;
        top: 0;
        height: 100vh;
        z-index: 1050;
        transform: translateX(-100%);
        transition: transform var(--rm-transition-base);
        background: var(--rm-bg-elevated);
      }
    }

    .rm-sidebar--open-mobile {
      transform: translateX(0);
    }

    .rm-sidebar-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.4);
      backdrop-filter: blur(4px);
      z-index: 1040;
    }

    .rm-nav-group {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .rm-nav-group__title {
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.06em;
      color: var(--rm-text-muted);
      padding: 0 10px 6px;
    }

    .rm-nav-item,
    .rm-filter-btn {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      padding: 8px 12px;
      border-radius: var(--rm-radius-md);
      color: var(--rm-text-secondary);
      font-size: 13.5px;
      font-weight: 500;
      transition: all var(--rm-transition-fast);
      width: 100%;
      text-align: left;
      border: 1px solid transparent;

      &:hover {
        background: var(--rm-bg-hover);
        color: var(--rm-text-primary);
      }

      &.active {
        background: var(--rm-bg-active);
        color: var(--rm-text-primary);
        font-weight: 600;
        border-color: var(--rm-border-base);
      }
    }

    .rm-nav-item--ai.active {
      background: rgba(99, 102, 241, 0.08);
      color: var(--rm-accent);
      border-color: rgba(99, 102, 241, 0.25);
    }

    .rm-nav-item__main {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .rm-nav-item__icon {
      flex-shrink: 0;
    }

    .rm-nav-item__count {
      font-size: 11px;
      font-weight: 600;
      color: var(--rm-text-muted);
      background: var(--rm-bg-hover);
      padding: 2px 7px;
      border-radius: var(--rm-radius-full);
    }

    .text-urgent { color: var(--rm-urgent) !important; }
    .text-progress { color: var(--rm-in-progress) !important; }
    .text-done { color: var(--rm-done) !important; }
    .text-pro { color: #d97706 !important; }

    .rm-tags-cloud {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      padding: 4px 8px;
    }

    .rm-tag-chip {
      font-size: 11px;
      padding: 3px 8px;
      border-radius: var(--rm-radius-sm);
      background: var(--rm-bg-hover);
      color: var(--rm-text-secondary);
      border: 1px solid var(--rm-border-base);
      transition: all var(--rm-transition-fast);

      &:hover {
        background: var(--rm-bg-active);
        color: var(--rm-text-primary);
      }

      &.active {
        background: var(--rm-accent);
        color: #ffffff;
        border-color: var(--rm-accent);
      }
    }

    .rm-tags-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 8px 6px;
      gap: 8px;
    }

    .rm-tags-toggle {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      font-size: 11px;
      font-weight: 600;
      color: var(--rm-accent);
      background: var(--rm-accent-light);
      border: 1px solid rgba(99,102,241,0.18);
      padding: 3px 7px;
      border-radius: var(--rm-radius-full);
      transition: all var(--rm-transition-fast);
      &:hover{ background: var(--rm-accent); color: #fff; }
    }

    .rm-tags-hint {
      font-size: 10.5px;
      color: var(--rm-text-muted);
      padding: 2px 8px;
    }

    .rm-sidebar__spacer {
      flex: 1;
    }

    .rm-quota-widget {
      margin-top: auto;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .rm-pro-badge-card {
      padding: 12px 14px;
      background: rgba(245, 158, 11, 0.08);
      border: 1px solid rgba(245, 158, 11, 0.25);
      border-radius: var(--rm-radius-lg);
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .rm-pro-badge-card__header {
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 600;
      font-size: 12.5px;
      color: #d97706;
    }

    .rm-pro-badge-card__desc {
      font-size: 11.5px;
      color: var(--rm-text-secondary);
    }

    .rm-free-quota-card {
      padding: 14px;
      background: var(--rm-bg-hover);
      border: 1px solid var(--rm-border-base);
      border-radius: var(--rm-radius-lg);
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .rm-free-quota-card__header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 12px;
      font-weight: 600;
      color: var(--rm-text-primary);
    }

    .rm-free-quota-card__val {
      font-size: 11.5px;
      color: var(--rm-text-muted);
    }

    .rm-progress-track {
      width: 100%;
      height: 6px;
      background: var(--rm-bg-active);
      border-radius: var(--rm-radius-full);
      overflow: hidden;
    }

    .rm-progress-fill {
      height: 100%;
      background: var(--rm-accent);
      border-radius: var(--rm-radius-full);
      transition: width var(--rm-transition-base);
    }

    .rm-free-quota-card__note {
      font-size: 11px;
      color: var(--rm-text-muted);
    }

    .rm-sidebar-logout-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 12px;
      font-size: 12.5px;
      font-weight: 500;
      color: var(--rm-text-muted);
      border-radius: var(--rm-radius-md);
      transition: all var(--rm-transition-fast);
      width: 100%;

      &:hover {
        background: rgba(244, 63, 94, 0.08);
        color: var(--rm-urgent);
      }
    }
  `]
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
