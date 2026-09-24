import { Injectable, computed, inject, signal } from '@angular/core';
import { StorageService } from './storage.service';
import { ToastService } from './toast.service';
import { PricingPlan, UserProfile } from '../models/user.model';

const FREE_TASKS_MAX = 8;
const FREE_IDEAS_MAX = 4;
const FREE_AI_QUERIES_PER_DAY = 3;
const UNLIMITED = 9999;

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly storage = inject(StorageService);
  private readonly toast = inject(ToastService);
  private readonly USER_KEY = 'redmindme_user_profile';
  private readonly TASKS_KEY = 'redmindme_tasks_list';
  private readonly IDEAS_KEY = 'redmindme_ideas_list';

  readonly currentUser = signal<UserProfile>(this.loadUser());
  readonly tasksUsed = signal<number>(this.loadTasksCount());
  readonly ideasUsed = signal<number>(this.loadIdeasCount());
  readonly isPaywallOpen = signal<boolean>(false);
  readonly paywallTriggerReason = signal<string>('Faça upgrade para ter acesso ilimitado.');
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

  readonly pricingPlans: PricingPlan[] = [
    {
      id: 'free',
      name: 'Starter',
      description: 'Ideal para experimentação e organização pessoal básica.',
      priceMonthly: 0,
      priceYearly: 0,
      features: [
        `Até ${FREE_TASKS_MAX} tarefas ativas`,
        `Até ${FREE_IDEAS_MAX} ideias salvas`,
        `${FREE_AI_QUERIES_PER_DAY} consultas de IA generativa por dia`,
        'Filtros básicos por status e prioridade',
        'Armazenamento local seguro'
      ],
      ctaLabel: 'Plano Atual'
    },
    {
      id: 'pro',
      name: 'RemindMe Pro',
      description: 'Poder absoluto de IA para profissionais focados em máxima produtividade linear.',
      priceMonthly: 29,
      priceYearly: 24,
      isPopular: true,
      features: [
        'Tarefas & Ideias Ilimitadas',
        'IA Generativa Ilimitada com modelos de alta velocidade',
        'Decomposição instantânea de ideias em tarefas acionáveis',
        'Priorização automática por inteligência contextual',
        'Visualização em Kanban & Lista avançada',
        'Exportação em Markdown & JSON',
        'Suporte prioritário e novidades em primeira mão'
      ],
      ctaLabel: 'Desbloquear Acesso Pro'
    },
    {
      id: 'team',
      name: 'Team Studio',
      description: 'Para squads e times que pensam e executam juntos com IA.',
      priceMonthly: 69,
      priceYearly: 55,
      features: [
        'Tudo incluído no Pro',
        'Workspaces colaborativos compartilhados',
        'Atribuição inteligente de tarefas entre membros',
        'Relatórios executivos semanais de sprints',
        'API de integração com Slack e GitHub'
      ],
      ctaLabel: 'Falar com Especialista'
    }
  ];

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

  openPaywall(reason: string): void {
    this.paywallTriggerReason.set(reason);
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
    this.toast.success('Parabéns! Você agora é RemindMe Pro', 'Todos os limites de tarefas, ideias e IA foram removidos.');
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
    this.toast.info('Plano alterado para Starter', 'Limites padrões reaplicados.');
  }

  incrementAiUsage(): boolean {
    this.maybeResetDailyQuota();
    if (this.isPro()) return true;

    const current = this.currentUser();
    if (current.quotas.aiQueriesUsedToday >= current.quotas.aiQueriesPerDay) {
      this.openPaywall(`Você atingiu o limite diário de ${FREE_AI_QUERIES_PER_DAY} consultas de IA no plano gratuito.`);
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

  updateProfile(data: { name: string; email: string; avatarUrl?: string }): void {
    this.currentUser.update(u => ({
      ...u,
      name: data.name.trim(),
      email: data.email.trim().toLowerCase(),
      avatarUrl: data.avatarUrl ?? u.avatarUrl
    }));
    this.saveUser();
    this.toast.success('Perfil atualizado', `Bem-vindo, ${data.name.trim()}!`);
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
