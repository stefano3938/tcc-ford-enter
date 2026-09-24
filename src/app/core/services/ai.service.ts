import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { UserService } from './user.service';
import { ToastService } from './toast.service';
import { TaskService } from './task.service';
import { ChatMessage } from '../models/ai.model';
import { Idea } from '../models/idea.model';
import { INITIAL_AI_CHAT_MESSAGES } from '../mock-data/ai.mock';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AiService {
  private readonly userService = inject(UserService);
  private readonly toast = inject(ToastService);
  private readonly taskService = inject(TaskService);
  private readonly http = inject(HttpClient);

  readonly messages = signal<ChatMessage[]>(INITIAL_AI_CHAT_MESSAGES);
  readonly isTyping = signal<boolean>(false);
  readonly streamingContent = signal<string>('');
  readonly isStreaming = signal<boolean>(false);

  private abortController: AbortController | null = null;

  async sendMessage(userInput: string): Promise<boolean> {
    const trimmed = userInput.trim();
    if (!trimmed) return false;
    if (this.isTyping() || this.isStreaming()) {
      return false;
    }
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
      this.streamingContent.set('');
      this.isStreaming.set(false);
      this.isTyping.set(false);
    }
    const canProceed = this.userService.incrementAiUsage();
    if (!canProceed) return false;
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}-user`,
      role: 'user',
      content: trimmed,
      timestamp: new Date().toISOString()
    };
    this.messages.update(msgs => [...msgs, userMsg]);
    this.isTyping.set(true);
    this.streamingContent.set('');
    this.isStreaming.set(false);

    this.abortController = new AbortController();
    const signal = this.abortController.signal;
    await this.delay(800, signal);
    if (signal.aborted) {
      this.isTyping.set(false);
      this.isStreaming.set(false);
      this.streamingContent.set('');
      return false;
    }
    let responsePayload: { content: string; suggestedTasks?: ChatMessage['suggestedTasks'] };
    const apiKey = (typeof localStorage !== 'undefined' ? localStorage.getItem('rm_gemini_key') : null) || (environment as any).geminiApiKey;
    if (apiKey) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
        const body = {
          contents: [{ parts: [{ text: `Você é o RedmindMe Copilot, assistente especialista em produtividade e planejamento de produtos digitais. Responda em português, de forma detalhada (350-500 palavras) com subtítulos, listas e exemplos práticos.

REGRAS OBRIGATÓRIAS:
- Ao final da resposta, SEMPRE crie EXATAMENTE 2 tarefas acionáveis no formato exato, cada uma em uma linha separada:
[TAREFA: <título objetivo e específico com verbo de ação> | prioridade: high | tags: Planejamento, Produto]
[TAREFA: <título objetivo e específico com verbo de ação> | prioridade: medium | tags: Execução, Foco]
- Título da tarefa deve ter 6-10 palavras, começar com verbo (Definir, Criar, Mapear, Validar, Prototipar) e ser específico ao pedido do usuário, NUNCA genérico como "Executar fase 1".
- Se o usuário pediu "planeje um site para...", as tarefas devem ser sobre esse site específico (ex: "Definir sitemap e arquitetura do site de portfólio" e "Prototipar homepage no Figma com grid de projetos").

Usuário: ${trimmed}` }] }],
          generationConfig: { temperature: 0.85, maxOutputTokens: 1400, topP: 0.95 }
        };
        const res: any = await firstValueFrom(this.http.post(url, body));
        const text: string = res?.candidates?.[0]?.content?.parts?.[0]?.text || '';
        if (text) {

          const taskRegex = /\[TAREFA:\s*([^\|]+)\|\s*prioridade:\s*(high|medium|urgent|low)\|\s*tags:\s*([^\]]+)\]/gi;
          const tasks: NonNullable<ChatMessage['suggestedTasks']> = [];
          let m: RegExpExecArray | null;
          while ((m = taskRegex.exec(text)) !== null) {
            tasks.push({ title: m[1].trim(), priority: m[2].trim() as any, tags: m[3].split(',').map(s => s.trim()), estimatedMinutes: 30 });
          }
          const cleanContent = text.replace(taskRegex, '').trim();
          responsePayload = { content: cleanContent || text, suggestedTasks: tasks.length ? tasks : this.generateSimulatedAiResponse(trimmed).suggestedTasks };
        } else {
          responsePayload = this.generateSimulatedAiResponse(trimmed);
        }
      } catch (e: any) {

        if (e?.error?.error?.message) this.toast.info('IA em modo local', 'Usando resposta local (verifique sua Gemini Key).');
        responsePayload = this.generateSimulatedAiResponse(trimmed);
      }
    } else {
      responsePayload = this.generateSimulatedAiResponse(trimmed);
    }
    this.isTyping.set(false);
    this.isStreaming.set(true);
    const fullText = responsePayload.content;
    let accumulated = '';

    for (let i = 0; i < fullText.length; i++) {
      if (signal.aborted) {
        this.streamingContent.set('');
        this.isStreaming.set(false);
        this.isTyping.set(false);
        return false;
      }
      accumulated += fullText[i];
      this.streamingContent.set(accumulated);

      await this.delay(12, signal);
      if (signal.aborted) {
        this.streamingContent.set('');
        this.isStreaming.set(false);
        this.isTyping.set(false);
        return false;
      }
    }

    if (signal.aborted) {
      this.streamingContent.set('');
      this.isStreaming.set(false);
      return false;
    }
    const assistantMsg: ChatMessage = {
      id: `msg-${Date.now()}-assistant`,
      role: 'assistant',
      content: fullText,
      timestamp: new Date().toISOString(),
      suggestedTasks: responsePayload.suggestedTasks
    };

    this.messages.update(msgs => [...msgs, assistantMsg]);
    this.streamingContent.set('');
    this.isStreaming.set(false);
    this.abortController = null;
    return true;
  }

  cancelStreaming(): void {
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
    this.isTyping.set(false);
    this.isStreaming.set(false);
    this.streamingContent.set('');
  }

  async expandIdea(idea: Idea): Promise<NonNullable<Idea['aiSuggestedBreakdown']>> {
    const canProceed = this.userService.incrementAiUsage();
    if (!canProceed) {
      throw new Error('Quota exceeded');
    }

    await this.delay(1200);

    const breakdown: NonNullable<Idea['aiSuggestedBreakdown']> = {
      overview: `Expansão estratégica para "${idea.title}". Foco em entrega incremental, validação com usuários reais e minimização de atrito visual.`,
      actionableSteps: [
        `Definir escopo do MVP para "${idea.title.slice(0, 30)}..." em 1 semana`,
        'Prototipar fluxos de interação no Figma com foco no Apple Human Interface Guidelines',
        'Validar requisitos de acessibilidade e estados vazios com usuários-alvo',
        'Implementar instrumentação de telemetria local para medir conversão e retenção'
      ],
      potentialRisks: [
        'Complexidade excessiva no primeiro release afetando a usabilidade',
        'Tempo de carregamento perceptível caso o volume de dados locais aumente muito'
      ],
      suggestedTags: [...idea.tags, 'Sprint-1', 'AI-Decomposed']
    };

    return breakdown;
  }

  convertSuggestedTasksToLive(tasks: NonNullable<ChatMessage['suggestedTasks']>): void {
    const mapped = tasks.map(t => ({
      title: t.title,
      description: 'Criado a partir de sugestão.',
      status: 'todo' as const,
      priority: t.priority,
      tags: [...t.tags, 'IA-Suggestion'],
      estimatedMinutes: t.estimatedMinutes || 30
    }));

    this.taskService.addMultipleTasks(mapped);
  }

  clearChat(): void {
    this.cancelStreaming();
    this.messages.set(INITIAL_AI_CHAT_MESSAGES);
    this.toast.info('Histórico de conversa reiniciado');
  }

  private generateSimulatedAiResponse(input: string): {
    content: string;
    suggestedTasks?: ChatMessage['suggestedTasks'];
  } {
    const lower = input.toLowerCase();

    if (lower.includes('prioriz') || lower.includes('dia') || lower.includes('hoje')) {
      return {
        content: `Analisei suas tarefas atuais. Recomendo começar pelas de prioridade **Urgente** com menor tempo estimado para obter vitórias rápidas pela manhã:\n\n1. **Refinar fluxo principal** (45 min) — Desbloqueia coerência visual.\n2. **Revisar pendências rápidas** (25 min) — Avanço imediato.\n3. **Planejar bloco da tarde** — Reserve energia criativa para síntese e revisão.`,
        suggestedTasks: [
          { title: 'Revisar checklist de tarefas da manhã', priority: 'high', tags: ['Foco', 'Rotina'], estimatedMinutes: 15 },
          { title: 'Bloquear 90 min de foco profundo', priority: 'urgent', tags: ['DeepWork', 'Foco'], estimatedMinutes: 90 }
        ]
      };
    }

    if (lower.includes('ideia') || lower.includes('brainstorm') || lower.includes('expand')) {
      return {
        content: `Excelente direcionamento criativo! Para transformar essa visão em um produto palpável e linear, precisamos responder a três perguntas:\n\n- **Qual o primeiro micro-hábito** que o usuário executará em 5 segundos?\n- **Como a IA antecipa** o próximo passo sem parecer invasiva?\n- **Qual o critério de sucesso** claro para o MVP?\n\nAbaixo formatei as primeiras ações recomendadas para o seu backlog:`,
        suggestedTasks: [
          { title: 'Mapear user journey do novo recurso', priority: 'high', tags: ['UX', 'Figma'], estimatedMinutes: 40 },
          { title: 'Prototipar componentes reutilizáveis no shared', priority: 'medium', tags: ['FrontEnd'], estimatedMinutes: 50 },
          { title: 'Testar usabilidade em dispositivo móvel (375px)', priority: 'high', tags: ['Mobile', 'QA'], estimatedMinutes: 30 }
        ]
      };
    }

    if (lower.includes('apresenta') || lower.includes('slides') || lower.includes('reunião')) {
      return {
        content: `Para uma apresentação de alto impacto, foque em três pilares:\n\n- **Clareza da narrativa** — Contexto, desafio e solução em sequência lógica.\n- **Demonstração prática** — Mostre o fluxo real em vez de apenas descrevê-lo.\n- **Próximos passos objetivos** — Finalize com ações concretas e responsáveis definidos.\n\nSugeri dois cards de preparação imediata:`,
        suggestedTasks: [
          { title: 'Ensaio de apresentação de 15 minutos', priority: 'high', tags: ['Planejamento', 'Comunicação'], estimatedMinutes: 45 },
          { title: 'Preparar roteiro de demonstração do produto', priority: 'medium', tags: ['Produto', 'Apresentação'], estimatedMinutes: 30 }
        ]
      };
    }
    if (lower.includes('site') || lower.includes('planeje') || lower.includes('planejar')) {
      const tema = input.replace(/quero que você planeje um site para/i, '').trim() || 'seu projeto';
      return {
        content: `Plano para site **${tema}** em 4 etapas:\n\n**1. Descoberta** — defina público, objetivo e conteúdo principal.\n**2. Arquitetura** — sitemap com Home, Sobre, Serviços/Portfólio, Contato + navegação clara.\n**3. Design** — wireframe no Figma com grid, tipografia (Outfit + Inter) e sistema de cores.\n**4. Build** — protótipo em Angular com Kanban/Lista e publicação.`,
        suggestedTasks: [
          { title: `Definir sitemap e arquitetura do site ${tema.slice(0,28)}`, priority: 'high', tags: ['Planejamento', 'Arquitetura'], estimatedMinutes: 45 },
          { title: `Prototipar homepage e fluxo principal no Figma`, priority: 'medium', tags: ['Design', 'Prototipação'], estimatedMinutes: 60 }
        ]
      };
    }
    const keywords = input.split(/\s+/).slice(0, 4).join(' ');
    return {
      content: `Entendido — estruturei seu pedido **"${input.slice(0,60)}..."** em um plano prático com próximos passos claros. As 2 tarefas abaixo já estão prontas para entrar no seu quadro com prioridade e tags:`,
      suggestedTasks: [
        { title: `Planejar: ${keywords} — definir escopo e critérios`, priority: 'high', tags: ['Planejamento', 'Foco'], estimatedMinutes: 35 },
        { title: `Executar: ${keywords} — validar primeira entrega`, priority: 'medium', tags: ['Execução', 'Revisão'], estimatedMinutes: 25 }
      ]
    };
  }

  private delay(ms: number, signal?: AbortSignal): Promise<void> {
    if (signal?.aborted) return Promise.resolve();
    return new Promise(resolve => {
      const timeout = setTimeout(() => resolve(), ms);
      signal?.addEventListener('abort', () => {
        clearTimeout(timeout);
        resolve();
      }, { once: true });
    });
  }
}
