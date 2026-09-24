import { ChangeDetectionStrategy, Component, computed, input, model, output } from '@angular/core';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'rm-input',
  standalone: true,
  imports: [IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="rm-field" [class.rm-field--has-error]="!!errorMessage()" [class.rm-field--disabled]="disabled()">
      @if (label()) {
        <label [for]="effectiveId()" class="rm-field__label">
          {{ label() }}
          @if (required()) {
            <span class="rm-field__required" aria-hidden="true">*</span>
          }
        </label>
      }

      <div class="rm-field__control">
        @if (prefixIcon()) {
          <rm-icon [name]="prefixIcon()!" [size]="14" class="rm-field__icon rm-field__icon--prefix" aria-hidden="true"></rm-icon>
        }

        @if (multiline()) {
          <textarea
            [id]="effectiveId()"
            [rows]="rows()"
            [placeholder]="placeholder()"
            [disabled]="disabled()"
            [required]="required()"
            [value]="value()"
            (input)="onInput($event)"
            class="rm-input rm-input--textarea"
            [class.rm-input--with-prefix]="!!prefixIcon()"
          ></textarea>
        } @else {
          <input
            [id]="effectiveId()"
            [type]="type()"
            [placeholder]="placeholder()"
            [disabled]="disabled()"
            [required]="required()"
            [value]="value()"
            (input)="onInput($event)"
            (keydown.enter)="enterPressed.emit(value())"
            class="rm-input"
            [class.rm-input--with-prefix]="!!prefixIcon()"
            [class.rm-input--with-suffix]="clearable() && value().length > 0"
          />
        }

        @if (clearable() && value().length > 0 && !disabled()) {
          <button
            type="button"
            class="rm-field__clear-btn"
            (click)="clear()"
            aria-label="Limpar campo"
          >
            <rm-icon name="x" [size]="12"></rm-icon>
          </button>
        }
      </div>

      @if (errorMessage()) {
        <span class="rm-field__error" role="alert">{{ errorMessage() }}</span>
      } @else if (hint()) {
        <span class="rm-field__hint">{{ hint() }}</span>
      }
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
    }

    .rm-field {
      display: flex;
      flex-direction: column;
      gap: 6px;
      width: 100%;
    }

    .rm-field__label {
      font-size: 12.5px;
      font-weight: 600;
      color: var(--rm-text-secondary);
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .rm-field__required {
      color: var(--rm-urgent);
    }

    .rm-field__control {
      position: relative;
      display: flex;
      align-items: center;
      width: 100%;
    }

    .rm-input {
      width: 100%;
      height: 40px;
      padding: 0 14px;
      background: var(--rm-bg-surface);
      border: 1px solid var(--rm-border-base);
      border-radius: var(--rm-radius-md);
      color: var(--rm-text-primary);
      font-size: 13.5px;
      outline: none;
      transition: all var(--rm-transition-fast);

      &::placeholder {
        color: var(--rm-text-muted);
      }

      &:hover:not(:disabled) {
        border-color: var(--rm-border-strong);
      }

      &:focus {
        border-color: var(--rm-accent);
        box-shadow: 0 0 0 3px var(--rm-accent-light);
        background: var(--rm-bg-canvas);
      }

      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        background: var(--rm-bg-hover);
      }
    }

    .rm-input--textarea {
      height: auto;
      padding: 10px 14px;
      min-height: 80px;
      resize: vertical;
      line-height: 1.5;
    }

    .rm-input--with-prefix {
      padding-left: 36px;
    }

    .rm-input--with-suffix {
      padding-right: 36px;
    }

    .rm-field__icon--prefix {
      position: absolute;
      left: 12px;
      color: var(--rm-text-muted);
      pointer-events: none;
    }

    .rm-field__clear-btn {
      position: absolute;
      right: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 22px;
      height: 22px;
      border-radius: 50%;
      color: var(--rm-text-muted);
      background: var(--rm-bg-hover);
      transition: all var(--rm-transition-fast);

      &:hover {
        color: var(--rm-text-primary);
        background: var(--rm-bg-active);
      }
    }

    .rm-field__error {
      font-size: 11.5px;
      color: var(--rm-urgent);
      font-weight: 500;
    }

    .rm-field__hint {
      font-size: 11.5px;
      color: var(--rm-text-muted);
    }

    .rm-field--has-error .rm-input {
      border-color: var(--rm-urgent);
      &:focus {
        box-shadow: 0 0 0 3px rgba(244, 63, 94, 0.15);
      }
    }
  `]
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
