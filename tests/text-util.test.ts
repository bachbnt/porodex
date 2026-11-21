import { describe, expect, it } from 'vitest'
import { normalize, sample, shuffle } from '../app/utils/text'

describe('normalize', () => {
  it('strips Vietnamese diacritics and đ', () => {
    expect(normalize('Đấu Sĩ')).toBe('dau si')
    expect(normalize('  Thuật Sư ')).toBe('thuat su')
  })
})

describe('shuffle / sample', () => {
  it('keeps every element and does not mutate the input', () => {
    const input = [1, 2, 3, 4, 5]
    const out = shuffle(input)
    expect([...out].sort()).toEqual(input)
    expect(input).toEqual([1, 2, 3, 4, 5])
  })

  it('samples at most n distinct items', () => {
    const out = sample([1, 2, 3], 5)
    expect(out).toHaveLength(3)
    expect(new Set(out).size).toBe(3)
  })
})
