import { ChangeDetectionStrategy, Component, ElementRef, HostListener, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { I18nService } from '../../../core/services/i18n.service';
import { ThemeService } from '../../../core/services/theme.service';
import { ButtonComponent } from '../../components/button/button.component';
import { IconComponent } from '../../components/icon/icon.component';
import { LangSwitcherComponent } from '../../components/lang-switcher/lang-switcher.component';

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
  private readonly router = inject(Router);
  private readonly elementRef = inject(ElementRef<HTMLElement>);
  readonly isMobileMenuOpen = signal(false);

  toggleMobileMenu(): void {
    this.isMobileMenuOpen.update(isOpen => !isOpen);
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen.set(false);
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.closeMobileMenu();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (this.isMobileMenuOpen() && !this.elementRef.nativeElement.contains(event.target as Node)) {
      this.closeMobileMenu();
    }
  }

  goToApp(): void {
    this.closeMobileMenu();
    this.router.navigate(['/dashboard']);
  }

  goToLogin(): void {
    this.closeMobileMenu();
    this.router.navigate(['/login']);
  }

  onStartNow(): void {
    if (this.authService.isAuthenticated()) {
      this.goToApp();
    } else {
      this.goToLogin();
    }
  }
}
