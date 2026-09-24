import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { UserService } from './user.service';
import { ToastService } from './toast.service';
import { TaskService } from './task.service';
import { I18nService } from './i18n.service';
import { ChatMessage } from '../models/ai.model';
import { Idea } from '../models/idea.model';
import { INITIAL_AI_CHAT_MESSAGES } from '../mock-data/ai.mock';
import { environment } from '../../../environments/environment';

/** Longest a reply may take to "type out" on screen, whatever its length. */
const MAX_REVEAL_MS = 2500;
const REVEAL_TICK_MS = 16;

@Injectable({
  providedIn: 'root'
})
export class AiService {
  private readonly userService = inject(UserService);
  private readonly toast = inject(ToastService);
  private readonly taskService = inject(TaskService);
  private readonly i18n = inject(I18nService);
  private readonly http = inject(HttpClient);

  readonly messages = signal<ChatMessage[]>(INITIAL_AI_CHAT_MESSAGES);
  readonly isTyping = signal<boolean>(false);
  readonly streamingContent = signal<string>('');
  readonly isStreaming = signal<boolean>(false);
  /** Messages whose suggested tasks were already added to the board. */
  readonly addedMessageIds = signal<ReadonlySet<string>>(new Set());

  private abortController: AbortController | null = null;

  async sendMessage(userInput: string): Promise<boolean> {
    const trimmed = userInput.trim();
    if (!trimmed) return false;
    if (this.isTyping() || this.isStreaming()) {
      return false;
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
    await this.delay(600, signal);
    if (signal.aborted) return false;

    let responsePayload: { content: string; suggestedTasks?: ChatMessage['suggestedTasks'] };
    const apiKey = (typeof localStorage !== 'undefined' ? localStorage.getItem('rm_gemini_key') : null) || (environment as { geminiApiKey?: string }).geminiApiKey;
    if (apiKey) {
      responsePayload = await this.askGemini(apiKey, trimmed);
    } else {
      responsePayload = this.generateSimulatedAiResponse(trimmed);
    }
    if (signal.aborted) return false;

    this.isTyping.set(false);
    this.isStreaming.set(true);
    const fullText = responsePayload.content;

    // Reveal in chunks sized so even a long answer finishes within MAX_REVEAL_MS
    const ticks = Math.max(1, Math.floor(MAX_REVEAL_MS / REVEAL_TICK_MS));
    const chunk = Math.max(2, Math.ceil(fullText.length / ticks));
    for (let i = chunk; i < fullText.length + chunk; i += chunk) {
      this.streamingContent.set(fullText.slice(0, i));
      await this.delay(REVEAL_TICK_MS, signal);
      if (signal.aborted) return false;
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

  /**
   * Stops the current answer. While the AI was still thinking, the query is given back,
   * since the user got nothing for it.
   */
  cancelStreaming(): void {
    if (!this.abortController) return;
    const gotNothing = this.isTyping();
    this.abortController.abort();
    this.abortController = null;
    this.isTyping.set(false);
    this.isStreaming.set(false);
    this.streamingContent.set('');
    if (gotNothing) {
      this.userService.refundAiUsage();
    }
  }

  async expandIdea(idea: Idea): Promise<NonNullable<Idea['aiSuggestedBreakdown']>> {
    const canProceed = this.userService.incrementAiUsage();
    if (!canProceed) {
      throw new Error('Quota exceeded');
    }

    await this.delay(1200);

    // Simulated AI output: demo content, like the canned chat replies below
    return {
      overview: `Expansão estratégica para "${idea.title}". Foco em entrega incremental, validação com usuários reais e minimização de atrito visual.`,
      actionableSteps: [
        `Definir escopo do MVP para "${idea.title.slice(0, 30)}" em 1 semana`,
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
  }

  /** Adds a message's suggested tasks once; the button is disabled afterwards. */
  addSuggestedTasks(messageId: string, tasks: NonNullable<ChatMessage['suggestedTasks']>): void {
    if (this.addedMessageIds().has(messageId)) return;
    const added = this.convertSuggestedTasksToLive(tasks);
    if (added > 0) {
      this.addedMessageIds.update(set => new Set(set).add(messageId));
    }
  }

  convertSuggestedTasksToLive(tasks: NonNullable<ChatMessage['suggestedTasks']>, description?: string): number {
    const mapped = tasks.map(t => ({
      title: t.title,
      description: description ?? this.i18n.t('ai.taskFromSuggestion'),
      status: 'todo' as const,
      priority: t.priority,
      tags: [...t.tags, 'IA'],
      estimatedMinutes: t.estimatedMinutes || 30
    }));

    return this.taskService.addMultipleTasks(mapped);
  }

  clearChat(): void {
    this.cancelStreaming();
    this.messages.set(INITIAL_AI_CHAT_MESSAGES);
    this.addedMessageIds.set(new Set());
  }

  private async askGemini(apiKey: string, prompt: string): Promise<{ content: string; suggestedTasks?: ChatMessage['suggestedTasks'] }> {
    const language = this.i18n.current().label;
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
      const body = {
        contents: [{ parts: [{ text: `Você é o RemindMe Copilot, assistente especialista em produtividade e planejamento de produtos digitais. Responda em ${language}, de forma objetiva (150-300 palavras) com subtítulos, listas e exemplos práticos.

REGRAS OBRIGATÓRIAS:
- Ao final da resposta, SEMPRE crie EXATAMENTE 2 tarefas acionáveis no formato exato, cada uma em uma linha separada:
[TAREFA: <título objetivo e específico com verbo de ação> | prioridade: high | tags: Planejamento, Produto]
[TAREFA: <título objetivo e específico com verbo de ação> | prioridade: medium | tags: Execução, Foco]
- Título da tarefa deve ter 6-10 palavras, começar com verbo e ser específico ao pedido do usuário, NUNCA genérico como "Executar fase 1".
- Escreva os títulos das tarefas em ${language}.

Usuário: ${prompt}` }] }],
        generationConfig: { temperature: 0.85, maxOutputTokens: 1000, topP: 0.95 }
      };
      const res = await firstValueFrom(this.http.post<{ candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> }>(url, body));
      const text = res?.candidates?.[0]?.content?.parts?.[0]?.text || '';
      if (!text) return this.generateSimulatedAiResponse(prompt);

      const taskRegex = /\[TAREFA:\s*([^|]+)\|\s*prioridade:\s*(high|medium|urgent|low)\|\s*tags:\s*([^\]]+)\]/gi;
      const tasks: NonNullable<ChatMessage['suggestedTasks']> = [];
      let m: RegExpExecArray | null;
      while ((m = taskRegex.exec(text)) !== null) {
        tasks.push({
          title: m[1].trim(),
          priority: m[2].trim().toLowerCase() as 'urgent' | 'high' | 'medium' | 'low',
          tags: m[3].split(',').map(s => s.trim()),
          estimatedMinutes: 30
        });
      }
      const cleanContent = text.replace(taskRegex, '').trim();
      return {
        content: cleanContent || text,
        suggestedTasks: tasks.length ? tasks : this.generateSimulatedAiResponse(prompt).suggestedTasks
      };
    } catch {
      this.toast.info(this.i18n.t('toast.ai.local'), this.i18n.t('toast.ai.local.body'));
      return this.generateSimulatedAiResponse(prompt);
    }
  }

  /** Canned replies used when no Gemini key is configured (demo content). */
  private generateSimulatedAiResponse(input: string): {
    content: string;
    suggestedTasks?: ChatMessage['suggestedTasks'];
  } {
    const lower = input.toLowerCase();

    if (lower.includes('prioriz') || lower.includes('dia') || lower.includes('hoje')) {
      return {
        content: `Analisei suas tarefas atuais. Recomendo começar pelas de prioridade **Urgente** com menor tempo estimado para obter vitórias rápidas pela manhã:\n\n1. **Refinar fluxo principal** (45 min): desbloqueia coerência visual.\n2. **Revisar pendências rápidas** (25 min): avanço imediato.\n3. **Planejar bloco da tarde**: reserve energia criativa para síntese e revisão.`,
        suggestedTasks: [
          { title: 'Revisar checklist de tarefas da manhã', priority: 'high', tags: ['Foco', 'Rotina'], estimatedMinutes: 15 },
          { title: 'Bloquear 90 min de foco profundo', priority: 'urgent', tags: ['DeepWork', 'Foco'], estimatedMinutes: 90 }
        ]
      };
    }

    if (lower.includes('ideia') || lower.includes('brainstorm') || lower.includes('expand')) {
      return {
        content: `Excelente direcionamento criativo! Para transformar essa visão em um produto palpável, precisamos responder a três perguntas:\n\n- **Qual o primeiro micro-hábito** que o usuário executará em 5 segundos?\n- **Como a IA antecipa** o próximo passo sem parecer invasiva?\n- **Qual o critério de sucesso** claro para o MVP?\n\nAbaixo formatei as primeiras ações recomendadas para o seu backlog:`,
        suggestedTasks: [
          { title: 'Mapear user journey do novo recurso', priority: 'high', tags: ['UX', 'Figma'], estimatedMinutes: 40 },
          { title: 'Prototipar componentes reutilizáveis no shared', priority: 'medium', tags: ['FrontEnd'], estimatedMinutes: 50 },
          { title: 'Testar usabilidade em dispositivo móvel (375px)', priority: 'high', tags: ['Mobile', 'QA'], estimatedMinutes: 30 }
        ]
      };
    }

    if (lower.includes('apresenta') || lower.includes('slides') || lower.includes('reunião') || lower.includes('resum')) {
      return {
        content: `Para uma apresentação de alto impacto, foque em três pilares:\n\n- **Clareza da narrativa**: contexto, desafio e solução em sequência lógica.\n- **Demonstração prática**: mostre o fluxo real em vez de apenas descrevê-lo.\n- **Próximos passos objetivos**: finalize com ações concretas e responsáveis definidos.\n\nSugeri dois cards de preparação imediata:`,
        suggestedTasks: [
          { title: 'Ensaio de apresentação de 15 minutos', priority: 'high', tags: ['Planejamento', 'Comunicação'], estimatedMinutes: 45 },
          { title: 'Preparar roteiro de demonstração do produto', priority: 'medium', tags: ['Produto', 'Apresentação'], estimatedMinutes: 30 }
        ]
      };
    }
    if (lower.includes('site') || lower.includes('planeje') || lower.includes('planejar')) {
      const tema = input.replace(/quero que você planeje um site para/i, '').trim() || 'seu projeto';
      return {
        content: `Plano para site **${tema}** em 4 etapas:\n\n**1. Descoberta**: defina público, objetivo e conteúdo principal.\n**2. Arquitetura**: sitemap com Home, Sobre, Serviços/Portfólio, Contato e navegação clara.\n**3. Design**: wireframe no Figma com grid, tipografia e sistema de cores.\n**4. Build**: protótipo navegável e publicação.`,
        suggestedTasks: [
          { title: `Definir sitemap e arquitetura do site ${tema.slice(0, 28)}`, priority: 'high', tags: ['Planejamento', 'Arquitetura'], estimatedMinutes: 45 },
          { title: 'Prototipar homepage e fluxo principal no Figma', priority: 'medium', tags: ['Design', 'Prototipação'], estimatedMinutes: 60 }
        ]
      };
    }
    const keywords = input.split(/\s+/).slice(0, 4).join(' ');
    const quoted = input.length > 60 ? `${input.slice(0, 60)}…` : input;
    return {
      content: `Entendido. Estruturei seu pedido **"${quoted}"** em um plano prático com próximos passos claros. As 2 tarefas abaixo já estão prontas para entrar no seu quadro com prioridade e tags:`,
      suggestedTasks: [
        { title: `Planejar: ${keywords} (escopo e critérios)`, priority: 'high', tags: ['Planejamento', 'Foco'], estimatedMinutes: 35 },
        { title: `Executar: ${keywords} (primeira entrega)`, priority: 'medium', tags: ['Execução', 'Revisão'], estimatedMinutes: 25 }
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
