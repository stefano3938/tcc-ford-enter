import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  effect,
  inject,
  input,
  model,
  output,
  untracked
} from '@angular/core';
import { IconComponent } from '../icon/icon.component';
import { I18nService } from '../../../core/services/i18n.service';

/** Open modals, top-most last. Esc and body scroll-lock only act on / release for the right one. */
const openStack: ModalComponent[] = [];

@Component({
  selector: 'rm-modal',
  standalone: true,
  imports: [IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.css'
})
export class ModalComponent implements OnDestroy {
  private static counter = 0;

  private readonly elementRef = inject(ElementRef);
  readonly i18n = inject(I18nService);

  readonly isOpen = model<boolean>(false);
  readonly title = input<string>('');
  readonly subtitle = input<string>('');
  /** Accessible name when the dialog shows no visible title. */
  readonly ariaLabel = input<string>('');
  readonly maxWidth = input<string>('560px');
  readonly closeOnBackdrop = input<boolean>(true);
  readonly dialogRole = input<'dialog' | 'alertdialog'>('dialog');

  readonly closed = output<void>();

  readonly titleId = `rm-modal-title-${ModalComponent.counter}`;
  readonly subtitleId = `rm-modal-subtitle-${ModalComponent.counter++}`;

  /** Element that had focus before opening; focus goes back there on close. */
  private returnFocusTo: HTMLElement | null = null;

  constructor() {
    effect(() => {
      const open = this.isOpen();
      untracked(() => (open ? this.onOpened() : this.onClosed()));
    });
  }

  ngOnDestroy(): void {
    this.onClosed();
  }

  @HostListener('document:keydown.escape', ['$event'])
  onEscape(event: Event): void {
    if (this.isOpen() && openStack[openStack.length - 1] === this) {
      event.stopPropagation();
      this.close();
    }
  }

  onBackdropClick(event: MouseEvent): void {
    if (this.closeOnBackdrop() && event.target === event.currentTarget) {
      this.close();
    }
  }

  onKeydown(event: KeyboardEvent): void {
    if (!this.isOpen()) return;
    if (event.key === 'Tab') {
      this.trapFocus(event);
    }
  }

  close(): void {
    this.isOpen.set(false);
    this.closed.emit();
  }

  private onOpened(): void {
    if (typeof document === 'undefined' || openStack.includes(this)) return;
    this.returnFocusTo = document.activeElement as HTMLElement | null;
    openStack.push(this);
    document.body.style.overflow = 'hidden';
    setTimeout(() => this.focusInitial(), 0);
  }

  private onClosed(): void {
    const index = openStack.indexOf(this);
    if (index === -1) return;
    openStack.splice(index, 1);
    if (typeof document !== 'undefined' && openStack.length === 0) {
      document.body.style.overflow = '';
    }
    const target = this.returnFocusTo;
    this.returnFocusTo = null;
    if (target && typeof target.focus === 'function' && document.contains(target)) {
      setTimeout(() => target.focus(), 0);
    }
  }

  private focusInitial(): void {
    const box: HTMLElement | null = this.elementRef.nativeElement.querySelector('.rm-modal-box');
    // Prefer the first form field; fall back to the first control, then the box itself
    const field = box?.querySelector<HTMLElement>('input:not([disabled]), textarea:not([disabled]), select:not([disabled])');
    const focusable = this.getFocusableElements();
    const target = field ?? focusable.find(el => !el.classList.contains('rm-modal-close')) ?? focusable[0];
    if (target) {
      target.focus();
    } else if (box) {
      box.setAttribute('tabindex', '-1');
      box.focus();
    }
  }

  private trapFocus(event: KeyboardEvent): void {
    const focusable = this.getFocusableElements();
    if (focusable.length === 0) {
      event.preventDefault();
      return;
    }
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const active = document.activeElement as HTMLElement | null;

    if (event.shiftKey) {
      if (active === first) {
        event.preventDefault();
        last.focus();
      }
    } else if (active === last) {
      event.preventDefault();
      first.focus();
    }
  }

  private getFocusableElements(): HTMLElement[] {
    const host: HTMLElement = this.elementRef.nativeElement;
    const selector =
      'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';
    const root: HTMLElement | null = host.querySelector('.rm-modal-box');
    if (!root) return [];
    return Array.from(root.querySelectorAll<HTMLElement>(selector)).filter(
      el => !el.hasAttribute('hidden') && el.getAttribute('aria-hidden') !== 'true'
    );
  }
}
