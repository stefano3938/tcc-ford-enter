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
  template: `
    @if (isOpen()) {
      <div
        class="rm-modal-overlay"
        role="dialog"
        aria-modal="true"
        [attr.aria-labelledby]="title() ? 'modal-title' : null"
        (click)="onBackdropClick($event)"
        (keydown)="onKeydown($event)"
      >
        <div
          class="rm-modal-box"
          #modalBox
          [style.max-width]="maxWidth()"
          (click)="$event.stopPropagation()"
        >

          <div class="rm-modal-header">
            <div class="rm-modal-titles">
              @if (title()) {
                <h3 id="modal-title" class="rm-modal-title">{{ title() }}</h3>
              }
              @if (subtitle()) {
                <p class="rm-modal-subtitle">{{ subtitle() }}</p>
              }
            </div>

            <button
              type="button"
              class="rm-modal-close"
              (click)="close()"
              aria-label="Fechar janela"
            >
              <rm-icon name="x" [size]="14"></rm-icon>
            </button>
          </div>
          <div class="rm-modal-body">
            <ng-content></ng-content>
          </div>
          <div class="rm-modal-footer">
            <ng-content select="[modal-footer]"></ng-content>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .rm-modal-overlay {
      position: fixed;
      inset: 0;
      z-index: 1000;
      background: rgba(15, 23, 42, 0.12);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 16px;
      animation: overlayFadeIn 180ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }

    .rm-modal-box {
      width: 100%;
      background: var(--rm-bg-elevated);
      border: 1px solid var(--rm-border-base);
      border-radius: var(--rm-radius-xl);
      box-shadow: var(--rm-shadow-modal);
      display: flex;
      flex-direction: column;
      max-height: calc(100vh - 32px);
      animation: modalScaleIn 240ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
      overflow: hidden;
    }

    .rm-modal-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 12px;
      padding: 14px 20px 12px;
      border-bottom: 1px solid var(--rm-border-subtle);
    }

    .rm-modal-titles {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .rm-modal-title {
      font-size: 16.5px;
      font-weight: 700;
      color: var(--rm-text-primary);
      letter-spacing: -0.01em;
    }

    .rm-modal-subtitle {
      font-size: 13px;
      color: var(--rm-text-secondary);
      line-height: 1.4;
    }

    .rm-modal-close {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      border-radius: var(--rm-radius-md);
      background: var(--rm-bg-hover);
      color: var(--rm-text-secondary);
      border: 1px solid var(--rm-border-base);
      transition: all var(--rm-transition-fast);
      flex-shrink: 0;

      &:hover {
        background: var(--rm-bg-active);
        color: var(--rm-text-primary);
      }
    }

    .rm-modal-body {
      padding: 14px 20px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .rm-modal-footer {
      padding: 12px 20px;
      border-top: 1px solid var(--rm-border-subtle);
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 10px;
      background: var(--rm-bg-surface);
    }

    @keyframes overlayFadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes modalScaleIn {
      from {
        opacity: 0;
        transform: scale(0.96) translateY(8px);
      }
      to {
        opacity: 1;
        transform: scale(1) translateY(0);
      }
    }
  `]
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
