#!/usr/bin/env node
/**
 * Pulls static game data from Riot's Data Dragon (League of Legends) and Community Dragon (TFT),
 * trims it to what Porodex shows, and writes it to `server/assets/data/` for the app and the prerenderer.
 *
 *   npm run sync            skips work when the patch already synced
 *   npm run sync -- --force re-downloads everything
 *
 * No API key is needed: both sources are public static files.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync, rmSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { cleanDesc, resolveTokens } from './lib/text.mjs'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const OUT = join(ROOT, 'server', 'assets', 'data')
const FORCE = process.argv.includes('--force') || process.env.FORCE === '1'

const DDRAGON = 'https://ddragon.leagueoflegends.com'
const CDRAGON = 'https://raw.communitydragon.org/latest'
const GAME_ASSETS = `${CDRAGON}/game/`

/** UI language -> source locale codes. */
const LANGS = {
  vi: { ddragon: 'vi_VN', cdragon: 'vi_vn' },
  en: { ddragon: 'en_US', cdragon: 'en_us' },
}

/** Community Dragon ships `assets/...tex` paths; the CDN serves them lower-cased as `.png`. */
const iconUrl = (path) =>
  path && path.includes('/') ? GAME_ASSETS + path.toLowerCase().replace(/\.tex$/, '.png') : null

async function getJson(url, tries = 4) {
  let last
  for (let i = 0; i < tries; i++) {
    try {
      const res = await fetch(url)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      return await res.json()
    } catch (err) {
      last = err
      await new Promise((r) => setTimeout(r, 400 * (i + 1)))
    }
  }
  throw new Error(`Failed to fetch ${url}: ${last?.message}`)
}

/** Runs `fn` over `items` with a bounded number of requests in flight. */
async function pool(items, size, fn) {
  const results = new Array(items.length)
  let next = 0
  await Promise.all(
    Array.from({ length: Math.min(size, items.length) }, async () => {
      while (next < items.length) {
        const i = next++
        results[i] = await fn(items[i], i)
      }
    }),
  )
  return results
}

/** Every file written this run; the prerenderer needs the list to emit them as static JSON. */
const written = []

function write(rel, data) {
  written.push(rel)
  const file = join(OUT, rel)
  mkdirSync(dirname(file), { recursive: true })
  writeFileSync(file, JSON.stringify(data))
}

// ---------------------------------------------------------------------------------------------
// League of Legends
// ---------------------------------------------------------------------------------------------

async function syncLol(version, lang) {
  const loc = LANGS[lang].ddragon
  const base = `${DDRAGON}/cdn/${version}/data/${loc}`

  const list = await getJson(`${base}/champion.json`)
  const champions = Object.values(list.data)
    .map((c) => ({
      id: c.id,
      key: c.key,
      name: c.name,
      title: c.title,
      tags: c.tags,
      partype: c.partype,
      blurb: cleanDesc(c.blurb, { lang }),
      info: c.info,
    }))
    .sort((a, b) => a.name.localeCompare(b.name, lang))
  write(`lol/champions.${lang}.json`, champions)

  const quiz = []
  await pool(champions, 12, async (c) => {
    const detail = (await getJson(`${base}/champion/${c.id}.json`)).data[c.id]
    write(`lol/champion/${lang}/${c.id}.json`, {
      id: detail.id,
      key: detail.key,
      name: detail.name,
      title: detail.title,
      lore: cleanDesc(detail.lore, { lang }),
      tags: detail.tags,
      partype: detail.partype,
      allytips: detail.allytips,
      enemytips: detail.enemytips,
      info: detail.info,
      stats: detail.stats,
      passive: {
        name: detail.passive.name,
        description: cleanDesc(detail.passive.description, { lang }),
        icon: detail.passive.image.full,
      },
      spells: detail.spells.map((s, i) => ({
        slot: 'QWER'[i],
        id: s.id,
        name: s.name,
        description: cleanDesc(s.description, { lang }),
        cooldown: s.cooldownBurn,
        cost: s.costBurn,
        costType: s.costType,
        range: s.rangeBurn,
        maxrank: s.maxrank,
        icon: s.image.full,
      })),
      skins: detail.skins.map((s) => ({ num: s.num, name: s.name })),
    })
    quiz.push({
      id: detail.id,
      name: detail.name,
      passive: detail.passive.image.full,
      spells: detail.spells.map((s) => s.image.full),
    })
  })
  quiz.sort((a, b) => a.name.localeCompare(b.name, lang))
  write(`lol/quiz.${lang}.json`, quiz)

  const itemData = (await getJson(`${base}/item.json`)).data
  const items = Object.entries(itemData)
    .filter(
      ([, it]) =>
        it.maps?.['11'] && it.gold?.purchasable && it.gold.total > 0 && !it.requiredChampion && !it.requiredAlly,
    )
    .map(([id, it]) => ({
      id,
      name: it.name,
      plaintext: it.plaintext ?? '',
      description: cleanDesc(it.description, { lang }),
      gold: { base: it.gold.base, total: it.gold.total, sell: it.gold.sell },
      from: it.from ?? [],
      into: it.into ?? [],
      tags: it.tags ?? [],
      depth: it.depth ?? 1,
    }))
    .sort((a, b) => a.gold.total - b.gold.total || a.name.localeCompare(b.name, lang))
  // Keep only references to items that survived the filter.
  const ids = new Set(items.map((i) => i.id))
  for (const it of items) {
    it.from = it.from.filter((x) => ids.has(x))
    it.into = it.into.filter((x) => ids.has(x))
  }
  write(`lol/items.${lang}.json`, items)

  return { champions: champions.map((c) => c.id), items: items.length }
}

// ---------------------------------------------------------------------------------------------
// Teamfight Tactics
// ---------------------------------------------------------------------------------------------

const STAR_SLOTS = [1, 2, 3]

function abilityText(ability, lang) {
  if (!ability?.desc) return ''
  const vars = {}
  for (const v of ability.variables ?? []) {
    const stars = STAR_SLOTS.map((i) => v.value?.[i]).filter((x) => x != null)
    if (stars.length) vars[v.name] = stars
  }
  return cleanDesc(resolveTokens(ability.desc, vars, { lang, series: true }), { lang })
}

function traitRows(trait, lang) {
  // Each <row> in the description belongs to one breakpoint (effects[i]).
  const rows = [...trait.desc.matchAll(/<row>([\s\S]*?)<\/row>/g)].map((m) => m[1])
  const intro = cleanDesc(trait.desc.replace(/<row>[\s\S]*?<\/row>/g, '').replace(/(<br>\s*)+$/g, ''), { lang })
  const breakpoints = trait.effects.map((e, i) => {
    const vars = { ...e.variables, MinUnits: e.minUnits }
    const text = rows[i] ? cleanDesc(resolveTokens(rows[i], vars, { lang }), { lang }) : ''
    return { min: e.minUnits, max: e.maxUnits, style: e.style, text }
  })
  return { intro: cleanDesc(resolveTokens(intro, {}, { lang }), { lang }), breakpoints }
}

async function syncTft(lang) {
  const data = await getJson(`${CDRAGON}/cdragon/tft/${LANGS[lang].cdragon}.json`)

  // The live set is the highest-numbered entry whose mutator is exactly `TFTSet<n>`.
  const sets = data.setData.filter((s) => s.mutator === `TFTSet${s.number}`)
  const set = sets.sort((a, b) => b.number - a.number)[0]
  if (!set) throw new Error('No live TFT set found in Community Dragon data')

  const byApi = new Map(data.items.map((i) => [i.apiName, i]))
  const traitByName = new Map(set.traits.map((t) => [t.name, t]))

  const traits = set.traits
    .map((t) => ({ apiName: t.apiName, name: t.name, icon: iconUrl(t.icon), ...traitRows(t, lang) }))
    .sort((a, b) => a.name.localeCompare(b.name, lang))

  const champions = set.champions
    .filter((c) => c.traits?.length && c.cost >= 1 && c.cost <= 5)
    .map((c) => ({
      apiName: c.apiName,
      name: c.name,
      cost: c.cost,
      traits: c.traits.filter((t) => traitByName.has(t)),
      role: c.role ?? null,
      icon: iconUrl(c.squareIcon || c.tileIcon || c.icon),
      ability: {
        name: c.ability?.name ?? '',
        desc: abilityText(c.ability, lang),
        icon: iconUrl(c.ability?.icon),
      },
      stats: {
        hp: c.stats?.hp,
        mana: c.stats?.mana,
        initialMana: c.stats?.initialMana,
        damage: c.stats?.damage,
        armor: c.stats?.armor,
        magicResist: c.stats?.magicResist,
        attackSpeed: c.stats?.attackSpeed,
        critChance: c.stats?.critChance,
        range: c.stats?.range,
      },
    }))
    .sort((a, b) => a.cost - b.cost || a.name.localeCompare(b.name, lang))

  // Items. The feed carries two parallel pools (`DA_*` for the live set, `TFT_Item_*` legacy);
  // use whichever pool holds more crafted items, then borrow missing descriptions by name.
  const setItems = set.items.map((id) => byApi.get(id)).filter(Boolean)
  const isDa = (id) => id.startsWith('DA_')
  const crafted2 = setItems.filter((it) => it.composition?.length === 2)
  const daCount = crafted2.filter((it) => isDa(it.apiName)).length
  const pool = daCount >= crafted2.length - daCount ? 'DA' : 'TFT'
  const inPool = (id) => (pool === 'DA' ? isDa(id) : !isDa(id))

  const descByName = new Map()
  for (const it of data.items) {
    const d = (it.desc ?? '').trim()
    if (d && it.name && !descByName.has(it.name)) descByName.set(it.name, it)
  }
  const describe = (it) => {
    const own = (it.desc ?? '').trim()
    if (own) return cleanDesc(resolveTokens(it.desc, it.effects ?? {}, { lang }), { lang })
    const twin = descByName.get(it.name)
    return twin ? cleanDesc(resolveTokens(twin.desc, twin.effects ?? {}, { lang }), { lang }) : ''
  }

  const crafted = crafted2.filter((it) => inPool(it.apiName) && it.composition.every(inPool))
  const componentIds = new Set(crafted.flatMap((it) => it.composition))
  const shape = (it) => ({
    apiName: it.apiName,
    name: it.name.trim(),
    icon: iconUrl(it.icon),
    desc: describe(it),
    composition: it.composition ?? [],
  })

  const byName = (a, b) => a.name.localeCompare(b.name, lang)
  const components = [...componentIds]
    .map((id) => byApi.get(id))
    .filter((it) => it && !it.composition?.length)
    .map(shape)
    .sort(byName)
  const isEmblem = (it) => /Emblem|Tactician/i.test(it.apiName)
  const emblems = crafted.filter(isEmblem).map(shape).sort(byName)
  const completed = crafted.filter((it) => !isEmblem(it)).map(shape).sort(byName)

  const out = {
    set: { number: set.number, mutator: set.mutator },
    champions,
    traits,
    items: { components, completed, emblems },
  }
  write(`tft/${lang}.json`, out)
  return out
}

// ---------------------------------------------------------------------------------------------

async function main() {
  const versions = await getJson(`${DDRAGON}/api/versions.json`)
  const version = versions[0]

  const metaFile = join(OUT, 'meta.json')
  if (!FORCE && existsSync(metaFile)) {
    const prev = JSON.parse(readFileSync(metaFile, 'utf8'))
    if (prev.version === version && prev.schema === 1) {
      console.log(`✔ Data already synced for patch ${version} (use --force to refresh)`)
      return
    }
  }

  console.log(`Syncing patch ${version}…`)
  rmSync(OUT, { recursive: true, force: true })
  mkdirSync(OUT, { recursive: true })

  const routes = []
  let lolIds = []
  let tftApi = []
  let tftSet = null
  let counts = {}
  for (const lang of Object.keys(LANGS)) {
    const lol = await syncLol(version, lang)
    const tft = await syncTft(lang)
    lolIds = lol.champions
    tftApi = tft.champions.map((c) => c.apiName)
    tftSet = tft.set
    counts = {
      lolChampions: lol.champions.length,
      lolItems: lol.items,
      tftChampions: tft.champions.length,
      tftTraits: tft.traits.length,
    }
    console.log(
      `  ${lang}: ${lol.champions.length} LoL champions, ${lol.items} LoL items | ` +
        `TFT set ${tft.set.number}: ${tft.champions.length} champions, ${tft.traits.length} traits, ` +
        `${tft.items.components.length}/${tft.items.completed.length}/${tft.items.emblems.length} components/items/emblems`,
    )
  }
  for (const id of lolIds) routes.push(`/lol/champions/${id}`)
  for (const id of tftApi) routes.push(`/tft/champions/${id}`)

  write('routes.json', routes)
  write('meta.json', {
    schema: 1,
    version,
    tftSet,
    counts,
    generatedAt: new Date().toISOString(),
  })
  // Listed last so it contains every other file (but not itself).
  write('files.json', written.filter((f) => f !== 'routes.json'))
  console.log(`✔ Wrote ${routes.length} entity routes and ${written.length} data files`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
