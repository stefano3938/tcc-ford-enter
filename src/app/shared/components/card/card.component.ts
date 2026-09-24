import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'rm-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './card.component.html',
  styleUrl: './card.component.css'
})
export class CardComponent {
  readonly interactive = input<boolean>(false);
  readonly glass = input<boolean>(false);
  readonly glow = input<boolean>(false);
  readonly lift = input<boolean>(true);
}
