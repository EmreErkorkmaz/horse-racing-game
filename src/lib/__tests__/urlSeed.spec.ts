import { describe, expect, it } from 'vitest'
import { parseSeed, randomSeed, resolveUrlSeed } from '../urlSeed'

describe('parseSeed', () => {
  it.each([
    ['42', 42],
    ['0', 0],
    ['4294967295', 4294967295],
  ])('accepts %s', (value, seed) => {
    expect(parseSeed(value)).toBe(seed)
  })

  it.each([null, '', 'abc', '-1', '1.5', '4294967296', '12abc'])('rejects %s', (value) => {
    expect(parseSeed(value)).toBeNull()
  })
})

describe('resolveUrlSeed', () => {
  const random = () => 7

  it('uses a valid seed from the URL and keeps the URL as is', () => {
    const { seed, url } = resolveUrlSeed(new URL('https://example.test/?seed=42'), random)
    expect(seed).toBe(42)
    expect(url.search).toBe('?seed=42')
  })

  it('draws a new seed and writes it to the URL when none is given', () => {
    const { seed, url } = resolveUrlSeed(new URL('https://example.test/?lang=en#top'), random)
    expect(seed).toBe(7)
    expect(url.searchParams.get('seed')).toBe('7')
    expect(url.searchParams.get('lang')).toBe('en')
    expect(url.hash).toBe('#top')
  })

  it('replaces an invalid seed with a new one', () => {
    const { seed, url } = resolveUrlSeed(new URL('https://example.test/?seed=oops'), random)
    expect(seed).toBe(7)
    expect(url.searchParams.get('seed')).toBe('7')
  })

  it('does not modify the given URL object', () => {
    const original = new URL('https://example.test/')
    resolveUrlSeed(original, random)
    expect(original.search).toBe('')
  })
})

describe('randomSeed', () => {
  it('returns a whole number the seed parser accepts', () => {
    for (let i = 0; i < 20; i++) {
      const seed = randomSeed()
      expect(parseSeed(String(seed))).toBe(seed)
    }
  })
})
