import { afterEach, describe, expect, it, vi } from 'vitest'
import { effectScope, nextTick, ref } from 'vue'
import { useRaceLoop, type FrameScheduler } from '../useRaceLoop'

/** Manually driven stand-in for requestAnimationFrame. */
function fakeScheduler() {
  let pending: FrameRequestCallback | null = null
  let nextId = 0
  const scheduler: FrameScheduler = {
    request: vi.fn<FrameScheduler['request']>((callback) => {
      pending = callback
      return ++nextId
    }),
    cancel: vi.fn<FrameScheduler['cancel']>(() => {
      pending = null
    }),
  }
  return {
    scheduler,
    hasPending: () => pending !== null,
    /** Runs the pending frame callback with the given timestamp. */
    frame(time: number) {
      const callback = pending
      pending = null
      callback?.(time)
    },
  }
}

const scopes: ReturnType<typeof effectScope>[] = []

/** Frame gap cap used by these specs; deliberately unrelated to the game config. */
const MAX_FRAME_MS = 250

function setup(initiallyActive: boolean) {
  const active = ref(initiallyActive)
  const onFrame = vi.fn<(deltaMs: number) => void>()
  const frames = fakeScheduler()
  const scope = effectScope()
  scopes.push(scope)
  scope.run(() =>
    useRaceLoop(active, onFrame, { maxFrameMs: MAX_FRAME_MS, scheduler: frames.scheduler }),
  )
  return { active, onFrame, frames, scope }
}

afterEach(() => {
  for (const scope of scopes.splice(0)) scope.stop()
})

describe('useRaceLoop', () => {
  it('does not request frames while inactive', () => {
    const { frames } = setup(false)
    expect(frames.hasPending()).toBe(false)
  })

  it('uses the first frame as the time baseline and reports elapsed time afterwards', () => {
    const { frames, onFrame } = setup(true)
    frames.frame(1000)
    expect(onFrame).not.toHaveBeenCalled()
    frames.frame(1016)
    frames.frame(1050)
    expect(onFrame.mock.calls).toEqual([[16], [34]])
    expect(frames.hasPending()).toBe(true)
  })

  it('caps a long gap between frames', () => {
    const { frames, onFrame } = setup(true)
    frames.frame(0)
    frames.frame(5000)
    expect(onFrame).toHaveBeenCalledWith(MAX_FRAME_MS)
  })

  it('stops when deactivated and does not count the inactive time on resume', async () => {
    const { active, frames, onFrame } = setup(true)
    frames.frame(0)
    frames.frame(16)
    active.value = false
    await nextTick()
    expect(frames.scheduler.cancel).toHaveBeenCalled()
    expect(frames.hasPending()).toBe(false)

    active.value = true
    await nextTick()
    frames.frame(10_000)
    frames.frame(10_020)
    expect(onFrame.mock.calls).toEqual([[16], [20]])
  })

  it('cancels the pending frame when its scope is disposed', () => {
    const { frames, scope } = setup(true)
    scope.stop()
    expect(frames.scheduler.cancel).toHaveBeenCalled()
    expect(frames.hasPending()).toBe(false)
  })
})
