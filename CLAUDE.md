# Horse Racing Game

Vue 3 + TypeScript + Pinia horse racing simulation. Built test-first.

## Architecture

```
src/
  config/game.ts      Game rules (horse counts, round distances, speeds). Single source for rules.
  domain/             Pure TypeScript, no Vue imports. Types, RNG, horse/schedule generation, race engine.
  stores/game.ts      Pinia store: game status machine, horses, program, results, live lane progress.
  composables/        Vue glue (requestAnimationFrame race loop).
  lib/                Framework-free browser helpers (URL seed).
  components/         Presentational components: data in via props, intent out via emits. No store access.
  App.vue             Container: reads the store, passes props, handles emits.
```

Rules:
- `domain/` never imports from Vue, Pinia or components.
- Components never import the store; only `App.vue` does.
- Every rule value comes from `config/game.ts`, never a literal in code.
- Randomness always goes through an injected `Rng` (seeded), never `Math.random()` directly.

## Conventions

- TDD: write the failing test first, then the implementation. Commit test and implementation separately when practical (`test:` then `feat:`), Conventional Commits.
- Unit and component tests live in `__tests__/` next to the code (`*.spec.ts`), run with Vitest + Vue Test Utils.
- E2E and visual tests live in `e2e/`, run with Playwright against the production build.
- Code comments are in English and written as documentation (JSDoc on exports). No first or second person ("we", "you").
- Do not mention any company name in code, docs or commit messages.
- Performance: animate with `transform` only; keep per-frame state separate from table data so tables do not re-render every frame. No UI libraries, no web fonts.

## Commands

- `npm run test:unit` / `npm run test:watch`
- `npm run test:e2e`
- `npm run type-check`, `npm run lint`, `npm run build`
