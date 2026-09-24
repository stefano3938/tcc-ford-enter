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
  templateUrl: './lang-switcher.component.html',
  styleUrl: './lang-switcher.component.css'
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
