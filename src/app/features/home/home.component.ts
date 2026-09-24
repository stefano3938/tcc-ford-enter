import { ChangeDetectionStrategy, Component, ElementRef, ViewChild, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ThemeService } from '../../core/services/theme.service';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { BadgeComponent } from '../../shared/components/badge/badge.component';

@Component({
  selector: 'rm-home',
  standalone: true,
  imports: [RouterLink, IconComponent, ButtonComponent, BadgeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="rm-home-container">
      <header class="rm-home-nav glass-panel">
        <div class="rm-home-nav__inner">
          <div class="rm-home-brand">
            <div class="rm-home-logo-mark">
              <rm-icon name="check-square" [size]="18"></rm-icon>
            </div>
            <span class="rm-home-logo-title">Redmind<span class="text-accent">Me</span></span>
          </div>
          <nav class="rm-home-links">
            <a href="#recursos" class="rm-home-link">Recursos</a>
            <a href="#como-funciona" class="rm-home-link">Como funciona</a>
            <a routerLink="/pricing" class="rm-home-link">Planos</a>
          </nav>
          <div class="rm-home-actions">
            <button type="button" class="rm-home-theme-btn" (click)="themeService.toggleTheme()" [attr.aria-label]="themeService.theme() === 'dark' ? 'Ativar modo claro' : 'Ativar modo escuro'" [title]="themeService.theme() === 'dark' ? 'Modo claro' : 'Modo escuro'">
              @if (themeService.theme() === 'dark') {
                <rm-icon name="sun" [size]="16"></rm-icon>
              } @else {
                <rm-icon name="moon" [size]="16"></rm-icon>
              }
            </button>
            @if (authService.isAuthenticated()) {
              <rm-button variant="subtle" size="sm" (clicked)="goToApp()">Ir para o Painel</rm-button>
            } @else {
              <rm-button variant="subtle" size="sm" (clicked)="goToLogin()">Entrar</rm-button>
            }
            <rm-button variant="primary" size="sm" icon="plus" (clicked)="onStartNow()">Começar Agora</rm-button>
            <button type="button" class="rm-home-menu-btn" (click)="isMobileMenuOpen.set(!isMobileMenuOpen())" aria-label="Abrir menu">
              <rm-icon [name]="isMobileMenuOpen() ? 'x' : 'menu'" [size]="18"></rm-icon>
            </button>
          </div>
        </div>
        @if (isMobileMenuOpen()) {
          <div class="rm-home-mobile-menu glass-panel">
            <a href="#recursos" class="rm-home-mobile-link" (click)="isMobileMenuOpen.set(false)">Recursos</a>
            <a href="#como-funciona" class="rm-home-mobile-link" (click)="isMobileMenuOpen.set(false)">Como funciona</a>
            <a routerLink="/pricing" class="rm-home-mobile-link" (click)="isMobileMenuOpen.set(false)">Planos</a>
            <div class="rm-home-mobile-actions">
              @if (authService.isAuthenticated()) {
                <rm-button variant="primary" size="md" (clicked)="goToApp(); isMobileMenuOpen.set(false)">Ir para o Painel</rm-button>
              } @else {
                <rm-button variant="subtle" size="md" (clicked)="goToLogin(); isMobileMenuOpen.set(false)">Entrar</rm-button>
                <rm-button variant="primary" size="md" (clicked)="onStartNow(); isMobileMenuOpen.set(false)">Começar Agora</rm-button>
              }
            </div>
          </div>
        }
      </header>
      <section class="rm-hero-section">
        <div class="rm-hero-bg" aria-hidden="true">
          <div class="rm-hero-orb"></div>
          <div class="rm-hero-orb rm-hero-orb--2"></div>
          <div class="rm-hero-grid"></div>
        </div>

        <h1 class="rm-hero-title">
          <span class="rm-typewriter-line">{{ typedLine1() }}</span><span class="rm-typewriter-cursor" [class.done]="isTypingDone()"></span>
          <br />
          <span class="rm-typewriter-line rm-typewriter-line--accent">{{ typedLine2() }}</span><span class="rm-typewriter-cursor" [class.done]="isTypingDone()"></span>
        </h1>

        <p class="rm-hero-subtitle">
          Organize tarefas, capture ideias e deixe a inteligência contextual criar seu próximo passo.
          Rápido, privado e projetado para foco profundo.
        </p>

        <div class="rm-hero-cta-group">
          <rm-button variant="primary" size="lg" icon="arrow-right" (clicked)="onStartNow()">Acessar o Aplicativo</rm-button>
          <rm-button variant="secondary" size="lg" icon="eye" (clicked)="goToLogin()">Explorar recursos</rm-button>
        </div>

        <div class="rm-bento-grid rm-bento-grid--metrics">
          <div class="rm-bento-card rm-bento-card--metric">
            <span class="rm-metric-kicker">ORGANIZAÇÃO</span>
            <h4 class="rm-bento-title">Tudo em um só lugar</h4>
            <p class="rm-bento-desc">Tarefas, ideias e prioridades conectadas sem abas extras.</p>
          </div>
          <div class="rm-bento-card rm-bento-card--metric">
            <span class="rm-metric-kicker">FOCO</span>
            <h4 class="rm-bento-title">Fluxo sem interrupção</h4>
            <p class="rm-bento-desc">Kanban para visão geral e lista para execução — troca instantânea.</p>
          </div>
          <div class="rm-bento-card rm-bento-card--metric">
            <span class="rm-metric-kicker">INTELIGÊNCIA</span>
            <h4 class="rm-bento-title">Próximo passo claro</h4>
            <p class="rm-bento-desc">Assistente sugere quebras e prioridades com base no seu contexto.</p>
          </div>
          <div class="rm-bento-card rm-bento-card--metric">
            <span class="rm-metric-kicker">ESCALA</span>
            <h4 class="rm-bento-title">Cresce com você</h4>
            <p class="rm-bento-desc">Do uso individual ao time, sem migração ou troca de ferramenta.</p>
          </div>
        </div>
      </section>
      <section class="rm-preview-section">
        <div class="rm-mockup-frame glass-panel">
          <div class="rm-mockup-header">
            <div class="rm-mockup-dots">
              <span class="rm-dot rm-dot--red"></span><span class="rm-dot rm-dot--yellow"></span><span class="rm-dot rm-dot--green"></span>
            </div>
            <div class="rm-mockup-url"><rm-icon name="lock" [size]="12"></rm-icon><span>app.redmind.me/dashboard</span><span class="rm-mockup-live"><span class="rm-live-dot"></span> ao vivo</span></div>
            <div class="rm-mockup-actions"><span class="rm-mockup-tabs"><span class="active">Quadro</span><span>Lista</span></span><rm-badge type="neutral" label="VISÃO GERAL"></rm-badge></div>
          </div>

          <div class="rm-mockup-toolbar">
            <div class="rm-mockup-search"><rm-icon name="search" [size]="13"></rm-icon><span>Buscar por título, #tag ou descrição...</span></div>
            <div class="rm-mockup-filters"><span class="rm-mockup-filter active">Todos</span><span class="rm-mockup-filter">Urgentes</span><span class="rm-mockup-filter">Em andamento</span></div>
          </div>

          <div class="rm-mockup-body">
            <div class="rm-mockup-stats-row">
              <div class="rm-mini-card rm-mini-card--progress"><div class="rm-mini-card__top"><span class="rm-mini-card__label">PRODUÇÃO TOTAL</span><span class="rm-mini-card__pct">83%</span></div><div class="rm-mini-progress"><span style="width: 83%"></span></div><span class="rm-mini-card__val">12 de 14 concluídas</span></div>
              <div class="rm-mini-card rm-mini-card--urgent"><span class="rm-mini-card__label">PRIORIDADE MÁXIMA</span><div class="rm-mini-urgent-row"><span class="rm-mini-card__val text-urgent">2 Urgentes</span><span class="rm-mini-badge-urgent">HOJE</span></div><span class="rm-mini-card__sub">Vencimento hoje</span></div>
              <div class="rm-mini-card"><span class="rm-mini-card__label">ASSISTENTE IA</span><span class="rm-mini-card__val text-accent">3 Sugestões ativas</span><span class="rm-mini-card__sub">Pronto para gerar tarefas</span></div>
            </div>

            <div class="rm-mockup-kanban-preview">
              <div class="rm-kanban-col-preview">
                <div class="rm-preview-col-title"><rm-icon name="list" [size]="14"></rm-icon><span>A Fazer</span><span class="rm-col-count">3</span></div>
                <div class="rm-preview-item" [class.rm-preview-item--demo]="demoIndex() === 0"><div class="rm-preview-item__top"><span class="rm-preview-priority rm-preview-priority--high">Alta</span><span class="rm-preview-time">30 min</span></div><span class="rm-preview-item__title">Revisar proposta comercial Q4</span><p class="rm-preview-item__desc">Validar escopo e margem com financeiro</p><div class="rm-preview-item__meta"><span class="rm-tag-pill">Planejamento</span><span class="rm-tag-pill">Q4</span><span class="rm-avatar-pill">SD</span></div><span class="rm-click-ripple" aria-hidden="true"></span></div>
                <div class="rm-preview-item" [class.rm-preview-item--demo]="demoIndex() === 1"><div class="rm-preview-item__top"><span class="rm-preview-priority rm-preview-priority--medium">Média</span><span class="rm-preview-time">45 min</span></div><span class="rm-preview-item__title">Definir escopo do MVP de onboarding</span><div class="rm-preview-item__meta"><span class="rm-tag-pill">Produto</span><span class="rm-tag-pill">MVP</span></div><span class="rm-click-ripple" aria-hidden="true"></span></div>
                <div class="rm-preview-item rm-preview-item--muted" [class.rm-preview-item--demo]="demoIndex() === 2"><span class="rm-preview-item__title">Agendar entrevistas com 5 usuários</span><div class="rm-preview-item__meta"><span class="rm-tag-pill">Pesquisa</span></div><span class="rm-click-ripple" aria-hidden="true"></span></div>
              </div>

              <div class="rm-kanban-col-preview">
                <div class="rm-preview-col-title"><rm-icon name="clock" [size]="14"></rm-icon><span>Em Andamento</span><span class="rm-col-count">3</span></div>
                <div class="rm-preview-item border-accent" [class.rm-preview-item--demo]="demoIndex() === 3"><div class="rm-preview-item__top"><span class="rm-preview-priority rm-preview-priority--urgent">Urgente</span><span class="rm-preview-time">45 min</span></div><span class="rm-preview-item__title">Refinar fluxo de onboarding</span><p class="rm-preview-item__desc">Protótipo no Figma com estados vazios</p><div class="rm-preview-item__meta"><span class="rm-tag-pill">Produto</span><span class="rm-tag-pill">UX</span><span class="rm-avatar-pill">AV</span></div><span class="rm-click-ripple" aria-hidden="true"></span></div>
                <div class="rm-preview-item" [class.rm-preview-item--demo]="demoIndex() === 4"><span class="rm-preview-item__title">Sincronizar design tokens</span><div class="rm-preview-item__meta"><span class="rm-tag-pill">Design System</span><span class="rm-preview-time">20 min</span></div><span class="rm-click-ripple" aria-hidden="true"></span></div>
                <div class="rm-preview-item" [class.rm-preview-item--demo]="demoIndex() === 5"><span class="rm-preview-item__title">Validar acessibilidade dos modais</span><div class="rm-preview-item__meta"><span class="rm-tag-pill">#A11y</span></div><span class="rm-click-ripple" aria-hidden="true"></span></div>
              </div>

              <div class="rm-kanban-col-preview">
                <div class="rm-preview-col-title"><rm-icon name="check-circle" [size]="14"></rm-icon><span>Concluídas</span><span class="rm-col-count">4</span></div>
                <div class="rm-preview-item done" [class.rm-preview-item--demo]="demoIndex() === 6"><span class="rm-preview-item__title">Mapear jornada do usuário</span><div class="rm-preview-item__meta"><span class="rm-tag-pill">Pesquisa</span><span class="rm-preview-check"><rm-icon name="check-circle" [size]="12"></rm-icon> ontem</span></div><span class="rm-click-ripple" aria-hidden="true"></span></div>
                <div class="rm-preview-item done" [class.rm-preview-item--demo]="demoIndex() === 7"><span class="rm-preview-item__title">Entrevistar 5 usuários beta</span><div class="rm-preview-item__meta"><span class="rm-tag-pill">Entrevista</span></div><span class="rm-click-ripple" aria-hidden="true"></span></div>
                <div class="rm-preview-item done" [class.rm-preview-item--demo]="demoIndex() === 8"><span class="rm-preview-item__title">Criar parser de datas</span><div class="rm-preview-item__meta"><span class="rm-tag-pill">Automação</span></div><span class="rm-click-ripple" aria-hidden="true"></span></div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section class="rm-carousel-section">
        <div class="rm-carousel-header">
          <div>
            <span class="rm-hero-badge">MODOS DE TRABALHO</span>
            <h2 class="rm-carousel-title">Cada fluxo, do seu jeito</h2>
            <p class="rm-carousel-subtitle">Três visões conectadas — escolha a que mantém seu foco.</p>
          </div>
          <div class="rm-carousel-controls">
            <button type="button" class="rm-carousel-arrow" (click)="scrollCarousel(-1)" aria-label="Anterior"><rm-icon name="chevron-left" [size]="18"></rm-icon></button>
            <button type="button" class="rm-carousel-arrow" (click)="scrollCarousel(1)" aria-label="Próximo"><rm-icon name="chevron-right" [size]="18"></rm-icon></button>
          </div>
        </div>

        <div class="rm-carousel-viewport" #carouselViewport (scroll)="onCarouselScroll()">
          <div class="rm-carousel-track">
            @for (item of carouselItems; track item.title) {
              <div class="rm-carousel-slide">
                <div class="rm-carousel-card glass-panel">
                  <div class="rm-carousel-card__icon"><rm-icon [name]="item.icon" [size]="22"></rm-icon></div>
                  <span class="rm-carousel-card__label">{{ item.label }}</span>
                  <h3 class="rm-carousel-card__title">{{ item.title }}</h3>
                  <p class="rm-carousel-card__desc">{{ item.desc }}</p>
                  <div class="rm-carousel-card__preview">
                    @if (item.label === 'MODO KANBAN') {
                      <div class="rm-preview-row"><span class="rm-dot-mini" style="background:#f97316"></span><span>Revisar proposta Q4</span><span class="rm-tag-mini">#Planejamento</span></div>
                      <div class="rm-preview-row"><span class="rm-dot-mini" style="background:#38bdf8"></span><span>Refinar fluxo onboarding</span><span class="rm-tag-mini">#Produto</span></div>
                      <div class="rm-preview-progress"><span style="width: 68%"></span></div>
                    } @else if (item.label === 'ASSISTENTE') {
                      <div class="rm-chat-mini"><span class="rm-chat-mini--user">Priorizar meu dia</span><span class="rm-chat-mini--ai">Sugeri 3 tarefas urgentes →</span></div>
                      <div class="rm-preview-row"><span class="rm-dot-mini"></span><span>Bloquear 90 min de foco</span><span class="rm-tag-mini">Urgente</span></div>
                    } @else if (item.label === 'BANCO DE IDEIAS') {
                      <div class="rm-preview-row"><span class="rm-dot-mini" style="background:#8b5cf6"></span><span>Smart Summarizer</span><span class="rm-tag-mini">#IA</span></div>
                      <div class="rm-preview-tags"><span>#Automação</span><span>#Sprint-1</span><span>#Pesquisa</span></div>
                    } @else if (item.label === 'FOCO') {
                      <div class="rm-preview-timer"><span class="rm-timer-ring"></span><span class="rm-timer-text">25:00</span><span class="rm-timer-label">Pomodoro • Tarefa atual</span></div>
                    } @else if (item.label === 'PROGRESSO') {
                      <div class="rm-preview-stats"><span class="rm-stat-big">83%</span><span class="rm-stat-label">concluídas</span><div class="rm-preview-progress"><span style="width: 83%"></span></div><span class="rm-stat-sub">12 de 14 • 2 urgentes</span></div>
                    } @else {
                      <div class="rm-preview-row"><span class="rm-dot-mini" style="background:#10b981"></span><span>Dados no dispositivo</span><span class="rm-tag-mini">Seguro</span></div>
                      <div class="rm-preview-row"><span class="rm-dot-mini" style="background:#64748b"></span><span>Acesso offline</span><span class="rm-tag-mini">Local</span></div>
                    }
                  </div>
                </div>
              </div>
            }
          </div>
        </div>

        <div class="rm-carousel-dots">
          @for (page of carouselPages; track page; let i = $index) {
            <button type="button" class="rm-carousel-dot" [class.active]="carouselPage() === i" (click)="scrollToPage(i)" [attr.aria-label]="'Ir para página ' + (i+1)"></button>
          }
        </div>
      </section>
      <section id="como-funciona" class="rm-architecture-section">
        <div class="rm-architecture-card glass-panel">
          <div class="rm-arch-header">
            <div><span class="rm-hero-badge">COMO FUNCIONA</span><h2 class="rm-arch-title">Três passos do pensamento à entrega</h2></div>
            <rm-button variant="outline" size="sm" icon="arrow-right" (clicked)="onStartNow()">Começar agora</rm-button>
          </div>
          <div class="rm-arch-grid">
            <div class="rm-arch-col"><h4 class="rm-arch-col-title"><rm-icon name="lightbulb" [size]="16"></rm-icon><span>Capture</span></h4><p class="rm-arch-text">Registre ideias em segundos com título, categoria e tags. Tudo fica organizado e pesquisável para quando a inspiração voltar.</p></div>
            <div class="rm-arch-col"><h4 class="rm-arch-col-title"><rm-icon name="kanban" [size]="16"></rm-icon><span>Organize</span></h4><p class="rm-arch-text">Priorize por status, urgência e tags. Visualize em Kanban para fluxo ou em Lista para foco linear e execução rápida.</p></div>
            <div class="rm-arch-col"><h4 class="rm-arch-col-title"><rm-icon name="message-square" [size]="16"></rm-icon><span>Execute com IA</span></h4><p class="rm-arch-text">Peça ao assistente para planejar, priorizar ou decompor uma ideia. As sugestões viram tarefas com um clique, sem atrito.</p></div>
          </div>
        </div>
      </section>

      <footer class="rm-home-footer">
        <div class="rm-home-footer__inner">
          <div class="rm-home-footer__brand"><div class="rm-home-logo-mark small"><rm-icon name="check-square" [size]="14"></rm-icon></div><span>RedmindMe</span></div>
          <div class="rm-home-footer__links">
            <a routerLink="/privacidade" class="rm-home-footer__link">Privacidade</a>
            <a routerLink="/privacidade" class="rm-home-footer__link">Termos</a>
            <a routerLink="/pricing" class="rm-home-footer__link">Planos</a>
          </div>
          <p class="rm-home-footer__rights">&copy; 2026 RedmindMe &mdash; Produtividade com inteligência. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  `,
  styles: [`
    .rm-home-container { display: flex; flex-direction: column; min-height: 100vh; background: var(--rm-bg-canvas); color: var(--rm-text-primary); }
    .rm-home-nav { position: sticky; top: 0; z-index: 100; min-height: 56px; height: auto; padding: 8px 24px; border-bottom: 1px solid var(--rm-border-base); flex-wrap: wrap; overflow-x: clip; @media (max-width: 768px){ padding: 8px 14px; } @media (max-width: 400px){ padding: 6px 10px; } }
    .rm-home-nav__inner { max-width: 1200px; margin: 0 auto; min-height: 44px; display: flex; align-items: center; justify-content: space-between; gap: 10px; flex-wrap: wrap; min-width: 0; @media (max-width: 400px){ gap: 6px; } }
    .rm-home-brand { display: flex; align-items: center; gap: 10px; min-width: 0; flex-shrink: 1; }
    .rm-home-logo-mark { width: 32px; height: 32px; border-radius: var(--rm-radius-md); background: var(--rm-accent); color: #fff; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 10px rgba(99,102,241,0.3); flex-shrink: 0; &.small { width: 24px; height: 24px; } @media (max-width: 400px){ width: 28px; height: 28px; } }
    .rm-home-logo-title { font-size: 17px; font-weight: 700; letter-spacing: -0.02em; }
    .text-accent { color: var(--rm-accent); }
    .rm-home-links { display: flex; align-items: center; gap: 24px; @media (max-width: 800px) { display: none; } }
    .rm-home-link { font-size: 13.5px; font-weight: 500; color: var(--rm-text-secondary); transition: color var(--rm-transition-fast); &:hover { color: var(--rm-text-primary); } }
    .rm-home-actions { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; min-width: 0; justify-content: flex-end; @media (max-width: 375px){ gap: 6px; } }
    .rm-home-theme-btn { width: 36px; height: 36px; border-radius: var(--rm-radius-md); background: var(--rm-bg-hover); border: 1px solid var(--rm-border-base); color: var(--rm-text-secondary); display: flex; align-items: center; justify-content: center; transition: all var(--rm-transition-fast); &:hover{ background: var(--rm-bg-active); color: var(--rm-text-primary); border-color: var(--rm-border-strong); } }
    .rm-home-menu-btn { display: none; width: 36px; height: 36px; border-radius: var(--rm-radius-md); background: var(--rm-bg-hover); border: 1px solid var(--rm-border-base); color: var(--rm-text-secondary); align-items: center; justify-content: center; @media(max-width:800px){ display: flex; } }
    .rm-home-mobile-menu { position: absolute; top: 100%; left: 0; right: 0; background: var(--rm-bg-surface); border-top: 1px solid var(--rm-border-base); border-bottom: 1px solid var(--rm-border-base); padding: 16px 24px 20px; display: flex; flex-direction: column; gap: 0; box-shadow: 0 12px 32px rgba(0,0,0,0.12); z-index: 99; animation: rmFadeUp 0.22s cubic-bezier(0.16,1,0.3,1); }
    .rm-home-mobile-link { font-size: 14px; font-weight: 500; color: var(--rm-text-secondary); padding: 12px 0; border-bottom: 1px solid var(--rm-border-subtle); &:last-of-type{ border-bottom: none; } &:hover{ color: var(--rm-text-primary); } }
    .rm-home-mobile-actions { display: flex; flex-direction: column; gap: 8px; padding-top: 12px; }
    .rm-hero-section { position: relative; max-width: 900px; margin: 60px auto 40px; padding: 0 24px; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 20px; isolation: isolate; overflow: visible; }
    .rm-hero-bg { position: absolute; inset: -60px -24px 0 -24px; z-index: -1; pointer-events: none; overflow: hidden; max-width: 100vw; }
    .rm-hero-orb { position: absolute; top: -100px; left: 50%; transform: translateX(-50%); width: min(780px, 180vw); height: 560px; max-width: 100%; background: radial-gradient(ellipse 68% 62% at 50% 0%, rgba(99,102,241,0.28) 0%, rgba(139,92,246,0.16) 32%, rgba(59,130,246,0.08) 52%, transparent 72%); filter: blur(0px); animation: rmOrbFloat 9s ease-in-out infinite; will-change: transform; @media (max-width: 400px){ width: 120vw; height: 400px; } }
    .rm-hero-orb--2 { top: 40px; width: min(520px, 130vw); height: 380px; max-width: 100%; background: radial-gradient(ellipse 70% 60% at 50% 50%, rgba(99,102,241,0.10) 0%, transparent 70%); animation: rmOrbFloat2 12s ease-in-out infinite; }
    body.dark-mode .rm-hero-orb { background: radial-gradient(ellipse 68% 62% at 50% 0%, rgba(99,102,241,0.38) 0%, rgba(139,92,246,0.20) 32%, rgba(59,130,246,0.12) 52%, transparent 72%); }
    .rm-hero-grid { position: absolute; inset: 0; background-image: radial-gradient(circle, var(--rm-border-subtle) 1.1px, transparent 1.1px); background-size: 22px 22px; mask-image: radial-gradient(ellipse 85% 65% at 50% 0%, black 45%, transparent 78%); -webkit-mask-image: radial-gradient(ellipse 85% 65% at 50% 0%, black 45%, transparent 78%); opacity: 0.75; }
    @keyframes rmOrbFloat { 0%,100% { transform: translateX(-50%) translateY(0) scale(1); } 50% { transform: translateX(-50%) translateY(14px) scale(1.04); } }
    @keyframes rmOrbFloat2 { 0%,100% { transform: translateX(-50%) translateY(0) scale(1); opacity: 0.9; } 50% { transform: translateX(-50%) translateY(-10px) scale(1.06); opacity: 1; } }

    .rm-hero-badge { display: inline-flex; align-items: center; gap: 8px; padding: 6px 14px; font-size: 12px; font-weight: 600; color: var(--rm-accent); background: var(--rm-accent-light); border: 1px solid rgba(99,102,241,0.25); border-radius: var(--rm-radius-full); letter-spacing: 0.02em; }
    .rm-hero-title { font-family: var(--rm-font-display); font-size: 58px; font-weight: 800; line-height: 1.02; letter-spacing: -0.045em; color: var(--rm-text-primary); min-height: 126px; overflow-wrap: anywhere; word-break: break-word; max-width: 100%; @media (max-width: 768px) { font-size: 42px; min-height: auto; } @media (max-width: 640px) { font-size: 34px; } @media (max-width: 400px) { font-size: 28px; line-height: 1.1; min-height: auto; } @media (max-width: 360px) { font-size: 24px; } }
    .rm-typewriter-line { white-space: nowrap; overflow-wrap: anywhere; @media (max-width: 375px) { white-space: normal; word-break: break-word; overflow-wrap: anywhere; } }
    .rm-typewriter-line--accent { background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #3b82f6 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
    .rm-typewriter-cursor { display: inline-block; width: 3px; height: 1em; background: var(--rm-accent); margin-left: 2px; vertical-align: -0.08em; animation: rmBlink 0.85s step-end infinite; }
    .rm-typewriter-cursor.done { animation: none; opacity: 0; }
    @keyframes rmBlink { 0%,50% { opacity: 1; } 51%,100% { opacity: 0; } }
    .rm-hero-subtitle { font-size: 16px; color: var(--rm-text-secondary); line-height: 1.6; max-width: 680px; }
    .rm-hero-cta-group { display: flex; align-items: center; gap: 14px; margin-top: 10px; flex-wrap: wrap; justify-content: center; }

    .rm-metrics-strip { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-top: 50px; width: 100%; text-align: left; @media (max-width: 900px) { grid-template-columns: repeat(2, 1fr); } @media (max-width: 500px) { grid-template-columns: 1fr; } }
    .rm-metrics-strip--editorial { grid-template-columns: 1fr 1px 1fr 1px 1fr 1px 1fr; gap: 0; align-items: start; @media (max-width: 900px) { grid-template-columns: 1fr 1px 1fr; .rm-metric-divider:nth-of-type(4){ display: none; } } @media (max-width: 640px) { grid-template-columns: 1fr; .rm-metric-divider{ display: none; } } }
    .rm-metrics-strip--editorial .rm-metric-item { display: flex; flex-direction: column; align-items: flex-start; gap: 6px; padding: 0 16px; background: transparent; border: none; border-radius: 0; box-shadow: none; transition: none; &:hover{ transform: none; border-color: transparent; box-shadow: none; } }
    .rm-metric-kicker { font-size: 10px; font-weight: 700; letter-spacing: 0.08em; color: var(--rm-accent); opacity: 0.9; }
    .rm-metric-divider { width: 1px; background: var(--rm-border-subtle); align-self: stretch; margin: 2px 0; min-height: 56px; }
    .rm-metric-icon { margin-top: 2px; color: var(--rm-text-secondary); transition: color var(--rm-transition-fast); .rm-metric-item:hover & { color: var(--rm-accent); } }
    .rm-metric-val { font-size: 13.5px; font-weight: 700; color: var(--rm-text-primary); }
    .rm-metric-sub { font-size: 11.5px; color: var(--rm-text-secondary); line-height: 1.45; margin-top: 2px; }
    .rm-metrics-strip--editorial .rm-metric-val { font-size: 14px; letter-spacing: -0.01em; }
    .rm-metrics-strip--editorial .rm-metric-sub { font-size: 12px; }
    .rm-metric-item { animation: rmFadeUp 0.6s cubic-bezier(0.16,1,0.3,1) both; &:nth-child(1){animation-delay:0.05s} &:nth-child(3){animation-delay:0.12s} &:nth-child(5){animation-delay:0.19s} &:nth-child(7){animation-delay:0.26s} }
    @keyframes rmFadeUp { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }

    .rm-preview-section { max-width: 1180px; width: 100%; margin: 0 auto 56px; padding: 0 24px; perspective: 1200px; perspective-origin: center top; }
    .rm-mockup-frame { border-radius: var(--rm-radius-xl); border: 1.5px solid var(--rm-border-base); overflow: hidden; background: var(--rm-bg-surface); box-shadow: 0 32px 80px -16px rgba(0,0,0,0.28), 0 0 0 1px rgba(0,0,0,0.04), 0 12px 32px -8px rgba(99,102,241,0.14); transform: perspective(1200px) rotateX(1.1deg) translateZ(0); transform-style: preserve-3d; transition: transform var(--rm-transition-smooth), box-shadow var(--rm-transition-base); will-change: transform; min-height: 560px; &:hover{ transform: perspective(1200px) rotateX(0deg) translateY(-4px); box-shadow: 0 40px 96px -16px rgba(0,0,0,0.36), 0 0 0 1px rgba(0,0,0,0.04), 0 16px 40px -8px rgba(99,102,241,0.18); } @media(max-width:768px){ transform:none; min-height: auto; &:hover{transform:none} } }
    .rm-mockup-header { height: 44px; padding: 0 16px; background: var(--rm-bg-hover); border-bottom: 1px solid var(--rm-border-subtle); display: flex; align-items: center; justify-content: space-between; gap: 12px; }
    .rm-mockup-live { display: inline-flex; align-items: center; gap: 6px; font-size: 10.5px; font-weight: 600; color: var(--rm-done); background: rgba(16,185,129,0.10); border: 1px solid rgba(16,185,129,0.18); padding: 2px 8px; border-radius: 999px; margin-left: 8px; }
    .rm-live-dot { width: 6px; height: 6px; background: var(--rm-done); border-radius: 50%; box-shadow: 0 0 0 4px rgba(16,185,129,0.18); animation: rmPulse 1.8s infinite; }
    @keyframes rmPulse { 0%{ box-shadow: 0 0 0 0 rgba(16,185,129,0.22); } 70%{ box-shadow: 0 0 0 6px rgba(16,185,129,0); } 100%{ box-shadow: 0 0 0 0 rgba(16,185,129,0); } }
    .rm-mockup-tabs { display: inline-flex; background: var(--rm-bg-surface); border: 1px solid var(--rm-border-subtle); border-radius: 999px; padding: 2px; gap: 2px; font-size: 11px; font-weight: 600; span{ padding: 3px 10px; border-radius: 999px; color: var(--rm-text-muted); &.active{ background: var(--rm-bg-hover); color: var(--rm-text-primary); border: 1px solid var(--rm-border-base); } } }
    .rm-mockup-toolbar { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 12px 16px; background: var(--rm-bg-surface); border-bottom: 1px solid var(--rm-border-subtle); flex-wrap: wrap; }
    .rm-mockup-search { flex: 1; min-width: 220px; display: flex; align-items: center; gap: 8px; font-size: 12px; color: var(--rm-text-muted); background: var(--rm-bg-canvas); border: 1px solid var(--rm-border-base); border-radius: 10px; padding: 8px 12px; }
    .rm-mockup-filters { display: flex; gap: 6px; flex-wrap: wrap; }
    .rm-mockup-filter { font-size: 11px; font-weight: 600; padding: 5px 10px; border-radius: 999px; border: 1px solid var(--rm-border-base); color: var(--rm-text-secondary); background: var(--rm-bg-hover); &.active{ background: var(--rm-accent); color: #fff; border-color: var(--rm-accent); } }
    .rm-mockup-dots { display: flex; gap: 6px; }
    .rm-dot { width: 10px; height: 10px; border-radius: 50%; }
    .rm-dot--red{background:#ef4444} .rm-dot--yellow{background:#f59e0b} .rm-dot--green{background:#10b981}
    .rm-mockup-url { display: flex; align-items: center; gap: 6px; font-size: 11.5px; color: var(--rm-text-muted); background: var(--rm-bg-surface); padding: 3px 12px; border-radius: var(--rm-radius-sm); border: 1px solid var(--rm-border-subtle); }
    .rm-mockup-body { padding: 24px; display: flex; flex-direction: column; gap: 20px; background: var(--rm-bg-canvas); }
    .rm-mockup-stats-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; @media(max-width:600px){grid-template-columns:1fr} }
    .rm-mini-card { padding: 14px 16px; background: var(--rm-bg-surface); border: 1.5px solid var(--rm-border-base); border-radius: 14px; display: flex; flex-direction: column; gap: 6px; transition: all var(--rm-transition-fast); &:hover{ transform: translateY(-2px); border-color: var(--rm-border-strong); box-shadow: 0 8px 20px rgba(0,0,0,0.06); } }
    .rm-mini-card__label{font-size:10px;font-weight:700;letter-spacing:0.06em;color:var(--rm-text-muted)}
    .rm-mini-card__val{font-size:17px;font-weight:800;letter-spacing:-0.02em;color:var(--rm-text-primary)} .text-urgent{color:var(--rm-urgent)}
    .rm-mini-card__top{ display: flex; align-items: center; justify-content: space-between; }
    .rm-mini-card__pct{ font-size: 11px; font-weight: 700; color: var(--rm-accent); background: var(--rm-accent-light); padding: 2px 7px; border-radius: 999px; }
    .rm-mini-progress{ height: 6px; background: var(--rm-bg-hover); border-radius: 999px; overflow: hidden; span{ display: block; height: 100%; background: linear-gradient(90deg, var(--rm-accent), #8b5cf6); border-radius: 999px; } }
    .rm-mini-card__sub{ font-size: 11px; color: var(--rm-text-muted); }
    .rm-mini-urgent-row{ display: flex; align-items: center; gap: 8px; }
    .rm-mini-badge-urgent{ font-size: 10px; font-weight: 700; padding: 3px 7px; background: rgba(244,63,94,0.10); color: var(--rm-urgent); border: 1px solid rgba(244,63,94,0.18); border-radius: 999px; }
    .rm-col-count{ margin-left: auto; font-size: 10px; font-weight: 700; padding: 2px 7px; background: var(--rm-bg-hover); border: 1px solid var(--rm-border-base); border-radius: 999px; color: var(--rm-text-muted); }
    .rm-preview-item__top{ display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 2px; }
    .rm-preview-priority{ font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 999px; letter-spacing: 0.04em; }
    .rm-preview-priority--high{ background: rgba(249,115,22,0.12); color: #f97316; border: 1px solid rgba(249,115,22,0.18); }
    .rm-preview-priority--medium{ background: rgba(234,179,8,0.12); color: #a16207; border: 1px solid rgba(234,179,8,0.18); }
    .rm-preview-priority--urgent{ background: rgba(244,63,94,0.12); color: var(--rm-urgent); border: 1px solid rgba(244,63,94,0.18); }
    .rm-preview-time{ font-size: 11px; color: var(--rm-text-muted); background: var(--rm-bg-hover); padding: 2px 6px; border-radius: 999px; }
    .rm-preview-item__desc{ font-size: 12px; color: var(--rm-text-secondary); line-height: 1.4; margin: 2px 0; }
    .rm-preview-item--muted{ opacity: 0.72; }
    .rm-avatar-pill{ margin-left: auto; width: 22px; height: 22px; border-radius: 50%; background: var(--rm-accent); color: #fff; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 700; flex-shrink: 0; }
    .rm-preview-check{ display: inline-flex; align-items: center; gap: 4px; font-size: 11px; color: var(--rm-done); margin-left: auto; }
    .rm-mockup-kanban-preview{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;@media(max-width:768px){grid-template-columns:1fr}}
    .rm-kanban-col-preview{background:var(--rm-bg-surface);border:1px solid var(--rm-border-base);border-radius:var(--rm-radius-md);padding:14px;display:flex;flex-direction:column;gap:10px;transition: transform var(--rm-transition-fast), border-color var(--rm-transition-fast); &:hover{transform: translateY(-2px); border-color: var(--rm-border-strong)}}
    .rm-preview-col-title{font-size:12px;font-weight:700;color:var(--rm-text-secondary);display:flex;align-items:center;gap:6px;padding-bottom:8px;border-bottom:1px solid var(--rm-border-subtle)}
    .rm-preview-item{padding:10px 12px;background:var(--rm-bg-canvas);border:1px solid var(--rm-border-base);border-radius:var(--rm-radius-sm);display:flex;flex-direction:column;gap:6px;transition: transform var(--rm-transition-fast), border-color var(--rm-transition-fast), box-shadow var(--rm-transition-fast); cursor: pointer; user-select: none; position: relative; overflow: hidden; &:hover{ transform: translateY(-2px); border-color: rgba(99,102,241,0.22); box-shadow: 0 6px 16px rgba(0,0,0,0.06); } &:active{ transform: scale(0.97); } &.border-accent{border-color:rgba(99,102,241,0.4)} &.done{opacity:0.6; .rm-preview-item__title{text-decoration:line-through}} }
    .rm-preview-item--demo{ transform: scale(0.98) !important; border-color: var(--rm-accent) !important; box-shadow: 0 0 0 3px var(--rm-accent-light), 0 10px 28px rgba(99,102,241,0.18) !important; z-index: 1; }
    .rm-click-ripple{ position: absolute; inset: 0; pointer-events: none; border-radius: inherit; overflow: hidden; }
    .rm-preview-item--demo .rm-click-ripple::after{ content: ''; position: absolute; top: 50%; left: 50%; width: 14px; height: 14px; background: var(--rm-accent); border-radius: 50%; transform: translate(-50%, -50%) scale(0); animation: rmRipple 0.65s cubic-bezier(0.16,1,0.3,1) forwards; opacity: 0.22; }
    @keyframes rmRipple{ 0%{ transform: translate(-50%,-50%) scale(0); opacity: 0.22; } 100%{ transform: translate(-50%,-50%) scale(18); opacity: 0; } }
    .rm-preview-item__title{font-size:12.5px;font-weight:600;color:var(--rm-text-primary)}
    .rm-preview-item__meta{display:flex;align-items:center;gap:6px}
    .rm-tag-pill{font-size:10px;background:var(--rm-bg-hover);padding:2px 6px;border-radius:var(--rm-radius-sm);color:var(--rm-text-muted)}
    .rm-carousel-section { max-width: 1100px; margin: 0 auto 80px; padding: 0 24px; }
    .rm-carousel-header { display: flex; align-items: flex-end; justify-content: space-between; gap: 16px; margin-bottom: 20px; flex-wrap: wrap; }
    .rm-carousel-title { font-family: var(--rm-font-display); font-size: 32px; font-weight: 800; letter-spacing: -0.03em; line-height: 1.1; color: var(--rm-text-primary); margin-top: 6px; }
    .rm-carousel-subtitle { font-size: 13.5px; color: var(--rm-text-secondary); margin-top: 6px; }
    .rm-carousel-controls { display: flex; gap: 8px; }
    .rm-carousel-arrow { width: 36px; height: 36px; border-radius: var(--rm-radius-md); background: var(--rm-bg-surface); border: 1px solid var(--rm-border-base); color: var(--rm-text-secondary); display: flex; align-items: center; justify-content: center; transition: all var(--rm-transition-fast); &:hover{ background: var(--rm-bg-hover); color: var(--rm-text-primary); border-color: var(--rm-border-strong); transform: translateY(-1px); } &:active{ transform: scale(0.96); } }
    .rm-carousel-viewport { overflow-x: auto; overflow-y: hidden; border-radius: var(--rm-radius-xl); scroll-snap-type: x mandatory; -webkit-overflow-scrolling: touch; scrollbar-width: none; &::-webkit-scrollbar{ display: none; } scroll-behavior: smooth; }
    .rm-carousel-track { display: flex; gap: 16px; padding: 4px 2px 8px; will-change: scroll-position; }
    .rm-carousel-slide { flex: 0 0 calc(33.333% - 11px); min-width: 0; scroll-snap-align: start; box-sizing: border-box; @media(max-width: 1100px){ flex: 0 0 calc(50% - 8px); } @media(max-width: 640px){ flex: 0 0 85%; } }
    .rm-carousel-card { padding: 22px; border-radius: var(--rm-radius-xl); background: var(--rm-bg-surface); border: 1px solid var(--rm-border-base); display: flex; flex-direction: column; gap: 10px; height: 100%; transition: all var(--rm-transition-base); &:hover{ transform: translateY(-4px) scale(1.01); border-color: rgba(99,102,241,0.28); box-shadow: 0 16px 40px -12px rgba(0,0,0,0.18), 0 0 0 1px rgba(99,102,241,0.08); } }
    .rm-carousel-card__icon { width: 40px; height: 40px; border-radius: var(--rm-radius-md); background: var(--rm-bg-hover); display: flex; align-items: center; justify-content: center; color: var(--rm-accent); transition: transform var(--rm-transition-fast); .rm-carousel-card:hover &{ transform: scale(1.08) rotate(2deg); } }
    .rm-carousel-card__label { font-size: 10.5px; font-weight: 700; letter-spacing: 0.06em; color: var(--rm-accent); }
    .rm-carousel-card__title { font-size: 17px; font-weight: 700; color: var(--rm-text-primary); letter-spacing: -0.015em; }
    .rm-carousel-card__desc { font-size: 13px; color: var(--rm-text-secondary); line-height: 1.5; }
    .rm-carousel-card__preview { margin-top: 8px; padding: 12px; background: var(--rm-bg-canvas); border: 1px solid var(--rm-border-subtle); border-radius: var(--rm-radius-md); display: flex; flex-direction: column; gap: 8px; min-height: 88px; }
    .rm-carousel-mini-bar { display: flex; gap: 4px; span{ height: 4px; flex:1; background: var(--rm-border-base); border-radius: 999px; &:first-child{ background: var(--rm-accent); } } }
    .rm-carousel-mini-card { height: 38px; background: var(--rm-bg-surface); border: 1px solid var(--rm-border-base); border-radius: var(--rm-radius-md); &.short{ width: 70%; } }
    .rm-preview-row { display: flex; align-items: center; gap: 8px; font-size: 11.5px; background: var(--rm-bg-surface); border: 1px solid var(--rm-border-base); border-radius: 10px; padding: 7px 10px; }
    .rm-dot-mini { width: 7px; height: 7px; border-radius: 50%; background: var(--rm-accent); flex-shrink: 0; }
    .rm-tag-mini { margin-left: auto; font-size: 10px; font-weight: 600; padding: 2px 6px; background: var(--rm-bg-hover); border: 1px solid var(--rm-border-base); border-radius: 999px; color: var(--rm-text-muted); }
    .rm-preview-progress { height: 6px; background: var(--rm-bg-hover); border-radius: 999px; overflow: hidden; span{ display: block; height: 100%; background: linear-gradient(90deg, var(--rm-accent), #8b5cf6); } }
    .rm-chat-mini { display: flex; flex-direction: column; gap: 6px; span{ font-size: 11px; padding: 6px 10px; border-radius: 12px; max-width: 85%; } .rm-chat-mini--user{ align-self: flex-end; background: var(--rm-accent); color: #fff; border-radius: 12px 12px 4px 12px; } .rm-chat-mini--ai{ align-self: flex-start; background: var(--rm-bg-surface); border: 1px solid var(--rm-border-base); color: var(--rm-text-primary); } }
    .rm-preview-tags { display: flex; gap: 6px; flex-wrap: wrap; span{ font-size: 10px; font-weight: 600; padding: 4px 8px; background: var(--rm-bg-hover); border: 1px solid var(--rm-border-base); border-radius: 999px; color: var(--rm-text-secondary); } }
    .rm-preview-timer { display: flex; flex-direction: column; align-items: center; gap: 6px; padding: 6px; .rm-timer-ring{ width: 44px; height: 44px; border-radius: 50%; border: 3px solid var(--rm-border-base); border-top-color: var(--rm-accent); } .rm-timer-text{ font-size: 16px; font-weight: 800; color: var(--rm-text-primary); letter-spacing: -0.02em; } .rm-timer-label{ font-size: 10px; color: var(--rm-text-muted); } }
    .rm-preview-stats { display: flex; flex-direction: column; gap: 6px; .rm-stat-big{ font-size: 22px; font-weight: 800; color: var(--rm-text-primary); letter-spacing: -0.03em; } .rm-stat-label{ font-size: 11px; font-weight: 600; color: var(--rm-text-muted); margin-top: -4px; } .rm-stat-sub{ font-size: 11px; color: var(--rm-text-muted); } }
    .rm-carousel-dots { display: flex; justify-content: center; gap: 6px; margin-top: 14px; }
    .rm-carousel-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--rm-border-base); border: none; transition: all var(--rm-transition-fast); &.active{ width: 22px; border-radius: 999px; background: var(--rm-accent); } }

    .rm-features-section { max-width: 1100px; margin: 0 auto 80px; padding: 0 24px; }
    .rm-section-header { text-align: center; display: flex; flex-direction: column; align-items: center; gap: 12px; margin-bottom: 32px; }
    .rm-section-title { font-family: var(--rm-font-display); font-size: 36px; font-weight: 800; letter-spacing: -0.035em; line-height: 1.1; overflow-wrap: anywhere; word-break: break-word; @media (max-width: 640px){ font-size: 28px; } @media (max-width: 400px){ font-size: 24px; } }
    .rm-section-desc { font-size: 15px; color: var(--rm-text-secondary); max-width: 640px; line-height: 1.55; overflow-wrap: anywhere; @media (max-width: 400px){ font-size: 14px; } }
    .rm-bento-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; grid-auto-rows: minmax(200px, auto); @media(max-width:900px){ grid-template-columns: repeat(2, 1fr); } @media(max-width:600px){ grid-template-columns: 1fr; } }
    .rm-bento-card { background: var(--rm-bg-surface); border: 1.5px solid var(--rm-border-base); border-radius: 20px; padding: 20px; display: flex; flex-direction: column; gap: 12px; overflow: hidden; position: relative; box-shadow: 0 1px 2px rgba(0,0,0,0.04), 0 8px 24px -12px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.5); transition: transform 0.32s cubic-bezier(0.16,1,0.3,1), border-color 0.32s, box-shadow 0.32s; animation: rmFadeUp 0.6s cubic-bezier(0.16,1,0.3,1) both; &:nth-child(1){animation-delay:0.04s} &:nth-child(2){animation-delay:0.10s} &:nth-child(3){animation-delay:0.16s} &:nth-child(4){animation-delay:0.22s} &:nth-child(5){animation-delay:0.28s} &:nth-child(6){animation-delay:0.34s}; &:hover{ transform: translateY(-4px) scale(1.01); border-color: rgba(99,102,241,0.38); box-shadow: 0 16px 40px -12px rgba(0,0,0,0.14), 0 0 0 1px rgba(99,102,241,0.14), inset 0 1px 0 rgba(255,255,255,0.7); }
      body.dark-mode &{ border-color: rgba(255,255,255,0.10); box-shadow: 0 4px 20px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,255,255,0.06); &:hover{ border-color: rgba(129,140,248,0.45); box-shadow: 0 16px 40px -12px rgba(0,0,0,0.45), 0 0 0 1px rgba(129,140,248,0.18), inset 0 1px 0 rgba(255,255,255,0.08); } }
    }
    .rm-bento-card--hero { grid-column: span 2; grid-row: span 2; min-height: 380px; background: linear-gradient(180deg, rgba(99,102,241,0.06) 0%, var(--rm-bg-surface) 45%); @media(max-width:900px){ grid-column: span 2; grid-row: span 1; min-height: 280px; } @media(max-width:600px){ grid-column: span 1; grid-row: span 1; min-height: 240px; } }
    .rm-bento-card--wide { grid-column: span 2; @media(max-width:600px){ grid-column: span 1; } }
    .rm-bento-grid--metrics { grid-template-columns: repeat(4, 1fr); margin-top: 48px; @media(max-width:900px){ grid-template-columns: repeat(2, 1fr); } @media(max-width:600px){ grid-template-columns: 1fr; } }
    .rm-bento-card--metric { min-height: 148px; padding: 18px; }
    .rm-bento-header { display: flex; align-items: center; gap: 12px; }
    .rm-bento-icon { width: 36px; height: 36px; border-radius: 10px; background: var(--rm-bg-hover); border: 1px solid var(--rm-border-base); display: flex; align-items: center; justify-content: center; color: var(--rm-accent); flex-shrink: 0; transition: transform 0.32s; .rm-bento-card:hover &{ transform: scale(1.08) rotate(2deg); } }
    .rm-bento-visual { flex: 1; display: flex; align-items: center; gap: 8px; min-width: 0; }
    .rm-bento-visual--hero { flex-direction: column; align-items: stretch; background: var(--rm-bg-canvas); border: 1px solid var(--rm-border-subtle); border-radius: 12px; padding: 12px; gap: 10px; margin-left: 8px; }
    .rm-bento-mock-bar { height: 8px; background: var(--rm-bg-hover); border-radius: 999px; overflow: hidden; span{ display: block; height: 100%; background: linear-gradient(90deg, var(--rm-accent), #8b5cf6); border-radius: 999px; } }
    .rm-bento-mock-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; span{ height: 28px; background: var(--rm-bg-hover); border: 1px solid var(--rm-border-subtle); border-radius: 8px; } }
    .rm-bento-mock-row { display: flex; align-items: center; gap: 8px; span:first-child{ flex: 1; height: 8px; background: var(--rm-border-base); border-radius: 999px; } .dot{ width: 16px; height: 16px; border-radius: 50%; background: var(--rm-accent); flex-shrink: 0; } }
    .rm-bento-visual--tags { gap: 6px; span{ font-size: 10px; font-weight: 600; padding: 4px 8px; background: var(--rm-bg-hover); border: 1px solid var(--rm-border-base); border-radius: 999px; color: var(--rm-text-secondary); } }

    .rm-bento-section { max-width: 1100px; margin: 0 auto 80px; padding: 0 24px; }
    .rm-bento-grid--dark { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; grid-auto-rows: minmax(200px, auto); @media(max-width: 640px){ grid-template-columns: 1fr; } }
    .rm-bento-card--dark { background: #121217; border: 1px solid rgba(255,255,255,0.08); border-radius: 20px; padding: 20px; display: flex; flex-direction: column; gap: 16px; @media(max-width: 640px){ padding: 16px; } body:not(.dark-mode) &{ background: #18181f; border-color: rgba(255,255,255,0.08); } }
    .rm-bento-card--full { grid-column: span 2; @media(max-width: 640px){ grid-column: span 1; } }
    .rm-bento-visual--chat { display: flex; flex-direction: column; gap: 10px; align-items: flex-end; }
    .rm-chat-bubble { max-width: 78%; padding: 10px 14px; border-radius: 16px; font-size: 12.5px; line-height: 1.4; }
    .rm-chat-bubble--user { align-self: flex-end; background: #2a2a36; color: #f8fafc; border: 1px solid rgba(255,255,255,0.08); border-radius: 16px 16px 4px 16px; }
    .rm-chat-bubble--assistant { align-self: flex-start; background: #1e1e2e; color: #e8e8f0; border: 1px solid rgba(99,102,241,0.22); border-radius: 16px 16px 16px 4px; display: flex; align-items: center; gap: 8px; code{ background: rgba(255,255,255,0.08); padding: 2px 6px; border-radius: 6px; font-family: var(--rm-font-mono); font-size: 11px; } }
    .rm-bento-visual--chart { height: 88px; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06); border-radius: 12px; padding: 8px; overflow: hidden; }
    .rm-chart-svg { width: 100%; height: 100%; display: block; }
    .rm-bento-visual--music { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 14px; padding: 12px; }
    .rm-music-row { display: flex; align-items: center; gap: 12px; }
    .rm-music-disc { width: 44px; height: 44px; border-radius: 50%; background: #fff; display: flex; align-items: center; justify-content: center; flex-shrink: 0; box-shadow: 0 0 0 4px rgba(255,255,255,0.06); span{ width: 10px; height: 10px; background: #121217; border-radius: 50%; display: block; } }
    .rm-music-meta { display: flex; flex-direction: column; gap: 2px; flex: 1; min-width: 0; }
    .rm-music-title { font-size: 13px; font-weight: 600; color: #f8fafc; }
    .rm-music-artist { font-size: 11px; color: #9ca3af; }
    .rm-music-bars { display: flex; align-items: flex-end; gap: 2px; height: 16px; span{ width: 3px; background: #fff; border-radius: 999px; &:nth-child(1){height: 40%} &:nth-child(2){height: 78%} &:nth-child(3){height: 55%} &:nth-child(4){height: 90%} } }
    .rm-bento-footer { display: flex; gap: 12px; align-items: flex-start; margin-top: auto; }
    .rm-bento-icon--dark { width: 36px; height: 36px; border-radius: 10px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.08); color: #f8fafc; }
    .rm-bento-title { font-family: var(--rm-font-display); font-size: 19px; font-weight: 800; color: var(--rm-text-primary); letter-spacing: -0.025em; line-height: 1.2; }
    .rm-bento-desc { font-size: 13.5px; color: var(--rm-text-secondary); line-height: 1.5; }
    .rm-bento-card--hero .rm-bento-title { font-size: 22px; letter-spacing: -0.03em; }
    .rm-bento-card--hero .rm-bento-desc { font-size: 14px; }
    .rm-feature-icon-box { width: 40px; height: 40px; border-radius: var(--rm-radius-md); background: var(--rm-bg-hover); display: flex; align-items: center; justify-content: center; color: var(--rm-text-primary); transition: transform var(--rm-transition-fast); .rm-feature-card:hover &{ transform: scale(1.08); } }
    .rm-feature-title { font-size: 16px; font-weight: 700; color: var(--rm-text-primary); }
    .rm-feature-text { font-size: 13px; color: var(--rm-text-secondary); line-height: 1.5; }

    .rm-architecture-section { max-width: 1100px; margin: 0 auto 80px; padding: 0 24px; }
    .rm-architecture-card { padding: 32px; border-radius: var(--rm-radius-xl); border: 1px solid var(--rm-border-base); display: flex; flex-direction: column; gap: 24px; transition: transform var(--rm-transition-base); &:hover{ transform: translateY(-2px); } }
    .rm-arch-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; flex-wrap: wrap; }
    .rm-arch-title { font-family: var(--rm-font-display); font-size: 28px; font-weight: 800; letter-spacing: -0.03em; line-height: 1.1; margin-top: 6px; }
    .rm-arch-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; @media(max-width:800px){grid-template-columns:1fr} }
    .rm-arch-col { display: flex; flex-direction: column; gap: 8px; padding: 14px; border-radius: var(--rm-radius-md); border: 1px solid transparent; transition: all var(--rm-transition-fast); &:hover{ background: var(--rm-bg-hover); border-color: var(--rm-border-base); transform: translateY(-2px); } }
    .rm-arch-col-title { font-size: 14px; font-weight: 700; display: flex; align-items: center; gap: 8px; color: var(--rm-text-primary); }
    .rm-arch-text { font-size: 12.5px; color: var(--rm-text-secondary); line-height: 1.5; }

    .rm-home-footer { border-top: 1px solid var(--rm-border-base); padding: 24px 32px; background: var(--rm-bg-surface); }
    .rm-home-footer__inner { max-width: 1200px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap; }
    .rm-home-footer__brand { display: flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 600; }
    .rm-home-footer__links { display: flex; gap: 16px; align-items: center; }
    .rm-home-footer__link { font-size: 12px; font-weight: 500; color: var(--rm-text-secondary); &:hover{ color: var(--rm-text-primary); text-decoration: underline; text-underline-offset: 3px; } }
    .rm-home-footer__rights { font-size: 12px; color: var(--rm-text-muted); }
  `]
})
export class HomeComponent {
  readonly authService = inject(AuthService);
  readonly themeService = inject(ThemeService);
  private readonly router = inject(Router);
  readonly isMobileMenuOpen = signal(false);
  readonly typedLine1 = signal('');
  readonly typedLine2 = signal('');
  readonly isTypingDone = signal(false);
  private readonly fullLine1 = 'Produtividade sem atrito.';
  private readonly fullLine2 = 'Ideias estruturadas por inteligência.';
  readonly demoIndex = signal(1);
  readonly carouselIndex = signal(0);
  readonly carouselPage = this.carouselIndex;
  get carouselPages(): number[] {
    const perPage = 3;
    return Array.from({ length: Math.ceil(this.carouselItems.length / perPage) }, (_, i) => i);
  }
  readonly carouselItems = [
    { icon: 'kanban', label: 'MODO KANBAN', title: 'Fluxo que você enxerga', desc: 'Três colunas nítidas com arraste suave, contadores vivos e feedback a cada movimento.' },
    { icon: 'message-square', label: 'ASSISTENTE', title: 'Diga e acontece', desc: '“Organizar meu dia” vira 4 tarefas priorizadas com tempo estimado — direto no quadro.' },
    { icon: 'layers', label: 'BANCO DE IDEIAS', title: 'Ideia não se perde', desc: 'Capture em 5s, organize por tags e expanda em plano acionável com 1 clique.' },
    { icon: 'clock', label: 'FOCO', title: 'Foco sem distrair', desc: 'Pomodoro minimalista mostra só a tarefa atual, sem poluir sua visão.' },
    { icon: 'check-circle', label: 'PROGRESSO', title: 'Avanço que motiva', desc: '83% concluídas e 2 urgentes — veja onde investir energia agora.' },
    { icon: 'shield', label: 'CONFIANÇA', title: 'Seu ritmo, suas regras', desc: 'Tudo no dispositivo, com acesso offline e sem amarras.' },
  ];

  constructor() {
    this.startTypewriter();
    this.startDemoClick();
  }

  private startTypewriter(): void {
    let i1 = 0;
    const type1 = () => {
      if (i1 <= this.fullLine1.length) {
        this.typedLine1.set(this.fullLine1.slice(0, i1));
        i1++;
        setTimeout(type1, 38);
      } else {
        let i2 = 0;
        const type2 = () => {
          if (i2 <= this.fullLine2.length) {
            this.typedLine2.set(this.fullLine2.slice(0, i2));
            i2++;
            setTimeout(type2, 32);
          } else {
            this.isTypingDone.set(true);
          }
        };
        setTimeout(type2, 220);
      }
    };
    setTimeout(type1, 300);
  }

  private startDemoClick(): void {

    setInterval(() => this.demoIndex.update(i => (i + 1) % 9), 2200);
  }

  @ViewChild('carouselViewport') carouselViewport?: ElementRef<HTMLElement>;

  scrollCarousel(dir: number): void {
    const el = this.carouselViewport?.nativeElement;
    if (!el) return;
    const slide = el.querySelector('.rm-carousel-slide') as HTMLElement | null;
    const gap = 16;
    const amount = slide ? slide.offsetWidth + gap : el.clientWidth * 0.85;
    el.scrollBy({ left: dir * amount, behavior: 'smooth' });
  }

  scrollToIndex(index: number): void {
    const el = this.carouselViewport?.nativeElement;
    if (!el) return;
    const slide = el.querySelector('.rm-carousel-slide') as HTMLElement | null;
    const gap = 16;
    const amount = slide ? slide.offsetWidth + gap : el.clientWidth * 0.85;
    el.scrollTo({ left: index * amount, behavior: 'smooth' });
  }

  scrollToPage(page: number): void {

    this.scrollToIndex(page * 3);
  }

  onCarouselScroll(): void {
    const el = this.carouselViewport?.nativeElement;
    if (!el) return;
    const slide = el.querySelector('.rm-carousel-slide') as HTMLElement | null;
    const gap = 16;
    const amount = slide ? slide.offsetWidth + gap : el.clientWidth * 0.85;
    if (amount > 0) {
      const idx = Math.round(el.scrollLeft / amount);
      this.carouselIndex.set(Math.max(0, Math.min(idx, this.carouselItems.length - 1)));
    }
  }

  goToApp(): void { this.router.navigate(['/dashboard']); }
  goToLogin(): void { this.router.navigate(['/login']); }
  onStartNow(): void {
    if (this.authService.isAuthenticated()) this.goToApp();
    else this.goToLogin();
  }
}
