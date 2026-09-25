import { ChangeDetectionStrategy, Component, afterNextRender, computed, inject, signal } from '@angular/core';
import { TaskService } from '../../../../core/services/task.service';
import { I18nService } from '../../../../core/services/i18n.service';
import { IdeaService } from '../../../../core/services/idea.service';
import { TaskPriority, TaskStatus } from '../../../../core/models/task.model';

type FlowKey = 'done' | 'doing' | 'todo';

interface FlowSegment {
  key: FlowKey;
  label: string;
  count: number;
  pct: number;
  dash: string;
  offset: number;
}

const RADIUS = 54;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const SEGMENT_GAP = 3;
const PRIORITIES: readonly TaskPriority[] = ['urgent', 'high', 'medium', 'low'];
const FLOW: ReadonlyArray<{ key: FlowKey; status: TaskStatus; label: string }> = [
  { key: 'done', status: 'done', label: 'dash.done' },
  { key: 'doing', status: 'in-progress', label: 'dash.doing' },
  { key: 'todo', status: 'todo', label: 'dash.todo' }
];

function localIsoDate(date: Date): string {
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${m}-${d}`;
}

@Component({
  selector: 'rm-stats-overview',
  standalone: true,
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './stats-overview.component.html',
  styleUrl: './stats-overview.component.css'
})
export class StatsOverviewComponent {
  readonly i18n = inject(I18nService);
  readonly taskService = inject(TaskService);
  readonly ideaService = inject(IdeaService);

  readonly radius = RADIUS;
  readonly circumference = CIRCUMFERENCE;
  readonly hovered = signal<FlowKey | null>(null);
  /** Segments start collapsed and grow once, after the first paint. */
  readonly drawn = signal(false);

  constructor() {
    afterNextRender(() => requestAnimationFrame(() => this.drawn.set(true)));
  }

  readonly segments = computed<FlowSegment[]>(() => {
    const tasks = this.taskService.tasks();
    const total = tasks.length;
    const counts = FLOW.map(f => tasks.filter(t => t.status === f.status).length);
    const visible = counts.filter(c => c > 0).length;
    const gap = visible > 1 ? SEGMENT_GAP : 0;
    const drawn = this.drawn();

    let start = 0;
    return FLOW.map((f, i) => {
      const count = counts[i];
      const length = total ? (count / total) * CIRCUMFERENCE : 0;
      const visibleLength = drawn && count ? Math.max(length - gap, 0.5) : 0;
      const segment: FlowSegment = {
        key: f.key,
        label: this.i18n.t(f.label),
        count,
        pct: total ? Math.round((count / total) * 100) : 0,
        dash: `${visibleLength} ${CIRCUMFERENCE}`,
        offset: -start
      };
      start += length;
      return segment;
    });
  });

  readonly progressLabel = computed(() => {
    const [done, doing, todo] = this.segments();
    return this.i18n.t('ov.progress.aria', {
      pct: this.taskService.completionPercentage(),
      done: done.count,
      doing: doing.count,
      todo: todo.count
    });
  });

  private readonly openTasks = computed(() =>
    this.taskService.tasks().filter(t => t.status !== 'done')
  );

  readonly priorities = computed(() => {
    const open = this.openTasks();
    const rows = PRIORITIES.map(p => ({
      key: p,
      label: this.i18n.t('priority.' + p),
      count: open.filter(t => t.priority === p).length
    }));
    const max = Math.max(1, ...rows.map(r => r.count));
    return rows.map(r => ({ ...r, width: this.drawn() ? (r.count / max) * 100 : 0 }));
  });

  readonly openCount = computed(() => this.openTasks().length);

  readonly overdueCount = computed(() => {
    const today = localIsoDate(new Date());
    return this.openTasks().filter(t => t.dueDate && t.dueDate < today).length;
  });

  readonly dueSoonCount = computed(() => {
    const now = new Date();
    const today = localIsoDate(now);
    const limit = localIsoDate(new Date(now.getFullYear(), now.getMonth(), now.getDate() + 7));
    return this.openTasks().filter(t => t.dueDate && t.dueDate >= today && t.dueDate <= limit).length;
  });

  readonly openEffort = computed(() => {
    const minutes = this.openTasks().reduce((sum, t) => sum + (t.estimatedMinutes ?? 0), 0);
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (!h) return `${m}min`;
    return m ? `${h}h ${m}min` : `${h}h`;
  });

  readonly ideasExpandedPct = computed(() => {
    const total = this.ideaService.totalIdeas();
    return total ? Math.round((this.ideaService.expandedCount() / total) * 100) : 0;
  });
}
