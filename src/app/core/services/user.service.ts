import { Injectable, computed, inject, signal } from '@angular/core';
import { StorageService } from './storage.service';
import { ToastService } from './toast.service';
import { I18nService } from './i18n.service';
import { PricingPlan, UserProfile } from '../models/user.model';

export const FREE_TASKS_MAX = 8;
export const FREE_IDEAS_MAX = 4;
export const FREE_AI_QUERIES_PER_DAY = 3;
const UNLIMITED = 9999;

export const PLAN_PRICES = {
  pro: { monthly: 29, yearly: 24 },
  team: { monthly: 69, yearly: 55 }
} as const;

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly storage = inject(StorageService);
  private readonly toast = inject(ToastService);
  private readonly i18n = inject(I18nService);
  private readonly USER_KEY = 'redmindme_user_profile';
  private readonly TASKS_KEY = 'redmindme_tasks_list';
  private readonly IDEAS_KEY = 'redmindme_ideas_list';

  readonly currentUser = signal<UserProfile>(this.loadUser());
  readonly tasksUsed = signal<number>(this.loadTasksCount());
  readonly ideasUsed = signal<number>(this.loadIdeasCount());
  readonly isPaywallOpen = signal<boolean>(false);
  readonly paywallTriggerReason = signal<string>('');
  readonly isPro = computed(() => this.currentUser().plan === 'pro');

  readonly tasksRemaining = computed(() => {
    if (this.isPro()) return UNLIMITED;
    return Math.max(0, this.currentUser().quotas.tasksMax - this.tasksUsed());
  });

  readonly ideasRemaining = computed(() => {
    if (this.isPro()) return UNLIMITED;
    return Math.max(0, this.currentUser().quotas.ideasMax - this.ideasUsed());
  });

  readonly aiRemaining = computed(() => {
    if (this.isPro()) return UNLIMITED;
    const { aiQueriesPerDay, aiQueriesUsedToday } = this.currentUser().quotas;
    return Math.max(0, aiQueriesPerDay - aiQueriesUsedToday);
  });

  /** Plans are built from translations, so they follow the selected language. */
  readonly pricingPlans = computed<PricingPlan[]>(() => {
    const t = (key: string, params?: Record<string, string | number>) => this.i18n.t(key, params);
    return [
      {
        id: 'free',
        name: 'Starter',
        description: t('plan.free.desc'),
        priceMonthly: 0,
        priceYearly: 0,
        features: [
          t('plan.free.f1', { count: FREE_TASKS_MAX }),
          t('plan.free.f2', { count: FREE_IDEAS_MAX }),
          t('plan.free.f3', { count: FREE_AI_QUERIES_PER_DAY }),
          t('plan.free.f4'),
          t('plan.free.f5')
        ],
        ctaLabel: t('plan.free.cta')
      },
      {
        id: 'pro',
        name: 'RemindMe Pro',
        description: t('plan.pro.desc'),
        priceMonthly: PLAN_PRICES.pro.monthly,
        priceYearly: PLAN_PRICES.pro.yearly,
        isPopular: true,
        features: [t('plan.pro.f1'), t('plan.pro.f2'), t('plan.pro.f3'), t('plan.pro.f4'), t('plan.pro.f5')],
        ctaLabel: t('plan.pro.cta')
      },
      {
        id: 'team',
        name: 'Team Studio',
        description: t('plan.team.desc'),
        priceMonthly: PLAN_PRICES.team.monthly,
        priceYearly: PLAN_PRICES.team.yearly,
        features: [t('plan.team.f1'), t('plan.team.f2'), t('plan.team.f3'), t('plan.team.f4')],
        ctaLabel: t('plan.team.cta')
      }
    ];
  });

  constructor() {
    this.maybeResetDailyQuota();
  }

  private maybeResetDailyQuota(): void {
    const today = new Date().toDateString();
    const current = this.currentUser();
    if (current.quotas.lastResetDate !== today) {
      this.currentUser.update(u => ({
        ...u,
        quotas: {
          ...u.quotas,
          aiQueriesUsedToday: 0,
          lastResetDate: today
        }
      }));
      this.saveUser();
    }
  }

  setTasksCount(count: number): void {
    this.tasksUsed.set(count);
  }

  setIdeasCount(count: number): void {
    this.ideasUsed.set(count);
  }

  /** @param reason already-translated sentence explaining why the paywall opened */
  openPaywall(reason?: string): void {
    this.paywallTriggerReason.set(reason ?? this.i18n.t('paywall.reason.default'));
    this.isPaywallOpen.set(true);
  }

  closePaywall(): void {
    this.isPaywallOpen.set(false);
  }

  upgradeToPro(): void {
    this.currentUser.update(user => ({
      ...user,
      plan: 'pro',
      quotas: {
        ...user.quotas,
        tasksMax: UNLIMITED,
        ideasMax: UNLIMITED,
        aiQueriesPerDay: UNLIMITED
      }
    }));
    this.saveUser();
    this.closePaywall();
    this.toast.success(this.i18n.t('toast.upgraded'), this.i18n.t('toast.upgraded.body'));
  }

  downgradeToFree(): void {
    this.currentUser.update(user => ({
      ...user,
      plan: 'free',
      quotas: {
        ...user.quotas,
        tasksMax: FREE_TASKS_MAX,
        ideasMax: FREE_IDEAS_MAX,
        aiQueriesPerDay: FREE_AI_QUERIES_PER_DAY
      }
    }));
    this.saveUser();
    this.toast.info(this.i18n.t('toast.downgraded'), this.i18n.t('toast.downgraded.body'));
  }

  incrementAiUsage(): boolean {
    this.maybeResetDailyQuota();
    if (this.isPro()) return true;

    const current = this.currentUser();
    if (current.quotas.aiQueriesUsedToday >= current.quotas.aiQueriesPerDay) {
      this.openPaywall(this.i18n.t('paywall.reason.ai', { count: FREE_AI_QUERIES_PER_DAY }));
      return false;
    }

    this.currentUser.update(u => ({
      ...u,
      quotas: {
        ...u.quotas,
        aiQueriesUsedToday: u.quotas.aiQueriesUsedToday + 1
      }
    }));
    this.saveUser();
    return true;
  }

  /** Gives a query back when the user cancels before getting an answer. */
  refundAiUsage(): void {
    if (this.isPro()) return;
    this.currentUser.update(u => ({
      ...u,
      quotas: {
        ...u.quotas,
        aiQueriesUsedToday: Math.max(0, u.quotas.aiQueriesUsedToday - 1)
      }
    }));
    this.saveUser();
  }

  private loadTasksCount(): number {
    try {
      const tasks = this.storage.getItem<unknown[]>(this.TASKS_KEY, []);
      return Array.isArray(tasks) ? tasks.length : 0;
    } catch {
      return 0;
    }
  }

  private loadIdeasCount(): number {
    try {
      const ideas = this.storage.getItem<unknown[]>(this.IDEAS_KEY, []);
      return Array.isArray(ideas) ? ideas.length : 0;
    } catch {
      return 0;
    }
  }

  createProfile(data: { name: string; email: string; }): void {
    const name = data.name.trim();
    const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=6366f1&color=fff&size=120`;
    this.currentUser.update(u => ({
      ...u,
      name,
      email: data.email.trim().toLowerCase(),
      avatarUrl,
      plan: 'free',
      quotas: {
        ...u.quotas,
        tasksMax: FREE_TASKS_MAX,
        ideasMax: FREE_IDEAS_MAX,
        aiQueriesPerDay: FREE_AI_QUERIES_PER_DAY
      }
    }));
    this.saveUser();
  }

  private loadUser(): UserProfile {
    const defaultProfile: UserProfile = {
      id: 'usr-001',
      name: 'Visitante',
      email: 'visitante@remindme.com',
      avatarUrl: '',
      plan: 'free',
      quotas: {
        tasksMax: FREE_TASKS_MAX,
        ideasMax: FREE_IDEAS_MAX,
        aiQueriesPerDay: FREE_AI_QUERIES_PER_DAY,
        aiQueriesUsedToday: 0,
        lastResetDate: new Date().toDateString()
      }
    };
    const stored = this.storage.getItem<UserProfile>(this.USER_KEY, defaultProfile);

    if (!stored.quotas.lastResetDate) {
      stored.quotas.lastResetDate = new Date().toDateString();
      this.storage.setItem(this.USER_KEY, stored);
    }

    const today = new Date().toDateString();
    if (stored.quotas.lastResetDate !== today) {
      stored.quotas.aiQueriesUsedToday = 0;
      stored.quotas.lastResetDate = today;
      this.storage.setItem(this.USER_KEY, stored);
    }
    return stored;
  }

  private saveUser(): void {
    this.storage.setItem(this.USER_KEY, this.currentUser());
  }
}
