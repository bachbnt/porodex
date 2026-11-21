<template>
  <NuxtLinkLocale :to="`/tft/champions/${champion.apiName}`" class="panel group block p-3" :class="`cost-${champion.cost}`">
    <div class="flex items-center gap-3">
      <TftIcon :src="champion.icon" :cost="champion.cost" :alt="champion.name" :size="64" />
      <div class="min-w-0">
        <p class="truncate font-display text-lg leading-tight font-bold text-gold-light">{{ champion.name }}</p>
        <CostPill :cost="champion.cost" class="mt-1" />
      </div>
    </div>
    <p class="mt-2.5 line-clamp-2 text-xs leading-relaxed text-muted">{{ champion.traits.join(' · ') }}</p>
  </NuxtLinkLocale>
</template>

<script setup lang="ts">
import type { TftChampion } from '#shared/types'

defineProps<{ champion: TftChampion }>()
</script>
