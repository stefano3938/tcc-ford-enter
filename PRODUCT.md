# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users
Primary audience: the TCC evaluation panel (Ford Enter) watching a live demo. They judge polish, coherence and whether the product reads as a real, professional app. Users in the product itself are fictional; all data is mock.

## Product Purpose
RemindMe organizes tasks, captures ideas and uses an AI assistant to turn ideas into next steps. Success for this phase: the public site and demo look professional and credible in front of the panel.

## Positioning
Tasks and ideas live in one place, and the assistant converts an idea into actionable tasks with one click (capture → organize → execute with AI).

## Operating Context
- Public pages: /home, /recursos, /como-funciona, /demonstracao, /planos, /login, /privacidade, /termos.
- App (behind auth guard): /dashboard (Kanban + list), /ai-assistant.
- Angular 20 standalone, OnPush, plain CSS, tokens `--rm-*` in `src/styles.css`, i18n PT/EN/ES via `I18nService`.

## Capabilities and Constraints
- Free and Pro plans exist in copy (`plan.*` keys); limits come from i18n values.
- Auth is simulated (includes a mock Google account picker).
- Project rules in AGENTS.md are binding (.rm-page container, 320px, i18n in 3 languages, hover guarded by media query, 44px targets).

## Brand Commitments
- Name: RemindMe.
- Palette must be blue-led. The previous neon purple/indigo is explicitly rejected by the owner.
- Owner wants to be asked before any drastic change.
- Owner likes the particle field on Google Antigravity's homepage as a hero reference.

## Evidence on Hand
No real testimonials, customers, metrics or press. Do not fabricate any.

## Product Principles
1. Looks like a shipped product, not a school exercise.
2. Calm and focused: the product is about focus, the interface should not shout.
3. The AI is a helper inside the workflow, not the whole identity.
