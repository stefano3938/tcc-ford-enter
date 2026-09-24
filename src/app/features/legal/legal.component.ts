import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IconComponent } from '../../shared/components/icon/icon.component';

@Component({
  selector: 'rm-legal',
  standalone: true,
  imports: [RouterLink, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="rm-legal-page">
      <a routerLink="/home" class="rm-legal-back">
        <rm-icon name="arrow-left" [size]="14"></rm-icon>
        <span>Voltar</span>
      </a>

      <header class="rm-legal-hero rm-page">
        <span class="rm-legal-badge">LGPD • Lei 13.709/2018</span>
        <h1 class="rm-legal-title">Privacidade e Termos</h1>
        <p class="rm-legal-subtitle">
          Transparência total sobre como o RemindMe trata seus dados. Atualizado em 24 de setembro de 2026.
        </p>
        <div class="rm-legal-tabs">
          <button type="button" class="rm-legal-tab" [class.active]="tab() === 'privacidade'" (click)="tab.set('privacidade')">Privacidade (LGPD)</button>
          <button type="button" class="rm-legal-tab" [class.active]="tab() === 'termos'" (click)="tab.set('termos')">Termos de Uso</button>
        </div>
      </header>

      @if (tab() === 'privacidade') {
        <article class="rm-legal-card rm-page">
          <section class="rm-legal-section">
            <h2>1. Quem somos e o que coletamos</h2>
            <p><strong>Controlador:</strong> RemindMe — contato <a href="mailto:privacidade@remindme.com">privacidade@remindme.com</a>.</p>
            <p>Coletamos apenas o mínimo necessário para o funcionamento local: <strong>nome, e-mail, tarefas, ideias, preferências de tema</strong> e contadores de uso do assistente. Nada é enviado a servidores externos — tudo permanece no seu navegador via <code>localStorage</code> criptografado pelo próprio navegador.</p>
          </section>

          <section class="rm-legal-section">
            <h2>2. Finalidade e base legal</h2>
            <ul>
              <li><strong>Execução do serviço</strong> (art. 7º, V): criar e organizar suas tarefas e ideias.</li>
              <li><strong>Consentimento</strong> (art. 7º, I): ao criar conta ou aceitar o uso de armazenamento local.</li>
              <li><strong>Legítimo interesse</strong> (art. 7º, IX): melhorar desempenho, medir uso anônimo e prevenir abuso de quotas.</li>
            </ul>
          </section>

          <section class="rm-legal-section">
            <h2>3. Armazenamento local e cookies</h2>
            <p>Não usamos cookies de rastreamento. Usamos apenas <code>localStorage</code> para: sessão (<code>redmindme_auth_session</code>), tarefas (<code>redmindme_tasks_list</code>), ideias (<code>redmindme_ideas_list</code>), tema e perfil. Você pode limpar a qualquer momento em Configurações do navegador → Limpar dados. Ao limpar, seus dados são removidos permanentemente deste dispositivo.</p>
          </section>

          <section class="rm-legal-section">
            <h2>4. Seus direitos (art. 18)</h2>
            <p>Você pode, a qualquer momento e gratuitamente: confirmar a existência de tratamento, acessar, corrigir, eliminar, solicitar portabilidade, revogar consentimento e peticionar à ANPD.</p>
            <p>Para exercer: envie e-mail para <strong>privacidade@remindme.com</strong> com o assunto “Direitos LGPD” ou use a opção “Limpar dados” no aplicativo. Respondemos em até 15 dias.</p>
          </section>

          <section class="rm-legal-section">
            <h2>5. Segurança e retenção</h2>
            <p>Aplicamos controle de acesso por <code>AuthGuard</code>, validação de expiração de sessão (7 dias) e sanitização de conteúdo contra XSS. Como os dados ficam apenas localmente, a retenção depende do seu dispositivo — recomendamos exportações periódicas. Não compartilhamos dados com terceiros.</p>
          </section>

          <section class="rm-legal-section">
            <h2>6. Encarregado (DPO)</h2>
            <p>Encarregado: Stefano — <a href="mailto:privacidade@remindme.com">privacidade@remindme.com</a>.</p>
          </section>

          <section class="rm-legal-section rm-legal-section--muted">
            <p>Esta política pode ser atualizada para refletir melhorias. A versão vigente é sempre esta, com data no topo.</p>
          </section>
        </article>
      } @else {
        <article class="rm-legal-card rm-page">
          <section class="rm-legal-section">
            <h2>1. Aceitação</h2>
            <p>Ao criar conta ou usar o RemindMe, você concorda com estes Termos e com a Política de Privacidade acima.</p>
          </section>
          <section class="rm-legal-section">
            <h2>2. Contas e uso</h2>
            <p>Você é responsável por manter sua senha segura. É vedado uso para atividades ilícitas, engenharia reversa ou sobrecarga do armazenamento local.</p>
          </section>
          <section class="rm-legal-section">
            <h2>3. Planos</h2>
            <p><strong>Free:</strong> 8 tarefas, 4 ideias, 3 consultas IA/dia. <strong>Pro:</strong> ilimitado. A simulação de pagamento é local e não processa cobrança real nesta versão de demonstração.</p>
          </section>
          <section class="rm-legal-section">
            <h2>4. Propriedade intelectual</h2>
            <p>Interface, marca e código são de titularidade do RemindMe. Seu conteúdo (tarefas e ideias) permanece seu.</p>
          </section>
          <section class="rm-legal-section">
            <h2>5. Limitações</h2>
            <p>Serviço fornecido “como está”, sem garantia de disponibilidade contínua. Não nos responsabilizamos por perda de dados por limpeza do navegador.</p>
          </section>
          <section class="rm-legal-section">
            <h2>6. Contato</h2>
            <p>Dúvidas sobre os Termos: <a href="mailto:contato@remindme.com">contato@remindme.com</a>.</p>
          </section>
        </article>
      }

      <p class="rm-legal-foot">
        RemindMe • Produto demonstrativo para fins acadêmicos e de avaliação — sem processamento de pagamentos reais nesta versão.
      </p>
    </div>
  `,
  styles: [`
    .rm-legal-page { max-width: 860px; margin: 0 auto; padding: 32px 24px 64px; display: flex; flex-direction: column; gap: 24px; }
    .rm-legal-back { display: inline-flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 500; color: var(--rm-text-secondary); align-self: flex-start; &:hover{ color: var(--rm-text-primary); } }
    .rm-legal-hero { display: flex; flex-direction: column; gap: 12px; padding-bottom: 8px; border-bottom: 1px solid var(--rm-border-subtle); }
    .rm-legal-badge { display: inline-flex; align-self: flex-start; font-size: 10px; font-weight: 700; letter-spacing: 0.08em; color: var(--rm-accent); background: var(--rm-accent-light); border: 1px solid rgba(99,102,241,0.22); padding: 4px 8px; border-radius: 999px; }
    .rm-legal-title { font-family: var(--rm-font-display); font-size: 36px; font-weight: 800; letter-spacing: -0.03em; line-height: 1.05; color: var(--rm-text-primary); @media(max-width:640px){ font-size: 28px; } }
    .rm-legal-subtitle { font-size: 14px; color: var(--rm-text-secondary); line-height: 1.55; max-width: 640px; }
    .rm-legal-tabs { display: flex; gap: 8px; margin-top: 8px; }
    .rm-legal-tab { padding: 8px 16px; font-size: 13px; font-weight: 600; border-radius: 999px; border: 1px solid var(--rm-border-base); background: var(--rm-bg-hover); color: var(--rm-text-secondary); transition: all 0.16s; &.active{ background: var(--rm-accent); color: #fff; border-color: var(--rm-accent); } }
    .rm-legal-card { background: var(--rm-bg-surface); border: 1.5px solid var(--rm-border-base); border-radius: 20px; padding: 28px; display: flex; flex-direction: column; gap: 24px; box-shadow: 0 8px 24px rgba(0,0,0,0.04); @media(max-width:640px){ padding: 20px; } }
    .rm-legal-section { display: flex; flex-direction: column; gap: 8px; h2{ font-family: var(--rm-font-display); font-size: 16px; font-weight: 700; letter-spacing: -0.015em; color: var(--rm-text-primary); } p, li{ font-size: 13.5px; line-height: 1.65; color: var(--rm-text-secondary); } ul{ padding-left: 18px; display: flex; flex-direction: column; gap: 6px; } a{ color: var(--rm-accent); text-decoration: underline; text-underline-offset: 2px; } code{ font-family: var(--rm-font-mono); font-size: 11.5px; background: var(--rm-bg-hover); border: 1px solid var(--rm-border-subtle); padding: 1px 6px; border-radius: 6px; } }
    .rm-legal-section--muted { background: var(--rm-bg-canvas); border: 1px solid var(--rm-border-subtle); border-radius: 12px; padding: 14px 16px; }
    .rm-legal-foot { font-size: 11.5px; color: var(--rm-text-muted); text-align: center; padding-top: 8px; border-top: 1px solid var(--rm-border-subtle); }
  `]
})
export class LegalComponent {
  readonly tab = signal<'privacidade' | 'termos'>('privacidade');
}
