export interface Meta {
  schema: number
  version: string
  /** Patch as players know it, e.g. "26.23" (Data Dragon's `version` is 16.23.1). */
  patch: string
  tftSet: { number: number; mutator: string }
  counts: { lolChampions: number; lolItems: number; tftChampions: number; tftTraits: number }
  generatedAt: string
}

// ----- League of Legends -----

export interface LolChampionSummary {
  id: string
  key: string
  name: string
  title: string
  tags: string[]
  partype: string
  blurb: string
  info: { attack: number; defense: number; magic: number; difficulty: number }
}

export interface LolSpell {
  slot: string
  id: string
  name: string
  description: string
  cooldown: string
  cost: string
  costType: string
  range: string
  maxrank: number
  icon: string
}

export interface LolChampion extends Omit<LolChampionSummary, 'blurb'> {
  lore: string
  allytips: string[]
  enemytips: string[]
  stats: Record<string, number>
  passive: { name: string; description: string; icon: string }
  spells: LolSpell[]
  skins: { num: number; name: string }[]
}

export interface LolItem {
  id: string
  name: string
  plaintext: string
  description: string
  gold: { base: number; total: number; sell: number }
  from: string[]
  into: string[]
  tags: string[]
  depth: number
}

export interface LolQuizEntry {
  id: string
  name: string
  passive: string
  spells: string[]
}

// ----- Teamfight Tactics -----

export interface TftBreakpoint {
  min: number
  max: number
  style: number
  text: string
}

export interface TftTrait {
  apiName: string
  name: string
  icon: string | null
  intro: string
  breakpoints: TftBreakpoint[]
}

export interface TftChampion {
  apiName: string
  name: string
  cost: number
  traits: string[]
  role: string | null
  icon: string | null
  ability: { name: string; desc: string; icon: string | null }
  stats: {
    hp?: number
    mana?: number
    initialMana?: number
    damage?: number
    armor?: number
    magicResist?: number
    attackSpeed?: number
    critChance?: number
    range?: number
  }
}

export interface TftItem {
  apiName: string
  name: string
  icon: string | null
  desc: string
  composition: string[]
}

export interface TftData {
  set: { number: number; mutator: string }
  champions: TftChampion[]
  traits: TftTrait[]
  items: { components: TftItem[]; completed: TftItem[]; emblems: TftItem[] }
}
