import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  NgZone,
  OnDestroy,
  PLATFORM_ID,
  QueryList,
  ViewChildren,
  inject,
  signal
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { I18nService } from '../../core/services/i18n.service';
import { AppPreviewComponent, AppPreviewVariant } from '../../shared/components/app-preview/app-preview.component';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { IconComponent, IconName } from '../../shared/components/icon/icon.component';
import { ParticleFieldComponent } from '../../shared/components/particle-field/particle-field.component';
import { RevealDirective } from '../../shared/directives/reveal.directive';
import { PublicShellComponent } from '../../shared/layout/public-shell/public-shell.component';

interface Step {
  readonly key: string;
  readonly icon: IconName;
  readonly preview: AppPreviewVariant;
}

@Component({
  selector: 'rm-como-funciona',
  standalone: true,
  imports: [AppPreviewComponent, ButtonComponent, IconComponent, ParticleFieldComponent, PublicShellComponent, RevealDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './como-funciona.component.html',
  styleUrl: './como-funciona.component.css'
})
export class ComoFuncionaComponent implements AfterViewInit, OnDestroy {
  readonly authService = inject(AuthService);
  readonly i18n = inject(I18nService);
  private readonly router = inject(Router);
  private readonly zone = inject(NgZone);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  readonly steps: ReadonlyArray<Step> = [
    { key: '1', icon: 'lightbulb', preview: 'ideas' },
    { key: '2', icon: 'kanban', preview: 'kanban' },
    { key: '3', icon: 'sparkles', preview: 'assistant' }
  ];

  /** Step currently in the middle of the viewport; picks the preview that follows the scroll */
  readonly active = signal(0);
  /** Below 900px there is no sticky preview: each step shows its own */
  readonly narrow = signal(false);

  @ViewChildren('stepEl') private stepEls!: QueryList<ElementRef<HTMLElement>>;

  private observer?: IntersectionObserver;
  private narrowQuery?: MediaQueryList;
  private readonly onNarrowChange = (event: MediaQueryListEvent) => this.narrow.set(event.matches);

  constructor() {
    if (this.isBrowser) {
      this.narrowQuery = window.matchMedia('(max-width: 900px)');
      this.narrow.set(this.narrowQuery.matches);
      this.narrowQuery.addEventListener('change', this.onNarrowChange);
    }
  }

  ngAfterViewInit(): void {
    if (!this.isBrowser || typeof IntersectionObserver === 'undefined') return;

    // A thin band across the middle of the viewport: whichever step crosses it is active
    this.observer = new IntersectionObserver(
      entries => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const index = Number((entry.target as HTMLElement).dataset['step']);
          this.zone.run(() => this.active.set(index));
        }
      },
      { rootMargin: '-45% 0px -45% 0px' }
    );
    this.zone.runOutsideAngular(() => {
      for (const el of this.stepEls) this.observer?.observe(el.nativeElement);
    });
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
    this.narrowQuery?.removeEventListener('change', this.onNarrowChange);
  }

  goTo(path: string): void {
    this.router.navigate([path]);
  }

  onStartNow(): void {
    this.router.navigate([this.authService.isAuthenticated() ? '/dashboard' : '/login']);
  }
}
