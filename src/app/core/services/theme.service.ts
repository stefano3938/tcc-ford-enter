import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, effect, inject, signal, untracked } from '@angular/core';
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
      untracked(() => {
        this.storage.setItem(this.THEME_KEY, currentTheme);
      });

      if (!isPlatformBrowser(this.platformId)) {
        return;
      }

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
    this.theme.update(current => (current === 'dark' ? 'light' : 'dark'));
  }

  setTheme(mode: ThemeMode): void {
    this.theme.set(mode);
  }

  private getInitialTheme(): ThemeMode {
    const saved = this.storage.getItem<ThemeMode | null>(this.THEME_KEY, null);
    if (saved === 'dark' || saved === 'light') {
      return saved;
    }
    return 'light';
  }
}
