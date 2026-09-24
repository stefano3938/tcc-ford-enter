import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
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
  private static counter = 0;

  readonly i18n = inject(I18nService);
  private readonly toast = inject(ToastService);
  readonly langs = LANGS;
  readonly open = signal(false);
  readonly menuId = `lang-menu-${LangSwitcherComponent.counter++}`;

  private readonly host = viewChild<ElementRef<HTMLElement>>('host');
  private readonly trigger = viewChild<ElementRef<HTMLButtonElement>>('trigger');

  toggle(): void {
    this.open.update(v => !v);
  }

  choose(code: LangCode): void {
    const changed = code !== this.i18n.lang();
    this.i18n.setLang(code);
    this.close();
    if (changed) {
      this.toast.success(this.i18n.t('toast.langChanged', { lang: this.i18n.current().label }));
    }
  }

  /** Closing returns focus to the trigger so keyboard users don't lose their place. */
  private close(): void {
    this.open.set(false);
    this.trigger()?.nativeElement.focus();
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.open()) this.close();
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
