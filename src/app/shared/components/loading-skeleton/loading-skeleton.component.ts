import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { I18nService } from '../../../core/services/i18n.service';

export type SkeletonVariant = 'card' | 'list-row' | 'kanban-col' | 'chat-bubble';

@Component({
  selector: 'rm-loading-skeleton',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './loading-skeleton.component.html',
  styleUrl: './loading-skeleton.component.css'
})
export class LoadingSkeletonComponent {
  readonly i18n = inject(I18nService);
  readonly variant = input<SkeletonVariant>('card');
  readonly count = input<number>(3);

  skeletonArray(): number[] {
    return Array.from({ length: this.count() }, (_, i) => i);
  }
}
