import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import RaceTrack from '../RaceTrack.vue'
import RaceLane from '../RaceLane.vue'
import HorseIconSymbol from '../HorseIconSymbol.vue'
import { horses, progress, rounds } from './fixtures'

const round = rounds[0]!

describe('RaceTrack', () => {
  it('shows an empty state without an active round', () => {
    const w = mount(RaceTrack, { props: { round: null, horses, progress: [] } })
    expect(w.findComponent(RaceLane).exists()).toBe(false)
    expect(w.get('.track-label').text()).toContain('Generate a program')
  })

  it('labels the track with the round', () => {
    const w = mount(RaceTrack, { props: { round, horses, progress } })
    expect(w.get('.track-label').text()).toBe('Round 1 - 1200m')
    expect(w.get('section').attributes('aria-label')).toBe('Race track')
  })

  it('renders one lane per runner in lane order', () => {
    const w = mount(RaceTrack, { props: { round, horses, progress } })
    const lanes = w.findAllComponents(RaceLane)
    expect(lanes.map((l) => l.props('lane'))).toEqual([1, 2, 3])
    expect(lanes.map((l) => l.props('horse').id)).toEqual([3, 1, 4])
  })

  it('passes covered / distance as the lane fraction', () => {
    const w = mount(RaceTrack, { props: { round, horses, progress } })
    const lanes = w.findAllComponents(RaceLane)
    expect(lanes.map((l) => l.props('fraction'))).toEqual([0.5, 0.25, 1])
    expect(lanes.map((l) => l.props('finished'))).toEqual([false, false, true])
    expect(lanes[0]!.get<HTMLElement>('.runner').element.style.transform).toBe('translateX(50%)')
  })

  it('starts runners without progress at the gate', () => {
    const w = mount(RaceTrack, { props: { round, horses, progress: [] } })
    expect(w.findAllComponents(RaceLane).map((l) => l.props('fraction'))).toEqual([0, 0, 0])
  })

  it('defines the horse symbol exactly once', () => {
    const w = mount(RaceTrack, { props: { round, horses, progress } })
    expect(w.findAllComponents(HorseIconSymbol)).toHaveLength(1)
    expect(w.findAll('symbol')).toHaveLength(1)
  })

  it('shows a finish line', () => {
    const w = mount(RaceTrack, { props: { round, horses, progress } })
    expect(w.find('.finish-line').exists()).toBe(true)
  })

  it('only animates the gallop while running', async () => {
    const w = mount(RaceTrack, { props: { round, horses, progress, running: false } })
    expect(w.get('.track').classes()).not.toContain('is-running')
    await w.setProps({ running: true })
    expect(w.get('.track').classes()).toContain('is-running')
  })
})
