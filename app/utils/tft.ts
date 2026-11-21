import type { TftChampion, TftTrait } from '#shared/types'

export const COST_COLORS: Record<number, string> = {
  1: 'var(--cost-1)',
  2: 'var(--cost-2)',
  3: 'var(--cost-3)',
  4: 'var(--cost-4)',
  5: 'var(--cost-5)',
}

/** Trait tier styles from the data: 1 bronze, 3 silver, 5 gold, 6 prismatic. */
export function tierColor(style: number): string {
  if (style >= 6) return '#c79bff'
  if (style >= 4) return '#ffd34d'
  if (style >= 2) return '#c9d1d9'
  return '#cd7f32'
}

export interface ActiveTrait {
  trait: TftTrait
  count: number
  /** Index into trait.breakpoints of the highest reached tier, or -1 when none. */
  tier: number
}

/** Counts unique champions per trait and finds the highest breakpoint each one reaches. */
export function computeTraits(team: TftChampion[], traits: TftTrait[]): ActiveTrait[] {
  const byName = new Map(traits.map((t) => [t.name, t]))
  const counts = new Map<string, number>()
  for (const champ of team) {
    for (const name of champ.traits) counts.set(name, (counts.get(name) ?? 0) + 1)
  }
  const out: ActiveTrait[] = []
  for (const [name, count] of counts) {
    const trait = byName.get(name)
    if (!trait) continue
    let tier = -1
    trait.breakpoints.forEach((bp, i) => {
      if (count >= bp.min) tier = i
    })
    out.push({ trait, count, tier })
  }
  // Active traits first (higher tier, then higher count), then the rest.
  return out.sort(
    (a, b) =>
      Number(b.tier >= 0) - Number(a.tier >= 0) ||
      (b.trait.breakpoints[b.tier]?.style ?? 0) - (a.trait.breakpoints[a.tier]?.style ?? 0) ||
      b.count - a.count ||
      a.trait.name.localeCompare(b.trait.name),
  )
}
