/**
 * Serves the JSON that `npm run sync` wrote to `server/assets/data`.
 *
 * Pages load their data through this route. During `nuxt generate` each call is prerendered to a
 * static `/api/data/<file>.json`, so the deployed site needs no server.
 */
export default defineEventHandler(async (event) => {
  const path = getRouterParam(event, 'path') ?? ''
  if (!/^[\w./-]+\.json$/.test(path) || path.includes('..')) {
    throw createError({ statusCode: 404, statusMessage: 'Not found' })
  }

  const data = await useStorage('assets:server').getItem(`data:${path.replaceAll('/', ':')}`)
  if (data == null) throw createError({ statusCode: 404, statusMessage: 'Not found' })

  setHeader(event, 'Cache-Control', 'public, max-age=3600')
  return data
})
