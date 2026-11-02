import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import AppHeader from '../AppHeader.vue'
import { GAME_CONFIG } from '@/config/game'
import type { GameStatus } from '@/domain/types'

function mountHeader(status: GameStatus, horseCount = 20, speed = 1) {
  return mount(AppHeader, { props: { status, horseCount, speed: speed as 1 | 2 | 4 } })
}

const startButton = (w: ReturnType<typeof mountHeader>) => w.get('[data-test="toggle"]')
const generateButton = (w: ReturnType<typeof mountHeader>) => w.get('[data-test="generate"]')
const countInput = (w: ReturnType<typeof mountHeader>) =>
  w.get<HTMLInputElement>('[data-test="horse-count"]')

describe('AppHeader', () => {
  it('renders the title', () => {
    expect(mountHeader('idle').get('h1').text()).toBe('Horse Racing')
  })

  it.each([
    ['idle', 'Start', true, false],
    ['ready', 'Start', false, false],
    ['running', 'Pause', false, true],
    ['paused', 'Resume', false, false],
    ['roundFinished', 'Start', true, true],
    ['finished', 'Start', true, false],
  ] as const)(
    'in %s: toggle label %s, toggle disabled %s, generate disabled %s',
    (status, label, toggleDisabled, generateDisabled) => {
      const w = mountHeader(status)
      expect(startButton(w).text()).toBe(label)
      expect(startButton(w).attributes('disabled')).toBe(toggleDisabled ? '' : undefined)
      expect(generateButton(w).attributes('disabled')).toBe(generateDisabled ? '' : undefined)
    },
  )

  it('emits generate and toggle on click', async () => {
    const w = mountHeader('ready')
    await generateButton(w).trigger('click')
    await startButton(w).trigger('click')
    expect(w.emitted('generate')).toHaveLength(1)
    expect(w.emitted('toggle')).toHaveLength(1)
  })

  describe('horse count input', () => {
    it('shows the current count with limits from the config', () => {
      const input = countInput(mountHeader('idle', 12))
      expect(input.element.value).toBe('12')
      expect(input.attributes('min')).toBe(String(GAME_CONFIG.minHorseCount))
      expect(input.attributes('max')).toBe(String(GAME_CONFIG.maxHorseCount))
    })

    it('has an accessible label', () => {
      const w = mountHeader('idle')
      const id = countInput(w).attributes('id')
      expect(w.get(`label[for="${id}"]`).text()).toContain('Horses')
    })

    it('emits update:horseCount with a number on change', async () => {
      const w = mountHeader('idle')
      await countInput(w).setValue('8')
      expect(w.emitted('update:horseCount')).toEqual([[8]])
    })

    it('clamps out-of-range and fractional values', async () => {
      const w = mountHeader('idle')
      await countInput(w).setValue('99')
      await countInput(w).setValue('0')
      await countInput(w).setValue('5.7')
      expect(w.emitted('update:horseCount')).toEqual([
        [GAME_CONFIG.maxHorseCount],
        [GAME_CONFIG.minHorseCount],
        [5],
      ])
    })

    it('ignores an empty value and restores the current count', async () => {
      const w = mountHeader('idle', 12)
      await countInput(w).setValue('')
      expect(w.emitted('update:horseCount')).toBeUndefined()
      expect(countInput(w).element.value).toBe('12')
    })

    it.each(['running', 'paused', 'roundFinished'] as const)('is disabled while %s', (status) => {
      expect(countInput(mountHeader(status)).attributes('disabled')).toBe('')
    })

    it.each(['idle', 'ready', 'finished'] as const)('is enabled in %s', (status) => {
      expect(countInput(mountHeader(status)).attributes('disabled')).toBeUndefined()
    })
  })

  describe('speed selector', () => {
    it('offers every configured multiplier and checks the current one', () => {
      const w = mountHeader('running', 20, 2)
      const radios = w.findAll<HTMLInputElement>('input[type="radio"]')
      expect(radios.map((r) => r.element.value)).toEqual(GAME_CONFIG.speedMultipliers.map(String))
      expect(radios.map((r) => r.element.checked)).toEqual([false, true, false])
      expect(w.get('fieldset legend').text()).toBe('Speed')
    })

    it('emits update:speed with a number', async () => {
      const w = mountHeader('running')
      await w.findAll('input[type="radio"]')[2]!.setValue(true)
      expect(w.emitted('update:speed')).toEqual([[4]])
    })
  })
})
