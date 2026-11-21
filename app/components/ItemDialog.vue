<template>
  <dialog
    ref="dialog"
    class="m-auto w-[min(34rem,calc(100vw-2rem))] bg-transparent p-0 text-ink backdrop:bg-void/80 backdrop:backdrop-blur-sm"
    :aria-label="item?.name"
    @close="emit('close')"
    @click="onBackdrop"
  >
    <div v-if="item" class="panel p-5 sm:p-6">
      <div class="flex items-start gap-4">
        <img :src="assets.item(item.id)" :alt="item.name" width="64" height="64" class="h-16 w-16 border border-gold-dark" />
        <div class="min-w-0 flex-1">
          <h2 class="font-display text-2xl leading-tight font-bold text-gold-light">{{ item.name }}</h2>
          <p class="text-sm text-gold">
            {{ item.gold.total }} {{ t('lol.gold') }}
            <span class="text-muted">· {{ t('lol.sell') }} {{ item.gold.sell }}</span>
          </p>
        </div>
        <button type="button" class="grid h-9 w-9 shrink-0 place-items-center border border-gold-dark text-gold-light hover:border-teal" :aria-label="t('common.close')" @click="close">
          <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><path d="M3 3l10 10M13 3L3 13" stroke="currentColor" stroke-width="1.8" /></svg>
        </button>
      </div>

      <DescText :html="item.description" class="mt-4 text-sm" />

      <template v-if="item.from.length || item.into.length">
        <hr class="divider" />
        <div v-if="item.from.length">
          <p class="font-display text-sm font-bold tracking-widest text-gold uppercase">{{ t('lol.buildsFrom') }}</p>
          <ul class="mt-2 flex flex-wrap gap-2">
            <li v-for="id in item.from" :key="id">
              <button type="button" class="flex items-center gap-2 border border-gold-dark/70 bg-void/60 px-2 py-1 text-xs hover:border-teal" @click="emit('select', id)">
                <img :src="assets.item(id)" alt="" width="28" height="28" class="h-7 w-7" />
                {{ names.get(id) }}
              </button>
            </li>
          </ul>
        </div>
        <div v-if="item.into.length" class="mt-4">
          <p class="font-display text-sm font-bold tracking-widest text-gold uppercase">{{ t('lol.buildsInto') }}</p>
          <ul class="mt-2 flex flex-wrap gap-2">
            <li v-for="id in item.into" :key="id">
              <button type="button" class="flex items-center gap-2 border border-gold-dark/70 bg-void/60 px-2 py-1 text-xs hover:border-teal" @click="emit('select', id)">
                <img :src="assets.item(id)" alt="" width="28" height="28" class="h-7 w-7" />
                {{ names.get(id) }}
              </button>
            </li>
          </ul>
        </div>
      </template>
      <p v-else class="mt-4 text-sm text-muted">{{ t('lol.noRecipe') }}</p>
    </div>
  </dialog>
</template>

<script setup lang="ts">
import type { LolItem } from '#shared/types'

const props = defineProps<{ item: LolItem | null; items: LolItem[] }>()
const emit = defineEmits<{ close: []; select: [id: string] }>()

const { t } = useI18n()
const assets = useAssets()
const dialog = ref<HTMLDialogElement>()
const names = computed(() => new Map(props.items.map((i) => [i.id, i.name])))

watch(
  () => props.item,
  (item) => {
    const el = dialog.value
    if (!el) return
    if (item && !el.open) el.showModal()
    if (!item && el.open) el.close()
  },
  { flush: 'post' },
)

const close = () => dialog.value?.close()

/** A click on the ::backdrop lands on the <dialog> element itself, not on its content. */
function onBackdrop(e: MouseEvent) {
  if (e.target === dialog.value) close()
}
</script>
