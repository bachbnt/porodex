<template>
  <div>
    <PageHero :title="t('tft.traitsTitle')" :subtitle="t('tft.traitsSubtitle')" :eyebrow="t('nav.tft')">
      <SearchInput v-model="query" class="max-w-md" />
    </PageHero>

    <p v-if="error" class="text-danger">{{ t('common.loadError') }}</p>
    <template v-else>
      <ul v-if="filtered.length" class="grid gap-5 lg:grid-cols-2">
        <li v-for="tr in filtered" :id="`trait-${tr.apiName}`" :key="tr.apiName" class="panel scroll-mt-24 p-5">
          <div class="flex items-center gap-3">
            <img v-if="tr.icon" :src="tr.icon" alt="" width="40" height="40" loading="lazy" class="h-10 w-10 object-contain" />
            <h2 class="font-display text-2xl font-bold text-gold-light">{{ tr.name }}</h2>
            <span class="ml-auto text-xs text-muted">{{ t('tft.units', { n: tr.members.length }) }}</span>
          </div>
          <DescText v-if="tr.intro" :html="tr.intro" class="mt-3 text-sm" />
          <ul class="mt-3 space-y-2">
            <li v-for="bp in tr.breakpoints" :key="bp.min" class="flex gap-3 text-sm">
              <span class="grid h-6 w-6 shrink-0 place-items-center border text-xs font-bold" :style="{ borderColor: tierColor(bp.style), color: tierColor(bp.style) }">{{ bp.min }}</span>
              <DescText :html="bp.text.replace(/^\(\d+\)\s*/, '')" />
            </li>
          </ul>
          <ul class="mt-4 flex flex-wrap gap-2" :aria-label="t('tft.members')">
            <li v-for="m in tr.members" :key="m.apiName">
              <NuxtLinkLocale :to="`/tft/champions/${m.apiName}`" :title="m.name">
                <TftIcon :src="m.icon" :cost="m.cost" :alt="m.name" :size="44" />
              </NuxtLinkLocale>
            </li>
          </ul>
        </li>
      </ul>
      <EmptyState v-else />
    </template>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()
const { data: tft, error } = await useTft()
const query = ref('')

const traits = computed(() =>
  (tft.value?.traits ?? []).map((tr) => ({
    ...tr,
    members: (tft.value?.champions ?? []).filter((c) => c.traits.includes(tr.name)),
  })),
)

const filtered = computed(() => {
  const q = normalize(query.value)
  return traits.value.filter((tr) => !q || normalize(tr.name).includes(q))
})

useSeoMeta({ title: () => t('tft.traitsTitle'), description: () => t('tft.traitsSubtitle') })
</script>
