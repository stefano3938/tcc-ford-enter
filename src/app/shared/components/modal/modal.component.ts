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
  output
} from '@angular/core';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'rm-modal',
  standalone: true,
  imports: [IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.css'
})
export class ModalComponent implements OnDestroy {
  private readonly elementRef = inject(ElementRef);
  readonly isOpen = model<boolean>(false);
  readonly title = input<string>('');
  readonly subtitle = input<string>('');
  readonly maxWidth = input<string>('560px');
  readonly closeOnBackdrop = input<boolean>(true);

  readonly closed = output<void>();

  constructor() {
    effect(() => {
      const open = this.isOpen();
      if (typeof document !== 'undefined') {
        if (open) {
          document.body.style.overflow = 'hidden';

          setTimeout(() => this.focusInitial(), 0);
        } else {
          document.body.style.overflow = '';
        }
      }
    });
  }

  ngOnDestroy(): void {

    if (typeof document !== 'undefined') {
      document.body.style.overflow = '';
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {

    if (this.isOpen()) {
      this.close();
    }
  }

  onBackdropClick(event: MouseEvent): void {
    if (this.closeOnBackdrop()) {
      this.close();
    }
  }

  onKeydown(event: KeyboardEvent): void {
    if (!this.isOpen()) return;
    if (event.key === 'Tab') {
      this.trapFocus(event);
    }
  }

  private focusInitial(): void {
    const focusable = this.getFocusableElements();
    if (focusable.length > 0) {
      focusable[0].focus();
    } else {

      const box: HTMLElement | null = this.elementRef.nativeElement.querySelector('.rm-modal-box');
      if (box) {

        if (!box.hasAttribute('tabindex')) box.setAttribute('tabindex', '-1');
        box.focus();
      }
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
    } else {
      if (active === last) {
        event.preventDefault();
        first.focus();
      }
    }
  }

  private getFocusableElements(): HTMLElement[] {
    const host: HTMLElement = this.elementRef.nativeElement;
    const selector =
      'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';
    const box: HTMLElement | null = host.querySelector('.rm-modal-box');
    const root: HTMLElement | null = box ?? host;
    if (!root) return [];
    return Array.from(root.querySelectorAll<HTMLElement>(selector)).filter(
      (el) => !el.hasAttribute('hidden') && el.getAttribute('aria-hidden') !== 'true'
    );
  }

  close(): void {
    this.isOpen.set(false);
    this.closed.emit();
  }
}
