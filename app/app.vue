<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup lang="ts">
const { t, locale } = useI18n()
const head = useLocaleHead({ dir: false, seo: true })

useHead({
  htmlAttrs: { lang: () => head.value.htmlAttrs?.lang ?? locale.value },
  link: () => head.value.link ?? [],
  meta: () => head.value.meta ?? [],
  titleTemplate: (title) => (title ? `${title} · ${t('site.name')}` : `${t('site.name')} — ${t('site.tagline')}`),
})
</script>
