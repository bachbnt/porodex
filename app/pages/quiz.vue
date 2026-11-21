<template>
  <div>
    <PageHero :title="t('quiz.title')" :subtitle="t('quiz.subtitle')" :eyebrow="t('site.name')" />

    <!-- Mode picker -->
    <ul v-if="!mode" class="grid gap-5 md:grid-cols-2">
      <li v-for="m in MODES" :key="m">
        <button type="button" class="panel block h-full w-full p-6 text-left" @click="start(m)">
          <h2 class="font-display text-2xl font-bold text-gold-light">{{ t(`quiz.modes.${m}.title`) }}</h2>
          <p class="mt-1 text-sm text-muted">{{ t(`quiz.modes.${m}.desc`) }}</p>
          <p v-if="bestStore.best[m]" class="mt-3 text-xs tracking-widest text-teal uppercase">
            {{ t('quiz.best') }}: {{ bestStore.best[m] }}/{{ maxFor(m) }}
          </p>
        </button>
      </li>
    </ul>

    <p v-else-if="loading" class="text-muted">…</p>
    <p v-else-if="failed" class="text-danger">{{ t('common.loadError') }}</p>

    <!-- Results -->
    <section v-else-if="finished" class="panel mx-auto max-w-lg p-8 text-center" aria-live="polite">
      <h2 class="font-display text-4xl font-bold text-gold-light">{{ t('quiz.result', { score, total }) }}</h2>
      <p class="mt-2 text-muted">{{ t(`quiz.modes.${mode}.title`) }}</p>
      <p v-if="newBest" class="mt-3 font-display text-lg tracking-widest text-teal uppercase">★ {{ t('quiz.best') }}</p>
      <div class="mt-8 flex flex-wrap justify-center gap-3">
        <button type="button" class="btn btn-primary" @click="start(mode)">{{ t('quiz.again') }}</button>
        <button type="button" class="btn" @click="reset">{{ t('quiz.modesLink') }}</button>
      </div>
    </section>

    <!-- Question -->
    <section v-else-if="question" class="mx-auto max-w-2xl">
      <div class="mb-4 flex flex-wrap items-center gap-x-6 gap-y-1 text-sm text-muted">
        <span class="font-display text-lg font-bold text-gold-light">{{ t('quiz.round', { n: index + 1, total: ROUNDS }) }}</span>
        <span>{{ t('quiz.score') }}: <strong class="text-gold-light">{{ score }}</strong></span>
        <span>{{ t('quiz.streak') }}: <strong class="text-gold-light">{{ streak }}</strong></span>
        <button type="button" class="ml-auto text-gold hover:text-teal" @click="reset">{{ t('quiz.modesLink') }}</button>
      </div>

      <div class="panel p-5 sm:p-8">
        <!-- Prompt -->
        <div class="flex flex-col items-center gap-3 text-center">
          <h2 class="font-display text-2xl font-bold text-gold-light">
            {{ question.kind === 'recipe' ? t('quiz.whichItem') : t('quiz.whichChampion') }}
          </h2>

          <img
            v-if="question.kind === 'spell'"
            :src="question.icon"
            alt=""
            width="96"
            height="96"
            class="h-24 w-24 border-2 border-gold"
          />

          <div v-else-if="question.kind === 'splash'" class="w-44 overflow-hidden border-2 border-gold">
            <img
              :src="assets.champLoading(question.id)"
              alt=""
              width="308"
              height="560"
              class="aspect-[308/560] w-full object-cover transition-[filter] duration-500"
              :style="{ filter: `blur(${blur}px)` }"
            />
          </div>

          <template v-else-if="question.kind === 'traits'">
            <CostPill :cost="question.cost" />
            <ul class="flex flex-wrap justify-center gap-2">
              <li v-for="tr in question.traits" :key="tr.name"><TraitChip :name="tr.name" :icon="tr.icon" /></li>
            </ul>
          </template>

          <template v-else-if="question.kind === 'recipe'">
            <img v-if="question.item.icon" :src="question.item.icon" :alt="question.item.name" width="80" height="80" class="h-20 w-20 border-2 border-gold" />
            <p class="font-display text-2xl text-gold-light">{{ question.item.name }}</p>
            <DescText v-if="question.item.desc" :html="question.item.desc" class="max-w-md text-sm" />
          </template>

          <p v-if="question.kind === 'splash' && !answered" class="text-xs text-muted">{{ t('quiz.revealHint') }}</p>
        </div>

        <!-- Multiple choice -->
        <ul v-if="question.kind !== 'recipe'" class="mt-6 grid gap-3 sm:grid-cols-2">
          <li v-for="o in question.options" :key="o.id">
            <button
              type="button"
              class="w-full border px-4 py-3 text-left font-medium transition-colors"
              :class="optionClass(o.id)"
              :disabled="answered || wrongGuesses.includes(o.id)"
              @click="choose(o.id)"
            >
              {{ o.label }}
            </button>
          </li>
        </ul>

        <!-- Recipe picker -->
        <div v-else class="mt-6">
          <p class="text-center text-sm text-muted">{{ t('quiz.pickTwo') }}</p>
          <ul class="mt-3 flex justify-center gap-3" aria-label="Selected">
            <li v-for="n in 2" :key="n">
              <button
                type="button"
                class="grid h-16 w-16 place-items-center border-2 border-dashed border-gold-dark/70 bg-void/60"
                :disabled="answered || !picks[n - 1]"
                :aria-label="picks[n - 1] ? componentName(picks[n - 1]!) : ''"
                @click="picks.splice(n - 1, 1)"
              >
                <img v-if="picks[n - 1] && componentIcon(picks[n - 1]!)" :src="componentIcon(picks[n - 1]!)!" alt="" width="56" height="56" class="h-14 w-14" />
              </button>
            </li>
          </ul>
          <ul class="mt-5 grid grid-cols-5 gap-2">
            <li v-for="c in components" :key="c.apiName">
              <button
                type="button"
                class="block w-full border border-gold-dark/60 bg-void/50 p-1 text-center hover:border-teal disabled:opacity-50"
                :disabled="answered || picks.length >= 2"
                :title="c.name"
                @click="picks.push(c.apiName)"
              >
                <img v-if="c.icon" :src="c.icon" :alt="c.name" width="48" height="48" class="mx-auto h-12 w-12" />
                <span class="mt-0.5 block truncate text-[11px] text-muted">{{ c.name }}</span>
              </button>
            </li>
          </ul>
          <div class="mt-5 text-center">
            <button type="button" class="btn btn-primary" :disabled="answered || picks.length !== 2" @click="checkRecipe">
              {{ t('quiz.check') }}
            </button>
          </div>
        </div>

        <!-- Feedback -->
        <div class="mt-6 min-h-12 text-center" aria-live="polite">
          <template v-if="answered">
            <p class="font-display text-xl font-bold" :class="lastCorrect ? 'text-teal' : 'text-danger'">
              {{ lastCorrect ? t('quiz.correct') : t('quiz.wrong', { answer: answerLabel }) }}
            </p>
            <button type="button" class="btn btn-primary mt-4" @click="next">
              {{ index + 1 >= ROUNDS ? t('quiz.finish') : t('quiz.next') }}
            </button>
          </template>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import type { LolQuizEntry, TftData, TftItem } from '#shared/types'

type Mode = 'spell' | 'splash' | 'traits' | 'recipe'
interface Option { id: string; label: string }
type Question =
  | { kind: 'spell'; icon: string; options: Option[]; answer: string }
  | { kind: 'splash'; id: string; options: Option[]; answer: string }
  | { kind: 'traits'; cost: number; traits: { name: string; icon: string | null }[]; options: Option[]; answer: string }
  | { kind: 'recipe'; item: TftItem; answer: string[] }

const MODES: Mode[] = ['spell', 'splash', 'traits', 'recipe']
const ROUNDS = 10
const MAX_GUESSES = 3

const { t, locale } = useI18n()
const assets = useAssets()
const bestStore = useQuizBestStore()

const mode = ref<Mode | null>(null)
const loading = ref(false)
const failed = ref(false)
const finished = ref(false)
const newBest = ref(false)

const questions = ref<Question[]>([])
const components = ref<TftItem[]>([])
const index = ref(0)
const score = ref(0)
const streak = ref(0)

// Per-question state
const answered = ref(false)
const lastCorrect = ref(false)
const pickedId = ref<string | null>(null)
const wrongGuesses = ref<string[]>([])
const picks = ref<string[]>([])

const question = computed(() => questions.value[index.value])
const pointsPer = (m: Mode) => (m === 'splash' ? MAX_GUESSES : 1)
const maxFor = (m: Mode) => ROUNDS * pointsPer(m)
const total = computed(() => (mode.value ? maxFor(mode.value) : ROUNDS))

/** 28px -> 18px -> 8px as guesses go wrong; fully clear once answered. */
const blur = computed(() => (answered.value ? 0 : Math.max(4, 28 - wrongGuesses.value.length * 10)))

const componentName = (id: string) => components.value.find((c) => c.apiName === id)?.name ?? id
const componentIcon = (id: string) => components.value.find((c) => c.apiName === id)?.icon ?? null

const answerLabel = computed(() => {
  const q = question.value
  if (!q) return ''
  if (q.kind === 'recipe') return q.answer.map(componentName).join(' + ')
  return q.options.find((o) => o.id === q.answer)?.label ?? ''
})

function optionClass(id: string) {
  const q = question.value
  if (answered.value && q && q.kind !== 'recipe' && id === q.answer) return 'border-teal bg-teal/15 text-teal'
  if (wrongGuesses.value.includes(id) || (answered.value && pickedId.value === id)) return 'border-danger bg-danger/10 text-danger'
  return 'border-gold-dark/70 bg-void/50 text-ink hover:border-teal hover:text-teal'
}

// ---------------------------------------------------------------------------------------------
// Question builders
// ---------------------------------------------------------------------------------------------

const toOptions = <T extends { name: string }>(items: T[], id: (x: T) => string): Option[] =>
  shuffle(items).map((x) => ({ id: id(x), label: x.name }))

function buildLol(list: LolQuizEntry[], kind: 'spell' | 'splash'): Question[] {
  return sample(list, ROUNDS).map((c) => {
    const options = toOptions([c, ...sample(list.filter((x) => x.id !== c.id), 3)], (x) => x.id)
    if (kind === 'splash') return { kind, id: c.id, options, answer: c.id }
    const pool = [
      { icon: assets.passive(c.passive) },
      ...c.spells.map((file) => ({ icon: assets.spell(file) })),
    ]
    return { kind, icon: sample(pool, 1)[0]!.icon, options, answer: c.id }
  })
}

function buildTraits(tft: TftData): Question[] {
  const icons = new Map(tft.traits.map((tr) => [tr.name, tr.icon]))
  return sample(tft.champions, ROUNDS).map((c) => ({
    kind: 'traits' as const,
    cost: c.cost,
    traits: c.traits.map((name) => ({ name, icon: icons.get(name) ?? null })),
    // Same-cost distractors make it a fair question rather than a giveaway.
    options: toOptions(
      [c, ...sample(tft.champions.filter((x) => x.apiName !== c.apiName && x.cost === c.cost), 3)],
      (x) => x.apiName,
    ),
    answer: c.apiName,
  }))
}

function buildRecipes(tft: TftData): Question[] {
  return sample(tft.items.completed, ROUNDS).map((item) => ({ kind: 'recipe' as const, item, answer: item.composition }))
}

// ---------------------------------------------------------------------------------------------
// Game flow
// ---------------------------------------------------------------------------------------------

function resetQuestionState() {
  answered.value = false
  lastCorrect.value = false
  pickedId.value = null
  wrongGuesses.value = []
  picks.value = []
}

async function start(m: Mode) {
  mode.value = m
  loading.value = true
  failed.value = false
  finished.value = false
  newBest.value = false
  index.value = 0
  score.value = 0
  streak.value = 0
  resetQuestionState()

  try {
    if (m === 'spell' || m === 'splash') {
      const list = await $fetch<LolQuizEntry[]>(`/api/data/lol/quiz.${locale.value}.json`)
      questions.value = buildLol(list, m)
    } else {
      const tft = await $fetch<TftData>(`/api/data/tft/${locale.value}.json`)
      components.value = tft.items.components
      questions.value = m === 'traits' ? buildTraits(tft) : buildRecipes(tft)
    }
  } catch {
    failed.value = true
  } finally {
    loading.value = false
  }
}

function reset() {
  mode.value = null
  finished.value = false
  failed.value = false
}

function settle(correct: boolean, points: number) {
  answered.value = true
  lastCorrect.value = correct
  score.value += points
  streak.value = correct ? streak.value + 1 : 0
}

function choose(id: string) {
  const q = question.value
  if (!q || q.kind === 'recipe' || answered.value) return
  pickedId.value = id

  if (id === q.answer) {
    // Splash: fewer wrong guesses earn more points. Other modes: one try, one point.
    settle(true, q.kind === 'splash' ? MAX_GUESSES - wrongGuesses.value.length : 1)
  } else if (q.kind === 'splash') {
    wrongGuesses.value = [...wrongGuesses.value, id]
    if (wrongGuesses.value.length >= MAX_GUESSES) settle(false, 0)
  } else {
    settle(false, 0)
  }
}

function checkRecipe() {
  const q = question.value
  if (!q || q.kind !== 'recipe' || picks.value.length !== 2) return
  const key = (ids: string[]) => [...ids].sort().join('|')
  const correct = key(picks.value) === key(q.answer)
  settle(correct, correct ? 1 : 0)
}

function next() {
  if (index.value + 1 >= ROUNDS) {
    finished.value = true
    if (mode.value) newBest.value = bestStore.record(mode.value, score.value)
    return
  }
  index.value++
  resetQuestionState()
}

useSeoMeta({ title: () => t('quiz.title'), description: () => t('quiz.subtitle') })
</script>
