<template>
  <div class="panel mx-auto max-w-md p-8 text-center">
    <p class="font-display text-xl text-gold-light"><slot>{{ t('common.noResults') }}</slot></p>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()
</script>
