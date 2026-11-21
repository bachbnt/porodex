<template>
  <div class="flex min-h-dvh flex-col">
    <a
      href="#main"
      class="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50 focus:bg-void focus:px-3 focus:py-2"
    >
      {{ t('nav.skip') }}
    </a>
    <AppHeader />
    <main id="main" class="mx-auto w-full max-w-6xl flex-1 px-4 pb-16 pt-8 sm:px-6">
      <slot />
    </main>
    <AppFooter />
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()
</script>
