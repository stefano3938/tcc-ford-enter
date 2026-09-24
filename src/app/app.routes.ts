import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'home'
  },
  {
    path: 'home',
    loadComponent: () =>
      import('./pages/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'demonstracao',
    loadComponent: () =>
      import('./pages/demonstracao/demonstracao.component').then(m => m.DemonstracaoComponent)
  },
  {
    path: 'recursos',
    loadComponent: () =>
      import('./pages/recursos/recursos.component').then(m => m.RecursosComponent)
  },
  {
    path: 'como-funciona',
    loadComponent: () =>
      import('./pages/como-funciona/como-funciona.component').then(m => m.ComoFuncionaComponent)
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/auth/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  {
    path: 'ai-assistant',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/ai-assistant/ai-assistant.component').then(m => m.AiAssistantComponent)
  },
  {
    path: 'planos',
    loadComponent: () =>
      import('./pages/paywall/paywall.component').then(m => m.PaywallComponent)
  },
  {
    // Old path kept working so shared links and bookmarks don't break.
    path: 'pricing',
    redirectTo: 'planos'
  },
  {
    path: 'privacidade',
    data: { tab: 'privacidade' },
    loadComponent: () =>
      import('./pages/legal/legal.component').then(m => m.LegalComponent)
  },
  {
    // Its own route now: "Termos" links used to land on the privacy tab
    path: 'termos',
    data: { tab: 'termos' },
    loadComponent: () =>
      import('./pages/legal/legal.component').then(m => m.LegalComponent)
  },
  {
    path: '**',
    redirectTo: 'home'
  }
];
