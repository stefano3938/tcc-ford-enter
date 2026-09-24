import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type SkeletonVariant = 'card' | 'list-row' | 'kanban-col' | 'chat-bubble';

@Component({
  selector: 'rm-loading-skeleton',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="rm-skeleton-group" role="status" aria-label="Carregando conteúdo" aria-busy="true">
      @for (i of skeletonArray(); track i) {
        @switch (variant()) {
          @case ('card') {
            <div class="rm-skeleton-card">
              <div class="skeleton-box rm-sk-title"></div>
              <div class="skeleton-box rm-sk-line"></div>
              <div class="skeleton-box rm-sk-line short"></div>
              <div class="rm-sk-footer">
                <div class="skeleton-box rm-sk-pill"></div>
                <div class="skeleton-box rm-sk-pill"></div>
              </div>
            </div>
          }
          @case ('list-row') {
            <div class="rm-skeleton-row">
              <div class="skeleton-box rm-sk-avatar"></div>
              <div class="rm-skeleton-row__main">
                <div class="skeleton-box rm-sk-title"></div>
                <div class="skeleton-box rm-sk-line"></div>
              </div>
              <div class="skeleton-box rm-sk-badge"></div>
            </div>
          }
          @case ('kanban-col') {
            <div class="rm-skeleton-kanban-col">
              <div class="skeleton-box rm-sk-col-header"></div>
              <div class="skeleton-box rm-sk-card-sm"></div>
              <div class="skeleton-box rm-sk-card-sm"></div>
              <div class="skeleton-box rm-sk-card-sm short"></div>
            </div>
          }
          @case ('chat-bubble') {
            <div class="rm-skeleton-chat" [class.even]="i % 2 === 0">
              <div class="skeleton-box rm-sk-avatar"></div>
              <div class="rm-skeleton-chat__bubble">
                <div class="skeleton-box rm-sk-line"></div>
                <div class="skeleton-box rm-sk-line short"></div>
              </div>
            </div>
          }
        }
      }
    </div>
  `,
  styles: [`
    :host { display: block; }

    .rm-skeleton-group {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .rm-skeleton-card {
      background: var(--rm-bg-surface);
      border: 1px solid var(--rm-border-base);
      border-radius: var(--rm-radius-lg);
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .rm-skeleton-row {
      background: var(--rm-bg-surface);
      border: 1px solid var(--rm-border-base);
      border-radius: var(--rm-radius-md);
      padding: 12px 16px;
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .rm-skeleton-row__main {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .rm-skeleton-kanban-col {
      background: var(--rm-bg-surface);
      border: 1px solid var(--rm-border-base);
      border-radius: var(--rm-radius-lg);
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      min-height: 260px;
    }
    .rm-skeleton-chat {
      display: flex;
      gap: 12px;
      max-width: 85%;
      align-self: flex-start;

      &.even {
        align-self: flex-end;
        flex-direction: row-reverse;
      }
    }

    .rm-skeleton-chat__bubble {
      flex: 1;
      background: var(--rm-bg-surface);
      border: 1px solid var(--rm-border-base);
      border-radius: var(--rm-radius-lg);
      padding: 14px 18px;
      display: flex;
      flex-direction: column;
      gap: 8px;
      min-width: 220px;
    }
    .rm-sk-title { height: 14px; width: 60%; }
    .rm-sk-line { height: 10px; width: 100%; }
    .rm-sk-line.short { width: 72%; }
    .rm-sk-pill { height: 18px; width: 54px; border-radius: var(--rm-radius-full); }
    .rm-sk-footer { display: flex; gap: 6px; margin-top: 4px; }
    .rm-sk-avatar { width: 32px; height: 32px; border-radius: 50%; flex-shrink: 0; }
    .rm-sk-badge { width: 64px; height: 20px; border-radius: var(--rm-radius-full); flex-shrink: 0; }
    .rm-sk-col-header { height: 12px; width: 40%; border-radius: var(--rm-radius-sm); }
    .rm-sk-card-sm { height: 58px; border-radius: var(--rm-radius-md); }
    .rm-sk-card-sm.short { width: 85%; }
  `]
})
export class LoadingSkeletonComponent {
  readonly variant = input<SkeletonVariant>('card');
  readonly count = input<number>(3);

  skeletonArray(): number[] {
    return Array.from({ length: this.count() }, (_, i) => i);
  }
}
