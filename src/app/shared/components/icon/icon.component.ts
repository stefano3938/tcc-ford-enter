import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

export type IconName =
  | 'sparkles'
  | 'check'
  | 'check-circle'
  | 'clock'
  | 'calendar'
  | 'plus'
  | 'trash'
  | 'edit'
  | 'filter'
  | 'search'
  | 'refresh'
  | 'sun'
  | 'moon'
  | 'crown'
  | 'zap'
  | 'flame'
  | 'list'
  | 'kanban'
  | 'arrow-right'
  | 'arrow-left'
  | 'alert-triangle'
  | 'info'
  | 'x'
  | 'lock'
  | 'unlock'
  | 'user'
  | 'mail'
  | 'shield'
  | 'log-out'
  | 'log-in'
  | 'chevron-right'
  | 'chevron-left'
  | 'external-link'
  | 'layout-dashboard'
  | 'lightbulb'
  | 'cpu'
  | 'terminal'
  | 'layers'
  | 'box'
  | 'bar-chart'
  | 'file-text'
  | 'tag'
  | 'send'
  | 'message-square'
  | 'sliders'
  | 'eye'
  | 'eye-off'
  | 'check-square'
  | 'folder'
  | 'menu'
  | 'globe'
  | 'chevron-down'
  | 'more-vertical'
  | 'undo'
  | 'square';

/** Names that other icon sets use for glyphs this set already draws. */
const ICON_ALIASES: Readonly<Record<string, string>> = {
  bolt: 'zap',
  pencil: 'edit',
  'exclamation-triangle': 'alert-triangle',
  'check-square-o': 'check-square'
};

@Component({
  selector: 'rm-icon',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './icon.component.html',
  styleUrl: './icon.component.css'
})
export class IconComponent {
  readonly name = input<IconName | string>('sparkles');
  readonly size = input<number>(16);
  readonly strokeWidth = input<number>(2);

  readonly resolvedName = computed(() => {
    let n = this.name().trim().toLowerCase();

    // Legacy PrimeIcons-style names ("pi-bolt") map onto this icon set
    if (n.startsWith('pi-')) {
      n = n.slice(3);
    }
    return ICON_ALIASES[n] ?? n;
  });
}
