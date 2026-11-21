<template>
  <div>
    <PageHero :title="t('lol.title')" :subtitle="t('lol.subtitle')" :eyebrow="t('nav.lol')">
      <div class="flex flex-col gap-4">
        <SearchInput v-model="query" class="max-w-md" />
        <div class="flex flex-wrap gap-2" role="group" :aria-label="t('lol.title')">
          <button type="button" class="chip" :aria-pressed="role === null" @click="role = null">{{ t('common.all') }}</button>
          <button
            v-for="r in ROLES"
            :key="r"
            type="button"
            class="chip"
            :aria-pressed="role === r"
            @click="role = role === r ? null : r"
          >
            {{ t(`lol.roles.${r}`) }}
          </button>
        </div>
      </div>
    </PageHero>

    <p v-if="error" class="text-danger">{{ t('common.loadError') }}</p>
    <template v-else>
      <p class="mb-4 text-sm text-muted" aria-live="polite">{{ t('common.results', { n: filtered.length }) }}</p>
      <ul v-if="filtered.length" class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        <li v-for="c in filtered" :key="c.id"><LolChampionCard :champion="c" /></li>
      </ul>
      <EmptyState v-else />
    </template>
  </div>
</template>

<script setup lang="ts">
const ROLES = ['Assassin', 'Fighter', 'Mage', 'Marksman', 'Support', 'Tank']

const { t } = useI18n()
const { data: champions, error } = await useLolChampions()

const query = ref('')
const role = ref<string | null>(null)

const filtered = computed(() => {
  const q = normalize(query.value)
  return (champions.value ?? []).filter(
    (c) => (!role.value || c.tags.includes(role.value)) && (!q || normalize(c.name).includes(q)),
  )
})

useSeoMeta({ title: () => t('lol.title'), description: () => t('lol.subtitle') })
</script>
