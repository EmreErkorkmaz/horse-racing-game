import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import type { RoundResult } from '@/domain/types'
import RoundResultModal from '../RoundResultModal.vue'
import RoundTable from '@/shared/RoundTable.vue'
import { horses, results, rounds } from '@/shared/__tests__/fixtures'

/** Both fixture rounds finished; the second one is the latest. */
const twoResults: RoundResult[] = [
  ...results,
  {
    roundIndex: 1,
    placements: [
      { position: 1, horseId: 2, finishTime: 82340 },
      { position: 2, horseId: 1, finishTime: 83105 },
      { position: 3, horseId: 4, finishTime: 84990 },
      { position: 4, horseId: 3, finishTime: 86020 },
    ],
  },
]

function mountModal(
  props: Partial<{ open: boolean; results: RoundResult[]; isLastRound: boolean }>,
) {
  return mount(RoundResultModal, {
    props: { open: true, rounds, horses, results: twoResults, isLastRound: false, ...props },
    attachTo: document.body,
  })
}

/** jsdom does not implement the modal dialog API; these stand-ins toggle the `open` attribute. */
beforeEach(() => {
  HTMLDialogElement.prototype.showModal = vi.fn<(this: HTMLDialogElement) => void>(function (
    this: HTMLDialogElement,
  ) {
    this.setAttribute('open', '')
  })
  HTMLDialogElement.prototype.close = vi.fn<(this: HTMLDialogElement) => void>(function (
    this: HTMLDialogElement,
  ) {
    this.removeAttribute('open')
  })
})

afterEach(() => {
  document.body.innerHTML = ''
})

describe('RoundResultModal', () => {
  it('opens only after its content is rendered, so autofocus finds the action button', async () => {
    let buttonPresentOnOpen = false
    HTMLDialogElement.prototype.showModal = vi.fn<(this: HTMLDialogElement) => void>(function (
      this: HTMLDialogElement,
    ) {
      buttonPresentOnOpen = this.querySelector('[data-test="next-round"]') !== null
      this.setAttribute('open', '')
    })
    // The first round result and the open flag arrive in the same update.
    const w = mountModal({ open: false, results: [] })
    await w.setProps({ open: true, results })
    expect(buttonPresentOnOpen).toBe(true)
  })

  it('opens as a modal dialog when open and closes when no longer open', async () => {
    const w = mountModal({ open: true })
    expect(w.get('dialog').attributes('open')).toBe('')
    await w.setProps({ open: false })
    expect(w.get('dialog').attributes('open')).toBeUndefined()
  })

  it('stays closed while not open', () => {
    const w = mountModal({ open: false })
    expect(w.get('dialog').attributes('open')).toBeUndefined()
  })

  it('names the finished round and its winner', () => {
    const w = mountModal({})
    expect(w.get('h2').text()).toBe('Round 2 - 1400m finished')
    expect(w.get('[data-test="winner"]').text()).toContain('Grace Hopper')
  })

  it('shows the winning time next to the winner', () => {
    const w = mountModal({})
    expect(w.get('[data-test="winner"]').text()).toContain('Grace Hopper · 1:22.34')
  })

  it('shows every finishing time in the latest and the earlier rounds', () => {
    const w = mountModal({})
    const tables = w.findAllComponents(RoundTable)
    expect(tables).toHaveLength(2)
    expect(tables.map((table) => table.props('showTime'))).toEqual([true, true])
  })

  it('titles each earlier round with its winning time', () => {
    const summary = mountModal({}).get('details summary').text()
    expect(summary).toContain('Linus Torvalds')
    expect(summary).toContain('1:11.25')
  })

  it('shows every placement of the latest round', () => {
    const w = mountModal({})
    const latest = w.get('[data-test="latest-round"]').getComponent(RoundTable)
    expect(latest.props('round')).toEqual(rounds[1])
    expect(latest.props('entries').map((e) => [e.position, e.horse.id])).toEqual([
      [1, 2],
      [2, 1],
      [3, 4],
      [4, 3],
    ])
  })

  it('lists earlier rounds as collapsed sections titled with their winner', () => {
    const w = mountModal({})
    const sections = w.findAll('details')
    expect(sections).toHaveLength(1)
    expect(sections[0]!.attributes('open')).toBeUndefined()
    expect(sections[0]!.get('summary').text()).toContain('Round 1 - 1200m')
    expect(sections[0]!.get('summary').text()).toContain('Linus Torvalds')
    expect(sections[0]!.getComponent(RoundTable).props('round')).toEqual(rounds[0])
  })

  it('has no earlier rounds section after the first round', () => {
    expect(mountModal({ results }).findAll('details')).toHaveLength(0)
  })

  it('offers the next round and finishing while rounds remain', async () => {
    const w = mountModal({ isLastRound: false })
    await w.get('[data-test="next-round"]').trigger('click')
    await w.get('[data-test="finish"]').trigger('click')
    expect(w.emitted('next')).toHaveLength(1)
    expect(w.emitted('finish')).toHaveLength(1)
  })

  it('offers only finishing after the last round', () => {
    const w = mountModal({ isLastRound: true })
    expect(w.find('[data-test="next-round"]').exists()).toBe(false)
    expect(w.findAll('button')).toHaveLength(1)
    expect(w.get('[data-test="finish"]').attributes('autofocus')).toBeDefined()
  })

  it('focuses the next round button first while rounds remain', () => {
    const w = mountModal({ isLastRound: false })
    expect(w.get('[data-test="next-round"]').attributes('autofocus')).toBeDefined()
    expect(w.get('[data-test="finish"]').attributes('autofocus')).toBeUndefined()
  })

  it('cannot be dismissed with the Escape key', () => {
    const w = mountModal({})
    const cancel = new Event('cancel', { cancelable: true })
    w.get('dialog').element.dispatchEvent(cancel)
    expect(cancel.defaultPrevented).toBe(true)
  })

  it('reopens itself if the browser closes it while still open', () => {
    const w = mountModal({ open: true })
    const dialog = w.get('dialog').element as HTMLDialogElement
    // Simulates a browser-initiated close, e.g. a repeated Escape press that bypasses `cancel`.
    dialog.close()
    dialog.dispatchEvent(new Event('close'))
    expect(w.get('dialog').attributes('open')).toBe('')
  })

  it('stays closed after closing because it is no longer open', async () => {
    const w = mountModal({ open: true })
    await w.setProps({ open: false })
    w.get('dialog').element.dispatchEvent(new Event('close'))
    expect(w.get('dialog').attributes('open')).toBeUndefined()
  })

  it('opts out of light dismiss and offers no close button', () => {
    const w = mountModal({})
    expect(w.get('dialog').attributes('closedby')).toBe('none')
    expect(w.findAll('button').map((b) => b.text())).toEqual(['Next round', 'Finish'])
  })
})
