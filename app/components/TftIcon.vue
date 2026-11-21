<template>
  <span
    class="relative inline-block shrink-0 overflow-hidden bg-navy"
    :class="`cost-${cost}`"
    :style="{ width: `${size}px`, height: `${size}px`, border: '2px solid var(--cost)' }"
  >
    <img
      v-if="src"
      :src="src"
      :alt="alt"
      :width="size"
      :height="size"
      loading="lazy"
      decoding="async"
      class="h-full w-full object-cover"
    />
    <span v-else class="grid h-full w-full place-items-center font-display text-lg text-muted">?</span>
  </span>
</template>

<script setup lang="ts">
withDefaults(defineProps<{ src: string | null; cost: number; alt?: string; size?: number }>(), {
  alt: '',
  size: 64,
})
</script>
