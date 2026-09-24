import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { IconComponent } from '../icon/icon.component';
import { ButtonComponent, ButtonVariant } from '../button/button.component';

@Component({
  selector: 'rm-empty-state',
  standalone: true,
  imports: [IconComponent, ButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './empty-state.component.html',
  styleUrl: './empty-state.component.css'
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
