import { describe, expect, it } from 'vitest'
import type { TftChampion, TftTrait } from '../shared/types'
import { computeTraits } from '../app/utils/tft'

const trait = (name: string, mins: number[]): TftTrait => ({
  apiName: name,
  name,
  icon: null,
  intro: '',
  breakpoints: mins.map((min, i) => ({ min, max: min, style: i * 2 + 1, text: '' })),
})

const champ = (apiName: string, traits: string[]): TftChampion => ({
  apiName,
  name: apiName,
  cost: 1,
  traits,
  role: null,
  icon: null,
  ability: { name: '', desc: '', icon: null },
  stats: {},
})

describe('computeTraits', () => {
  const traits = [trait('Fae', [2, 4]), trait('Hunter', [3])]

  it('activates the highest breakpoint reached', () => {
    const team = [champ('a', ['Fae']), champ('b', ['Fae']), champ('c', ['Fae']), champ('d', ['Fae'])]
    const fae = computeTraits(team, traits).find((r) => r.trait.name === 'Fae')!
    expect(fae.count).toBe(4)
    expect(fae.tier).toBe(1)
  })

  it('reports a trait below its first breakpoint as inactive', () => {
    const hunter = computeTraits([champ('a', ['Hunter'])], traits)[0]!
    expect(hunter.tier).toBe(-1)
  })

  it('sorts active traits before inactive ones', () => {
    const team = [champ('a', ['Hunter']), champ('b', ['Fae']), champ('c', ['Fae'])]
    const names = computeTraits(team, traits).map((r) => r.trait.name)
    expect(names).toEqual(['Fae', 'Hunter'])
  })

  it('ignores traits that are not in the data', () => {
    expect(computeTraits([champ('a', ['Mystery'])], traits)).toEqual([])
  })
})
