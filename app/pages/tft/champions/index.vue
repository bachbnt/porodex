<template>
  <div>
    <PageHero :title="t('tft.title')" :subtitle="t('tft.subtitle', { set: tft?.set.number ?? '' })" :eyebrow="t('nav.tft')">
      <div class="flex flex-col gap-4">
        <div class="flex flex-col gap-3 sm:flex-row">
          <SearchInput v-model="query" class="w-full sm:max-w-md" />
          <label class="block sm:w-64">
            <span class="sr-only">{{ t('tft.trait') }}</span>
            <select v-model="trait" class="input">
              <option value="">{{ t('tft.allTraits') }}</option>
              <option v-for="tr in tft?.traits ?? []" :key="tr.apiName" :value="tr.name">{{ tr.name }}</option>
            </select>
          </label>
        </div>
        <div class="flex flex-wrap gap-2" role="group" :aria-label="t('tft.costLabel')">
          <button type="button" class="chip" :aria-pressed="cost === null" @click="cost = null">{{ t('common.all') }}</button>
          <button v-for="n in 5" :key="n" type="button" class="chip" :aria-pressed="cost === n" @click="cost = cost === n ? null : n">
            <span class="inline-block h-2.5 w-2.5 rounded-full" :style="{ background: COST_COLORS[n] }" />
            {{ t('tft.cost', { n }) }}
          </button>
        </div>
      </div>
    </PageHero>

    <p v-if="error" class="text-danger">{{ t('common.loadError') }}</p>
    <template v-else>
      <p class="mb-4 text-sm text-muted" aria-live="polite">{{ t('common.results', { n: filtered.length }) }}</p>
      <ul v-if="filtered.length" class="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        <li v-for="c in filtered" :key="c.apiName"><TftChampionCard :champion="c" /></li>
      </ul>
      <EmptyState v-else />
    </template>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()
const { data: tft, error } = await useTft()

const query = ref('')
const trait = ref('')
const cost = ref<number | null>(null)

const filtered = computed(() => {
  const q = normalize(query.value)
  return (tft.value?.champions ?? []).filter(
    (c) =>
      (cost.value === null || c.cost === cost.value) &&
      (!trait.value || c.traits.includes(trait.value)) &&
      (!q || normalize(c.name).includes(q)),
  )
})

useSeoMeta({ title: () => t('tft.title'), description: () => t('tft.subtitle', { set: tft.value?.set.number ?? '' }) })
</script>
