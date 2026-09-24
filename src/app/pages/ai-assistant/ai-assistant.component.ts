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
import { I18nService } from '../../core/services/i18n.service';
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
