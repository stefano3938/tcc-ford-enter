import { DOCUMENT } from '@angular/common';
import { Injectable, inject } from '@angular/core';
import { ToastService } from './toast.service';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private readonly document = inject(DOCUMENT, { optional: true });
  private readonly toast = inject(ToastService, { optional: true });
  private memoryFallback = new Map<string, string>();

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
      this.toast?.warning('Dados muito grandes', 'Conteúdo excede limite local — mantido em memória temporária.');
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
        this.toast?.warning('Armazenamento cheio', 'Limite local excedido, usando fallback em memória.');
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
