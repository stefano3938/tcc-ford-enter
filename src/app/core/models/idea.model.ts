export type IdeaCategory = 'product' | 'research' | 'workflow' | 'creative' | 'personal';

export interface Idea {
  id: string;
  title: string;
  summary: string;
  category: IdeaCategory;
  tags: string[];
  createdAt: string;
  isExpandedByAi: boolean;
  /** Set once the AI steps were turned into tasks, so they can't be added twice. */
  convertedToTasks?: boolean;
  aiSuggestedBreakdown?: {
    overview: string;
    actionableSteps: string[];
    potentialRisks: string[];
    suggestedTags: string[];
  };
}
