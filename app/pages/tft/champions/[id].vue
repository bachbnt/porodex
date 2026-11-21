<template>
  <article v-if="champ">
    <header class="panel p-6 sm:p-8" :class="`cost-${champ.cost}`">
      <NuxtLinkLocale to="/tft/champions" class="text-sm text-gold hover:text-teal">← {{ t('nav.champions') }}</NuxtLinkLocale>
      <div class="mt-4 flex flex-wrap items-center gap-5">
        <TftIcon :src="champ.icon" :cost="champ.cost" :alt="champ.name" :size="112" />
        <div>
          <h1 class="font-display text-5xl leading-none font-bold text-gold-light sm:text-6xl">{{ champ.name }}</h1>
          <div class="mt-3 flex flex-wrap items-center gap-2">
            <CostPill :cost="champ.cost" />
            <NuxtLinkLocale v-for="tr in traits" :key="tr.apiName" :to="`/tft/traits#trait-${tr.apiName}`">
              <TraitChip :name="tr.name" :icon="tr.icon" />
            </NuxtLinkLocale>
          </div>
        </div>
      </div>
    </header>

    <div class="mt-8 grid gap-8 lg:grid-cols-[1fr_20rem]">
      <div class="min-w-0 space-y-8">
        <section aria-labelledby="ability">
          <h2 id="ability" class="font-display text-3xl font-bold text-gold-light">{{ t('tft.ability') }}</h2>
          <hr class="divider !my-3" />
          <div class="panel flex gap-4 p-5">
            <img v-if="champ.ability.icon" :src="champ.ability.icon" :alt="champ.ability.name" width="56" height="56" class="h-14 w-14 shrink-0 border border-gold-dark object-cover" />
            <div>
              <h3 class="font-display text-2xl font-bold text-gold-light">{{ champ.ability.name }}</h3>
              <DescText :html="champ.ability.desc" class="mt-2 text-sm" />
              <p v-if="champ.ability.desc.includes('x-var')" class="mt-3 text-xs text-muted">
                <span class="desc"><span class="x-var">?</span></span> {{ t('common.unknownValue') }}
              </p>
            </div>
          </div>
        </section>

        <section v-for="tr in traits" :key="tr.apiName" :aria-labelledby="`t-${tr.apiName}`">
          <h2 :id="`t-${tr.apiName}`" class="flex items-center gap-3 font-display text-2xl font-bold text-gold-light">
            <img v-if="tr.icon" :src="tr.icon" alt="" width="28" height="28" class="h-7 w-7 object-contain" />
            {{ tr.name }}
          </h2>
          <div class="panel mt-3 space-y-3 p-5">
            <DescText v-if="tr.intro" :html="tr.intro" class="text-sm" />
            <ul class="space-y-2">
              <li v-for="bp in tr.breakpoints" :key="bp.min" class="flex gap-3 text-sm">
                <span class="grid h-6 w-6 shrink-0 place-items-center border text-xs font-bold" :style="{ borderColor: tierColor(bp.style), color: tierColor(bp.style) }">{{ bp.min }}</span>
                <DescText :html="bp.text.replace(/^\(\d+\)\s*/, '')" />
              </li>
            </ul>
            <ul class="flex flex-wrap gap-2 pt-2">
              <li v-for="m in tr.members" :key="m.apiName">
                <NuxtLinkLocale :to="`/tft/champions/${m.apiName}`" :title="m.name">
                  <TftIcon :src="m.icon" :cost="m.cost" :alt="m.name" :size="40" :class="m.apiName === champ.apiName ? 'ring-2 ring-teal' : ''" />
                </NuxtLinkLocale>
              </li>
            </ul>
          </div>
        </section>
      </div>

      <aside>
        <section class="panel p-5" aria-labelledby="stats">
          <h2 id="stats" class="font-display text-2xl font-bold text-gold-light">{{ t('tft.stats') }}</h2>
          <dl class="mt-3 divide-y divide-gold-dark/30 text-sm">
            <div v-for="row in statRows" :key="row.key" class="flex justify-between gap-3 py-1.5">
              <dt class="text-muted">{{ row.label }}</dt>
              <dd class="font-semibold text-ink">{{ row.value }}</dd>
            </div>
          </dl>
        </section>
      </aside>
    </div>
  </article>
</template>

<script setup lang="ts">
const route = useRoute()
const { t } = useI18n()

const apiName = String(route.params.id)
const { data, error } = await useTftChampion(apiName)

if (error.value || !data.value) {
  throw createError({ statusCode: 404, statusMessage: 'Champion not found', fatal: true })
}

const champ = computed(() => data.value!.champion)
const traits = computed(() => data.value!.traits)

const STAT_KEYS = ['hp', 'mana', 'initialMana', 'damage', 'armor', 'magicResist', 'attackSpeed', 'critChance', 'range'] as const

const statRows = computed(() =>
  STAT_KEYS.filter((k) => champ.value.stats[k] != null).map((k) => {
    const raw = champ.value.stats[k]!
    return {
      key: k,
      label: t(`tft.stat.${k}`),
      value: k === 'critChance' ? `${Math.round(raw * 100)}%` : Number(raw.toFixed(2)),
    }
  }),
)

useSeoMeta({
  title: () => champ.value.name,
  description: () => `${champ.value.name} — ${t('tft.cost', { n: champ.value.cost })} · ${champ.value.traits.join(', ')}`,
})
</script>
