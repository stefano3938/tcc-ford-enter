import { ChangeDetectionStrategy, Component, ElementRef, HostListener, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { I18nService } from '../../../core/services/i18n.service';
import { ThemeService } from '../../../core/services/theme.service';
import { StartCtaService } from '../../../core/services/start-cta.service';
import { ButtonComponent } from '../../components/button/button.component';
import { IconComponent } from '../../components/icon/icon.component';
import { LangSwitcherComponent } from '../../components/lang-switcher/lang-switcher.component';

export const PUBLIC_NAV_LINKS = [
  { path: '/recursos', label: 'home.nav.features' },
  { path: '/demonstracao', label: 'nav.demo' },
  { path: '/como-funciona', label: 'home.nav.how' },
  { path: '/planos', label: 'home.nav.plans' }
] as const;

@Component({
  selector: 'rm-public-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, IconComponent, ButtonComponent, LangSwitcherComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './public-header.component.html',
  styleUrl: './public-header.component.css'
})
export class PublicHeaderComponent {
  readonly authService = inject(AuthService);
  readonly themeService = inject(ThemeService);
  readonly i18n = inject(I18nService);
  readonly cta = inject(StartCtaService);
  private readonly elementRef = inject(ElementRef<HTMLElement>);

  readonly links = PUBLIC_NAV_LINKS;
  readonly isMobileMenuOpen = signal(false);

  toggleMobileMenu(): void {
    this.isMobileMenuOpen.update(isOpen => !isOpen);
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen.set(false);
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (!this.isMobileMenuOpen()) return;
    this.closeMobileMenu();
    this.elementRef.nativeElement.querySelector('.rm-public-menu-btn')?.focus();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (this.isMobileMenuOpen() && !this.elementRef.nativeElement.contains(event.target as Node)) {
      this.closeMobileMenu();
    }
  }
}
