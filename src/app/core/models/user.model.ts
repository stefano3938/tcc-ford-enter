export type UserPlan = 'free' | 'pro';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  plan: UserPlan;
  planExpiryDate?: string;
  quotas: {
    tasksMax: number;
    ideasMax: number;
    aiQueriesPerDay: number;
    aiQueriesUsedToday: number;
    lastResetDate?: string;
  };
}

export interface PricingPlan {
  id: 'free' | 'pro' | 'team';
  name: string;
  description: string;
  priceMonthly: number;
  priceYearly: number;
  isPopular?: boolean;
  features: string[];
  ctaLabel: string;
}
