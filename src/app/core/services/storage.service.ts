import { Injectable, Injector, inject } from '@angular/core';
import { ToastService } from './toast.service';
import { I18nService } from './i18n.service';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private readonly toast = inject(ToastService, { optional: true });
  private readonly injector = inject(Injector);
  private memoryFallback = new Map<string, string>();

  /** I18nService itself depends on this service, so it is resolved lazily, only when a warning is shown. */
  private warn(titleKey: string, messageKey: string): void {
    const i18n = this.injector.get(I18nService);
    this.toast?.warning(i18n.t(titleKey), i18n.t(messageKey));
  }

  private hasStorage(): boolean {
    return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
  }

  getItem<T>(key: string, defaultValue: T): T {

    if (this.hasStorage()) {
      try {
        const item = localStorage.getItem(key);
        if (item !== null) {
          try {
            return JSON.parse(item) as T;
          } catch {

            try {
              localStorage.removeItem(key);
            } catch {

            }
            return defaultValue;
          }
        }
      } catch {

        const fallback = this.memoryFallback.get(key);
        if (fallback !== undefined) {
          try {
            return JSON.parse(fallback) as T;
          } catch {
            return defaultValue;
          }
        }
      }
    } else {

      const fallback = this.memoryFallback.get(key);
      if (fallback !== undefined) {
        try {
          return JSON.parse(fallback) as T;
        } catch {
          return defaultValue;
        }
      }
    }
    return defaultValue;
  }

  setItem<T>(key: string, value: T): void {
    const serialized = JSON.stringify(value);

    const MAX_BYTES = 2_500_000;
    if (serialized.length > MAX_BYTES) {

      this.memoryFallback.set(key, serialized);
      this.warn('toast.storageBig', 'toast.storageBig.body');
      return;
    }

    if (!this.hasStorage()) {
      this.memoryFallback.set(key, serialized);
      return;
    }

    try {
      localStorage.setItem(key, serialized);
    } catch (error: unknown) {
      const isQuotaExceeded =
        error instanceof DOMException &&
        (error.name === 'QuotaExceededError' || error.name === 'NS_ERROR_DOM_QUOTA_REACHED' || error.code === 22);

      if (isQuotaExceeded) {
        this.warn('toast.storageFull', 'toast.storageFull.body');
      }

      try {
        this.memoryFallback.set(key, serialized);
      } catch {

      }
    }
  }

  removeItem(key: string): void {
    this.memoryFallback.delete(key);
    if (!this.hasStorage()) {
      return;
    }
    try {
      localStorage.removeItem(key);
    } catch {

    }
  }
}
