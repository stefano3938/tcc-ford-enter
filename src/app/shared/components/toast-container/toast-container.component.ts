import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { ToastItem, ToastService } from '../../../core/services/toast.service';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'rm-toast-container',
  standalone: true,
  imports: [IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="rm-toast-viewport" aria-live="polite" aria-atomic="true">
      @for (toast of visibleToasts(); track toast.id) {
        <div
          [class]="'rm-toast rm-toast--' + toast.type"
          role="status"
          (click)="toastService.dismiss(toast.id)"
        >
          <div class="rm-toast__icon">
            @switch (toast.type) {
              @case ('success') {
                <rm-icon name="check-circle" [size]="16"></rm-icon>
              }
              @case ('warning') {
                <rm-icon name="alert-triangle" [size]="16"></rm-icon>
              }
              @case ('error') {
                <rm-icon name="x" [size]="16"></rm-icon>
              }
              @case ('ai') {
                <rm-icon name="sparkles" [size]="16"></rm-icon>
              }
              @default {
                <rm-icon name="info" [size]="16"></rm-icon>
              }
            }
          </div>

          <div class="rm-toast__content">
            <h4 class="rm-toast__title">{{ toast.title }}</h4>
            @if (toast.message) {
              <p class="rm-toast__message">{{ toast.message }}</p>
            }
          </div>

          <button
            type="button"
            class="rm-toast__close"
            (click)="toastService.dismiss(toast.id); $event.stopPropagation()"
            aria-label="Dispensar notificação"
          >
            <rm-icon name="x" [size]="12"></rm-icon>
          </button>
        </div>
      }
    </div>
  `,
  styles: [`
    .rm-toast-viewport {
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 10px;
      max-width: 380px;
      width: calc(100vw - 32px);
      pointer-events: none;
    }

    .rm-toast {
      pointer-events: auto;
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 14px 16px;
      background: var(--rm-bg-elevated);
      border: 1px solid var(--rm-border-strong);
      border-radius: var(--rm-radius-lg);
      box-shadow: var(--rm-shadow-dropdown);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      cursor: pointer;
      animation: toastSlideIn 240ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
      transition: transform var(--rm-transition-fast), opacity var(--rm-transition-fast);

      &:hover {
        transform: translateY(-2px);
      }
    }

    .rm-toast__icon {
      margin-top: 2px;
      flex-shrink: 0;
    }

    .rm-toast--success .rm-toast__icon { color: var(--rm-done); }
    .rm-toast--warning .rm-toast__icon { color: var(--rm-medium); }
    .rm-toast--error .rm-toast__icon { color: var(--rm-urgent); }
    .rm-toast--info .rm-toast__icon { color: var(--rm-in-progress); }
    .rm-toast--ai .rm-toast__icon { color: var(--rm-accent); }

    .rm-toast--ai {
      border-color: rgba(99, 102, 241, 0.35);
      box-shadow: 0 0 20px rgba(99, 102, 241, 0.2);
    }

    .rm-toast__content {
      display: flex;
      flex-direction: column;
      gap: 2px;
      flex: 1;
    }

    .rm-toast__title {
      font-size: 13px;
      font-weight: 600;
      color: var(--rm-text-primary);
      line-height: 1.3;
    }

    .rm-toast__message {
      font-size: 12px;
      color: var(--rm-text-secondary);
      line-height: 1.4;
    }

    .rm-toast__close {
      color: var(--rm-text-muted);
      padding: 4px;
      border-radius: var(--rm-radius-sm);
      transition: color var(--rm-transition-fast);

      &:hover {
        color: var(--rm-text-primary);
      }
    }

    @keyframes toastSlideIn {
      from {
        opacity: 0;
        transform: translateX(20px) scale(0.95);
      }
      to {
        opacity: 1;
        transform: translateX(0) scale(1);
      }
    }
  `]
})
export class ToastContainerComponent {
  readonly toastService = inject(ToastService);
  readonly visibleToasts = computed(() => {
    const all = this.toastService.toasts();
    if (all.length <= 4) return all;
    return all.slice(all.length - 4);
  });
}
