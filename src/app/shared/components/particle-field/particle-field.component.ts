import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  NgZone,
  OnDestroy,
  PLATFORM_ID,
  ViewChild,
  effect,
  inject,
  input
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ThemeService } from '../../../core/services/theme.service';

/**
 * ring    ideas orbit the pointer (a ghost cursor wanders when there is none)
 * scatter loose ideas drifting apart
 * grid    ideas snapped into board columns
 * flow    ideas moving in one direction, like work shipping
 */
export type ParticleFormation = 'ring' | 'scatter' | 'grid' | 'flow';

/** hero: full strength. ambient: a quieter band behind an inner-page title. */
export type ParticleVariant = 'hero' | 'ambient';

/** Where the text sits, so the field thins out behind it */
export type ParticleQuietZone = 'center' | 'left' | 'none';

interface Particle {
  hx: number;
  hy: number;
  /** Board-column slot used by the grid formation */
  gx: number;
  gy: number;
  /** Last flow position, to detect the wrap and teleport instead of flying back */
  fx: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  dirX: number;
  dirY: number;
  /** 0 = far, 1 = mid, 2 = near: size, alpha and pull all scale with it */
  plane: number;
  color: number;
  len: number;
  phase: number;
  baseDx: number;
  baseDy: number;
}

const PLANES = [
  { scale: 0.62, alpha: 0.38, pull: 0.035, drift: 5, speed: 18 },
  { scale: 0.85, alpha: 0.6, pull: 0.05, drift: 8, speed: 30 },
  { scale: 1.1, alpha: 0.9, pull: 0.07, drift: 12, speed: 44 }
];

const FORMATIONS: ReadonlyArray<ParticleFormation> = ['ring', 'scatter', 'grid', 'flow'];
const ALPHA_STEPS = 5;
const GRID_COL = 44;
const GRID_ROW = 12;

/**
 * Field of short dashes. It gathers into a wobbling ring around the pointer and can
 * morph between formations (see ParticleFormation). Runs outside Angular, pauses
 * off-screen, and under prefers-reduced-motion never moves by itself: it only
 * follows the pointer and switches formation without the in-between travel.
 */
@Component({
  selector: 'rm-particle-field',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './particle-field.component.html',
  styleUrl: './particle-field.component.css',
  host: {
    '[class.rm-particle-field--ambient]': "variant() === 'ambient'"
  }
})
export class ParticleFieldComponent implements AfterViewInit, OnDestroy {
  readonly variant = input<ParticleVariant>('hero');
  readonly formation = input<ParticleFormation>('ring');
  readonly quiet = input<ParticleQuietZone>('center');

  @ViewChild('canvas', { static: true }) private canvasRef!: ElementRef<HTMLCanvasElement>;

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly zone = inject(NgZone);
  private readonly theme = inject(ThemeService);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  private ctx: CanvasRenderingContext2D | null = null;
  private particles: Particle[] = [];
  private colors: string[] = ['#2563eb', '#3b82f6', '#93c5fd', '#1e3a8a'];
  private width = 0;
  private height = 0;
  private dpr = 1;

  private frame = 0;
  private running = false;
  private visible = true;
  private startedAt = 0;
  private reducedMotion = false;

  private pointerX = 0;
  private pointerY = 0;
  private pointerActive = false;
  /** 0 = ghost cursor, 1 = real pointer; eased so hand-off never snaps */
  private pointerWeight = 0;
  private focusX = 0;
  private focusY = 0;

  /** Eased weight of each formation; they always sum to ~1 */
  private weights: Record<ParticleFormation, number> = { ring: 1, scatter: 0, grid: 0, flow: 0 };

  private resizeObserver?: ResizeObserver;
  private intersectionObserver?: IntersectionObserver;
  private motionQuery?: MediaQueryList;
  private cleanups: Array<() => void> = [];

  constructor() {
    effect(() => {
      this.theme.theme();
      // Wait a tick so the body class (and its tokens) has switched
      if (this.isBrowser) {
        requestAnimationFrame(() => {
          this.readColors();
          if (!this.running) this.drawStill();
        });
      }
    });

    effect(() => {
      const target = this.formation();
      // No travel under reduced motion, and none before the first frame
      if (this.reducedMotion || !this.particles.length) {
        for (const name of FORMATIONS) this.weights[name] = name === target ? 1 : 0;
      }
      if (this.isBrowser && !this.running) requestAnimationFrame(() => this.drawStill());
    });
  }

  ngAfterViewInit(): void {
    if (!this.isBrowser) return;

    const canvas = this.canvasRef.nativeElement;
    this.ctx = canvas.getContext('2d');
    if (!this.ctx) return;

    this.motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    this.reducedMotion = this.motionQuery.matches;
    const onMotionChange = (event: MediaQueryListEvent) => (this.reducedMotion = event.matches);
    this.motionQuery.addEventListener('change', onMotionChange);
    this.cleanups.push(() => this.motionQuery?.removeEventListener('change', onMotionChange));

    this.zone.runOutsideAngular(() => {
      this.readColors();
      this.resize();

      this.resizeObserver = new ResizeObserver(() => {
        this.resize();
        if (!this.running) this.drawStill();
      });
      this.resizeObserver.observe(this.host.nativeElement);

      this.intersectionObserver = new IntersectionObserver(entries => {
        this.visible = entries[0]?.isIntersecting ?? true;
        this.visible ? this.start() : this.stop();
      });
      this.intersectionObserver.observe(this.host.nativeElement);

      const onMove = (event: PointerEvent) => {
        const rect = this.host.nativeElement.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        this.pointerActive = x >= 0 && y >= 0 && x <= rect.width && y <= rect.height;
        if (this.pointerActive) {
          this.pointerX = x;
          this.pointerY = y;
        }
      };
      const onLeave = () => (this.pointerActive = false);
      const onVisibility = () => (document.hidden ? this.stop() : this.start());

      window.addEventListener('pointermove', onMove, { passive: true });
      document.documentElement.addEventListener('pointerleave', onLeave);
      document.addEventListener('visibilitychange', onVisibility);
      this.cleanups.push(
        () => window.removeEventListener('pointermove', onMove),
        () => document.documentElement.removeEventListener('pointerleave', onLeave),
        () => document.removeEventListener('visibilitychange', onVisibility)
      );

      this.startedAt = performance.now();
      if (this.reducedMotion) this.drawStill();
      this.start();
    });
  }

  ngOnDestroy(): void {
    this.stop();
    this.resizeObserver?.disconnect();
    this.intersectionObserver?.disconnect();
    for (const cleanup of this.cleanups) cleanup();
  }

  private start(): void {
    if (this.running || !this.visible || !this.ctx) return;
    if (typeof document !== 'undefined' && document.hidden) return;
    this.running = true;
    const loop = (now: number) => {
      if (!this.running) return;
      this.step(now);
      this.frame = requestAnimationFrame(loop);
    };
    this.frame = requestAnimationFrame(loop);
  }

  private stop(): void {
    this.running = false;
    cancelAnimationFrame(this.frame);
  }

  private readColors(): void {
    const style = getComputedStyle(this.host.nativeElement);
    const read = (name: string, fallback: string) => style.getPropertyValue(name).trim() || fallback;
    this.colors = [
      read('--rm-particle-1', this.colors[0]),
      read('--rm-particle-2', this.colors[1]),
      read('--rm-particle-3', this.colors[2]),
      read('--rm-particle-4', this.colors[3])
    ];
  }

  private resize(): void {
    const rect = this.host.nativeElement.getBoundingClientRect();
    const width = Math.max(1, Math.round(rect.width));
    const height = Math.max(1, Math.round(rect.height));
    if (width === this.width && height === this.height) return;

    this.width = width;
    this.height = height;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);

    const canvas = this.canvasRef.nativeElement;
    canvas.width = Math.round(width * this.dpr);
    canvas.height = Math.round(height * this.dpr);
    this.ctx?.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);

    this.focusX = width * 0.5;
    this.focusY = height * 0.5;
    this.seed();
  }

  /** Jittered grid: even coverage without the mechanical look of a lattice */
  private seed(): void {
    const ambient = this.variant() === 'ambient';
    const spacing = (this.width < 640 ? 26 : 22) + (ambient ? 4 : 0);
    const cols = Math.ceil(this.width / spacing);
    const rows = Math.ceil(this.height / spacing);
    const gridOffset = (this.width % GRID_COL) / 2;
    const particles: Particle[] = [];

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        // Thin out randomly so the field breathes instead of tiling
        if (Math.random() < 0.42) continue;
        const hx = (col + 0.1 + Math.random() * 0.8) * spacing;
        const hy = (row + 0.1 + Math.random() * 0.8) * spacing;
        const plane = Math.random() < 0.45 ? 0 : Math.random() < 0.6 ? 1 : 2;
        const angle = Math.random() * Math.PI * 2;
        particles.push({
          hx,
          hy,
          gx: gridOffset + Math.round((hx - gridOffset) / GRID_COL) * GRID_COL + (plane - 1) * 5,
          gy: Math.round(hy / GRID_ROW) * GRID_ROW,
          fx: hx,
          x: hx + (Math.random() - 0.5) * 60,
          y: hy + (Math.random() - 0.5) * 60,
          vx: 0,
          vy: 0,
          dirX: Math.cos(angle),
          dirY: Math.sin(angle),
          plane,
          color: plane === 2 ? (Math.random() < 0.7 ? 0 : 3) : plane === 1 ? (Math.random() < 0.6 ? 1 : 0) : 2,
          len: 3 + Math.random() * 4,
          phase: Math.random() * Math.PI * 2,
          baseDx: Math.cos(angle),
          baseDy: Math.sin(angle)
        });
      }
    }

    this.particles = particles;
  }

  private step(now: number): void {
    // Reduced motion: nothing moves on its own (time frozen, ghost parked),
    // but the field still answers the pointer, which is motion the user drives.
    const t = this.reducedMotion ? 0 : (now - this.startedAt) / 1000;

    const target = this.formation();
    for (const name of FORMATIONS) {
      const goal = name === target ? 1 : 0;
      this.weights[name] = this.reducedMotion ? goal : this.weights[name] + (goal - this.weights[name]) * 0.045;
    }

    // Ghost cursor: a slow Lissajous path through the upper-middle of the field
    const ghostX = this.reducedMotion ? this.width * 0.72 : this.width * (0.5 + 0.3 * Math.sin(t * 0.21));
    const ghostY = this.reducedMotion ? this.height * 0.38 : this.height * (0.46 + 0.22 * Math.sin(t * 0.29 + 1.3));

    this.pointerWeight += ((this.pointerActive ? 1 : 0) - this.pointerWeight) * 0.06;
    const targetX = ghostX + (this.pointerX - ghostX) * this.pointerWeight;
    const targetY = ghostY + (this.pointerY - ghostY) * this.pointerWeight;
    this.focusX += (targetX - this.focusX) * 0.12;
    this.focusY += (targetY - this.focusY) * 0.12;

    this.update(t);
    this.draw(this.reducedMotion ? 1 : Math.min(1, t / 0.9));
  }

  /** How strongly the ring pulls: full in the ring formation, pointer-only elsewhere */
  private ringStrength(): number {
    return Math.max(this.weights.ring, this.pointerWeight * 0.75);
  }

  private reach(): number {
    const base = Math.min(260, Math.max(170, this.width * 0.2));
    return this.variant() === 'ambient' ? base * 0.75 : base;
  }

  private update(t: number): void {
    const w = this.weights;
    const cx = this.focusX;
    const cy = this.focusY;
    const reach = this.reach();
    const ring = this.ringStrength();
    const span = this.width + 40;

    for (const p of this.particles) {
      const plane = PLANES[p.plane];
      let tx = 0;
      let ty = 0;
      let dx = 0;
      let dy = 0;

      const calm = w.ring + w.scatter;
      if (calm > 0.001) {
        const drift = plane.drift * (1 + w.scatter * 2.2);
        const sx = p.hx + Math.sin(t * 0.6 + p.phase) * drift + p.baseDx * w.scatter * 18;
        const sy = p.hy + Math.cos(t * 0.5 + p.phase * 1.3) * drift + p.baseDy * w.scatter * 18;
        tx += sx * calm;
        ty += sy * calm;
        dx += p.baseDx * calm;
        dy += p.baseDy * calm;
      }

      if (w.grid > 0.001) {
        tx += (p.gx + Math.sin(t * 0.8 + p.phase) * 1.2) * w.grid;
        ty += p.gy * w.grid;
        dy += w.grid;
      }

      if (w.flow > 0.001) {
        const raw = p.hx + t * plane.speed;
        const fx = (((raw % span) + span) % span) - 20;
        const fy = p.hy + Math.sin(fx * 0.012 + p.phase) * 10;
        // Wrapped from the right edge: jump with it instead of streaking back across
        if (w.flow > 0.5 && fx < p.fx - span / 2) {
          p.x = fx;
          p.vx = 0;
        }
        p.fx = fx;
        tx += fx * w.flow;
        ty += fy * w.flow;
        dx += w.flow;
        dy += Math.cos(fx * 0.012 + p.phase) * 0.12 * w.flow;
      }

      // The ring bends every formation around the focus point
      const rx = tx - cx;
      const ry = ty - cy;
      const dist = Math.hypot(rx, ry) || 0.0001;
      if (ring > 0.001 && dist < reach) {
        const falloff = 1 - dist / reach;
        // Aggressive curve: most of the neighbourhood collapses onto the ring
        const ease = Math.pow(falloff, 0.55) * ring;
        const angle = Math.atan2(ry, rx) + ease * 0.45;
        // The ring wobbles with angle and time, so it reads as alive, not a stamp
        const radius = reach * 0.36 + Math.sin(angle * 3 + t * 1.6) * 9 + p.plane * 6;
        const r = dist + (radius - dist) * ease;
        tx = cx + Math.cos(angle) * r;
        ty = cy + Math.sin(angle) * r;
      }

      const len = Math.hypot(dx, dy) || 1;
      p.dirX = dx / len;
      p.dirY = dy / len;

      p.vx = (p.vx + (tx - p.x) * plane.pull) * 0.84;
      p.vy = (p.vy + (ty - p.y) * plane.pull) * 0.84;
      p.x += p.vx;
      p.y += p.vy;
    }
  }

  /** 0..1: how much of the field shows at a point, thinner behind the text */
  private presence(x: number, y: number): number {
    switch (this.quiet()) {
      case 'none':
        return 1;
      case 'left': {
        const ex = (x - this.width * 0.3) / (this.width * 0.36);
        const ey = (y - this.height * 0.55) / (this.height * 0.42);
        return Math.min(1, Math.max(0, Math.hypot(ex, ey) - 0.4));
      }
      default: {
        const ex = (x - this.width / 2) / Math.min(this.width * 0.36, 460);
        const ey = (y - this.height / 2) / Math.min(this.height * 0.26, 200);
        return Math.min(1, Math.max(0, Math.hypot(ex, ey) - 0.35));
      }
    }
  }

  private draw(intro: number): void {
    const ctx = this.ctx;
    if (!ctx) return;
    ctx.clearRect(0, 0, this.width, this.height);
    ctx.lineCap = 'round';

    const cx = this.focusX;
    const cy = this.focusY;
    const reach = this.reach();
    const ring = this.ringStrength();
    const strength = this.variant() === 'ambient' ? 0.8 : 1;
    // Without the ring's highlight the other formations need a brighter resting state to read
    const base = 0.5 + 0.4 * (1 - this.weights.ring);

    // Bucket by colour x plane x alpha step: a few dozen strokes instead of thousands
    const buckets = new Map<string, number[]>();

    for (const p of this.particles) {
      const plane = PLANES[p.plane];
      const dx = p.x - cx;
      const dy = p.y - cy;
      const dist = Math.hypot(dx, dy) || 0.0001;
      const near = Math.max(0, 1 - Math.abs(dist - reach * 0.36) / (reach * 0.55)) * ring;

      // Dashes point away from the focus on the ring, keep the formation's heading elsewhere
      let dirX = p.dirX * (1 - near) + (dx / dist) * near;
      let dirY = p.dirY * (1 - near) + (dy / dist) * near;
      const dirLen = Math.hypot(dirX, dirY) || 1;
      dirX /= dirLen;
      dirY /= dirLen;

      const quiet = 0.22 + 0.78 * Math.max(this.presence(p.x, p.y), near);
      const alpha = Math.min(1, plane.alpha * quiet * (base + 0.9 * near)) * intro * strength;
      if (alpha < 0.03) continue;
      const step = Math.min(ALPHA_STEPS, Math.max(1, Math.round(alpha * ALPHA_STEPS)));
      const half = (p.len * plane.scale * (1 + near * 0.9)) / 2;

      const key = `${p.color}|${p.plane}|${step}`;
      let list = buckets.get(key);
      if (!list) {
        list = [];
        buckets.set(key, list);
      }
      list.push(p.x - dirX * half, p.y - dirY * half, p.x + dirX * half, p.y + dirY * half);
    }

    for (const [key, coords] of buckets) {
      const [color, plane, step] = key.split('|').map(Number);
      ctx.strokeStyle = this.colors[color];
      ctx.globalAlpha = step / ALPHA_STEPS;
      ctx.lineWidth = 1.6 * PLANES[plane].scale + 0.4;
      ctx.beginPath();
      for (let i = 0; i < coords.length; i += 4) {
        ctx.moveTo(coords[i], coords[i + 1]);
        ctx.lineTo(coords[i + 2], coords[i + 3]);
      }
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }

  /** First paint under reduced motion, or while paused: settle every particle and paint once */
  private drawStill(): void {
    if (!this.ctx || !this.particles.length) return;
    this.focusX = this.width * 0.72;
    this.focusY = this.height * 0.38;
    for (let i = 0; i < 90; i++) this.update(0);
    this.draw(1);
  }
}
