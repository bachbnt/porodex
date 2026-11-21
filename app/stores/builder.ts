import { defineStore } from 'pinia'

export const MIN_LEVEL = 1
export const MAX_LEVEL = 11

/** The TFT team being built: which champions are on the board and how many slots the level allows. */
export const useBuilderStore = defineStore('builder', () => {
  // `initOnMounted` keeps the server-rendered markup identical to the first client render.
  const team = useLocalStorage<string[]>('porodex:team', [], { initOnMounted: true })
  const level = useLocalStorage<number>('porodex:level', 9, { initOnMounted: true })

  const slots = computed(() => level.value)
  const isFull = computed(() => team.value.length >= slots.value)

  function has(apiName: string) {
    return team.value.includes(apiName)
  }

  /** Adds the champion if there is room, removes it if already on the team. */
  function toggle(apiName: string) {
    if (has(apiName)) team.value = team.value.filter((id) => id !== apiName)
    else if (!isFull.value) team.value = [...team.value, apiName]
  }

  function setLevel(next: number) {
    level.value = Math.min(MAX_LEVEL, Math.max(MIN_LEVEL, next))
    if (team.value.length > level.value) team.value = team.value.slice(0, level.value)
  }

  function set(apiNames: string[]) {
    team.value = [...new Set(apiNames)].slice(0, MAX_LEVEL)
    if (team.value.length > level.value) level.value = team.value.length
  }

  function clear() {
    team.value = []
  }

  return { team, level, slots, isFull, has, toggle, setLevel, set, clear }
})
