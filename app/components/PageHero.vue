<template>
  <section class="mb-8">
    <p v-if="eyebrow" class="font-display text-sm font-bold tracking-[0.25em] text-teal uppercase">{{ eyebrow }}</p>
    <h1 class="mt-1 font-display text-4xl leading-tight font-bold text-gold-light sm:text-5xl">{{ title }}</h1>
    <p v-if="subtitle" class="mt-2 max-w-2xl text-muted">{{ subtitle }}</p>
    <hr class="divider" />
    <slot />
  </section>
</template>

<script setup lang="ts">
defineProps<{ title: string; subtitle?: string; eyebrow?: string }>()
</script>
