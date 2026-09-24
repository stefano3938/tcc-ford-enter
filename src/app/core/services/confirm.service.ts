import { Injectable, signal } from '@angular/core';

export interface ConfirmRequest {
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  danger?: boolean;
}

interface PendingConfirm extends ConfirmRequest {
  resolve: (confirmed: boolean) => void;
}

/**
 * Asks the user to confirm an action that cannot be undone.
 * Rendered once by <rm-confirm-dialog> in the app root.
 */
@Injectable({ providedIn: 'root' })
export class ConfirmService {
  readonly pending = signal<PendingConfirm | null>(null);

  ask(request: ConfirmRequest): Promise<boolean> {
    // A new question replaces an unanswered one, which counts as cancelled
    this.pending()?.resolve(false);
    return new Promise<boolean>(resolve => {
      this.pending.set({ ...request, resolve });
    });
  }

  answer(confirmed: boolean): void {
    const current = this.pending();
    if (!current) return;
    this.pending.set(null);
    current.resolve(confirmed);
  }
}
