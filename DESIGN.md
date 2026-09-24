# RemindMe design system

World: **Swiss particle field**. A calm Swiss-style grid on white (or deep navy in dark mode), one blue, hairline rules, and a live field of blue dashes in the hero that gather into a ring around the cursor. This mirrors what the product does: loose ideas become structured tasks.

## Color

All colors are tokens in `src/styles.css`. There is no purple anywhere; the old indigo/violet palette was removed on purpose.

| Role | Light | Dark |
|---|---|---|
| Canvas `--rm-bg-canvas` | `#ffffff` | `#060910` |
| Surface `--rm-bg-surface` | `#ffffff` | `#0c111c` |
| Ink `--rm-text-primary` | `#0a1020` | `#eef2f9` |
| Secondary `--rm-text-secondary` | `#4a5568` | `#9aa6ba` |
| Accent `--rm-accent` | `#2563eb` | `#2563eb` |
| Accent text `--rm-accent-text` | `#1d4ed8` | `#7aa7ff` |
| AI `--rm-ai-gradient` | navy `#1d4ed8` → sky `#0ea5e9` | same |
| Particles `--rm-particle-1..4` | `#2563eb #3b82f6 #93c5fd #1e3a8a` | `#3b82f6 #60a5fa #93c5fd #1d4ed8` |

- Tints come from `rgba(var(--rm-accent-rgb), a)`; never hard-code a new blue.
- Solid blue is reserved for the **one primary action per viewport**. Everything else is ink, outline or hairline.
- Status colors (`--rm-urgent`, `--rm-done`, …) are unchanged and used only for task state.

## Type

- **Geist** for everything (400–800), **Geist Mono** only for numerals that carry order or measurement (`.rm-num`).
- Page titles: `.rm-page-title`, `clamp(34px, 6vw, 64px)`, weight 700, tracking `-0.035em`, `text-wrap: balance`.
- Lede: `.rm-page-lede`, `clamp(16px, 1.6vw, 18px)`, max 60ch.
- Hero headline: `clamp(38px, 6.2vw, 76px)`, line two in accent.
- No eyebrows or kickers above headings, and no gradient text.

## Shape and depth

- Radii: `--rm-radius-sm 8`, `md 10`, `lg 14`, `xl 16`. Cards use 14–16.
- Structure comes from 1px rules (`--rm-border-base` / `--rm-border-strong`) and a 2px ink rule to open a numbered list.
- Shadows have an offset and a soft blur (`0 14px 32px -16px`). No glow halos and no glass. The only blur is the sticky public header, because the particle field moves beneath it.

## Layout

- Every public section uses `.rm-page` (max 1100px, gutter `clamp(16px, 4vw, 32px)`).
- Inner public pages open with `.rm-page-head` (left aligned) and put the action at the right on desktop.
- Lists of features are ruled columns (`repeat(4) → 2 → 1`), not grids of identical cards.

## Motion

- **Signature:** `<rm-particle-field>` (`src/app/shared/components/particle-field`). It draws on a canvas outside Angular's zone, has three depth planes, and a ghost cursor wanders when there is no pointer. It pauses off-screen and when the tab is hidden. Under `prefers-reduced-motion` it paints a single still frame. Used on the home hero and behind the login card.
- Hero copy enters with fade + 14px rise + blur, 900ms, `--rm-ease-out`. Nothing else on the page has an entrance animation.
- Ease: `--rm-ease-out` = `cubic-bezier(0.16, 1, 0.3, 1)`.

## Components

- `rm-button`: `primary` (solid blue), `outline` (canvas + strong hairline, ink on hover), `secondary`, `subtle`, `ai` (navy→sky), `danger`.
- Public header: centered nav, active link = ink with a 2px blue underline, icon buttons are ghost 36px with 44px hit area.
