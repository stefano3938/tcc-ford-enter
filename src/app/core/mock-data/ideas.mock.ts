import { Idea } from '../models/idea.model';

export const INITIAL_MOCK_IDEAS: Idea[] = [
  {
    id: 'idea-001',
    title: 'Smart Context Summarizer para reuniões diárias',
    summary: 'Um plugin local que transcreve pontos-chave e automaticamente cria cartões de tarefas no RemindMe com tags apropriadas.',
    category: 'product',
    tags: ['IA', 'Automação', 'Produtividade'],
    createdAt: '2026-09-22T14:00:00.000Z',
    isExpandedByAi: true,
    aiSuggestedBreakdown: {
      overview: 'Transformação de notas soltas em fluxos de trabalho acionáveis por PLN de baixa latência.',
      actionableSteps: [
        'Criar parser de texto livre para detecção de datas e prioridades',
        'Implementar categorização semântica automática por tags',
        'Permitir confirmação em 1-clique antes de gerar tarefas'
      ],
      potentialRisks: [
        'Sobrecarga de tarefas caso o áudio contenha muitas conversas paralelas',
        'Falso positivo em atribuição de urgência'
      ],
      suggestedTags: ['NLP', 'FastAction', 'Workflow']
    }
  },
  {
    id: 'idea-002',
    title: 'Modo Foco Linear estilo Apple Dynamic Island',
    summary: 'Barra flutuante compacta no topo da tela com cronômetro Pomodoro e a tarefa prioritária atual em destaque.',
    category: 'workflow',
    tags: ['UX', 'Pomodoro', 'Foco'],
    createdAt: '2026-09-23T09:30:00.000Z',
    isExpandedByAi: false
  },
  {
    id: 'idea-003',
    title: 'Grafo visual de correlação entre Tarefas e Ideias',
    summary: 'Visualização interativa em nós conectados para identificar gargalos e projetos com maior densidade de tarefas pendentes.',
    category: 'research',
    tags: ['Visualização', 'Analytics', 'Grafo'],
    createdAt: '2026-09-21T18:00:00.000Z',
    isExpandedByAi: false
  }
];
