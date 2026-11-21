<template>
  <span
    class="inline-flex items-center gap-1.5 border px-2 py-1 text-xs font-medium"
    :style="{ borderColor: color, color: dim ? 'var(--muted)' : color }"
    :class="dim ? 'opacity-70' : ''"
  >
    <img v-if="icon" :src="icon" alt="" width="16" height="16" loading="lazy" class="h-4 w-4 object-contain" />
    <span>{{ name }}</span>
    <span v-if="count != null" class="font-bold">{{ count }}</span>
  </span>
</template>

<script setup lang="ts">
const props = defineProps<{
  name: string
  icon?: string | null
  /** Trait tier style from the data (1 bronze … 6 prismatic). Omit for a neutral chip. */
  style?: number
  count?: number
  dim?: boolean
}>()

const color = computed(() => (props.style != null ? tierColor(props.style) : 'var(--gold-3)'))
</script>
