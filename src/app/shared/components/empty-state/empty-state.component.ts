import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { IconComponent } from '../icon/icon.component';
import { ButtonComponent, ButtonVariant } from '../button/button.component';

@Component({
  selector: 'rm-empty-state',
  standalone: true,
  imports: [IconComponent, ButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="rm-empty-state" role="status" aria-live="polite">
      <div class="rm-empty-state__icon-wrap" aria-hidden="true">
        <rm-icon [name]="icon()" [size]="28" class="rm-empty-state__icon"></rm-icon>
      </div>
      <h4 class="rm-empty-state__title">{{ title() }}</h4>
      @if (description()) {
        <p class="rm-empty-state__desc">{{ description() }}</p>
      }
      @if (actionLabel()) {
        <rm-button
          [variant]="actionVariant()"
          size="sm"
          [icon]="actionIcon()"
          (clicked)="action.emit()"
        >
          {{ actionLabel() }}
        </rm-button>
      }
      <ng-content></ng-content>
    </div>
  `,
  styles: [`
    :host { display: block; }

    .rm-empty-state {
      padding: 50px 20px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      gap: 12px;
      background: var(--rm-bg-surface);
      border: 1px dashed var(--rm-border-strong);
      border-radius: var(--rm-radius-lg);
      animation: fadeIn var(--rm-transition-base) forwards;
    }

    .rm-empty-state__icon-wrap {
      width: 52px;
      height: 52px;
      border-radius: var(--rm-radius-md);
      background: var(--rm-bg-hover);
      border: 1px solid var(--rm-border-base);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 4px;
    }

    .rm-empty-state__icon {
      color: var(--rm-text-muted);
    }

    .rm-empty-state__title {
      font-size: 16px;
      font-weight: 600;
      color: var(--rm-text-primary);
      letter-spacing: -0.01em;
    }

    .rm-empty-state__desc {
      font-size: 13px;
      color: var(--rm-text-secondary);
      max-width: 380px;
      line-height: 1.5;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(6px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class EmptyStateComponent {
  readonly icon = input<string>('list');
  readonly title = input<string>('Nenhum item encontrado');
  readonly description = input<string>('');
  readonly actionLabel = input<string>('');
  readonly actionIcon = input<string>('plus');
  readonly actionVariant = input<ButtonVariant>('outline');

  readonly action = output<void>();
}
