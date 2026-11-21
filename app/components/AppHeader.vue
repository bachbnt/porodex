<template>
  <header class="sticky top-0 z-40 border-b border-gold-dark/60 bg-void/85 backdrop-blur">
    <div class="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3 sm:px-6">
      <NuxtLinkLocale to="/" class="flex items-center gap-2.5" :aria-label="t('site.name')">
        <img src="/favicon.svg" alt="" width="34" height="34" />
        <span class="font-display text-2xl font-bold tracking-wide text-gold-light">Porodex</span>
      </NuxtLinkLocale>

      <!-- Desktop navigation -->
      <nav class="ml-6 hidden items-center gap-1 lg:flex" aria-label="Main">
        <div v-for="group in groups" :key="group.label" class="group relative">
          <button
            type="button"
            class="flex items-center gap-1.5 rounded px-3 py-2 text-sm font-medium tracking-wide text-ink/90 uppercase hover:text-teal focus-visible:text-teal"
            :aria-haspopup="true"
          >
            {{ group.label }}
            <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true"><path d="M1 3l4 4 4-4" fill="none" stroke="currentColor" stroke-width="1.5" /></svg>
          </button>
          <div
            class="invisible absolute left-0 top-full min-w-48 pt-2 opacity-0 transition group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100"
          >
            <ul class="panel py-2">
              <li v-for="link in group.links" :key="link.to">
                <NuxtLinkLocale
                  :to="link.to"
                  class="block px-4 py-2 text-sm text-ink/90 hover:bg-teal/10 hover:text-teal"
                  active-class="!text-teal"
                >
                  {{ link.label }}
                </NuxtLinkLocale>
              </li>
            </ul>
          </div>
        </div>
        <NuxtLinkLocale
          v-for="link in topLinks"
          :key="link.to"
          :to="link.to"
          class="rounded px-3 py-2 text-sm font-medium tracking-wide text-ink/90 uppercase hover:text-teal"
          active-class="!text-teal"
        >
          {{ link.label }}
        </NuxtLinkLocale>
      </nav>

      <div class="ml-auto flex items-center gap-2">
        <LocaleSwitcher />
        <button
          type="button"
          class="grid h-10 w-10 place-items-center border border-gold-dark text-gold-light lg:hidden"
          :aria-expanded="open"
          aria-controls="mobile-nav"
          :aria-label="t('nav.menu')"
          @click="open = !open"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
            <path v-if="!open" d="M3 6h14M3 10h14M3 14h14" stroke="currentColor" stroke-width="1.8" fill="none" />
            <path v-else d="M5 5l10 10M15 5L5 15" stroke="currentColor" stroke-width="1.8" fill="none" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Mobile navigation -->
    <nav v-if="open" id="mobile-nav" class="border-t border-gold-dark/50 bg-void lg:hidden" aria-label="Mobile">
      <div class="mx-auto max-w-6xl px-4 py-3 sm:px-6">
        <div v-for="group in groups" :key="group.label" class="py-2">
          <p class="font-display text-sm font-bold tracking-widest text-gold uppercase">{{ group.label }}</p>
          <ul class="mt-1 grid grid-cols-2 gap-x-4">
            <li v-for="link in group.links" :key="link.to">
              <NuxtLinkLocale :to="link.to" class="block py-2 text-ink/90" active-class="!text-teal">
                {{ link.label }}
              </NuxtLinkLocale>
            </li>
          </ul>
        </div>
        <ul class="flex gap-6 border-t border-gold-dark/30 py-2">
          <li v-for="link in topLinks" :key="link.to">
            <NuxtLinkLocale :to="link.to" class="block py-2 text-ink/90" active-class="!text-teal">
              {{ link.label }}
            </NuxtLinkLocale>
          </li>
        </ul>
      </div>
    </nav>
  </header>
</template>

<script setup lang="ts">
const { t } = useI18n()
const route = useRoute()
const open = ref(false)

// Close the mobile menu after navigating.
watch(() => route.fullPath, () => (open.value = false))

const groups = computed(() => [
  {
    label: t('nav.lol'),
    links: [
      { to: '/lol/champions', label: t('nav.champions') },
      { to: '/lol/items', label: t('nav.items') },
    ],
  },
  {
    label: t('nav.tft'),
    links: [
      { to: '/tft/champions', label: t('nav.champions') },
      { to: '/tft/traits', label: t('nav.traits') },
      { to: '/tft/items', label: t('nav.items') },
      { to: '/tft/builder', label: t('nav.builder') },
    ],
  },
])

const topLinks = computed(() => [
  { to: '/quiz', label: t('nav.quiz') },
  { to: '/about', label: t('nav.about') },
])
</script>
