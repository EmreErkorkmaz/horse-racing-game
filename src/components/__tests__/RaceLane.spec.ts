import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import RaceLane from '../RaceLane.vue'
import HorseIcon from '../HorseIcon.vue'
import { gallopPhase } from '../gallop'
import { horses } from './fixtures'

const horse = horses[0]!

function mountLane(fraction: number, finished = false) {
  return mount(RaceLane, { props: { lane: 3, horse, fraction, finished } })
}

describe('RaceLane', () => {
  it('shows the lane number', () => {
    expect(mountLane(0).get('.lane-number').text()).toBe('3')
  })

  it('names lane and horse for assistive technology', () => {
    expect(mountLane(0).get('li').attributes('aria-label')).toBe('Lane 3: #1 Ada Lovelace')
  })

  it('draws the horse in its color with its number', () => {
    const w = mountLane(0)
    expect(w.getComponent(HorseIcon).props('color')).toBe('#e53935')
    expect(w.get('.runner-number').text()).toBe('1')
  })

  it.each([
    [0, 'translateX(0%)'],
    [0.5, 'translateX(50%)'],
    [1, 'translateX(100%)'],
  ])('positions the runner with a transform for fraction %s', (fraction, transform) => {
    const runner = mountLane(fraction).get<HTMLElement>('.runner')
    expect(runner.element.style.transform).toBe(transform)
    expect(runner.element.style.left).toBe('')
    expect(runner.element.style.width).toBe('')
  })

  it('updates only the transform when the fraction changes', async () => {
    const w = mountLane(0.25)
    await w.setProps({ fraction: 0.75 })
    expect(w.get<HTMLElement>('.runner').element.style.transform).toBe('translateX(75%)')
  })

  it('gives the runner its own gallop phase, so horses do not bob in unison', () => {
    const runner = mountLane(0.5).get<HTMLElement>('.runner')
    expect(runner.element.style.getPropertyValue('--gallop-phase')).toBe(
      String(gallopPhase(horse.id)),
    )
  })

  it('draws one ground shadow under the runner', () => {
    expect(mountLane(0.5).get('.runner').findAll('[data-test="runner-shadow"]')).toHaveLength(1)
  })

  it('marks a finished runner', () => {
    expect(mountLane(1, true).get('.runner').classes()).toContain('is-finished')
    expect(mountLane(0.5).get('.runner').classes()).not.toContain('is-finished')
  })
})
