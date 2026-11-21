<template>
  <div>
    <section class="relative pt-4 pb-10 text-center sm:pt-10">
      <p v-if="meta" class="font-display text-sm font-bold tracking-[0.3em] text-teal uppercase">
        {{ t('home.eyebrow', { version: meta.version }) }}
      </p>
      <h1 class="mx-auto mt-3 max-w-3xl font-display text-5xl leading-[1.05] font-bold text-gold-light sm:text-7xl">
        {{ t('home.title') }}
      </h1>
      <p class="mx-auto mt-5 max-w-2xl text-lg text-muted">{{ t('home.subtitle') }}</p>
      <hr class="divider mx-auto max-w-md" />
    </section>

    <section class="grid gap-6 md:grid-cols-2">
      <article v-for="game in games" :key="game.key" class="panel flex flex-col p-6 sm:p-8">
        <h2 class="font-display text-3xl font-bold text-gold-light">{{ game.title }}</h2>
        <p class="mt-2 flex-1 text-muted">{{ game.desc }}</p>
        <div class="mt-6 flex flex-wrap gap-3">
          <NuxtLinkLocale v-for="link in game.links" :key="link.to" :to="link.to" class="btn">
            {{ link.label }}
          </NuxtLinkLocale>
        </div>
      </article>
    </section>

    <section class="mt-6 grid gap-6 md:grid-cols-2">
      <NuxtLinkLocale v-for="f in features" :key="f.to" :to="f.to" class="panel block p-6">
        <h2 class="font-display text-2xl font-bold text-gold-light">{{ f.title }}</h2>
        <p class="mt-1 text-sm text-muted">{{ f.desc }}</p>
        <span class="mt-4 inline-block font-display font-bold tracking-widest text-teal uppercase">
          {{ f.cta }} →
        </span>
      </NuxtLinkLocale>
    </section>
  </div>
</template>

<script setup lang="ts">
import type { Meta } from '#shared/types'

const { t } = useI18n()
const meta = useState<Meta | null>('meta')

const games = computed(() => {
  const c = meta.value?.counts
  return [
    {
      key: 'lol',
      title: t('home.lolTitle'),
      desc: t('home.lolDesc', { champions: c?.lolChampions ?? 0, items: c?.lolItems ?? 0 }),
      links: [
        { to: '/lol/champions', label: t('nav.champions') },
        { to: '/lol/items', label: t('nav.items') },
      ],
    },
    {
      key: 'tft',
      title: t('home.tftTitle'),
      desc: t('home.tftDesc', {
        set: meta.value?.tftSet.number ?? '',
        champions: c?.tftChampions ?? 0,
        traits: c?.tftTraits ?? 0,
      }),
      links: [
        { to: '/tft/champions', label: t('nav.champions') },
        { to: '/tft/traits', label: t('nav.traits') },
        { to: '/tft/items', label: t('nav.items') },
      ],
    },
  ]
})

const features = computed(() => [
  { to: '/tft/builder', title: t('home.builderTitle'), desc: t('home.builderDesc'), cta: t('home.start') },
  { to: '/quiz', title: t('home.quizTitle'), desc: t('home.quizDesc'), cta: t('home.start') },
])

useSeoMeta({
  title: () => t('site.tagline'),
  ogTitle: () => `${t('site.name')} — ${t('site.tagline')}`,
  description: () => t('home.subtitle'),
})
</script>
