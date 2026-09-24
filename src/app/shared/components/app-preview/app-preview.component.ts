import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { I18nService } from '../../../core/services/i18n.service';
import { IconComponent } from '../icon/icon.component';

export type AppPreviewVariant = 'kanban' | 'ideas' | 'assistant' | 'progress';

type Priority = 'urgent' | 'high' | 'medium';

interface PreviewTask {
  readonly title: string;
  readonly desc?: string;
  readonly priority?: Priority;
  readonly time?: string;
  readonly tags: ReadonlyArray<string>;
  readonly owner?: string;
}

interface PreviewColumn {
  readonly key: 'todo' | 'doing' | 'done';
  readonly icon: 'list' | 'clock' | 'check-circle';
  readonly tasks: ReadonlyArray<PreviewTask>;
}

/**
 * Read-only replica of the app used as product imagery on public pages.
 * Interface labels go through i18n; task titles are demo content.
 * Plays its small one-shot animation when an ancestor gets .rm-reveal--in.
 */
@Component({
  selector: 'rm-app-preview',
  standalone: true,
  imports: [IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './app-preview.component.html',
  styleUrl: './app-preview.component.css',
  host: { 'aria-hidden': 'true' }
})
export class AppPreviewComponent {
  readonly i18n = inject(I18nService);

  readonly variant = input<AppPreviewVariant>('kanban');
  /** Kanban only: index (across all cards) of the card to spotlight */
  readonly highlight = input<number | null>(null);
  /** Hides the toolbar and stats row: for smaller frames next to text */
  readonly compact = input(false);

  readonly path = computed(() => {
    switch (this.variant()) {
      case 'ideas': return 'ideias';
      case 'assistant': return 'ai-assistant';
      default: return 'dashboard';
    }
  });

  readonly columns: ReadonlyArray<PreviewColumn> = [
    {
      key: 'todo',
      icon: 'list',
      tasks: [
        { title: 'Revisar proposta comercial Q4', desc: 'Validar escopo e margem com financeiro', priority: 'high', time: '30 min', tags: ['Planejamento', 'Q4'], owner: 'SD' },
        { title: 'Definir escopo do MVP de onboarding', priority: 'medium', time: '45 min', tags: ['Produto', 'MVP'] },
        { title: 'Agendar entrevistas com 5 usuários', tags: ['Pesquisa'] }
      ]
    },
    {
      key: 'doing',
      icon: 'clock',
      tasks: [
        { title: 'Refinar fluxo de onboarding', desc: 'Protótipo com estados vazios', priority: 'urgent', time: '45 min', tags: ['Produto', 'UX'], owner: 'AV' },
        { title: 'Sincronizar design tokens', time: '20 min', tags: ['Design System'] },
        { title: 'Validar acessibilidade dos modais', tags: ['A11y'] }
      ]
    },
    {
      key: 'done',
      icon: 'check-circle',
      tasks: [
        { title: 'Mapear jornada do usuário', tags: ['Pesquisa'] },
        { title: 'Entrevistar 5 usuários beta', tags: ['Entrevista'] },
        { title: 'Criar parser de datas', tags: ['Automação'] }
      ]
    }
  ];

  readonly ideas: ReadonlyArray<{ title: string; body: string; tags: ReadonlyArray<string> }> = [
    { title: 'Resumo automático de reuniões', body: 'Gerar pontos de ação a partir das notas.', tags: ['IA', 'Automação'] },
    { title: 'Modo apresentação do quadro', body: 'Visão limpa do Kanban para reuniões.', tags: ['Produto'] },
    { title: 'Lembretes por contexto', body: 'Avisar quando a tarefa fica relevante.', tags: ['Pesquisa', 'Sprint 2'] }
  ];

  readonly suggestions: ReadonlyArray<{ title: string; priority: Priority; time: string }> = [
    { title: 'Revisar proposta comercial Q4', priority: 'urgent', time: '30 min' },
    { title: 'Refinar fluxo de onboarding', priority: 'high', time: '45 min' },
    { title: 'Sincronizar design tokens', priority: 'medium', time: '20 min' }
  ];

  /** Position of a card across all columns, to match `highlight` */
  cardIndex(column: number, row: number): number {
    let offset = 0;
    for (let i = 0; i < column; i++) offset += this.columns[i].tasks.length;
    return offset + row;
  }
}
