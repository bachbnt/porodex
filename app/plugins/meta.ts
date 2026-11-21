import type { Meta } from '#shared/types'

/** Loads the patch metadata once; it lands in the payload so client navigation never refetches it. */
export default defineNuxtPlugin(async () => {
  const meta = useState<Meta | null>('meta', () => null)
  if (!meta.value) meta.value = await $fetch<Meta>('/api/data/meta.json')
})
