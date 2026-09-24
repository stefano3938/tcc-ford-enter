import { ChangeDetectionStrategy, Component, ElementRef, computed, inject, input, model, output } from '@angular/core';
import { IconComponent } from '../icon/icon.component';
import { I18nService } from '../../../core/services/i18n.service';

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
  private readonly host = inject(ElementRef<HTMLElement>);
  readonly i18n = inject(I18nService);

  readonly value = model<string>('');
  readonly label = input<string>('');
  /** Accessible name for fields that show no visible label (e.g. a search box). */
  readonly ariaLabel = input<string>('');
  readonly placeholder = input<string>('');
  readonly type = input<string>('text');
  readonly autocomplete = input<string>('');
  readonly enterKeyHint = input<string>('');
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
  readonly messageId = `${this._autoId}-msg`;
  readonly describedBy = computed(() => (this.errorMessage() || this.hint() ? this.messageId : null));

  readonly enterPressed = output<string>();

  onInput(event: Event): void {
    const target = event.target as HTMLInputElement | HTMLTextAreaElement;
    this.value.set(target.value);
  }

  clear(): void {
    this.value.set('');
    // Keep the keyboard user in the field instead of dropping focus on <body>
    this.host.nativeElement.querySelector('input, textarea')?.focus();
  }
}
