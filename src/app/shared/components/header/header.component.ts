import { ChangeDetectionStrategy, Component, inject, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ThemeService } from '../../../core/services/theme.service';
import { UserService } from '../../../core/services/user.service';
import { TaskService } from '../../../core/services/task.service';
import { AuthService } from '../../../core/services/auth.service';
import { ButtonComponent } from '../button/button.component';
import { BadgeComponent } from '../badge/badge.component';
import { IconComponent } from '../icon/icon.component';
import { AvatarComponent } from '../avatar/avatar.component';

@Component({
  selector: 'rm-header',
  standalone: true,
  imports: [RouterLink, ButtonComponent, BadgeComponent, IconComponent, AvatarComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="rm-header glass-panel">
      <div class="rm-header__left">
        <button
          type="button"
          class="rm-header__menu-btn"
          (click)="toggleMenu.emit()"
          aria-label="Abrir menu de navegação"
        >
          <rm-icon name="menu" [size]="16"></rm-icon>
        </button>

        <a routerLink="/dashboard" class="rm-logo">
          <div class="rm-logo__mark">
            <rm-icon name="check-square" [size]="16"></rm-icon>
          </div>
          <span class="rm-logo__text">Redmind<span class="rm-logo__accent">Me</span></span>
        </a>

        <div class="rm-header__status-badge">
          @if (taskService.totalCount() > 0) {
            <rm-badge
              type="neutral"
              [showDot]="true"
              [label]="taskService.doneCount() + '/' + taskService.totalCount() + ' concluídas (' + taskService.completionPercentage() + '%)'"
            ></rm-badge>
          }
        </div>
      </div>

      <div class="rm-header__right">

        <div class="rm-header__ai-quota" (click)="openAiPaywall()">
          <span class="ai-pill">
            <rm-icon name="layers" [size]="12"></rm-icon>
            @if (userService.isPro()) {
              PRO ILIMITADO
            } @else {
              {{ userService.aiRemaining() }} IA restante(s)
            }
          </span>
        </div>
        @if (!userService.isPro()) {
          <rm-button
            variant="ai"
            size="sm"
            icon="crown"
            (clicked)="userService.openPaywall('Upgrade para desbloquear todos os superpoderes de IA.')"
          >
            Upgrade Pro
          </rm-button>
        }
        <button
          type="button"
          class="rm-header__action-btn"
          (click)="themeService.toggleTheme()"
          [attr.aria-label]="themeService.theme() === 'dark' ? 'Ativar modo claro' : 'Ativar modo escuro'"
          [title]="themeService.theme() === 'dark' ? 'Ativar modo claro' : 'Ativar modo escuro'"
        >
          @if (themeService.theme() === 'dark') {
            <rm-icon name="sun" [size]="15"></rm-icon>
          } @else {
            <rm-icon name="moon" [size]="15"></rm-icon>
          }
        </button>
        <div class="rm-user-pill" [title]="userService.currentUser().name">
          <rm-avatar
            [src]="userService.currentUser().avatarUrl"
            [name]="userService.currentUser().name"
            size="sm"
            [alt]="userService.currentUser().name"
          ></rm-avatar>
          <div class="rm-user-pill__info">
            <span class="rm-user-pill__name">{{ userService.currentUser().name }}</span>
            <rm-badge
              [type]="userService.isPro() ? 'pro' : 'neutral'"
              [label]="userService.currentUser().plan.toUpperCase()"
            ></rm-badge>
          </div>
        </div>
        <button
          type="button"
          class="rm-header__action-btn rm-header__action-btn--logout"
          (click)="authService.logout()"
          title="Encerrar sessão"
          aria-label="Encerrar sessão"
        >
          <rm-icon name="log-out" [size]="15"></rm-icon>
        </button>
      </div>
    </header>
  `,
  styles: [`
    .rm-header {
      position: sticky;
      top: 0;
      z-index: 100;
      min-height: 60px;
      height: auto;
      padding: 8px 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      border-bottom: 1px solid var(--rm-border-base);
      flex-wrap: wrap;
      min-width: 0;
      @media (max-width: 768px) {
        padding: 8px 14px;
        gap: 8px;
      }
      @media (max-width: 375px) {
        padding: 8px 10px;
      }
    }

    .rm-header__left,
    .rm-header__right {
      display: flex;
      align-items: center;
      gap: 10px;
      min-width: 0;
      flex-wrap: wrap;
    }

    .rm-header__left {
      flex: 1 1 auto;
      min-width: 0;
    }

    .rm-header__right {
      flex: 0 1 auto;
      justify-content: flex-end;
      min-width: 0;
    }

    .rm-header__menu-btn {
      display: none;
      align-items: center;
      justify-content: center;
      width: 34px;
      height: 34px;
      border-radius: var(--rm-radius-md);
      color: var(--rm-text-secondary);
      background: var(--rm-bg-hover);
      border: 1px solid var(--rm-border-base);

      @media (max-width: 900px) {
        display: flex;
      }
    }

    .rm-logo {
      display: flex;
      align-items: center;
      gap: 10px;
      user-select: none;
      min-width: 0;
      flex-shrink: 1;
    }

    .rm-logo__mark {
      width: 32px;
      height: 32px;
      border-radius: var(--rm-radius-md);
      background: var(--rm-accent);
      color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 10px rgba(99, 102, 241, 0.3);
    }

    .rm-logo__text {
      font-size: 17px;
      font-weight: 700;
      letter-spacing: -0.02em;
      color: var(--rm-text-primary);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      min-width: 0;
      @media (max-width: 375px) {
        font-size: 15px;
      }
    }

    .rm-logo__accent {
      color: var(--rm-accent);
      margin-left: 1px;
    }

    .rm-header__status-badge {
      display: block;
      @media (max-width: 700px) {
        display: none;
      }
    }

    .rm-header__ai-quota {
      cursor: pointer;
      transition: transform var(--rm-transition-fast);
      min-width: 0;
      flex-shrink: 1;
      &:hover {
        transform: scale(1.03);
      }
      @media (max-width: 375px) {
        font-size: 10px;
      }
    }

    .rm-header__action-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      border-radius: var(--rm-radius-md);
      background: var(--rm-bg-hover);
      color: var(--rm-text-secondary);
      border: 1px solid var(--rm-border-base);
      transition: all var(--rm-transition-fast);

      &:hover {
        background: var(--rm-bg-active);
        color: var(--rm-text-primary);
        border-color: var(--rm-border-strong);
      }
    }

    .rm-header__action-btn--logout:hover {
      color: var(--rm-urgent);
      background: rgba(244, 63, 94, 0.08);
      border-color: rgba(244, 63, 94, 0.2);
    }

    .rm-user-pill {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 4px 10px 4px 4px;
      background: var(--rm-bg-hover);
      border: 1px solid var(--rm-border-base);
      border-radius: var(--rm-radius-full);
      user-select: none;
      min-width: 0;
      max-width: 180px;
      @media (max-width: 375px) {
        max-width: 120px;
        padding: 3px 8px 3px 3px;
      }
    }

    .rm-user-pill__avatar {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      object-fit: cover;
    }

    .rm-user-pill__info {
      display: flex;
      align-items: center;
      gap: 6px;
      min-width: 0;
      overflow: hidden;
    }

    .rm-user-pill__name {
      font-size: 12.5px;
      font-weight: 500;
      color: var(--rm-text-primary);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      min-width: 0;
      @media (max-width: 600px) {
        display: none;
      }
    }
  `]
})
export class HeaderComponent {
  readonly themeService = inject(ThemeService);
  readonly userService = inject(UserService);
  readonly taskService = inject(TaskService);
  readonly authService = inject(AuthService);

  readonly toggleMenu = output<void>();

  openAiPaywall(): void {
    if (!this.userService.isPro()) {
      this.userService.openPaywall('Acesso ilimitado à inteligência generativa e expansão de ideias.');
    }
  }
}
