import { onScopeDispose, toValue, watch, type MaybeRefOrGetter } from 'vue'
import { GAME_CONFIG } from '@/config/game'

/** Frame scheduling functions; `requestAnimationFrame` in the browser. */
export interface FrameScheduler {
  request(callback: FrameRequestCallback): number
  cancel(id: number): void
}

const browserScheduler: FrameScheduler = {
  request: (callback) => requestAnimationFrame(callback),
  cancel: (id) => cancelAnimationFrame(id),
}

/**
 * Calls `onFrame` once per animation frame while `active` is true, with the
 * wall-clock milliseconds elapsed since the previous frame.
 *
 * - The first frame after (re)activation only records the time, so time spent
 *   inactive (paused, between rounds) is never reported.
 * - A gap longer than `GAME_CONFIG.race.maxFrameMs` is cut to that value, so a
 *   tab returning from the background does not jump the race ahead.
 * - Browsers stop animation frames in hidden tabs, so the loop costs nothing
 *   there.
 *
 * The loop knows nothing about the game; the caller decides what a frame does.
 * It stops when the owning component or effect scope is disposed.
 *
 * @param active Whether frames should run, e.g. `() => store.status === 'running'`.
 * @param onFrame Receives the elapsed milliseconds of each frame.
 * @param scheduler Frame scheduling functions; replaced by a fake in tests.
 */
export function useRaceLoop(
  active: MaybeRefOrGetter<boolean>,
  onFrame: (deltaMs: number) => void,
  scheduler: FrameScheduler = browserScheduler,
): void {
  let frameId: number | null = null
  let lastTime: number | null = null

  function loop(time: number): void {
    if (lastTime !== null) {
      onFrame(Math.min(time - lastTime, GAME_CONFIG.race.maxFrameMs))
    }
    lastTime = time
    frameId = scheduler.request(loop)
  }

  function start(): void {
    if (frameId !== null) return
    lastTime = null
    frameId = scheduler.request(loop)
  }

  function stop(): void {
    if (frameId === null) return
    scheduler.cancel(frameId)
    frameId = null
  }

  watch(
    () => toValue(active),
    (isActive) => (isActive ? start() : stop()),
    { immediate: true },
  )
  onScopeDispose(stop)
}
