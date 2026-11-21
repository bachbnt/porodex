<template>
  <div>
    <PageHero :title="t('tft.itemsTitle')" :subtitle="t('tft.itemsSubtitle')" :eyebrow="t('nav.tft')">
      <div class="flex flex-wrap gap-2" role="tablist" :aria-label="t('tft.itemsTitle')">
        <button
          v-for="tab in tabs"
          :id="`tab-${tab.key}`"
          :key="tab.key"
          type="button"
          role="tab"
          class="chip"
          :aria-selected="view === tab.key"
          :aria-pressed="view === tab.key"
          :aria-controls="`panel-${tab.key}`"
          @click="view = tab.key"
        >
          {{ tab.label }}
        </button>
      </div>
    </PageHero>

    <p v-if="error" class="text-danger">{{ t('common.loadError') }}</p>
    <template v-else-if="tft">
      <!-- Recipe chart -->
      <section v-show="view === 'matrix'" id="panel-matrix" role="tabpanel" aria-labelledby="tab-matrix">
        <p class="mb-3 text-sm text-muted">{{ t('tft.recipeHint') }}</p>
        <div class="panel overflow-x-auto p-3">
          <table class="mx-auto border-separate border-spacing-1">
            <caption class="sr-only">{{ t('tft.recipeMatrix') }}</caption>
            <thead>
              <tr>
                <td />
                <th v-for="c in components" :key="c.apiName" scope="col" class="p-1">
                  <img v-if="c.icon" :src="c.icon" :alt="c.name" :title="c.name" width="40" height="40" class="mx-auto h-10 w-10" />
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in components" :key="row.apiName">
                <th scope="row" class="p-1">
                  <img v-if="row.icon" :src="row.icon" :alt="row.name" :title="row.name" width="40" height="40" class="h-10 w-10" />
                </th>
                <td v-for="col in components" :key="col.apiName" class="p-0 text-center">
                    <button
                      v-if="recipe(row.apiName, col.apiName)"
                      type="button"
                      class="block border border-gold-dark/60 bg-void/60 hover:border-teal"
                      :class="selected?.apiName === recipe(row.apiName, col.apiName)?.apiName ? '!border-teal ring-2 ring-teal/60' : ''"
                      :title="recipe(row.apiName, col.apiName)?.name"
                      @click="selected = recipe(row.apiName, col.apiName)!"
                    >
                      <img
                        v-if="recipe(row.apiName, col.apiName)?.icon"
                        :src="recipe(row.apiName, col.apiName)!.icon!"
                        :alt="recipe(row.apiName, col.apiName)!.name"
                        width="40"
                        height="40"
                        loading="lazy"
                        class="h-10 w-10"
                      />
                    </button>
                    <span v-else class="grid h-10 w-10 place-items-center border border-gold-dark/20 text-gold-dark/40">–</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-if="selected" class="panel mt-4 flex gap-4 p-5" aria-live="polite">
          <img v-if="selected.icon" :src="selected.icon" :alt="selected.name" width="56" height="56" class="h-14 w-14 shrink-0 border border-gold-dark" />
          <div>
            <h2 class="font-display text-2xl font-bold text-gold-light">{{ selected.name }}</h2>
            <p class="text-xs tracking-widest text-teal uppercase">
              {{ t('tft.recipe') }}: {{ selected.composition.map(nameOf).join(' + ') }}
            </p>
            <DescText v-if="selected.desc" :html="selected.desc" class="mt-2 text-sm" />
          </div>
        </div>
      </section>

      <!-- Completed items / emblems -->
      <section v-for="key in (['completed', 'emblems'] as const)" v-show="view === key" :id="`panel-${key}`" :key="key" role="tabpanel" :aria-labelledby="`tab-${key}`">
        <ul class="grid gap-4 md:grid-cols-2">
          <li v-for="item in tft.items[key]" :key="item.apiName" class="panel flex gap-4 p-4">
            <img v-if="item.icon" :src="item.icon" :alt="item.name" width="56" height="56" loading="lazy" class="h-14 w-14 shrink-0 border border-gold-dark" />
            <div class="min-w-0">
              <h2 class="font-display text-xl leading-tight font-bold text-gold-light">{{ item.name }}</h2>
              <p class="mt-0.5 flex items-center gap-1.5 text-xs text-muted">
                <template v-for="(id, i) in item.composition" :key="`${id}-${i}`">
                  <span v-if="i" aria-hidden="true">+</span>
                  <img v-if="iconOf(id)" :src="iconOf(id)!" :alt="nameOf(id)" :title="nameOf(id)" width="22" height="22" class="h-[22px] w-[22px]" />
                  <span class="sr-only">{{ nameOf(id) }}</span>
                </template>
              </p>
              <DescText v-if="item.desc" :html="item.desc" class="mt-2 text-sm" />
            </div>
          </li>
        </ul>
      </section>
    </template>
  </div>
</template>

<script setup lang="ts">
import type { TftItem } from '#shared/types'

const { t } = useI18n()
const { data: tft, error } = await useTft()

const view = ref<'matrix' | 'completed' | 'emblems'>('matrix')
const selected = ref<TftItem | null>(null)

const tabs = computed(() => [
  { key: 'matrix' as const, label: t('tft.recipeMatrix') },
  { key: 'completed' as const, label: t('tft.completed') },
  { key: 'emblems' as const, label: t('tft.emblems') },
])

const components = computed(() => tft.value?.items.components ?? [])
const byApi = computed(() => new Map(components.value.map((c) => [c.apiName, c])))
const nameOf = (id: string) => byApi.value.get(id)?.name ?? id
const iconOf = (id: string) => byApi.value.get(id)?.icon ?? null

/** Order-independent lookup: (a, b) and (b, a) are the same recipe. */
const recipes = computed(() => {
  const map = new Map<string, TftItem>()
  for (const item of [...(tft.value?.items.completed ?? []), ...(tft.value?.items.emblems ?? [])]) {
    const [a, b] = item.composition
    if (a && b) map.set([a, b].sort().join('|'), item)
  }
  return map
})
const recipe = (a: string, b: string) => recipes.value.get([a, b].sort().join('|')) ?? null

useSeoMeta({ title: () => t('tft.itemsTitle'), description: () => t('tft.itemsSubtitle') })
</script>
