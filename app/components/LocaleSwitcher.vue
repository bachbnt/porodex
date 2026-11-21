<template>
  <div class="flex overflow-hidden border border-gold-dark" role="group" :aria-label="t('common.language')">
    <NuxtLink
      v-for="l in locales"
      :key="l.code"
      :to="switchLocalePath(l.code)"
      :aria-current="l.code === locale ? 'true' : undefined"
      :hreflang="l.language"
      class="px-2.5 py-1.5 text-xs font-semibold tracking-wider uppercase"
      :class="l.code === locale ? 'bg-gold text-void' : 'text-ink/80 hover:text-teal'"
    >
      {{ l.code }}
    </NuxtLink>
  </div>
</template>

<script setup lang="ts">
const { t, locale, locales } = useI18n()
const switchLocalePath = useSwitchLocalePath()
</script>
