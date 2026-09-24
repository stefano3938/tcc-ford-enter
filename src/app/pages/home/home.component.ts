import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, OnDestroy, ViewChild, computed, effect, inject, signal, untracked } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ThemeService } from '../../core/services/theme.service';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { BadgeComponent } from '../../shared/components/badge/badge.component';
import { LangSwitcherComponent } from '../../shared/components/lang-switcher/lang-switcher.component';
import { I18nService } from '../../core/services/i18n.service';

@Component({
  selector: 'rm-home',
  standalone: true,
  imports: [RouterLink, IconComponent, ButtonComponent, BadgeComponent, LangSwitcherComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements AfterViewInit, OnDestroy {
  readonly authService = inject(AuthService);
  readonly themeService = inject(ThemeService);
  readonly i18n = inject(I18nService);
  private readonly router = inject(Router);
  readonly isMobileMenuOpen = signal(false);
  readonly typedLine1 = signal('');
  readonly typedLine2 = signal('');
  readonly isTypingDone = signal(false);
  get fullLine1(): string { return this.i18n.t('home.hero.line1'); }
  get fullLine2(): string { return this.i18n.t('home.hero.line2'); }
  readonly demoIndex = signal(1);
  readonly isNarrow = signal(false);
  private demoTimer: ReturnType<typeof setInterval> | undefined;
  private resizeHandler = () => {
    this.isNarrow.set(typeof window !== 'undefined' && window.innerWidth < 900);
  };
  readonly carouselIndex = signal(0);
  readonly carouselPage = this.carouselIndex;
  get carouselPages(): number[] {
    const perPage = 3;
    return Array.from({ length: Math.ceil(this.carouselItems().length / perPage) }, (_, i) => i);
  }
  readonly carouselItems = computed(() => [
    { icon: 'kanban', label: 'KANBAN', title: this.t2('kanban.t', 'Fluxo que você enxerga', 'Flow you can see', 'Flujo que puedes ver'), desc: this.t3('kanban.d', 'Três colunas nítidas com arraste suave, contadores vivos e feedback a cada movimento.', 'Three crisp columns with smooth dragging, live counters and feedback on every move.', 'Tres columnas nítidas con arrastre suave, contadores vivos y feedback en cada movimiento.') },
    { icon: 'message-square', label: this.i18n.t('dash.ai').toUpperCase(), title: this.t2('ai.t', 'Diga e acontece', 'Say it and it happens', 'Dilo y sucede'), desc: this.t3('ai.d', '“Organizar meu dia” vira 4 tarefas priorizadas com tempo estimado — direto no quadro.', '“Plan my day” becomes 4 prioritised tasks with time estimates — straight on the board.', '«Organizar mi día» se convierte en 4 tareas priorizadas con tiempo estimado, directo en el tablero.') },
    { icon: 'layers', label: this.t2('ideas.l', 'BANCO DE IDEIAS', 'IDEA BANK', 'BANCO DE IDEAS'), title: this.t2('ideas.t', 'Ideia não se perde', 'No idea gets lost', 'Ninguna idea se pierde'), desc: this.t3('ideas.d', 'Capture em 5s, organize por tags e expanda em plano acionável com 1 clique.', 'Capture in 5s, organise by tags and expand into an actionable plan in one click.', 'Captura en 5 s, organiza por etiquetas y expande en un plan accionable con un clic.') },
    { icon: 'clock', label: this.i18n.t('home.metric.focus').toUpperCase(), title: this.t2('focus.t', 'Foco sem distrair', 'Focus without distraction', 'Concentración sin distracciones'), desc: this.t3('focus.d', 'Pomodoro minimalista mostra só a tarea atual, sem poluir sua visão.', 'A minimal Pomodoro shows only the current task, keeping your view clean.', 'Un Pomodoro minimalista muestra solo la tarea actual, sin ensuciar tu vista.') },
    { icon: 'check-circle', label: this.t2('prog.l', 'PROGRESSO', 'PROGRESS', 'PROGRESO'), title: this.t2('prog.t', 'Avanço que motiva', 'Progress that motivates', 'Avance que motiva'), desc: this.t3('prog.d', '83% concluídas e 2 urgentes — veja onde investir energia agora.', '83% done and 2 urgent — see where to invest energy now.', '83% completadas y 2 urgentes: mira dónde invertir energía ahora.') },
    { icon: 'shield', label: this.t2('trust.l', 'CONFIANÇA', 'TRUST', 'CONFIANZA'), title: this.t2('trust.t', 'Seu ritmo, suas regras', 'Your pace, your rules', 'Tu ritmo, tus reglas'), desc: this.t3('trust.d', 'Tudo no dispositivo, com acesso offline e sem amarras.', 'Everything on device, with offline access and no strings attached.', 'Todo en el dispositivo, con acceso offline y sin ataduras.') },
  ]);

  private t2(key: string, pt: string, en: string, es: string): string {
    return this.i18n.lang() === 'pt' ? pt : this.i18n.lang() === 'en' ? en : es;
  }

  private t3(key: string, pt: string, en: string, es: string): string {
    return this.t2(key, pt, en, es);
  }

  constructor() {
    this.resizeHandler();
    if (typeof window !== 'undefined') window.addEventListener('resize', this.resizeHandler, { passive: true });
    this.showFullHeadline();
    this.startDemoClick();

    // On language change the headline is already on screen, so swap it in full
    // instead of replaying the typing animation over empty space.
    effect(() => {
      this.i18n.lang();
      untracked(() => this.showFullHeadline());
    });
  }

  private showFullHeadline(): void {
    this.stopTypewriter();
    this.typedLine1.set(this.fullLine1);
    this.typedLine2.set(this.fullLine2);
    this.isTypingDone.set(true);
  }

  ngOnDestroy(): void {
    this.stopTypewriter();
    if (this.demoTimer !== undefined) clearInterval(this.demoTimer);
    if (typeof window !== 'undefined') window.removeEventListener('resize', this.resizeHandler);
  }

  private typeTimers: Array<ReturnType<typeof setTimeout>> = [];

  private stopTypewriter(): void {
    for (const t of this.typeTimers) clearTimeout(t);
    this.typeTimers = [];
    this.typedLine1.set('');
    this.typedLine2.set('');
    this.isTypingDone.set(false);
  }

  ngAfterViewInit(): void {
    if (!this.isNarrow() && !this.prefersReducedMotion()) {
      this.startTypewriter();
    }
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
    let i1 = 0;
    const type1 = () => {
      if (i1 <= line1.length) {
        this.typedLine1.set(line1.slice(0, i1));
        i1++;
        this.typeTimers.push(setTimeout(type1, 38));
      } else {
        let i2 = 0;
        const type2 = () => {
          if (i2 <= line2.length) {
            this.typedLine2.set(line2.slice(0, i2));
            i2++;
            this.typeTimers.push(setTimeout(type2, 32));
          } else {
            this.isTypingDone.set(true);
          }
        };
        this.typeTimers.push(setTimeout(type2, 220));
      }
    };
    this.typeTimers.push(setTimeout(type1, 300));
  }

  private startDemoClick(): void {
    if (this.demoTimer !== undefined) return;
    this.demoTimer = setInterval(() => {
      if (document.hidden) return;
      this.demoIndex.update(i => (i + 1) % 9);
    }, 2200);
  }

  @ViewChild('carouselViewport') carouselViewport?: ElementRef<HTMLElement>;

  scrollCarousel(dir: number): void {
    const el = this.carouselViewport?.nativeElement;
    if (!el) return;
    const slide = el.querySelector('.rm-carousel-slide') as HTMLElement | null;
    const gap = 16;
    const amount = slide ? slide.offsetWidth + gap : el.clientWidth * 0.85;
    el.scrollBy({ left: dir * amount, behavior: 'smooth' });
  }

  scrollToIndex(index: number): void {
    const el = this.carouselViewport?.nativeElement;
    if (!el) return;
    const slide = el.querySelector('.rm-carousel-slide') as HTMLElement | null;
    const gap = 16;
    const amount = slide ? slide.offsetWidth + gap : el.clientWidth * 0.85;
    el.scrollTo({ left: index * amount, behavior: 'smooth' });
  }

  scrollToPage(page: number): void {

    this.scrollToIndex(page * 3);
  }

  onCarouselScroll(): void {
    const el = this.carouselViewport?.nativeElement;
    if (!el) return;
    const slide = el.querySelector('.rm-carousel-slide') as HTMLElement | null;
    const gap = 16;
    const amount = slide ? slide.offsetWidth + gap : el.clientWidth * 0.85;
    if (amount > 0) {
      const idx = Math.round(el.scrollLeft / amount);
      this.carouselIndex.set(Math.max(0, Math.min(idx, this.carouselItems().length - 1)));
    }
  }

  goToApp(): void { this.router.navigate(['/dashboard']); }
  goToLogin(): void { this.router.navigate(['/login']); }
  onStartNow(): void {
    if (this.authService.isAuthenticated()) this.goToApp();
    else this.goToLogin();
  }
}
