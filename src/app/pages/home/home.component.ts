import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  effect,
  inject,
  signal,
  untracked
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { take } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { I18nService } from '../../core/services/i18n.service';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { PublicShellComponent } from '../../shared/layout/public-shell/public-shell.component';

@Component({
  selector: 'rm-home',
  standalone: true,
  imports: [ButtonComponent, PublicShellComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements AfterViewInit, OnDestroy {
  readonly authService = inject(AuthService);
  readonly i18n = inject(I18nService);
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);

  readonly typedLine1 = signal('');
  readonly typedLine2 = signal('');
  readonly isTypingDone = signal(false);
  readonly isNarrow = signal(false);

  get fullLine1(): string {
    return this.i18n.t('home.hero.line1');
  }

  get fullLine2(): string {
    return this.i18n.t('home.hero.line2');
  }

  private typeTimers: Array<ReturnType<typeof setTimeout>> = [];
  private readonly resizeHandler = () => {
    this.isNarrow.set(typeof window !== 'undefined' && window.innerWidth < 900);
  };

  constructor() {
    this.resizeHandler();
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', this.resizeHandler, { passive: true });
    }

    this.showFullHeadline();

    effect(() => {
      this.i18n.lang();
      untracked(() => this.showFullHeadline());
    });

    this.activatedRoute.fragment.pipe(take(1)).subscribe(fragment => {
      if (fragment === 'recursos') {
        this.router.navigate(['/recursos'], { replaceUrl: true });
      } else if (fragment === 'como-funciona') {
        this.router.navigate(['/como-funciona'], { replaceUrl: true });
      }
    });
  }

  ngAfterViewInit(): void {
    if (!this.isNarrow() && !this.prefersReducedMotion()) {
      this.startTypewriter();
    }
  }

  ngOnDestroy(): void {
    this.stopTypewriter();
    if (typeof window !== 'undefined') {
      window.removeEventListener('resize', this.resizeHandler);
    }
  }

  goToApp(): void {
    this.router.navigate(['/dashboard']);
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }

  goToResources(): void {
    this.router.navigate(['/recursos']);
  }

  onStartNow(): void {
    if (this.authService.isAuthenticated()) {
      this.goToApp();
    } else {
      this.goToLogin();
    }
  }

  private showFullHeadline(): void {
    this.stopTypewriter();
    this.typedLine1.set(this.fullLine1);
    this.typedLine2.set(this.fullLine2);
    this.isTypingDone.set(true);
  }

  private stopTypewriter(): void {
    for (const timer of this.typeTimers) {
      clearTimeout(timer);
    }
    this.typeTimers = [];
    this.typedLine1.set('');
    this.typedLine2.set('');
    this.isTypingDone.set(false);
  }

  private prefersReducedMotion(): boolean {
    return (
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    );
  }

  private startTypewriter(): void {
    const line1 = this.fullLine1;
    const line2 = this.fullLine2;
    let index1 = 0;

    const typeFirstLine = () => {
      if (index1 <= line1.length) {
        this.typedLine1.set(line1.slice(0, index1));
        index1 += 1;
        this.typeTimers.push(setTimeout(typeFirstLine, 38));
        return;
      }

      let index2 = 0;
      const typeSecondLine = () => {
        if (index2 <= line2.length) {
          this.typedLine2.set(line2.slice(0, index2));
          index2 += 1;
          this.typeTimers.push(setTimeout(typeSecondLine, 32));
        } else {
          this.isTypingDone.set(true);
        }
      };

      this.typeTimers.push(setTimeout(typeSecondLine, 220));
    };

    this.typeTimers.push(setTimeout(typeFirstLine, 300));
  }
}
