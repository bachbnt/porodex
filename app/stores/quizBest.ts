import { defineStore } from 'pinia'

/** Best score per quiz mode, kept in the browser. */
export const useQuizBestStore = defineStore('quizBest', () => {
  const best = useLocalStorage<Record<string, number>>('porodex:quiz-best', {}, { initOnMounted: true })

  function record(mode: string, score: number): boolean {
    const isNew = score > (best.value[mode] ?? 0)
    if (isNew) best.value = { ...best.value, [mode]: score }
    return isNew
  }

  return { best, record }
})
