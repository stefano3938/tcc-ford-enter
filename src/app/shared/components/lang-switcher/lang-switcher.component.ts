import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  computed,
  effect,
  inject,
  signal,
  viewChild
} from '@angular/core';
import { I18nService, LANGS, LangCode } from '../../../core/services/i18n.service';
import { ToastService } from '../../../core/services/toast.service';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'rm-lang-switcher',
  standalone: true,
  imports: [IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div #host class="lang" [class.lang--open]="open()">
      <button
        type="button"
        class="lang__trigger"
        [attr.aria-haspopup]="'listbox'"
        [attr.aria-expanded]="open()"
        aria-controls="lang-menu"
        [attr.aria-label]="i18n.t('nav.language') + ': ' + i18n.current().label"
        [title]="i18n.t('nav.language')"
        (click)="toggle()"
      >
        <rm-icon name="globe" [size]="15"></rm-icon>
        <span class="lang__code">{{ i18n.current().short }}</span>
        <rm-icon class="lang__caret" name="chevron-down" [size]="12"></rm-icon>
      </button>

      @if (open()) {
        <div class="lang__menu" id="lang-menu" role="listbox" [attr.aria-label]="i18n.t('nav.language')">
          @for (lang of langs; track lang.code) {
            <button
              type="button"
              role="option"
              class="lang__option"
              [class.lang__option--active]="lang.code === i18n.lang()"
              [attr.aria-selected]="lang.code === i18n.lang()"
              (click)="choose(lang.code)"
            >
              <span class="lang__option-code">{{ lang.short }}</span>
              <span class="lang__option-label">{{ lang.label }}</span>
              @if (lang.code === i18n.lang()) {
                <rm-icon class="lang__check" name="check" [size]="14"></rm-icon>
              }
            </button>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .lang { position: relative; flex-shrink: 0; }

    .lang__trigger {
      display: flex;
      align-items: center;
      gap: 5px;
      height: 36px;
      padding: 0 9px;
      border-radius: var(--rm-radius-md);
      background: var(--rm-bg-hover);
      color: var(--rm-text-secondary);
      border: 1px solid var(--rm-border-base);
      transition:
        background var(--rm-transition-fast),
        color var(--rm-transition-fast),
        border-color var(--rm-transition-fast),
        transform 160ms cubic-bezier(0.23, 1, 0.32, 1);
    }

    .lang__trigger:active { transform: scale(0.94); }

    .lang__code {
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 0.02em;
      font-family: 'JetBrains Mono', ui-monospace, monospace;
      line-height: 1;
    }

    .lang__caret { transition: transform 200ms cubic-bezier(0.23, 1, 0.32, 1); }
    .lang--open .lang__caret { transform: rotate(180deg); }

    .lang__menu {
      position: absolute;
      top: calc(100% + 6px);
      right: 0;
      z-index: 200;
      min-width: 168px;
      padding: 4px;
      border-radius: var(--rm-radius-md);
      background: var(--rm-bg-elevated);
      border: 1px solid var(--rm-border-base);
      box-shadow: var(--rm-shadow-dropdown);
      display: flex;
      flex-direction: column;
      gap: 2px;
      transform-origin: top right;
      animation: langIn 180ms cubic-bezier(0.23, 1, 0.32, 1);
    }

    @keyframes langIn {
      from { opacity: 0; transform: scale(0.95) translateY(-4px); }
      to { opacity: 1; transform: scale(1) translateY(0); }
    }

    .lang__option {
      display: flex;
      align-items: center;
      gap: 10px;
      width: 100%;
      min-height: 38px;
      padding: 0 10px;
      border-radius: 8px;
      color: var(--rm-text-secondary);
      text-align: left;
      transition: background 140ms ease-out, color 140ms ease-out;
    }

    .lang__option:active { transform: scale(0.98); }
    .lang__option--active { color: var(--rm-text-primary); background: var(--rm-bg-hover); }

    .lang__option-code {
      font-size: 11px;
      font-weight: 700;
      font-family: 'JetBrains Mono', ui-monospace, monospace;
      color: var(--rm-text-muted);
      min-width: 20px;
    }

    .lang__option--active .lang__option-code { color: var(--rm-accent); }

    .lang__option-label { flex: 1; font-size: 13.5px; font-weight: 500; }
    .lang__check { color: var(--rm-accent); flex-shrink: 0; }

    @media (hover: hover) and (pointer: fine) {
      .lang__trigger:hover { background: var(--rm-bg-active); color: var(--rm-text-primary); border-color: var(--rm-border-strong); }
      .lang__option:not(.lang__option--active):hover { background: var(--rm-bg-hover); color: var(--rm-text-primary); }
    }

    @media (max-width: 480px) {
      .lang__trigger { padding: 0 7px; gap: 4px; }
      .lang__code { display: none; }
    }

    @media (prefers-reduced-motion: reduce) {
      .lang__menu { animation: none; }
      .lang__caret { transition: none; }
    }
  `]
})
export class LangSwitcherComponent {
  readonly i18n = inject(I18nService);
  private readonly toast = inject(ToastService);
  readonly langs = LANGS;
  readonly open = signal(false);

  private readonly host = viewChild<ElementRef<HTMLElement>>('host');

  constructor() {
    effect(() => {
      this.i18n.lang();
      if (typeof document !== 'undefined' && document.activeElement?.closest('.lang')) {
        queueMicrotask(() => (document.activeElement as HTMLElement | null)?.blur());
      }
    });
  }

  toggle(): void {
    this.open.update(v => !v);
  }

  choose(code: LangCode): void {
    this.i18n.setLang(code);
    this.open.set(false);
    const label = this.i18n.current().label;
    this.toast.success(this.i18n.t('toast.langChanged', { lang: label }), '');
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.open.set(false);
  }

  @HostListener('document:click', ['$event'])
  onDocClick(event: MouseEvent): void {
    if (!this.open()) return;
    const el = this.host()?.nativeElement;
    if (el && !el.contains(event.target as Node)) {
      this.open.set(false);
    }
  }
}
