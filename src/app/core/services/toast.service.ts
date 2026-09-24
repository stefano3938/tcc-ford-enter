import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'info' | 'warning' | 'error' | 'ai';

export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  durationMs?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  readonly toasts = signal<ToastItem[]>([]);

  private readonly MAX_VISIBLE = 4;
  private readonly DEBOUNCE_MS = 350;
  private lastToastKey: string | null = null;
  private lastToastTime = 0;
  private timeouts = new Map<string, ReturnType<typeof setTimeout>>();

  show(item: Omit<ToastItem, 'id'>): void {
    const key = `${item.type}|${item.title}|${item.message ?? ''}`;
    const now = Date.now();
    if (key === this.lastToastKey && now - this.lastToastTime < this.DEBOUNCE_MS) {
      return;
    }
    this.lastToastKey = key;
    this.lastToastTime = now;

    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const fullItem: ToastItem = {
      ...item,
      id,
      durationMs: item.durationMs ?? 4000
    };

    this.toasts.update(current => {
      const next = [...current, fullItem];

      if (next.length > this.MAX_VISIBLE) {
        const removed = next.slice(0, next.length - this.MAX_VISIBLE);

        for (const r of removed) {
          const t = this.timeouts.get(r.id);
          if (t) {
            clearTimeout(t);
            this.timeouts.delete(r.id);
          }
        }
        return next.slice(next.length - this.MAX_VISIBLE);
      }
      return next;
    });

    if (fullItem.durationMs && fullItem.durationMs > 0) {
      const tid = setTimeout(() => {
        this.dismiss(id);
      }, fullItem.durationMs);
      this.timeouts.set(id, tid);
    }
  }

  success(title: string, message?: string): void {
    this.show({ type: 'success', title, message });
  }

  info(title: string, message?: string): void {
    this.show({ type: 'info', title, message });
  }

  warning(title: string, message?: string): void {
    this.show({ type: 'warning', title, message });
  }

  error(title: string, message?: string): void {
    this.show({ type: 'error', title, message });
  }

  ai(title: string, message?: string): void {
    this.show({ type: 'ai', title, message });
  }

  dismiss(id: string): void {
    const t = this.timeouts.get(id);
    if (t) {
      clearTimeout(t);
      this.timeouts.delete(id);
    }
    this.toasts.update(current => current.filter(to => to.id !== id));
  }
  clearAll(): void {
    for (const [, tid] of this.timeouts) clearTimeout(tid);
    this.timeouts.clear();
    this.toasts.set([]);
  }
}
