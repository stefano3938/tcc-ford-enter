import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'rm-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      [class]="'rm-card' + (interactive() ? ' rm-card--interactive' : '') + (glass() ? ' rm-card--glass' : '') + (glow() ? ' rm-card--glow' : '')"
    >
      <ng-content select="[card-header]"></ng-content>
      <div class="rm-card__body">
        <ng-content></ng-content>
      </div>
      <ng-content select="[card-footer]"></ng-content>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }

    .rm-card {
      background: var(--rm-bg-card);
      border: 1px solid var(--rm-border-base);
      border-radius: var(--rm-radius-lg);
      padding: 18px 20px;
      box-shadow: var(--rm-shadow-card);
      position: relative;
      overflow: hidden;
      transition: all var(--rm-transition-base);
    }

    .rm-card--interactive {
      cursor: pointer;

      &:hover {
        border-color: var(--rm-border-strong);
        transform: translateY(-2px);
        box-shadow: 0 8px 30px -4px rgba(0, 0, 0, 0.3), 0 0 0 1px var(--rm-border-strong);
      }
    }

    .rm-card--glass {
      background: var(--rm-bg-glass);
      backdrop-filter: blur(20px) saturate(180%);
      -webkit-backdrop-filter: blur(20px) saturate(180%);
    }

    .rm-card--glow {
      border-color: var(--rm-border-glow);
      box-shadow: 0 0 30px -4px rgba(99, 102, 241, 0.25), 0 0 0 1px var(--rm-border-glow);
    }

    .rm-card__body {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
  `]
})
export class CardComponent {
  readonly interactive = input<boolean>(false);
  readonly glass = input<boolean>(false);
  readonly glow = input<boolean>(false);
}
