<template>
  <div class="max-w-3xl">
    <PageHero :title="t('about.title')" :eyebrow="t('site.name')" />
    <div class="space-y-8">
      <p class="text-lg text-ink/90">{{ t('about.what') }}</p>

      <section>
        <h2 class="font-display text-2xl font-bold text-gold-light">{{ t('about.dataTitle') }}</h2>
        <p class="mt-2 text-muted">{{ t('about.data') }}</p>
        <p v-if="meta" class="mt-2 text-sm text-muted">
          {{ t('common.patch') }} {{ meta.patch }} · TFT set {{ meta.tftSet.number }} ·
          <time :datetime="meta.generatedAt">{{ meta.generatedAt.slice(0, 10) }}</time>
        </p>
      </section>

      <section>
        <h2 class="font-display text-2xl font-bold text-gold-light">{{ t('about.legalTitle') }}</h2>
        <p class="mt-2 text-sm text-muted">{{ t('about.legal') }}</p>
      </section>

      <p class="text-sm text-muted">{{ t('about.tech') }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Meta } from '#shared/types'

const { t } = useI18n()
const meta = useState<Meta | null>('meta')

useSeoMeta({ title: () => t('about.title'), description: () => t('about.what') })
</script>
