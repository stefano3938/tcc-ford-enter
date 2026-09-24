import { AfterViewInit, Directive, ElementRef, OnDestroy, PLATFORM_ID, inject, input } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

/**
 * One entrance per section: rises, sharpens and fades in the first time it
 * enters the viewport. Content stays visible without JS (the hidden state is
 * only applied once the observer is ready), and reduced motion skips the travel.
 *
 * <section rmReveal> ... </section>
 * <div rmReveal [rmRevealDelay]="120"> ... </div>
 */
@Directive({
  selector: '[rmReveal]',
  standalone: true
})
export class RevealDirective implements AfterViewInit, OnDestroy {
  readonly rmRevealDelay = input(0);

  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private observer?: IntersectionObserver;

  ngAfterViewInit(): void {
    if (!this.isBrowser || typeof IntersectionObserver === 'undefined') return;

    const el = this.element.nativeElement;
    el.style.setProperty('--rm-reveal-delay', `${this.rmRevealDelay()}ms`);
    el.classList.add('rm-reveal');

    this.observer = new IntersectionObserver(
      entries => {
        if (entries.some(entry => entry.isIntersecting)) {
          el.classList.add('rm-reveal--in');
          this.observer?.disconnect();
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.12 }
    );
    this.observer.observe(el);
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }
}
