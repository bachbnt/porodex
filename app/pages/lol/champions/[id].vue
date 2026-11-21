<template>
  <article v-if="champ">
    <!-- Hero -->
    <header class="panel relative overflow-hidden">
      <img
        :src="assets.champSplash(champ.id)"
        alt=""
        width="1215"
        height="717"
        class="absolute inset-0 h-full w-full object-cover object-top opacity-45"
      />
      <div class="absolute inset-0 bg-gradient-to-t from-void via-void/60 to-transparent" />
      <div class="relative flex min-h-72 flex-col justify-end gap-3 p-6 sm:p-10">
        <NuxtLinkLocale to="/lol/champions" class="w-fit text-sm text-gold hover:text-teal">← {{ t('nav.champions') }}</NuxtLinkLocale>
        <p class="font-display text-lg tracking-[0.2em] text-teal uppercase">{{ champ.title }}</p>
        <h1 class="font-display text-5xl leading-none font-bold text-gold-light sm:text-7xl">{{ champ.name }}</h1>
        <ul class="flex flex-wrap gap-2">
          <li v-for="tag in champ.tags" :key="tag" class="border border-gold-dark px-2.5 py-1 text-xs tracking-wider text-gold uppercase">
            {{ t(`lol.roles.${tag}`) }}
          </li>
          <li v-if="champ.partype" class="border border-gold-dark/50 px-2.5 py-1 text-xs tracking-wider text-muted uppercase">
            {{ champ.partype }}
          </li>
        </ul>
      </div>
    </header>

    <div class="mt-8 grid gap-8 lg:grid-cols-[1fr_20rem]">
      <div class="min-w-0 space-y-8">
        <!-- Abilities -->
        <section aria-labelledby="abilities">
          <h2 id="abilities" class="font-display text-3xl font-bold text-gold-light">{{ t('lol.abilities') }}</h2>
          <hr class="divider !my-3" />
          <ul class="space-y-4">
            <li class="panel flex gap-4 p-4">
              <img :src="assets.passive(champ.passive.icon)" :alt="champ.passive.name" width="56" height="56" class="h-14 w-14 shrink-0 border border-gold-dark" />
              <div>
                <h3 class="font-display text-xl font-bold text-gold-light">
                  <span class="mr-2 text-xs tracking-widest text-teal uppercase">{{ t('lol.passive') }}</span>{{ champ.passive.name }}
                </h3>
                <DescText :html="champ.passive.description" class="mt-1 text-sm" />
              </div>
            </li>
            <li v-for="s in champ.spells" :key="s.id" class="panel flex gap-4 p-4">
              <div class="relative shrink-0">
                <img :src="assets.spell(s.icon)" :alt="s.name" width="56" height="56" class="h-14 w-14 border border-gold-dark" />
                <span class="absolute -right-1.5 -bottom-1.5 grid h-6 w-6 place-items-center bg-void font-display text-sm font-bold text-gold ring-1 ring-gold-dark">
                  {{ s.slot }}
                </span>
              </div>
              <div class="min-w-0">
                <h3 class="font-display text-xl font-bold text-gold-light">{{ s.name }}</h3>
                <dl class="mt-1 flex flex-wrap gap-x-5 gap-y-1 text-xs text-muted">
                  <div>
                    <dt class="inline">{{ t('lol.cooldown') }}:</dt>
                    <dd class="ml-1 inline font-semibold text-ink">{{ s.cooldown }}s</dd>
                  </div>
                  <div v-if="s.cost && s.cost !== '0'">
                    <dt class="inline">{{ t('lol.cost') }}:</dt>
                    <dd class="ml-1 inline font-semibold text-ink">{{ s.cost }}</dd>
                  </div>
                  <div v-if="s.range && s.range !== '0' && s.range !== 'self'">
                    <dt class="inline">{{ t('lol.range') }}:</dt>
                    <dd class="ml-1 inline font-semibold text-ink">{{ s.range }}</dd>
                  </div>
                </dl>
                <DescText :html="s.description" class="mt-2 text-sm" />
              </div>
            </li>
          </ul>
        </section>

        <!-- Lore -->
        <section aria-labelledby="lore">
          <h2 id="lore" class="font-display text-3xl font-bold text-gold-light">{{ t('lol.lore') }}</h2>
          <hr class="divider !my-3" />
          <DescText :html="champ.lore" class="!text-ink/85" />
        </section>

        <!-- Tips -->
        <section v-if="champ.allytips.length || champ.enemytips.length" class="grid gap-6 md:grid-cols-2">
          <div v-if="champ.allytips.length">
            <h2 class="font-display text-2xl font-bold text-gold-light">{{ t('lol.allyTips') }} {{ champ.name }}</h2>
            <ul class="mt-3 list-disc space-y-2 pl-5 text-sm text-ink/85 marker:text-teal">
              <li v-for="tip in champ.allytips" :key="tip">{{ tip }}</li>
            </ul>
          </div>
          <div v-if="champ.enemytips.length">
            <h2 class="font-display text-2xl font-bold text-gold-light">{{ t('lol.enemyTips') }} {{ champ.name }}</h2>
            <ul class="mt-3 list-disc space-y-2 pl-5 text-sm text-ink/85 marker:text-danger">
              <li v-for="tip in champ.enemytips" :key="tip">{{ tip }}</li>
            </ul>
          </div>
        </section>

        <!-- Skins -->
        <section aria-labelledby="skins">
          <h2 id="skins" class="font-display text-3xl font-bold text-gold-light">{{ t('lol.skins') }}</h2>
          <hr class="divider !my-3" />
          <ul ref="skinList" class="flex snap-x gap-3 overflow-x-auto pb-3">
            <li v-for="s in skins" :key="s.num" class="w-32 shrink-0 snap-start">
              <img
                :src="assets.champLoading(champ.id, s.num)"
                :alt="skinName(s)"
                width="308"
                height="560"
                loading="lazy"
                decoding="async"
                class="aspect-[308/560] w-full border border-gold-dark object-cover"
                :data-skin="s.num"
                @error="hideSkin(s.num)"
              />
              <p class="mt-1 text-xs text-muted">{{ skinName(s) }}</p>
            </li>
          </ul>
        </section>
      </div>

      <!-- Sidebar -->
      <aside class="space-y-6">
        <section class="panel space-y-3 p-5" aria-labelledby="ratings">
          <h2 id="ratings" class="sr-only">{{ t('lol.info.difficulty') }}</h2>
          <StatBar :label="t('lol.info.attack')" :value="champ.info.attack" />
          <StatBar :label="t('lol.info.defense')" :value="champ.info.defense" />
          <StatBar :label="t('lol.info.magic')" :value="champ.info.magic" />
          <StatBar :label="t('lol.info.difficulty')" :value="champ.info.difficulty" />
        </section>

        <section class="panel p-5" aria-labelledby="stats">
          <h2 id="stats" class="font-display text-2xl font-bold text-gold-light">{{ t('lol.stats') }}</h2>
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
import type { LolChampion } from '#shared/types'

const route = useRoute()
const { t, te } = useI18n()
const assets = useAssets()

const id = String(route.params.id)
const { data: champ, error } = await useLolChampion(id)

if (error.value || !champ.value) {
  throw createError({ statusCode: 404, statusMessage: 'Champion not found', fatal: true })
}

const skinName = (s: LolChampion['skins'][number]) => (s.num === 0 ? champ.value!.name : s.name)

// Some skins (old chromas) have no loading art; hide any whose image fails instead of showing a broken box.
const brokenSkins = ref<number[]>([])
const skinList = ref<HTMLElement>()
const skins = computed(() => (champ.value?.skins ?? []).filter((s) => !brokenSkins.value.includes(s.num)))
const hideSkin = (num: number) => {
  if (!brokenSkins.value.includes(num)) brokenSkins.value = [...brokenSkins.value, num]
}

// An image can fail before hydration attaches @error, so check the ones already settled.
onMounted(() => {
  skinList.value?.querySelectorAll<HTMLImageElement>('img[data-skin]').forEach((img) => {
    if (img.complete && img.naturalWidth === 0) hideSkin(Number(img.dataset.skin))
  })
})

const STAT_KEYS = [
  'hp', 'hpperlevel', 'mp', 'mpperlevel', 'movespeed', 'armor', 'armorperlevel',
  'spellblock', 'spellblockperlevel', 'attackrange', 'hpregen', 'hpregenperlevel',
  'mpregen', 'mpregenperlevel', 'attackdamage', 'attackdamageperlevel', 'attackspeed', 'attackspeedperlevel',
] as const

const statRows = computed(() =>
  STAT_KEYS.filter((k) => champ.value && champ.value.stats[k] != null && te(`lol.stat.${k}`)).map((k) => ({
    key: k,
    label: t(`lol.stat.${k}`),
    value: Number(Number(champ.value!.stats[k]).toFixed(3)),
  })),
)

useSeoMeta({
  title: () => `${champ.value?.name} — ${champ.value?.title}`,
  description: () => champ.value?.lore.replace(/<[^>]+>/g, ' ').slice(0, 160),
  ogImage: () => assets.champSplash(id),
})
</script>
