export type IdeaCategory = 'product' | 'research' | 'workflow' | 'creative' | 'personal';

export interface Idea {
  id: string;
  title: string;
  summary: string;
  category: IdeaCategory;
  tags: string[];
  createdAt: string;
  isExpandedByAi: boolean;
  aiSuggestedBreakdown?: {
    overview: string;
    actionableSteps: string[];
    potentialRisks: string[];
    suggestedTags: string[];
  };
}
