import type {
  LolChampion,
  LolChampionSummary,
  LolItem,
  LolQuizEntry,
  TftChampion,
  TftData,
  TftTrait,
} from '#shared/types'

/** Fetches one JSON file for the active language. The key includes the locale so languages never mix. */
function useJson<T, R = T>(name: string, path: (lang: string) => string, transform?: (data: T) => R) {
  const { locale } = useI18n()
  const lang = locale.value
  return useAsyncData<R>(`${name}:${lang}`, async () => {
    const data = (await $fetch(path(lang))) as T
    return (transform ? transform(data) : data) as R
  })
}

export const useLolChampions = () =>
  useJson<LolChampionSummary[]>('lol-champions', (l) => `/api/data/lol/champions.${l}.json`)

export const useLolChampion = (id: string) =>
  useJson<LolChampion>(`lol-champion:${id}`, (l) => `/api/data/lol/champion/${l}/${id}.json`)

export const useLolItems = () => useJson<LolItem[]>('lol-items', (l) => `/api/data/lol/items.${l}.json`)

export const useLolQuiz = () => useJson<LolQuizEntry[]>('lol-quiz', (l) => `/api/data/lol/quiz.${l}.json`)

export const useTft = () => useJson<TftData>('tft', (l) => `/api/data/tft/${l}.json`)

export interface TftTraitWithMembers extends TftTrait {
  members: Pick<TftChampion, 'apiName' | 'name' | 'cost' | 'icon'>[]
}

/**
 * One TFT champion plus the traits it belongs to. The transform keeps the page payload small:
 * without it every champion page would embed the whole set.
 */
export const useTftChampion = (apiName: string) =>
  useJson<TftData, { champion: TftChampion; traits: TftTraitWithMembers[] } | null>(
    `tft-champion:${apiName}`,
    (l) => `/api/data/tft/${l}.json`,
    (d) => {
      const champion = d.champions.find((c) => c.apiName === apiName)
      if (!champion) return null
      const traits = d.traits
        .filter((t) => champion.traits.includes(t.name))
        .map((t) => ({
          ...t,
          members: d.champions
            .filter((c) => c.traits.includes(t.name))
            .map((c) => ({ apiName: c.apiName, name: c.name, cost: c.cost, icon: c.icon })),
        }))
      return { champion, traits }
    },
  )
