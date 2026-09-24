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
      import('./features/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  {
    path: 'ai-assistant',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/ai-assistant/ai-assistant.component').then(m => m.AiAssistantComponent)
  },
  {
    path: 'planos',
    loadComponent: () =>
      import('./features/paywall/paywall.component').then(m => m.PaywallComponent)
  },
  {
    // Old path kept working so shared links and bookmarks don't break.
    path: 'pricing',
    redirectTo: 'planos'
  },
  {
    path: 'privacidade',
    loadComponent: () =>
      import('./features/legal/legal.component').then(m => m.LegalComponent)
  },
  {
    path: 'termos',
    redirectTo: 'privacidade'
  },
  {
    path: '**',
    redirectTo: 'home'
  }
];
