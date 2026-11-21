import type { Meta } from '#shared/types'

const DD = 'https://ddragon.leagueoflegends.com/cdn'

/** URL builders for Riot's static CDN. Called lazily so the patch version is always current. */
export function useAssets() {
  const meta = useState<Meta | null>('meta')
  const v = () => meta.value?.version ?? ''
  return {
    version: v,
    champSquare: (id: string) => `${DD}/${v()}/img/champion/${id}.png`,
    champLoading: (id: string, n = 0) => `${DD}/img/champion/loading/${id}_${n}.jpg`,
    champSplash: (id: string, n = 0) => `${DD}/img/champion/splash/${id}_${n}.jpg`,
    champCenter: (id: string, n = 0) => `${DD}/img/champion/centered/${id}_${n}.jpg`,
    spell: (file: string) => `${DD}/${v()}/img/spell/${file}`,
    passive: (file: string) => `${DD}/${v()}/img/passive/${file}`,
    item: (id: string) => `${DD}/${v()}/img/item/${id}.png`,
  }
}
