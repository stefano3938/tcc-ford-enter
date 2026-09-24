export type TaskStatus = 'todo' | 'in-progress' | 'done';
export type TaskPriority = 'urgent' | 'high' | 'medium' | 'low';

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  tags: string[];
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
  isAiGenerated?: boolean;
  estimatedMinutes?: number;
}

export interface TaskFilterOptions {
  searchQuery?: string;
  status?: TaskStatus | 'all';
  priority?: TaskPriority | 'all';
  tag?: string | 'all';
  isAiGeneratedOnly?: boolean;
}
