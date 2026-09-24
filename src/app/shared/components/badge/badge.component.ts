import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { IconComponent } from '../icon/icon.component';

export type BadgeType =
  | 'todo' | 'in-progress' | 'done'
  | 'urgent' | 'high' | 'medium' | 'low'
  | 'ai' | 'neutral' | 'pro';

@Component({
  selector: 'rm-badge',
  standalone: true,
  imports: [IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span [class]="'rm-badge rm-badge--' + resolvedType()" [class.rm-badge--clickable]="clickable()">
      @if (showDot()) {
        <span class="rm-badge__dot" aria-hidden="true"></span>
      }
      @if (icon()) {
        <rm-icon [name]="icon()!" [size]="11" class="rm-badge__icon" aria-hidden="true"></rm-icon>
      }
      <span class="rm-badge__label">
        <ng-content>{{ label() }}</ng-content>
      </span>
    </span>
  `,
  styles: [`
    :host {
      display: inline-block;
      vertical-align: middle;
    }

    .rm-badge {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      font-size: 11px;
      font-weight: 500;
      letter-spacing: 0.02em;
      padding: 2.5px 8px;
      border-radius: var(--rm-radius-full);
      line-height: 1.2;
      border: 1px solid transparent;
      user-select: none;
      transition: all var(--rm-transition-fast);
    }

    .rm-badge--clickable {
      cursor: pointer;
      &:hover {
        filter: brightness(1.1);
        transform: translateY(-0.5px);
      }
    }

    .rm-badge__dot {
      width: 5px;
      height: 5px;
      border-radius: 50%;
      background-color: currentColor;
    }

    .rm-badge__icon {
      line-height: 0;
    }
    .rm-badge--todo {
      background: var(--rm-todo-bg);
      color: var(--rm-todo);
      border-color: rgba(148, 163, 184, 0.2);
    }

    .rm-badge--in-progress {
      background: var(--rm-in-progress-bg);
      color: var(--rm-in-progress);
      border-color: rgba(56, 189, 248, 0.25);
    }

    .rm-badge--done {
      background: var(--rm-done-bg);
      color: var(--rm-done);
      border-color: rgba(16, 185, 129, 0.25);
    }

    .rm-badge--urgent {
      background: var(--rm-urgent-bg);
      color: var(--rm-urgent);
      border-color: rgba(244, 63, 94, 0.25);
      font-weight: 600;
    }

    .rm-badge--high {
      background: var(--rm-high-bg);
      color: var(--rm-high);
      border-color: rgba(249, 115, 22, 0.25);
    }

    .rm-badge--medium {
      background: var(--rm-medium-bg);
      color: var(--rm-medium);
      border-color: rgba(234, 179, 8, 0.25);
    }

    .rm-badge--low {
      background: var(--rm-low-bg);
      color: var(--rm-low);
      border-color: rgba(100, 116, 139, 0.2);
    }

    .rm-badge--ai {
      background: rgba(109, 40, 217, 0.14);
      color: #581c87;
      border-color: rgba(109, 40, 217, 0.28);
      font-weight: 600;
    }

    :host-context(body.dark-mode) .rm-badge--ai,
    body.dark-mode .rm-badge--ai {
      background: rgba(139, 92, 246, 0.22);
      color: #d8b4fe;
      border-color: rgba(168, 85, 247, 0.35);
    }

    .rm-badge--pro {
      background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
      color: #000000;
      font-weight: 700;
      box-shadow: 0 0 10px rgba(245, 158, 11, 0.3);
    }

    .rm-badge--neutral {
      background: var(--rm-bg-hover);
      color: var(--rm-text-secondary);
      border-color: var(--rm-border-base);
    }
  `]
})
export class BadgeComponent {
  readonly type = input<BadgeType | string>('neutral');
  readonly label = input<string>('');
  readonly icon = input<string | undefined>(undefined);
  readonly showDot = input<boolean>(false);
  readonly clickable = input<boolean>(false);

  readonly resolvedType = computed(() => {
    const raw = this.type().toLowerCase();
    const valid: BadgeType[] = ['todo', 'in-progress', 'done', 'urgent', 'high', 'medium', 'low', 'ai', 'neutral', 'pro'];
    return (valid.includes(raw as BadgeType) ? raw : 'neutral') as BadgeType;
  });
}
