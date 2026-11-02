import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import PanelSection from '../PanelSection.vue'

function mountPanel(isEmpty = false) {
  return mount(PanelSection, {
    props: { title: 'Program', isEmpty, emptyMessage: 'Nothing here yet.' },
    slots: { default: '<p class="content">Body</p>' },
  })
}

describe('PanelSection', () => {
  it('renders the title as a level-two heading', () => {
    expect(mountPanel().get('h2').text()).toBe('Program')
  })

  it('labels the section with its heading', () => {
    const w = mountPanel()
    expect(w.get('section').attributes('aria-labelledby')).toBe(w.get('h2').attributes('id'))
  })

  it('places the slot content inside the scrollable body', () => {
    expect(mountPanel().get('.panel-body .content').text()).toBe('Body')
  })

  it('shows the empty message instead of the content when empty', () => {
    const w = mountPanel(true)
    expect(w.get('.panel-body').text()).toBe('Nothing here yet.')
    expect(w.find('.content').exists()).toBe(false)
  })

  it('does not show the empty message when there is content', () => {
    expect(mountPanel(false).text()).not.toContain('Nothing here yet.')
  })
})
