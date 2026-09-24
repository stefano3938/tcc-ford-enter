import { Task } from '../models/task.model';

export const INITIAL_MOCK_TASKS: Task[] = [
  {
    id: 'tsk-001',
    title: 'Refinar design tokens do Design System',
    description: 'Ajustar variáveis de cor, sombras sutis e contraste de botões de acordo com o padrão Apple HIG e Linear.',
    status: 'in-progress',
    priority: 'urgent',
    tags: ['UI/UX', 'Design System', 'Tokens'],
    dueDate: '2026-09-25',
    createdAt: '2026-09-22T10:00:00.000Z',
    updatedAt: '2026-09-23T08:30:00.000Z',
    isAiGenerated: false,
    estimatedMinutes: 45
  },
  {
    id: 'tsk-002',
    title: 'Implementar Signals reativos para TaskService',
    description: 'Construir os signals computed() para filtrar tarefas por status, prioridade e cálculo em tempo real de estatísticas de conclusão.',
    status: 'done',
    priority: 'high',
    tags: ['Desenvolvimento', 'Estado', 'Produtividade'],
    dueDate: '2026-09-23',
    createdAt: '2026-09-21T14:20:00.000Z',
    updatedAt: '2026-09-23T09:15:00.000Z',
    isAiGenerated: false,
    estimatedMinutes: 60
  },
  {
    id: 'tsk-003',
    title: 'Implementar efeito de digitação no chat',
    description: 'Implementar fluxo de streaming com efeito de digitação e cursor piscante para respostas generativas de alta fidelidade.',
    status: 'todo',
    priority: 'high',
    tags: ['IA', 'UX', 'Streaming'],
    dueDate: '2026-09-26',
    createdAt: '2026-09-23T11:00:00.000Z',
    updatedAt: '2026-09-23T11:00:00.000Z',
    isAiGenerated: true,
    estimatedMinutes: 30
  },
  {
    id: 'tsk-004',
    title: 'Construir modal de Upsell com plano Pro',
    description: 'Apresentar gatilhos visuais quando o usuário atinge o limite gratuito de tarefas/ideias, com micro-interações de conversão.',
    status: 'in-progress',
    priority: 'medium',
    tags: ['Paywall', 'Monetização', 'Growth'],
    dueDate: '2026-09-28',
    createdAt: '2026-09-22T16:45:00.000Z',
    updatedAt: '2026-09-23T10:20:00.000Z',
    isAiGenerated: false,
    estimatedMinutes: 40
  },
  {
    id: 'tsk-005',
    title: 'Auditoria de Acessibilidade (ARIA) nos modais',
    description: 'Garantir foco preso (focus trap), fechamento por tecla Escape e leitor de tela nos diálogos de edição.',
    status: 'todo',
    priority: 'low',
    tags: ['A11y', 'Qualidade', 'Front-End'],
    dueDate: '2026-09-30',
    createdAt: '2026-09-23T09:00:00.000Z',
    updatedAt: '2026-09-23T09:00:00.000Z',
    isAiGenerated: false,
    estimatedMinutes: 25
  },
  {
    id: 'tsk-006',
    title: 'Preparar apresentação trimestral de resultados',
    description: 'Consolidar métricas de produtividade, destaques do trimestre e próximos passos estratégicos para a equipe.',
    status: 'todo',
    priority: 'urgent',
    tags: ['Planejamento', 'Apresentação'],
    dueDate: '2026-10-02',
    createdAt: '2026-09-23T08:00:00.000Z',
    updatedAt: '2026-09-23T08:00:00.000Z',
    isAiGenerated: false,
    estimatedMinutes: 90
  }
];
