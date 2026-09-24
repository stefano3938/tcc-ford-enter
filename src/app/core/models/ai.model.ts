export type MessageRole = 'user' | 'assistant' | 'system';

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: string;
  isStreaming?: boolean;
  suggestedTasks?: Array<{
    title: string;
    priority: 'urgent' | 'high' | 'medium' | 'low';
    tags: string[];
    estimatedMinutes?: number;
  }>;
}

export interface AiPromptPreset {
  id: string;
  icon: string;
  title: string;
  description: string;
  promptTemplate: string;
}
