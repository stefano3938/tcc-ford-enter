import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { IconComponent } from '../icon/icon.component';

export type ButtonVariant = 'primary' | 'secondary' | 'subtle' | 'outline' | 'danger' | 'ai';
export type ButtonSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'rm-button',
  standalone: true,
  imports: [IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button
      [type]="type()"
      [disabled]="disabled() || loading()"
      [attr.aria-busy]="loading()"
      [attr.aria-disabled]="disabled() || loading()"
      [class]="'rm-btn rm-btn--' + variant() + ' rm-btn--' + size()"
      [class.rm-btn--loading]="loading()"
      [class.rm-btn--icon-only]="iconOnly()"
      (click)="onClick($event)"
    >
      @if (loading()) {
        <span class="rm-spinner" aria-hidden="true"></span>
      } @else if (icon()) {
        <rm-icon [name]="icon()!" [size]="iconSize()" aria-hidden="true"></rm-icon>
      }

      <span class="rm-btn__content">
        <ng-content></ng-content>
      </span>
    </button>
  `,
  styles: [`
    :host {
      display: inline-block;
    }

    .rm-btn {
      position: relative;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      font-weight: 500;
      border-radius: var(--rm-radius-md);
      transition: all var(--rm-transition-fast);
      white-space: nowrap;
      border: 1px solid transparent;
      user-select: none;
      cursor: pointer;

      &:focus-visible {
        outline: 2px solid var(--rm-accent);
        outline-offset: 2px;
      }

      &:active:not(:disabled) {
        transform: scale(0.97);
      }

      &:disabled {
        opacity: 0.45;
        cursor: not-allowed;
      }
    }
    .rm-btn--sm {
      height: 32px;
      padding: 0 12px;
      font-size: 12px;
      gap: 6px;
    }

    .rm-btn--md {
      height: 40px;
      padding: 0 16px;
      font-size: 13.5px;
    }

    .rm-btn--lg {
      height: 46px;
      padding: 0 22px;
      font-size: 14.5px;
      font-weight: 600;
      border-radius: var(--rm-radius-lg);
    }

    .rm-btn--icon-only {
      padding: 0;
      aspect-ratio: 1 / 1;
    }
    .rm-btn--primary {
      background: var(--rm-accent);
      color: #ffffff;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.15), 0 0 16px rgba(99, 102, 241, 0.25);

      &:hover:not(:disabled) {
        background: var(--rm-accent-hover);
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2), 0 0 24px rgba(99, 102, 241, 0.4);
      }
    }

    .rm-btn--secondary {
      background: var(--rm-bg-hover);
      color: var(--rm-text-primary);
      border-color: var(--rm-border-base);

      &:hover:not(:disabled) {
        background: var(--rm-bg-active);
        border-color: var(--rm-border-strong);
      }
    }

    .rm-btn--subtle {
      background: transparent;
      color: var(--rm-text-secondary);

      &:hover:not(:disabled) {
        background: var(--rm-bg-hover);
        color: var(--rm-text-primary);
      }
    }

    .rm-btn--outline {
      background: transparent;
      color: var(--rm-text-primary);
      border-color: var(--rm-border-strong);

      &:hover:not(:disabled) {
        background: var(--rm-bg-hover);
        border-color: var(--rm-accent);
        color: var(--rm-accent);
      }
    }

    .rm-btn--danger {
      background: rgba(244, 63, 94, 0.08);
      color: var(--rm-urgent);
      border-color: rgba(244, 63, 94, 0.2);

      &:hover:not(:disabled) {
        background: var(--rm-urgent);
        color: #ffffff;
      }
    }

    .rm-btn--ai {
      background: var(--rm-ai-gradient);
      color: #ffffff;
      box-shadow: 0 2px 14px rgba(139, 92, 246, 0.3);

      &:hover:not(:disabled) {
        filter: brightness(1.08);
        box-shadow: 0 4px 22px rgba(139, 92, 246, 0.5);
        transform: translateY(-1px);
      }
    }
    .rm-spinner {
      width: 14px;
      height: 14px;
      border: 2px solid currentColor;
      border-right-color: transparent;
      border-radius: 50%;
      animation: spin 0.6s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `]
})
export class ButtonComponent {
  readonly variant = input<ButtonVariant>('secondary');
  readonly size = input<ButtonSize>('md');
  readonly disabled = input<boolean>(false);
  readonly loading = input<boolean>(false);
  readonly icon = input<string | undefined>(undefined);
  readonly iconOnly = input<boolean>(false);
  readonly type = input<'button' | 'submit' | 'reset'>('button');

  readonly clicked = output<MouseEvent>();

  iconSize(): number {
    switch (this.size()) {
      case 'sm': return 13;
      case 'lg': return 17;
      default: return 15;
    }
  }

  onClick(event: MouseEvent): void {
    if (!this.disabled() && !this.loading()) {
      this.clicked.emit(event);
    }
  }
}
