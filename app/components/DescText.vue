<template>
  <!-- The HTML is produced by scripts/lib/text.mjs, which only emits <br> and <span class="x-…">. -->
  <p class="desc" v-html="html" />
</template>

<script setup lang="ts">
defineProps<{ html: string }>()
</script>
