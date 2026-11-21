<template>
  <footer class="border-t border-gold-dark/50 bg-void/80">
    <div class="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-8 text-sm text-muted sm:px-6">
      <p>{{ t('footer.disclaimer') }}</p>
      <p class="flex flex-wrap gap-x-4 gap-y-1">
        <span>{{ t('footer.data') }}</span>
        <span v-if="meta">{{ t('common.patch') }} {{ meta.version }}</span>
        <NuxtLinkLocale to="/about" class="text-gold hover:text-teal">{{ t('nav.about') }}</NuxtLinkLocale>
      </p>
    </div>
  </footer>
</template>

<script setup lang="ts">
import type { Meta } from '#shared/types'

const { t } = useI18n()
const meta = useState<Meta | null>('meta')
</script>
