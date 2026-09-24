import { ChangeDetectionStrategy, Component, computed, effect, input, signal } from '@angular/core';

export type AvatarSize = 'sm' | 'md' | 'lg' | 'xl';
export type AvatarStatus = 'online' | 'offline' | 'busy' | undefined;

@Component({
  selector: 'rm-avatar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './avatar.component.html',
  styleUrl: './avatar.component.css'
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
