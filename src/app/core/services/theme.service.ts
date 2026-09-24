import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, effect, inject, signal } from '@angular/core';
import { StorageService } from './storage.service';

export type ThemeMode = 'dark' | 'light';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly storage = inject(StorageService);
  private readonly document = inject(DOCUMENT, { optional: true });
  private readonly platformId = inject(PLATFORM_ID);
  private readonly THEME_KEY = 'redmindme_theme_mode';

  readonly theme = signal<ThemeMode>(this.getInitialTheme());

  constructor() {
    effect(() => {
      const currentTheme = this.theme();

      if (!isPlatformBrowser(this.platformId)) {
        return;
      }
      this.document?.documentElement.setAttribute('data-theme', currentTheme);

      const body = this.document?.body;
      if (!body) {
        return;
      }

      if (currentTheme === 'dark') {
        body.classList.add('dark-mode');
      } else {
        body.classList.remove('dark-mode');
      }
    });
  }

  toggleTheme(): void {
    this.setTheme(this.theme() === 'dark' ? 'light' : 'dark');
  }

  /** Only an explicit choice is persisted, so a visitor who never chose keeps following the OS. */
  setTheme(mode: ThemeMode): void {
    this.theme.set(mode);
    this.storage.setItem(this.THEME_KEY, mode);
  }

  private getInitialTheme(): ThemeMode {
    const saved = this.storage.getItem<ThemeMode | null>(this.THEME_KEY, null);
    if (saved === 'dark' || saved === 'light') {
      return saved;
    }
    // No explicit choice yet: follow the operating system instead of forcing light
    if (isPlatformBrowser(this.platformId) && typeof window.matchMedia === 'function') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  }
}
