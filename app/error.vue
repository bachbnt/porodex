<template>
  <NuxtLayout>
    <div class="mx-auto max-w-xl px-4 py-24 text-center">
      <p class="font-display text-7xl font-bold text-gold">{{ error?.statusCode ?? 404 }}</p>
      <h1 class="mt-2 font-display text-3xl font-bold text-gold-light">{{ t('error.title') }}</h1>
      <p class="mt-3 text-muted">{{ t('error.text') }}</p>
      <button class="btn btn-primary mt-8" @click="clearError({ redirect: localePath('/') })">
        {{ t('error.home') }}
      </button>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import type { NuxtError } from '#app'

defineProps<{ error: NuxtError }>()
const { t } = useI18n()
const localePath = useLocalePath()
</script>
