# Horse Racing

[![CI](https://github.com/EmreErkorkmaz/horse-racing-game/actions/workflows/ci.yml/badge.svg)](https://github.com/EmreErkorkmaz/horse-racing-game/actions/workflows/ci.yml)

An interactive horse racing simulation built with Vue 3, TypeScript and Pinia.

**Live demo:** _link added after the first deployment_

## Features

The numbers below are the defaults in [`src/config/game.ts`](src/config/game.ts), the single source for every rule; if they ever differ, the config file is right.

- A stable of up to 20 horses, each with a unique name, a unique color and a condition score from 1 to 100.
- **Generate Program** draws a six-round program (1200 m to 2200 m); each round enters 10 different horses in random lane order.
- **Start / Pause / Resume** runs the rounds one after another on an animated ten-lane track.
- After each round a result dialog lists the full finishing order, keeps earlier rounds as collapsible sections titled with their winner, and offers **Next round** or **Finish**.
- The **Results** panel collects the finishing order of every round that was run.
- **Playback speed** of 1x, 2x or 4x.
- **Replayable races:** the page URL carries a seed (`?seed=42`). Reloading or sharing the link replays the same stable, program and race outcomes.
- **Accessible:** keyboard operable, labelled regions, a focus-trapped result dialog, horse numbers on every color swatch (color is never the only cue) and reduced motion support.
- **Responsive:** one column on phones, the track above three panels on tablets and laptops, four columns from 1440 px.

## Assumptions

The specification left a few points open; these are the choices made:

| Topic             | Decision                                                                                                                                                            |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Number of horses  | 20 by default. The header input lowers it to as few as 2. With fewer than 10 horses, every horse runs in every round.                                               |
| Start / Pause     | One button starts the program, pauses the running round and resumes it from the same positions.                                                                     |
| Generate Program  | Draws a new program and resets results and the track. It is unavailable while horses are moving.                                                                    |
| Between rounds    | The game waits in a dialog that cannot be dismissed. **Next round** continues; **Finish** ends the program early and keeps the results of the rounds that were run. |
| Winner of a round | The first horse across the line. Finishing times are interpolated within a simulation step, so two horses never tie.                                                |

## How a race is simulated

Each horse runs at a pace of `14 m/s + up to 4 m/s from condition`. On top of that comes:

- a **form of the day**: up to ±1 m/s, drawn once per round. This is what makes upsets possible;
- a small **per-step variation**: up to ±1.5 m/s. It keeps the motion lively but averages out over a round.

Over many races, a horse with condition 70 beats a horse with condition 60 about two times out of three.

The engine advances in fixed 100 ms simulation steps, independent of the frame rate. The animation loop turns wall-clock time into steps through an accumulator, so the same seed gives the same result on a 30 Hz phone, on a 144 Hz monitor and at any playback speed.

All rules and tuning values live in [`src/config/game.ts`](src/config/game.ts). Changing the number of rounds, the distances or the stable size is a one-line edit.

## Architecture

```
src/
  config/        Game rules and tuning values (single source).
  domain/        Pure TypeScript, no framework imports: types, seeded RNG,
                 stable and program generation, race engine, status rules.
  stores/        Pinia store: the game state machine and its actions.
  composables/   Vue glue: the requestAnimationFrame loop and table helpers.
  lib/           Framework-free browser helpers (URL seed).
  components/    Presentational components: props in, events out, no store access.
  App.vue        The only component that reads the store.
```

- **State machine.** The game is always in one status: `idle → ready → running ⇄ paused → roundFinished → … → finished`. Which actions each status allows is defined once in [`domain/gameRules.ts`](src/domain/gameRules.ts). The store guards and the header controls both read it, so a button is never enabled for an action the store would ignore.
- **Deterministic randomness.** Every random draw goes through one seeded generator (Mulberry32). `Math.random` is not used.
- **Rendering performance.**
  - Horses move with `transform` only, so the browser does not recalculate the layout during the race.
  - The race state lives in a `shallowRef` that changes every frame. The stable, program and results change only when they actually do, so the tables do not re-render during a race.
  - The live progress is read only inside the track slot.
  - The horse silhouette is one inline SVG symbol that every lane reuses.
  - The page uses no UI library and no web fonts.

## Testing

Development was test-first: new behavior lands as a failing `test:` commit followed by the commit that makes it pass.

| Layer      | Tool                    | What it covers                                                                                                                                                           |
| ---------- | ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Unit       | Vitest                  | RNG, stable and program generation, race engine, status rules, store transitions, composables, URL seed                                                                  |
| Component  | Vitest + Vue Test Utils | Every component's props, events, states and accessibility attributes                                                                                                     |
| End to end | Playwright              | The full six-round flow, pause and resume, the keyboard-only dialog, seed replay at different speeds, URL seed rules, stable size, and layout overflow at 375 to 1920 px |

## Getting started

Requires Node.js 22.18+ or 24.12+.

```bash
npm install
npm run dev          # development server
npm run build        # type-check and production build
npm run preview      # serve the production build
```

```bash
npm run test:unit    # unit and component tests
npm run test:e2e     # end-to-end tests against the production build
npm run type-check
npm run lint         # lint and auto-fix (rewrites files)
```

The first end-to-end run needs a browser: `npx playwright install chromium`.

## Continuous integration and deployment

- GitHub Actions runs lint, type-check, unit tests, the build and the end-to-end tests on every push and pull request.
- Every successful CI run for a push to `main` deploys the production build to Cloudflare Pages. Pull requests, including those from forks, never deploy.
- Hashed assets are served with a one-year immutable cache.
