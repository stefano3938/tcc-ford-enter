import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  ViewChild,
  computed,
  effect,
  inject,
  signal
} from '@angular/core';
import { SecurityContext } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import type { SafeHtml } from '@angular/platform-browser';
import { AiService } from '../../core/services/ai.service';
import { UserService } from '../../core/services/user.service';
import { I18nService } from '../../core/services/i18n.service';
import { AI_PROMPT_PRESETS, AI_WELCOME_MESSAGE_ID } from '../../core/mock-data/ai.mock';
import { AiPromptPreset, ChatMessage } from '../../core/models/ai.model';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { BadgeComponent } from '../../shared/components/badge/badge.component';
import { IconComponent, IconName } from '../../shared/components/icon/icon.component';

@Component({
  selector: 'rm-ai-assistant',
  standalone: true,
  imports: [ButtonComponent, BadgeComponent, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './ai-assistant.component.html',
  styleUrl: './ai-assistant.component.css'
})
export class AiAssistantComponent {
  readonly i18n = inject(I18nService);
  readonly aiService = inject(AiService);
  readonly userService = inject(UserService);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly destroyRef = inject(DestroyRef);

  @ViewChild('scrollContainer') private scrollContainer?: ElementRef<HTMLDivElement>;
  @ViewChild('inputArea') private inputArea?: ElementRef<HTMLTextAreaElement>;

  readonly presets = AI_PROMPT_PRESETS;
  readonly welcomeId = AI_WELCOME_MESSAGE_ID;
  readonly messageInput = signal<string>('');

  readonly isBusy = computed(() => this.aiService.isTyping() || this.aiService.isStreaming());
  readonly hasConversation = computed(() => this.aiService.messages().some(m => m.role === 'user'));

  readonly quota = computed(() => {
    const { aiQueriesPerDay, aiQueriesUsedToday } = this.userService.currentUser().quotas;
    const left = this.userService.aiRemaining();
    return { left, pct: aiQueriesPerDay ? Math.min(100, (left / aiQueriesPerDay) * 100) : 0 };
  });

  private scrollTimeout: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    effect(() => {
      this.aiService.messages();
      this.aiService.streamingContent();
      this.aiService.isTyping();
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

  presetIcon(preset: AiPromptPreset): IconName {
    return preset.icon as IconName;
  }

  applyPreset(preset: AiPromptPreset): void {
    this.messageInput.set(this.i18n.t(preset.promptTemplate));
    const field = this.inputArea?.nativeElement;
    if (field) {
      field.focus();
      queueMicrotask(() => field.setSelectionRange(field.value.length, field.value.length));
    }
  }

  onEnterPressed(event: Event): void {
    const keyboardEvent = event as KeyboardEvent;
    if (!keyboardEvent.shiftKey && !keyboardEvent.isComposing) {
      keyboardEvent.preventDefault();
      this.send();
    }
  }

  async send(): Promise<void> {
    const text = this.messageInput().trim();
    if (!text || this.isBusy()) return;

    this.messageInput.set('');
    await this.aiService.sendMessage(text);
  }

  stop(): void {
    this.aiService.cancelStreaming();
  }

  totalMinutes(tasks: NonNullable<ChatMessage['suggestedTasks']>): string {
    const minutes = tasks.reduce((sum, t) => sum + (t.estimatedMinutes ?? 0), 0);
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (!h) return `${m}min`;
    return m ? `${h}h ${m}min` : `${h}h`;
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

  private scrollToBottom(): void {
    const el = this.scrollContainer?.nativeElement;
    if (el) {
      el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
    }
  }
}
