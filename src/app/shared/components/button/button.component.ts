import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { IconComponent } from '../icon/icon.component';

export type ButtonVariant = 'primary' | 'secondary' | 'subtle' | 'outline' | 'danger' | 'ai';
export type ButtonSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'rm-button',
  standalone: true,
  imports: [IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './button.component.html',
  styleUrl: './button.component.css'
})
export class ButtonComponent {
  readonly variant = input<ButtonVariant>('secondary');
  readonly size = input<ButtonSize>('md');
  readonly disabled = input<boolean>(false);
  readonly loading = input<boolean>(false);
  readonly icon = input<string | undefined>(undefined);
  readonly iconOnly = input<boolean>(false);
  readonly type = input<'button' | 'submit' | 'reset'>('button');
  /** Required when the visible text is hidden (icon-only on small screens). */
  readonly ariaLabel = input<string>('');
  readonly ariaPressed = input<boolean | null>(null);

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
