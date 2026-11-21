<template>
  <div>
    <PageHero :title="t('builder.title')" :subtitle="t('builder.subtitle')" :eyebrow="t('nav.tft')" />

    <p v-if="error" class="text-danger">{{ t('common.loadError') }}</p>
    <div v-else-if="tft" class="grid gap-8 lg:grid-cols-[1fr_24rem]">
      <!-- Champion pool -->
      <section aria-labelledby="pool">
        <h2 id="pool" class="font-display text-2xl font-bold text-gold-light">{{ t('builder.pool') }}</h2>
        <div class="mt-3 flex flex-col gap-3">
          <SearchInput v-model="query" class="max-w-sm" />
          <div class="flex flex-wrap gap-2" role="group" :aria-label="t('tft.costLabel')">
            <button type="button" class="chip" :aria-pressed="cost === null" @click="cost = null">{{ t('common.all') }}</button>
            <button v-for="n in 5" :key="n" type="button" class="chip" :aria-pressed="cost === n" @click="cost = cost === n ? null : n">
              <span class="inline-block h-2.5 w-2.5 rounded-full" :style="{ background: COST_COLORS[n] }" />
              {{ n }}
            </button>
          </div>
        </div>

        <ul v-if="pool.length" class="mt-4 grid grid-cols-4 gap-3 sm:grid-cols-6 md:grid-cols-7">
          <li v-for="c in pool" :key="c.apiName">
            <button
              type="button"
              class="group block w-full text-center disabled:opacity-40"
              :aria-pressed="builder.has(c.apiName)"
              :disabled="!builder.has(c.apiName) && builder.isFull"
              :title="`${c.name} — ${c.traits.join(', ')}`"
              :aria-label="builder.has(c.apiName) ? t('builder.remove', { name: c.name }) : t('builder.add', { name: c.name })"
              @click="builder.toggle(c.apiName)"
            >
              <span class="relative block" :class="builder.has(c.apiName) ? 'ring-2 ring-teal ring-offset-2 ring-offset-void' : ''">
                <TftIcon :src="c.icon" :cost="c.cost" :alt="c.name" :size="72" class="!block !h-auto !w-full aspect-square group-hover:brightness-110" />
              </span>
              <span class="mt-1 block truncate text-xs text-ink/90">{{ c.name }}</span>
            </button>
          </li>
        </ul>
        <EmptyState v-else class="mt-4" />
      </section>

      <!-- Team + traits -->
      <aside class="lg:sticky lg:top-24 lg:self-start">
        <section class="panel p-5" aria-labelledby="team">
          <div class="flex flex-wrap items-center gap-3">
            <h2 id="team" class="font-display text-2xl font-bold text-gold-light">{{ t('builder.team') }}</h2>
            <span class="text-sm text-muted">{{ t('builder.slots', { n: builder.team.length, max: builder.slots }) }}</span>
            <label class="ml-auto flex items-center gap-2 text-sm text-muted">
              {{ t('builder.level') }}
              <select :value="builder.level" class="input !w-auto !py-1" @change="builder.setLevel(Number(($event.target as HTMLSelectElement).value))">
                <option v-for="n in LEVELS" :key="n" :value="n">{{ n }}</option>
              </select>
            </label>
          </div>

          <ul class="mt-4 grid grid-cols-5 gap-2" :aria-label="t('builder.team')">
            <li v-for="(c, i) in slotList" :key="c?.apiName ?? `empty-${i}`">
              <button
                v-if="c"
                type="button"
                class="block w-full"
                :title="c.name"
                :aria-label="t('builder.remove', { name: c.name })"
                @click="builder.toggle(c.apiName)"
              >
                <TftIcon :src="c.icon" :cost="c.cost" :alt="c.name" :size="56" class="!block !h-auto !w-full aspect-square hover:brightness-110" />
              </button>
              <span v-else class="block aspect-square w-full border border-dashed border-gold-dark/50 bg-void/50" aria-hidden="true" />
            </li>
          </ul>
          <p v-if="!builder.team.length" class="mt-3 text-sm text-muted">{{ t('builder.empty') }}</p>
          <p v-else-if="builder.isFull" class="mt-3 text-sm text-gold">{{ t('builder.full') }}</p>

          <div class="mt-4 flex flex-wrap items-center gap-3">
            <button type="button" class="btn" :disabled="!builder.team.length" @click="copyLink">
              {{ copied ? t('builder.copied') : t('builder.share') }}
            </button>
            <button type="button" class="chip" :disabled="!builder.team.length" @click="builder.clear()">{{ t('builder.reset') }}</button>
            <span v-if="builder.team.length" class="ml-auto text-sm text-muted">
              {{ t('builder.totalCost') }}: <strong class="text-gold-light">{{ totalCost }}</strong>
            </span>
          </div>
        </section>

        <section class="panel mt-6 p-5" aria-labelledby="traits">
          <h2 id="traits" class="font-display text-2xl font-bold text-gold-light">{{ t('builder.activeTraits') }}</h2>
          <p v-if="!traits.length" class="mt-3 text-sm text-muted">{{ t('builder.noTraits') }}</p>
          <ul v-else class="mt-3 space-y-2">
            <li v-for="row in active" :key="row.trait.apiName" class="flex items-center gap-3">
              <TraitChip :name="row.trait.name" :icon="row.trait.icon" :style="row.trait.breakpoints[row.tier]?.style" :count="row.count" />
              <span class="text-xs text-muted">{{ breakpointsText(row) }}</span>
            </li>
          </ul>
          <template v-if="inactive.length">
            <p class="mt-4 text-xs tracking-widest text-muted uppercase">{{ t('builder.inactive') }}</p>
            <ul class="mt-2 flex flex-wrap gap-2">
              <li v-for="row in inactive" :key="row.trait.apiName">
                <TraitChip :name="row.trait.name" :icon="row.trait.icon" :count="row.count" dim :title="breakpointsText(row)" />
              </li>
            </ul>
          </template>
        </section>
      </aside>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ActiveTrait } from '~/utils/tft'
import { MAX_LEVEL, MIN_LEVEL } from '~/stores/builder'

const LEVELS = Array.from({ length: MAX_LEVEL }, (_, i) => i + 1)

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const { data: tft, error } = await useTft()
const builder = useBuilderStore()

const query = ref('')
const cost = ref<number | null>(null)
const copied = ref(false)
const ready = ref(false)

const byApi = computed(() => new Map((tft.value?.champions ?? []).map((c) => [c.apiName, c])))

const pool = computed(() => {
  const q = normalize(query.value)
  return (tft.value?.champions ?? []).filter(
    (c) => (cost.value === null || c.cost === cost.value) && (!q || normalize(c.name).includes(q)),
  )
})

const teamChamps = computed(() => builder.team.map((id) => byApi.value.get(id)).filter((c) => !!c))
const slotList = computed(() => Array.from({ length: builder.slots }, (_, i) => teamChamps.value[i] ?? null))
const totalCost = computed(() => teamChamps.value.reduce((sum, c) => sum + c.cost, 0))

const traits = computed(() => computeTraits(teamChamps.value, tft.value?.traits ?? []))
const active = computed(() => traits.value.filter((r) => r.tier >= 0))
const inactive = computed(() => traits.value.filter((r) => r.tier < 0))

/** "2 / 4 / 6" with the reached breakpoint kept readable. */
function breakpointsText(row: ActiveTrait) {
  return row.trait.breakpoints.map((bp) => bp.min).join(' / ')
}

// Load a shared team from the URL, then keep the URL in sync with the team.
onMounted(async () => {
  await nextTick() // let the stores restore their saved state first; a shared link wins over it
  const shared = typeof route.query.t === 'string' ? route.query.t.split(',').filter((id) => byApi.value.has(id)) : []
  if (shared.length) {
    const level = Number(route.query.l)
    if (level >= MIN_LEVEL && level <= MAX_LEVEL) builder.setLevel(level)
    builder.set(shared)
  }
  ready.value = true
})

watch(
  () => [builder.team.join(','), builder.level] as const,
  ([team, level]) => {
    if (!ready.value) return
    router.replace({ query: team ? { t: team, l: String(level) } : {} })
  },
)

async function copyLink() {
  try {
    await navigator.clipboard.writeText(window.location.href)
    copied.value = true
    setTimeout(() => (copied.value = false), 1800)
  } catch {
    // Clipboard can be blocked; the address bar already holds the link.
  }
}

useSeoMeta({ title: () => t('builder.title'), description: () => t('builder.subtitle') })
</script>
