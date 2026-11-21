<template>
  <NuxtLinkLocale :to="`/lol/champions/${champion.id}`" class="panel group block p-1.5">
    <div class="overflow-hidden">
      <img
        :src="assets.champSquare(champion.id)"
        :alt="champion.name"
        width="120"
        height="120"
        loading="lazy"
        decoding="async"
        class="tile-img transition-transform duration-300 group-hover:scale-110"
      />
    </div>
    <div class="px-1.5 pt-2 pb-1.5 text-center">
      <p class="truncate font-display text-lg leading-tight font-bold text-gold-light">{{ champion.name }}</p>
      <p class="truncate text-xs text-muted capitalize">{{ champion.title }}</p>
    </div>
  </NuxtLinkLocale>
</template>

<script setup lang="ts">
import type { LolChampionSummary } from '#shared/types'

defineProps<{ champion: LolChampionSummary }>()
const assets = useAssets()
</script>
