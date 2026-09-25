# RemindMe — regras para agentes

Angular 20, standalone components, `ChangeDetectionStrategy.OnPush`, SCSS-free (CSS puro).
Tokens de cor/espaço/tipografia vivem em `src/styles.css` como `--rm-*`. **Não invente cor, raio ou sombra nova.**
O sistema visual (paleta azul, Geist, filetes, campo de partículas) está descrito em `DESIGN.md`. **Nada de roxo/violeta.** Tons de azul derivados usam `rgba(var(--rm-accent-rgb), a)`.

## Layout: o container `.rm-page` é obrigatório

Qualquer página pública (home, planos, legal) **precisa** placing its content in `.rm-page`:

```html
<div class="rm-page"> ...conteúdo... </div>
```

Ele é quem garante a margem lateral e a largura máxima de leitura. Sem ele, o conteúdo gruda na borda do viewport — foi exatamente o bug na página de planos.

- `--rm-page`: `max-width: 1100px`, `padding-inline: clamp(16px, 4vw, 32px)`, centralizado
- `--rm-page > * + *`: respiro vertical automático entre seções
- Seções dentro dela **não** repetem `max-width` nem `margin: 0 auto`
- Aplica `rm-page` por **seção**, não na página inteira: o header sticky precisa sair dela

Regra: se você cria uma página e a lateral está colada, a falta é `.rm-page`.

## Espaçamento

- Use a escala já existente. Não invente `padding: 37px`
- Ritmo vertical: `clamp(32px, 5vw, 56px)` entre seções, `16–24px` dentro de um bloco
- Mais espaço **acima** de um título do que abaixo
- Alvo de toque mínimo **44×44px**. Item pequeno usa pseudo-elemento `::after` para ampliar a área sem mudar o visual

## Responsividade — regras que evitam os bugs recorrentes

1. **Nunca fixe largura em `px` num filho de flex.** Filho flex tem `min-width: auto` por padrão; um neto largo impede a coluna de encolher. Use `width: 100%; min-width: 0`.
2. **Tipografia fluida com `clamp()`**, não media query por breakpoint: `clamp(24px, 4vw, 36px)`. Nunca `min-height` fixo num título — o texto quebrado deixa buraco.
3. **Grid responsivo:** `repeat(auto-fit, minmax(260px, 1fr))` ou 3→2→1 colunas. Evite `grid-auto-rows: minheight(...)` em mobile.
4. **`svh`, não `vh`**, em página de conteúdo (evita salto quando a barra do navegador recolhe). `dvh` só em shell de app.
5. **Toda tabela** precisa de wrapper com `overflow-x: auto`. Tabela sem wrapper estoura o viewport no celular.
6. **Teste em 320px.** Não é exagero: 320 é onde o flex trava. Verifique `document.documentElement.scrollWidth === clientWidth` — se diferir, há overflow.

## Mobile nativo

- `-webkit-tap-highlight-color: transparent` está global; **todo elemento tocável precisa de `:active`**
- **Nenhum `:hover` sem `@media (hover: hover) and (pointer: fine)`** — no toque, o hover gruda após o tap
- Input com `font-size: 16px` no mínimo, senão o iOS dá zoom
- Nunca `user-scalable=no` nem `maximum-scale=1`
- Respeite `prefers-reduced-motion`
- Header/bottom bar: `padding` com `env(safe-area-inset-*)`

## Acessibilidade

- Botão só com ícone **precisa** de `aria-label`
- Foco visível em tudo que recebe teclado
- Dropdown/menu: `aria-expanded`, `aria-controls`, fecha com `Esc` e clique fora
- Ícone decorativo: `aria-hidden="true"`

## Idiomas

Todo texto visível passa por `i18n.t('chave')` — exceto dados de demonstração e mockup (esses são conteúdo, não interface).

- Novas strings vão em **PT, EN e ES** no `src/app/core/services/i18n.service.ts`. Chave faltando em EN/ES = bug.
- Sem interpolação manual nos templates: use `i18n.t('chave', { valor })`
- Não use os pipes `uppercase`/`lowercase` do Angular; use `text-transform` no CSS

## Rotas

Português. Se renomear uma rota, **mantenha a antiga como `redirectTo`** — link compartilhado e favorito não podem quebrar.

## Antes de dizer que terminou

1. `ng build` (dev **e** production) sem erro nem warning novo
2. `scrollWidth === clientWidth` em 320/390/768
3. Zero texto em português quando o idioma está em EN
4. Nada de `TODO` no código entregue
