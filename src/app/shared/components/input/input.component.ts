import { ChangeDetectionStrategy, Component, computed, input, model, output } from '@angular/core';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'rm-input',
  standalone: true,
  imports: [IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './input.component.html',
  styleUrl: './input.component.css'
})
export class InputComponent {

  private static _counter = 0;
  private readonly _autoId = `rm-input-${InputComponent._counter++}`;

  readonly value = model<string>('');
  readonly label = input<string>('');
  readonly placeholder = input<string>('');
  readonly type = input<string>('text');
  readonly multiline = input<boolean>(false);
  readonly rows = input<number>(3);
  readonly prefixIcon = input<string | undefined>(undefined);
  readonly clearable = input<boolean>(false);
  readonly disabled = input<boolean>(false);
  readonly required = input<boolean>(false);
  readonly errorMessage = input<string | undefined>(undefined);
  readonly hint = input<string | undefined>(undefined);

  readonly inputId = input<string>('');
  readonly effectiveId = computed(() => this.inputId() || this._autoId);

  readonly enterPressed = output<string>();

  onInput(event: Event): void {
    const target = event.target as HTMLInputElement | HTMLTextAreaElement;
    this.value.set(target.value);
  }

  clear(): void {
    this.value.set('');
  }
}
