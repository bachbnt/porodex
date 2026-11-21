<template>
  <div class="flex items-center gap-3 text-sm">
    <span class="w-28 shrink-0 text-muted">{{ label }}</span>
    <div class="h-2 flex-1 bg-void ring-1 ring-gold-dark/60" role="img" :aria-label="`${label}: ${value}/${max}`">
      <div class="h-full bg-gradient-to-r from-gold-dark via-gold to-gold-light" :style="{ width: `${(value / max) * 100}%` }" />
    </div>
    <span class="w-8 text-right font-semibold text-gold-light">{{ value }}</span>
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{ label: string; value: number; max?: number }>(), { max: 10 })
</script>
