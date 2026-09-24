import { ChangeDetectionStrategy, Component, computed, effect, input, signal } from '@angular/core';

export type AvatarSize = 'sm' | 'md' | 'lg' | 'xl';
export type AvatarStatus = 'online' | 'offline' | 'busy' | undefined;

@Component({
  selector: 'rm-avatar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      [class]="'rm-avatar rm-avatar--' + size()"
      [attr.aria-label]="accessibleLabel()"
      role="img"
    >
      @if (src() && !hasError()) {
        <img
          [src]="src()!"
          [alt]="accessibleLabel()"
          class="rm-avatar__img"
          loading="lazy"
          decoding="async"
          (error)="hasError.set(true)"
        />
      } @else {
        <span class="rm-avatar__fallback" aria-hidden="true">{{ initials() }}</span>
      }
      @if (status()) {
        <span [class]="'rm-avatar__status rm-avatar__status--' + status()!" aria-hidden="true"></span>
      }
      @if (showBorder()) {
        <span class="rm-avatar__ring" aria-hidden="true"></span>
      }
    </div>
  `,
  styles: [`
    :host { display: inline-block; line-height: 0; }

    .rm-avatar {
      position: relative;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      background: var(--rm-bg-hover);
      color: var(--rm-text-secondary);
      font-weight: 600;
      overflow: hidden;
      flex-shrink: 0;
      user-select: none;
      border: 1px solid var(--rm-border-base);
    }

    .rm-avatar--sm { width: 28px; height: 28px; font-size: 11px; }
    .rm-avatar--md { width: 36px; height: 36px; font-size: 13px; }
    .rm-avatar--lg { width: 44px; height: 44px; font-size: 15px; }
    .rm-avatar--xl { width: 56px; height: 56px; font-size: 18px; }

    .rm-avatar__img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }

    .rm-avatar__fallback {
      letter-spacing: -0.02em;
    }

    .rm-avatar__status {
      position: absolute;
      bottom: -1px;
      right: -1px;
      width: 10px;
      height: 10px;
      border-radius: 50%;
      border: 2px solid var(--rm-bg-surface);
    }

    .rm-avatar__status--online { background: var(--rm-done); }
    .rm-avatar__status--offline { background: var(--rm-todo); }
    .rm-avatar__status--busy { background: var(--rm-urgent); }

    .rm-avatar--sm .rm-avatar__status { width: 8px; height: 8px; }
    .rm-avatar--xl .rm-avatar__status { width: 12px; height: 12px; }

    .rm-avatar__ring {
      position: absolute;
      inset: -2px;
      border-radius: 50%;
      border: 2px solid var(--rm-accent);
      pointer-events: none;
    }
  `]
})
export class AvatarComponent {
  readonly src = input<string | undefined>(undefined);
  readonly alt = input<string>('Avatar');
  readonly name = input<string>('');
  readonly size = input<AvatarSize>('md');
  readonly status = input<AvatarStatus>(undefined);
  readonly showBorder = input<boolean>(false);

  readonly hasError = signal<boolean>(false);

  constructor() {

    effect(() => {
      this.src();
      this.hasError.set(false);
    }, { allowSignalWrites: true });
  }

  readonly accessibleLabel = computed(() => {
    const a = this.alt().trim();
    const n = this.name().trim();
    if (a && a !== 'Avatar') return a;
    if (n) return `Avatar de ${n}`;
    return 'Avatar';
  });

  readonly initials = computed(() => {
    const n = this.name().trim();
    if (!n) return '?';
    const parts = n.split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return n.slice(0, 2).toUpperCase();
  });
}
