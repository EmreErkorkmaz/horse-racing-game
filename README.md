# Horse Racing

[![CI](https://github.com/EmreErkorkmaz/horse-racing-game/actions/workflows/ci.yml/badge.svg)](https://github.com/EmreErkorkmaz/horse-racing-game/actions/workflows/ci.yml)

An interactive horse racing simulation built with Vue 3, TypeScript and Pinia.

**Live demo:** https://horse-racing-game.erkorkmazemre77.workers.dev

## Features

The numbers below are the defaults in [`src/config/game.ts`](src/config/game.ts), the single source for every rule; if they ever differ, the config file is right.

- A stable of up to 20 horses, each with a unique name, a unique color and a condition score from 1 to 100.
- **Generate Program** draws a six-round program (1200 m to 2200 m); each round enters 10 different horses in random lane order.
- **Start / Pause / Resume** runs the rounds one after another on an animated ten-lane track.
- After each round a result dialog lists the full finishing order with each horse's race time, keeps earlier rounds as collapsible sections titled with their winner, and offers **Next round** or **Finish**.
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
  features/      One folder per screen section, with its components, helpers and tests:
    header/      horse count, playback speed, Generate Program, Start / Pause
    stable/      horse list
    track/       race track, lanes, gallop animation, animation frame loop
    program/     program panel
    results/     results panel and round result dialog
  shared/        Pieces used by several sections: page layout, panel frame,
                 round table, color swatch, formatting, URL seed.
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

| Layer      | Tool                                                           | What it covers                                                                                                                                                           |
| ---------- | -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Unit       | Vitest                                                         | RNG, stable and program generation, race engine, status rules, store transitions, table helpers, animation loop, URL seed                                                |
| Component  | Vitest + Vue Test Utils                                        | Every component's props, events, states and accessibility attributes                                                                                                     |
| End to end | Playwright                                                     | The full six-round flow, pause and resume, the keyboard-only dialog, seed replay at different speeds, URL seed rules, stable size, and layout overflow at 375 to 1920 px |
| Visual     | Playwright screenshots in the official Playwright Docker image | Initial, program, round result dialog and finished screens at 375, 1280 and 1440 px                                                                                      |

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
npm run test:visual  # screenshot comparison in Docker (same image as CI)
npm run type-check
npm run lint         # lint and auto-fix (rewrites files)
```

The first end-to-end run needs a browser: `npx playwright install chromium`.

Visual tests run inside the official Playwright Docker image, so screenshots render the same on every machine and in CI. They need Docker and run as linux/amd64 to match CI, so the first run (image pull and install, emulated on Apple Silicon) takes several minutes. After an intended UI change, refresh the baselines with `npm run test:visual -- --update-snapshots`.

## Continuous integration and deployment

- GitHub Actions runs lint, type-check, unit tests, the build, the end-to-end tests and the visual tests (inside the Playwright image) on every push and pull request.
- Cloudflare Workers builds every push to `main` (unit tests, type-check, production build) and publishes the static site; a failing build leaves the previous version live.
- Hashed assets are served with a one-year immutable cache.
