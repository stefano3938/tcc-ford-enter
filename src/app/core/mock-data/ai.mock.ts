import { AiPromptPreset, ChatMessage } from '../models/ai.model';

/** Preset chips. title/description/promptTemplate are i18n keys, translated when rendered. */
export const AI_PROMPT_PRESETS: AiPromptPreset[] = [
  {
    id: 'breakdown',
    icon: 'layers',
    title: 'ai.preset.breakdown.title',
    description: 'ai.preset.breakdown.desc',
    promptTemplate: 'ai.preset.breakdown.prompt'
  },
  {
    id: 'prioritize',
    icon: 'zap',
    title: 'ai.preset.prioritize.title',
    description: 'ai.preset.prioritize.desc',
    promptTemplate: 'ai.preset.prioritize.prompt'
  },
  {
    id: 'creative-expand',
    icon: 'sparkles',
    title: 'ai.preset.expand.title',
    description: 'ai.preset.expand.desc',
    promptTemplate: 'ai.preset.expand.prompt'
  },
  {
    id: 'summarize',
    icon: 'file-text',
    title: 'ai.preset.summarize.title',
    description: 'ai.preset.summarize.desc',
    promptTemplate: 'ai.preset.summarize.prompt'
  }
];

/** The greeting's text comes from i18n ('ai.welcome'); this id marks it. */
export const AI_WELCOME_MESSAGE_ID = 'msg-001';

export const INITIAL_AI_CHAT_MESSAGES: ChatMessage[] = [
  {
    id: AI_WELCOME_MESSAGE_ID,
    role: 'assistant',
    content: '',
    timestamp: new Date().toISOString(),
    isStreaming: false
  }
];
