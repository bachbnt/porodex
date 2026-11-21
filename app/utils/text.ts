/** Lower-cases and strips diacritics so "Dũng Sĩ" matches "dung si" (and đ -> d). */
export function normalize(input: string): string {
  return input
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/đ/gi, 'd')
    .toLowerCase()
    .trim()
}

/** Fisher–Yates shuffle that returns a new array. */
export function shuffle<T>(items: readonly T[]): T[] {
  const out = [...items]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[out[i], out[j]] = [out[j]!, out[i]!]
  }
  return out
}

export function sample<T>(items: readonly T[], n: number): T[] {
  return shuffle(items).slice(0, n)
}
