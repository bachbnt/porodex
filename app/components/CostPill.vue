<template>
  <span
    class="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-semibold"
    :class="`cost-${cost}`"
    :style="{ color: 'var(--cost)', borderColor: 'var(--cost)' }"
    :title="t('tft.cost', { n: cost })"
  >
    <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true"><circle cx="5" cy="5" r="4.2" fill="currentColor" /></svg>
    {{ cost }}
  </span>
</template>

<script setup lang="ts">
defineProps<{ cost: number }>()
const { t } = useI18n()
</script>
