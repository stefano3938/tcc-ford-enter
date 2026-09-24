import { ChangeDetectionStrategy, Component, computed, effect, inject, signal, untracked } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs';
import { HeaderComponent } from './shared/components/header/header.component';
import { SidebarComponent } from './shared/components/sidebar/sidebar.component';
import { ToastContainerComponent } from './shared/components/toast-container/toast-container.component';
import { PaywallModalComponent } from './shared/components/paywall-modal/paywall-modal.component';
import { ConfirmDialogComponent } from './shared/components/confirm-dialog/confirm-dialog.component';
import { AiFabComponent } from './shared/components/ai-fab/ai-fab.component';
import { AuthService } from './core/services/auth.service';

const PUBLIC_PATHS = ['/home', '/demonstracao', '/recursos', '/como-funciona', '/login', '/planos', '/pricing', '/privacidade', '/termos'];

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    HeaderComponent,
    SidebarComponent,
    ToastContainerComponent,
    PaywallModalComponent,
    ConfirmDialogComponent,
    AiFabComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './app.html'
})
export class App {
  readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly isMobileMenuOpen = signal<boolean>(false);
  private readonly currentUrl = toSignal(
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      map(event => (event as NavigationEnd).urlAfterRedirects)
    ),
    { initialValue: this.router.url }
  );

  readonly isPublicPage = computed(() => {
    const url = this.currentUrl() || '';
    const clean = url.split('?')[0].split('#')[0];
    return clean === '/' || PUBLIC_PATHS.some(path => clean === path || clean.startsWith(`${path}/`));
  });

  /** The AI shortcut is pointless on the AI page itself, where it would also cover the chat input. */
  readonly isAiPage = computed(() => (this.currentUrl() || '').split('?')[0].startsWith('/ai-assistant'));

  constructor() {
    // Any navigation closes the mobile drawer
    effect(() => {
      this.currentUrl();
      untracked(() => this.isMobileMenuOpen.set(false));
    });
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen.update(v => !v);
  }
}
