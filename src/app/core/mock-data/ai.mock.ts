import { AiPromptPreset, ChatMessage } from '../models/ai.model';

export const AI_PROMPT_PRESETS: AiPromptPreset[] = [
  {
    id: 'breakdown',
    icon: 'layers',
    title: 'Decompor em Tarefas Acionáveis',
    description: 'Transforme uma ideia abstrata em passos executáveis com prioridades sugeridas.',
    promptTemplate: 'Analise o seguinte objetivo e gere um checklist passo a passo de tarefas acionáveis com estimativa de tempo e prioridade recomendada: '
  },
  {
    id: 'prioritize',
    icon: 'zap',
    title: 'Priorizar meu Dia',
    description: 'Organize minhas tarefas pendentes usando a matriz de Eisenhower inteligente.',
    promptTemplate: 'Considerando minha lista de tarefas de hoje, sugira a ordem ótima de execução para maximizar o foco e diminuir a fadiga mental.'
  },
  {
    id: 'creative-expand',
    icon: 'sparkles',
    title: 'Expandir Ideia com Criatividade',
    description: 'Explore novos ângulos, riscos não óbvios e diferenciais competitivos para uma ideia.',
    promptTemplate: 'Expanda criticamente a seguinte proposta, propondo 3 diferenciais fortes e apontando 2 possíveis pontos fracos para mitigarmos: '
  },
  {
    id: 'summarize',
    icon: 'file-text',
    title: 'Sintetizar & Resumir',
    description: 'Crie uma visão executiva rápida das atividades concluídas e em andamento.',
    promptTemplate: 'Crie um resumo conciso e profissional em formato de bullet points do progresso atual para apresentar em uma reunião rápida.'
  }
];

export const INITIAL_AI_CHAT_MESSAGES: ChatMessage[] = [
  {
    id: 'msg-001',
    role: 'assistant',
    content: 'Olá! Sou o assistente de inteligência do **RedmindMe**. Estou pronto para ajudá-lo a decompor ideias complexas, planejar sprints ou priorizar o que realmente importa hoje. Como posso otimizar seu fluxo?',
    timestamp: new Date().toISOString(),
    isStreaming: false
  }
];
