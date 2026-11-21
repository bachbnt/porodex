/** Pages that exist regardless of data. Entity pages come from `public/data/routes.json`. */
export const STATIC_ROUTES = [
  '/',
  '/lol/champions',
  '/lol/items',
  '/tft/champions',
  '/tft/traits',
  '/tft/items',
  '/tft/builder',
  '/quiz',
  '/about',
]

/** Default locale (vi) has no prefix; English lives under `/en`. */
export function withLanguages(path: string): string[] {
  return [path, path === '/' ? '/en' : `/en${path}`]
}
