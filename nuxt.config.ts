import { existsSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import { STATIC_ROUTES, withLanguages } from './shared/utils/routes'

const SITE_URL = process.env.NUXT_PUBLIC_SITE_URL ?? 'https://porodex.web.app'

/** Entity pages (`/lol/champions/Ahri`, `/tft/champions/TFT_Ahri`...) written by `npm run sync` into server/assets/data. */
function entityRoutes(): string[] {
  const file = fileURLToPath(new URL('./server/assets/data/routes.json', import.meta.url))
  return existsSync(file) ? (JSON.parse(readFileSync(file, 'utf8')) as string[]) : []
}

/** Data files served by `server/api/data`; each is prerendered so client-side navigation works statically. */
function dataRoutes(): string[] {
  const file = fileURLToPath(new URL('./server/assets/data/files.json', import.meta.url))
  const files = existsSync(file) ? (JSON.parse(readFileSync(file, 'utf8')) as string[]) : []
  return files.map((f) => `/api/data/${f}`)
}

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: false },

  modules: ['@pinia/nuxt', '@vueuse/nuxt', '@nuxt/fonts', '@nuxtjs/i18n'],

  i18n: {
    strategy: 'prefix_except_default',
    defaultLocale: 'vi',
    // Static hosting cannot redirect by Accept-Language; the visitor picks a language explicitly.
    detectBrowserLanguage: false,
    baseUrl: SITE_URL,
    locales: [
      { code: 'vi', language: 'vi-VN', name: 'Tiếng Việt', file: 'vi.json' },
      { code: 'en', language: 'en-US', name: 'English', file: 'en.json' },
    ],
  },

  pinia: {
    storesDirs: ['./stores/**'],
  },

  css: ['~/assets/css/main.css'],

  vite: {
    plugins: [tailwindcss()],
  },

  fonts: {
    families: [
      // Both faces ship Vietnamese glyphs, so diacritics never fall back to a mismatched font.
      { name: 'Cormorant Garamond', provider: 'google', weights: [600, 700], subsets: ['vietnamese', 'latin', 'latin-ext'] },
      { name: 'Be Vietnam Pro', provider: 'google', weights: [400, 500, 600], subsets: ['vietnamese', 'latin', 'latin-ext'] },
    ],
  },

  runtimeConfig: {
    public: {
      siteUrl: SITE_URL,
    },
  },

  // Static hosting: `nuxt generate` prerenders every page from the data `npm run sync` produced.
  nitro: {
    prerender: {
      crawlLinks: false,
      failOnError: true,
      concurrency: 8,
      routes: [...[...STATIC_ROUTES, ...entityRoutes()].flatMap(withLanguages), ...dataRoutes()],
    },
  },

  app: {
    head: {
      title: 'Porodex',
      meta: [
        { name: 'theme-color', content: '#010a13' },
        { name: 'description', content: 'Porodex — tra cứu tướng, trang bị, hệ và xây đội hình cho Liên Minh Huyền Thoại và Đấu Trường Chân Lý.' },
      ],
      link: [{ rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }],
    },
  },

  typescript: {
    strict: true,
  },
})
