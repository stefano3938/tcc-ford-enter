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
  templateUrl: './badge.component.html',
  styleUrl: './badge.component.css'
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
