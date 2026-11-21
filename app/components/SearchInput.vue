<template>
  <label class="relative block">
    <span class="sr-only">{{ t('common.search') }}</span>
    <svg
      class="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-gold-dark"
      width="18"
      height="18"
      viewBox="0 0 20 20"
      aria-hidden="true"
    >
      <circle cx="8.5" cy="8.5" r="5.5" fill="none" stroke="currentColor" stroke-width="1.8" />
      <path d="M13 13l5 5" stroke="currentColor" stroke-width="1.8" />
    </svg>
    <input
      v-model="model"
      type="search"
      class="input !pl-10"
      :placeholder="t('common.searchPlaceholder')"
      autocomplete="off"
      spellcheck="false"
    />
  </label>
</template>

<script setup lang="ts">
const model = defineModel<string>({ default: '' })
const { t } = useI18n()
</script>
