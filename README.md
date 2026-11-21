# Porodex

A Hextech-styled field guide for **League of Legends** and **Teamfight Tactics**: champions, items, traits, a TFT team builder and quizzes. Vietnamese and English.

- **LoL:** champions (abilities, stats, lore, skins) and Summoner's Rift items with build paths.
- **TFT:** champions, traits with activation breakpoints, an item recipe chart, and a team builder that shows which traits light up and shares your comp as a link.
- **Quiz:** guess a champion from an ability icon, from blurred art, or from TFT traits; or match item recipes.

No backend and no API key. A script downloads Riot's public static data, and `nuxt generate` turns it into plain static pages.

## Stack

Nuxt 4 (static generation) · TypeScript · Tailwind CSS 4 · Pinia · `@nuxtjs/i18n` · Firebase Hosting

## Getting started

```bash
npm install
npm run dev        # syncs data on first run, then starts the dev server
```

| Command | What it does |
| --- | --- |
| `npm run sync` | Downloads and trims game data into `server/assets/data/` (skips if the patch is already synced; add `-- --force` to refresh) |
| `npm run dev` | Dev server (runs `sync` first) |
| `npm run generate` | Prerenders every page into `.output/public` (runs `sync` first) |
| `npm test` | Unit tests |
| `npm run typecheck` | Type check |
| `npm run deploy:firebase` | Generate and deploy to Firebase Hosting |

## How the data flows

```
Data Dragon (LoL) ─┐                                 ┌─> /api/data/*.json  (prerendered)
                   ├─> scripts/sync-data.mjs ─> server/assets/data ─┤
Community Dragon (TFT) ─┘                            └─> /lol/..., /tft/... (prerendered pages)
```

- `scripts/sync-data.mjs` fetches LoL data from [Data Dragon](https://developer.riotgames.com/docs/lol#data-dragon) and TFT data from [Community Dragon](https://www.communitydragon.org/), in Vietnamese and English, and keeps only what the app shows.
- `scripts/lib/text.mjs` turns Riot's markup into a tiny safe subset (`<br>` and classed `<span>`), so the app can render descriptions without trusting upstream.
- `server/api/data/[...path].get.ts` serves those files. During `generate` every file is prerendered to a static `/api/data/*.json`, which is what client-side navigation fetches.
- Images are loaded from Riot's and Community Dragon's CDNs.

### Known limitation

The public TFT feed doesn't include per-star ability numbers for the current set, so those values show a dotted `?`. The UI says why where it appears.

## Keeping it current

`.github/workflows/deploy.yml` re-syncs the data and redeploys every day, so a new patch appears without any manual step. It needs a `FIREBASE_SERVICE_ACCOUNT` secret. `ci.yml` runs tests, the type check and a full prerender on every push.

## Project layout

```
app/            pages, components, composables, Pinia stores, styles
i18n/locales/   vi.json, en.json
scripts/        data sync (plain Node, no dependencies)
server/         the data route; server/assets/data is generated and git-ignored
shared/         types and route helpers shared with the config
tests/          Vitest
```

## Legal

Porodex isn't endorsed by Riot Games and doesn't reflect the views or opinions of Riot Games or anyone officially involved in producing or managing League of Legends or Teamfight Tactics. League of Legends, Teamfight Tactics and Riot Games are trademarks or registered trademarks of Riot Games, Inc.
