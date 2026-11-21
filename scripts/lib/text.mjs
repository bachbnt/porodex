/**
 * Turns Riot's markup-laden descriptions into a tiny, safe HTML subset:
 * `<br>` and `<span class="x-…">` only. Everything else is stripped and escaped, so the app can
 * render the result with `v-html` without trusting upstream.
 */

/** Tag name (lower-case) -> CSS class of the span it becomes. Tags not listed are dropped. */
const SPAN_TAGS = {
  magicdamage: 'x-magic',
  physicaldamage: 'x-physical',
  truedamage: 'x-true',
  healing: 'x-heal',
  shield: 'x-shield',
  attention: 'x-attn',
  status: 'x-status',
  keywordmajor: 'x-attn',
  tftkeyword: 'x-attn',
  active: 'x-key',
  passive: 'x-key',
  rarity: 'x-key',
  rules: 'x-rules',
  tftitemrules: 'x-rules',
  tftbonus: 'x-attn',
  keyword: 'x-attn',
  bright: 'x-bright',
  dim: 'x-rules',
  tftkeyword: 'x-attn',
  scaleap: 'x-ap',
  scalead: 'x-ad',
}

/** `%i:scaleAP%` -> a short label, per language. Unknown icons are dropped. */
const ICONS = {
  vi: {
    scaleap: 'SMPT',
    scalead: 'STVL',
    scalehealth: 'Máu',
    scaleas: 'TĐĐ',
    scalearmor: 'Giáp',
    scalemr: 'KPT',
    scalemana: 'Mana',
    scalecrit: 'Chí mạng',
    scaledr: 'Giảm ST',
    scalerange: 'Tầm',
    scaleap1: 'SMPT',
    scaleda: 'KĐST',
    scalesp: 'SMPT',
    scalecritdamage: 'ST chí mạng',
    scaleharmonic: 'Hòa Hợp',
  },
  en: {
    scaleap: 'AP',
    scalead: 'AD',
    scalehealth: 'Health',
    scaleas: 'AS',
    scalearmor: 'Armor',
    scalemr: 'MR',
    scalemana: 'Mana',
    scalecrit: 'Crit',
    scaledr: 'DR',
    scalerange: 'Range',
    scaleap1: 'AP',
    scaleda: 'DA',
    scalesp: 'AP',
    scalecritdamage: 'Crit Dmg',
    scaleharmonic: 'Harmony',
  },
}

const ENTITIES = { '&nbsp;': ' ', '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#39;': "'", '&apos;': "'" }

const escapeHtml = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

/** Rounds floats from the data (0.1499999761…) to a short readable number. */
function fmt(n) {
  if (typeof n !== 'number' || Number.isNaN(n)) return String(n)
  const abs = Math.abs(n)
  const digits = abs >= 100 ? 0 : abs >= 10 ? 1 : 2
  return String(Number(n.toFixed(digits)))
}

const UNRESOLVED = '\u0004'

/**
 * Replaces `@Name@` / `@Name*100@` tokens using `vars`.
 * A variable may be a number or an array (one value per star level, shown as `a / b / c`).
 */
export function resolveTokens(text, vars, { lang = 'vi' } = {}) {
  const lower = new Map(Object.entries(vars).map(([k, v]) => [k.toLowerCase(), v]))
  const lookup = (name) => {
    const key = name.toLowerCase()
    if (lower.has(key)) return lower.get(key)
    // "ModifiedDamage" is computed in game from "Damage"; fall back to the base value.
    const stripped = key.replace(/^(modified|total|bonus)/, '')
    if (stripped !== key && lower.has(stripped)) return lower.get(stripped)
    return undefined
  }
  const show = (value, mult) => {
    if (Array.isArray(value)) return value.map((v) => fmt(v * mult)).join(' / ')
    return fmt(value * mult)
  }
  return text.replace(/@([^@\s]+?)@/g, (_, expr) => {
    const m = expr.match(/^([^*]+)(?:\*([\d.]+))?$/)
    if (!m || /^TFTUnitProperty/i.test(m[1])) return ''
    const value = lookup(m[1])
    if (value == null) return UNRESOLVED
    return show(value, m[2] ? Number(m[2]) : 1)
  })
}

export function cleanDesc(input, { lang = 'vi' } = {}) {
  if (!input) return ''
  const icons = ICONS[lang] ?? ICONS.en
  let text = String(input)

  // Icon tokens like (%i:scaleAP%) -> "AP"
  // Adjacent icons ("AD" + "AP") read as one label, so join them with a slash.
  text = text.replace(/(?:%i:[A-Za-z0-9_]+%)+/g, (run) =>
    [...run.matchAll(/%i:([A-Za-z0-9_]+)%/g)]
      .map((m) => icons[m[1].toLowerCase()] ?? '')
      .filter(Boolean)
      .join('/'),
  )
  // Leftover template placeholders ({{ e1 }}) carry no meaning outside the game.
  text = text.replace(/\{\{[^}]*\}\}/g, '')

  const OPEN = '\u0001'
  const CLOSE = '\u0002'
  const BREAK = '\u0003'
  // Some feeds carry literal "\\r\\n" sequences as well as real newlines.
  text = text.replace(/(?:\\r|\r)?(?:\\n|\n)/g, '<br>')
  text = text
    .replace(/<br\s*\/?>/gi, BREAK)
    .replace(/<\/?row>/gi, BREAK)
    .replace(/<li>/gi, BREAK)
    .replace(/<(\/?)([A-Za-z0-9]+)[^>]*>/g, (_, slash, tag) => {
      const cls = SPAN_TAGS[tag.toLowerCase()]
      if (!cls) return ''
      return slash ? CLOSE : `${OPEN}${cls}${OPEN}`
    })

  text = text.replace(/&[#A-Za-z0-9]+;/g, (e) => ENTITIES[e] ?? '')
  text = escapeHtml(text)

  text = text
    .replace(new RegExp(`${OPEN}([a-z-]+)${OPEN}`, 'g'), '<span class="$1">')
    .replace(new RegExp(CLOSE, 'g'), '</span>')
    .replace(new RegExp(BREAK, 'g'), '<br>')
    .replace(new RegExp(UNRESOLVED, 'g'), '<span class="x-var">?</span>')

  // Tidy: collapse runs of breaks, trim, drop empty spans left by dropped content.
  return text
    .replace(/(<br>\s*){3,}/g, '<br><br>')
    .replace(/^(\s*<br>)+|(<br>\s*)+$/g, '')
    .replace(/<span class="[a-z-]+"><\/span>/g, '')
    .replace(/[ \t]{2,}/g, ' ')
    .trim()
}
