import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  ViewChild,
  effect,
  inject,
  signal
} from '@angular/core';
import { SecurityContext } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import type { SafeHtml } from '@angular/platform-browser';
import { AiService } from '../../core/services/ai.service';
import { UserService } from '../../core/services/user.service';
import { AI_PROMPT_PRESETS } from '../../core/mock-data/ai.mock';
import { AiPromptPreset, ChatMessage } from '../../core/models/ai.model';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { BadgeComponent } from '../../shared/components/badge/badge.component';
import { AvatarComponent } from '../../shared/components/avatar/avatar.component';

@Component({
  selector: 'rm-ai-assistant',
  standalone: true,
  imports: [ButtonComponent, BadgeComponent, AvatarComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="rm-ai-view">

      <div class="rm-ai-hero">
        <div class="rm-ai-hero__left">
          <div class="rm-ai-spark-icon">
            <i class="pi pi-sparkles" aria-hidden="true"></i>
          </div>
          <div>
            <div class="rm-ai-title-row">
              <h2 class="rm-ai-hero__title">RedmindMe Copilot</h2>
              <span class="ai-pill">MODO GENERATIVO</span>
            </div>
            <p class="rm-ai-hero__subtitle">
              Inteligência linear para decomposição de objetivos, priorização executiva e refinamento de sprints.
            </p>
          </div>
        </div>

        <div class="rm-ai-hero__right">
          <rm-button
            variant="subtle"
            size="sm"
            icon="pi-trash"
            (clicked)="aiService.clearChat()"
            title="Limpar histórico"
          >
            Limpar Conversa
          </rm-button>
        </div>
      </div>
      <div class="rm-presets-scroll">
        @for (preset of presets; track preset.id) {
          <button
            type="button"
            class="rm-preset-chip"
            (click)="applyPreset(preset)"
          >
            <i [class]="'pi ' + preset.icon + ' text-ai'" aria-hidden="true"></i>
            <span class="rm-preset-chip__title">{{ preset.title }}</span>
          </button>
        }
      </div>
      <div class="rm-chat-box" #scrollContainer>
        @for (msg of aiService.messages(); track msg.id) {
          <div
            class="rm-chat-message"
            [class.rm-chat-message--user]="msg.role === 'user'"
            [class.rm-chat-message--assistant]="msg.role === 'assistant'"
          >
            <div class="rm-chat-avatar">
              @if (msg.role === 'user') {
                <rm-avatar
                  [src]="userService.currentUser().avatarUrl"
                  [name]="userService.currentUser().name"
                  size="sm"
                  alt="Usuário"
                ></rm-avatar>
              } @else {
                <div class="rm-ai-avatar-mark">
                  <i class="pi pi-sparkles" aria-hidden="true"></i>
                </div>
              }
            </div>

            <div class="rm-chat-bubble">
              <div class="rm-chat-bubble__meta">
                <span class="rm-chat-bubble__author">
                  {{ msg.role === 'user' ? userService.currentUser().name : 'RedmindMe IA' }}
                </span>
                <span class="rm-chat-bubble__time">{{ formatTime(msg.timestamp) }}</span>
              </div>

              <div class="rm-chat-bubble__text" [innerHTML]="formatContentSafe(msg.content)"></div>
              @if (msg.suggestedTasks && msg.suggestedTasks.length > 0) {
                <div class="rm-ai-suggested-tasks">
                  <div class="rm-suggested-header">
                    <i class="pi pi-bolt text-ai" aria-hidden="true"></i>
                    <span>Tarefas Acionáveis Geradas:</span>
                  </div>

                  <div class="rm-suggested-cards">
                    @for (task of msg.suggestedTasks; track task.title) {
                      <div class="rm-suggested-task-card">
                        <div class="rm-suggested-task-info">
                          <span class="rm-suggested-task-title">{{ task.title }}</span>
                          <div class="rm-suggested-task-tags">
                            <rm-badge [type]="task.priority" [label]="task.priority.toUpperCase()"></rm-badge>
                            @if (task.estimatedMinutes) {
                              <span class="rm-suggested-min">{{ task.estimatedMinutes }} min</span>
                            }
                          </div>
                        </div>
                      </div>
                    }
                  </div>

                  <div class="rm-suggested-action">
                    <rm-button
                      variant="ai"
                      size="sm"
                      icon="pi-check-circle"
                      (clicked)="aiService.convertSuggestedTasksToLive(msg.suggestedTasks)"
                    >
                      Adicionar Todas ao Painel de Tarefas
                    </rm-button>
                  </div>
                </div>
              }
            </div>
          </div>
        }
        @if (aiService.streamingContent(); as streamed) {
          <div class="rm-chat-message rm-chat-message--assistant">
            <div class="rm-chat-avatar">
              <div class="rm-ai-avatar-mark ai-pulse">
                <i class="pi pi-sparkles" aria-hidden="true"></i>
              </div>
            </div>

            <div class="rm-chat-bubble">
              <div class="rm-chat-bubble__meta">
                <span class="rm-chat-bubble__author">RedmindMe IA</span>
                <span class="rm-chat-bubble__time">Digitando...</span>
              </div>

              <div class="rm-chat-bubble__text" [innerHTML]="formatContentSafe(streamed)"></div>
              <span class="rm-typewriter-cursor"></span>
            </div>
          </div>
        }
        @if (aiService.isTyping()) {
          <div class="rm-chat-message rm-chat-message--assistant">
            <div class="rm-chat-avatar">
              <div class="rm-ai-avatar-mark ai-pulse">
                <i class="pi pi-sparkles" aria-hidden="true"></i>
              </div>
            </div>

            <div class="rm-chat-bubble rm-chat-bubble--thinking">
              <div class="rm-typing-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
              <span class="rm-thinking-label">RedmindMe IA está analisando o contexto...</span>
            </div>
          </div>
        }
      </div>
      <div class="rm-chat-input-bar glass-panel">
        <textarea
          #inputArea
          class="rm-chat-textarea"
          placeholder="Peça para planejar um sprint, priorizar tarefas ou expandir um conceito... (Pressione Enter para enviar)"
          [value]="messageInput()"
          (input)="messageInput.set($any($event.target).value)"
          (keydown.enter)="onEnterPressed($event)"
          rows="2"
        ></textarea>

        <div class="rm-chat-input-controls">
          <span class="rm-chat-quota-hint">
            @if (userService.isPro()) {
              <span class="text-pro"><i class="pi pi-crown"></i> Acesso Pro Ilimitado</span>
            } @else {
              <span>{{ userService.aiRemaining() }} consultas restantes hoje</span>
            }
          </span>

          <rm-button
            variant="ai"
            size="md"
            icon="pi-send"
            [disabled]="!messageInput().trim() || aiService.isTyping() || aiService.isStreaming()"
            (clicked)="send()"
          >
            Enviar
          </rm-button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .rm-ai-view {
      display: flex;
      flex-direction: column;
      gap: 16px;
      height: calc(100vh - 120px);
      max-height: 860px;
    }

    .rm-ai-hero {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      padding-bottom: 8px;
    }

    .rm-ai-hero__left {
      display: flex;
      align-items: center;
      gap: 14px;
    }

    .rm-ai-spark-icon {
      width: 44px;
      height: 44px;
      border-radius: var(--rm-radius-lg);
      background: var(--rm-ai-gradient);
      color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      box-shadow: 0 0 24px rgba(139, 92, 246, 0.4);
      flex-shrink: 0;
    }

    .rm-ai-title-row {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .rm-ai-hero__title {
      font-size: 20px;
      font-weight: 700;
      color: var(--rm-text-primary);
      letter-spacing: -0.02em;
    }

    .rm-ai-hero__subtitle {
      font-size: 13px;
      color: var(--rm-text-secondary);
      margin-top: 2px;
    }
    .rm-presets-scroll {
      display: flex;
      gap: 10px;
      overflow-x: auto;
      padding-bottom: 4px;

      &::-webkit-scrollbar {
        height: 4px;
      }
    }

    .rm-preset-chip {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 14px;
      background: var(--rm-bg-surface);
      border: 1px solid var(--rm-border-base);
      border-radius: var(--rm-radius-full);
      color: var(--rm-text-primary);
      font-size: 12.5px;
      font-weight: 500;
      white-space: nowrap;
      transition: all var(--rm-transition-fast);

      &:hover {
        border-color: rgba(139, 92, 246, 0.4);
        background: var(--rm-bg-hover);
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
      }
    }

    .text-ai { color: #c084fc; }
    .text-pro { color: #f59e0b; }
    .rm-chat-box {
      flex: 1;
      overflow-y: auto;
      background: var(--rm-bg-card);
      border: 1px solid var(--rm-border-base);
      border-radius: var(--rm-radius-xl);
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 18px;
    }

    .rm-chat-message {
      display: flex;
      gap: 12px;
      max-width: 85%;
    }

    .rm-chat-message--user {
      align-self: flex-end;
      flex-direction: row-reverse;

      .rm-chat-bubble {
        background: var(--rm-accent);
        color: #ffffff;
        border-color: transparent;
      }

      .rm-chat-bubble__author,
      .rm-chat-bubble__time {
        color: rgba(255, 255, 255, 0.7);
      }
    }

    .rm-chat-message--assistant {
      align-self: flex-start;

      .rm-chat-bubble {
        background: var(--rm-bg-surface);
        border: 1px solid var(--rm-border-base);
      }
    }

    .rm-chat-avatar {
      flex-shrink: 0;
    }

    .rm-avatar-img {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      object-fit: cover;
    }

    .rm-ai-avatar-mark {
      width: 32px;
      height: 32px;
      border-radius: var(--rm-radius-md);
      background: var(--rm-ai-gradient);
      color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 13px;
    }

    .rm-chat-bubble {
      padding: 14px 18px;
      border-radius: var(--rm-radius-lg);
      display: flex;
      flex-direction: column;
      gap: 8px;
      box-shadow: var(--rm-shadow-card);
    }

    .rm-chat-bubble__meta {
      display: flex;
      align-items: baseline;
      gap: 8px;
    }

    .rm-chat-bubble__author {
      font-size: 12px;
      font-weight: 600;
      color: var(--rm-text-primary);
    }

    .rm-chat-bubble__time {
      font-size: 10.5px;
      color: var(--rm-text-muted);
    }

    .rm-chat-bubble__text {
      font-size: 13.5px;
      line-height: 1.55;
      color: inherit;
      white-space: pre-wrap;
    }

    .rm-typewriter-cursor {
      display: inline-block;
      width: 2px;
      height: 14px;
      background: #c084fc;
      margin-left: 2px;
      animation: blink 0.8s infinite;
      vertical-align: middle;
    }

    @keyframes blink {
      0%, 100% { opacity: 1; }
      50% { opacity: 0; }
    }
    .rm-chat-bubble--thinking {
      display: flex;
      flex-direction: row;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
    }

    .rm-typing-dots {
      display: flex;
      gap: 4px;

      span {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: #c084fc;
        animation: typingDot 1.4s infinite ease-in-out both;

        &:nth-child(1) { animation-delay: -0.32s; }
        &:nth-child(2) { animation-delay: -0.16s; }
      }
    }

    @keyframes typingDot {
      0%, 80%, 100% { transform: scale(0); opacity: 0.4; }
      40% { transform: scale(1); opacity: 1; }
    }

    .rm-thinking-label {
      font-size: 12px;
      color: var(--rm-text-secondary);
    }
    .rm-ai-suggested-tasks {
      margin-top: 8px;
      padding: 12px;
      background: var(--rm-bg-canvas);
      border: 1px solid rgba(139, 92, 246, 0.25);
      border-radius: var(--rm-radius-md);
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .rm-suggested-header {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      font-weight: 600;
      color: #c084fc;
    }

    .rm-suggested-cards {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .rm-suggested-task-card {
      padding: 8px 10px;
      background: var(--rm-bg-surface);
      border: 1px solid var(--rm-border-base);
      border-radius: var(--rm-radius-sm);
    }

    .rm-suggested-task-info {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
    }

    .rm-suggested-task-title {
      font-size: 12.5px;
      font-weight: 500;
      color: var(--rm-text-primary);
    }

    .rm-suggested-task-tags {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .rm-suggested-min {
      font-size: 11px;
      color: var(--rm-text-muted);
    }

    .rm-suggested-action {
      display: flex;
      justify-content: flex-end;
      padding-top: 4px;
    }
    .rm-chat-input-bar {
      border-radius: var(--rm-radius-lg);
      padding: 12px 16px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      border: 1px solid var(--rm-border-base);
    }

    .rm-chat-textarea {
      width: 100%;
      resize: none;
      font-size: 13.5px;
      line-height: 1.45;
      color: var(--rm-text-primary);
      outline: none;

      &::placeholder {
        color: var(--rm-text-muted);
      }
    }

    .rm-chat-input-controls {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-top: 6px;
      border-top: 1px solid var(--rm-border-subtle);
    }

    .rm-chat-quota-hint {
      font-size: 11.5px;
      color: var(--rm-text-muted);
    }
  `]
})
export class AiAssistantComponent {
  readonly aiService = inject(AiService);
  readonly userService = inject(UserService);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly destroyRef = inject(DestroyRef);

  @ViewChild('scrollContainer') private scrollContainer?: ElementRef<HTMLDivElement>;

  readonly presets = AI_PROMPT_PRESETS;
  readonly messageInput = signal<string>('');

  private scrollTimeout: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    effect(() => {

      this.aiService.messages();
      this.aiService.streamingContent();
      if (this.scrollTimeout) {
        clearTimeout(this.scrollTimeout);
      }
      this.scrollTimeout = setTimeout(() => this.scrollToBottom(), 50);
    });

    this.destroyRef.onDestroy(() => {
      if (this.scrollTimeout) {
        clearTimeout(this.scrollTimeout);
        this.scrollTimeout = null;
      }
    });
  }

  applyPreset(preset: AiPromptPreset): void {
    this.messageInput.set(preset.promptTemplate);
  }

  onEnterPressed(event: Event): void {
    const keyboardEvent = event as KeyboardEvent;
    if (!keyboardEvent.shiftKey) {
      keyboardEvent.preventDefault();
      this.send();
    }
  }

  async send(): Promise<void> {
    const text = this.messageInput().trim();
    if (!text) return;

    this.messageInput.set('');
    await this.aiService.sendMessage(text);
  }

  formatTime(isoString: string): string {
    if (!isoString || typeof isoString !== 'string') return '';
    try {
      const date = new Date(isoString);
      if (isNaN(date.getTime())) return '';
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  }

  private escapeHtml(value: string): string {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  formatContentSafe(raw: string | null | undefined): SafeHtml {
    if (!raw) return '';
    const escaped = this.escapeHtml(raw);
    const withBold = escaped.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    const withBreaks = withBold.replace(/\n/g, '<br />');
    const sanitized = this.sanitizer.sanitize(SecurityContext.HTML, withBreaks) ?? '';
    return this.sanitizer.bypassSecurityTrustHtml(sanitized);
  }

  formatContent(raw: string): SafeHtml {
    return this.formatContentSafe(raw);
  }

  private scrollToBottom(): void {
    if (this.scrollContainer) {
      this.scrollContainer.nativeElement.scrollTop =
        this.scrollContainer.nativeElement.scrollHeight;
    }
  }
}
