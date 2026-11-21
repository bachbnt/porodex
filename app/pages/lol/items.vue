<template>
  <div>
    <PageHero :title="t('lol.itemsTitle')" :subtitle="t('lol.itemsSubtitle')" :eyebrow="t('nav.lol')">
      <div class="flex flex-col gap-4">
        <SearchInput v-model="query" class="max-w-md" />
        <div class="flex flex-wrap gap-2" role="group" :aria-label="t('lol.itemsTitle')">
          <button type="button" class="chip" :aria-pressed="tag === null" @click="tag = null">{{ t('common.all') }}</button>
          <button v-for="g in tags" :key="g" type="button" class="chip" :aria-pressed="tag === g" @click="tag = tag === g ? null : g">
            {{ tagLabel(g) }}
          </button>
        </div>
      </div>
    </PageHero>

    <p v-if="error" class="text-danger">{{ t('common.loadError') }}</p>
    <template v-else>
      <p class="mb-4 text-sm text-muted" aria-live="polite">{{ t('common.results', { n: filtered.length }) }}</p>
      <ul v-if="filtered.length" class="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        <li v-for="item in filtered" :key="item.id">
          <button type="button" class="panel flex h-full w-full items-center gap-3 p-3 text-left" @click="selectedId = item.id">
            <img :src="assets.item(item.id)" :alt="item.name" width="48" height="48" loading="lazy" decoding="async" class="h-12 w-12 shrink-0 border border-gold-dark" />
            <span class="min-w-0">
              <span class="block truncate text-sm font-semibold text-gold-light">{{ item.name }}</span>
              <span class="block text-xs text-gold">{{ item.gold.total }} {{ t('lol.gold') }}</span>
            </span>
          </button>
        </li>
      </ul>
      <EmptyState v-else />
    </template>

    <ItemDialog :item="selected" :items="items ?? []" @close="selectedId = null" @select="(id) => (selectedId = id)" />
  </div>
</template>

<script setup lang="ts">
const { t, te } = useI18n()
const assets = useAssets()
const { data: items, error } = await useLolItems()

const query = ref('')
const tag = ref<string | null>(null)
const selectedId = ref<string | null>(null)

/** The most common tags that we have a label for, so every chip filters a meaningful group. */
const tags = computed(() => {
  const counts = new Map<string, number>()
  for (const item of items.value ?? []) for (const g of item.tags) counts.set(g, (counts.get(g) ?? 0) + 1)
  return [...counts.entries()]
    .filter(([g, n]) => n >= 4 && te(`lol.itemTags.${g}`))
    .sort((a, b) => b[1] - a[1])
    .slice(0, 16)
    .map(([g]) => g)
})

const tagLabel = (g: string) => t(`lol.itemTags.${g}`)

const filtered = computed(() => {
  const q = normalize(query.value)
  return (items.value ?? []).filter(
    (i) => (!tag.value || i.tags.includes(tag.value)) && (!q || normalize(i.name).includes(q)),
  )
})

const selected = computed(() => items.value?.find((i) => i.id === selectedId.value) ?? null)

useSeoMeta({ title: () => t('lol.itemsTitle'), description: () => t('lol.itemsSubtitle') })
</script>
