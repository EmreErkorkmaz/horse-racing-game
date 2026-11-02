# Horse Racing Game

Vue 3 + TypeScript + Pinia horse racing simulation. Built test-first.

## Architecture

```
src/
  config/game.ts      Game rules (horse counts, round distances, speeds). Single source for rules.
  domain/             Pure TypeScript, no Vue imports. Types, RNG, horse/schedule generation, race engine.
  stores/game.ts      Pinia store: game status machine, horses, program, results, live lane progress.
  features/           One folder per screen section; each holds its components, helpers and specs.
    header/           AppHeader: horse count, speed, Generate Program, Start/Pause.
    stable/           HorseList.
    track/            RaceTrack, RaceLane, horse icon, gallop phase, requestAnimationFrame race loop.
    program/          ProgramPanel and its table helper.
    results/          ResultsPanel, RoundResultModal and their table helper.
  shared/             Used by more than one section: GameLayout, PanelSection, RoundTable, HorseSwatch,
                      formatting, view-model types, horse lookup, URL seed.
  App.vue             Container: reads the store, passes props, handles emits.
```

Rules:
- `domain/` never imports from Vue, Pinia, `features/` or `shared/`.
- Code in `features/` and `shared/` never imports the store; only `App.vue` does. Components get data via props and send intent via emits.
- A feature folder never imports from another feature folder; shared code goes to `shared/`.
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
