/* global process */
// Vercel Serverless Proxy — runs at the REPO ROOT level.
// Forwards all /api/* requests to the HTTP backend server-side so the browser
// stays on HTTPS (Vercel) while Vercel talks to the upstream HTTP API.
// const DEFAULT_BACKEND_URL = 'http://gear-pms-api.runasp.net'
const DEFAULT_BACKEND_URL = 'https://pmss.runasp.net/'
const BACKEND_BASE_URL = (process.env.BACKEND_BASE_URL || DEFAULT_BACKEND_URL).replace(/\/+$/, '')

function getProxyPath(req) {
  const pathParam = req.query?.path
  if (Array.isArray(pathParam)) return pathParam.join('/')
  if (typeof pathParam === 'string' && pathParam.length > 0) return pathParam

  const pathname = (req.url || '').split('?')[0] || ''
  return pathname.replace(/^\/api\/?/, '').replace(/^\/+/, '')
}

function getQueryString(req) {
  const restQuery = { ...(req.query || {}) }
  delete restQuery.path

  return new URLSearchParams(
    Object.entries(restQuery).flatMap(([key, value]) => {
      if (value == null) return []
      if (Array.isArray(value)) return value.map((item) => [key, String(item)])
      return [[key, String(value)]]
    }),
  ).toString()
}

function buildTargetUrl(path, queryString) {
  const cleanPath = String(path || '').replace(/^\/+/, '')
  return `${BACKEND_BASE_URL}/${cleanPath}${queryString ? `?${queryString}` : ''}`
}

function getCandidatePaths(path) {
  const cleanPath = String(path || '').replace(/^\/+/, '')
  const candidates = [cleanPath]

  // Some deployments/upstreams expose controllers with the ASP.NET-style /api
  // prefix while the Vite dev proxy strips it locally. If the stripped path 404s
  // in production, retry once with /api before returning the upstream 404.
  if (cleanPath && !cleanPath.toLowerCase().startsWith('api/')) {
    candidates.push(`api/${cleanPath}`)
  }

  return [...new Set(candidates)]
}

function copyRequestHeaders(req) {
  const headers = { ...(req.headers || {}) }
  delete headers.host
  delete headers.connection
  delete headers['content-length']
  delete headers['accept-encoding']

  if (!headers.accept) headers.accept = 'application/json'
  return headers
}

async function callUpstream(req, targetUrl) {
  const init = {
    method: req.method,
    headers: copyRequestHeaders(req),
  }

  if (req.method !== 'GET' && req.method !== 'HEAD' && req.body) {
    const contentType = String(req.headers?.['content-type'] ?? '')
    init.body = contentType.includes('application/json') ? JSON.stringify(req.body) : req.body
  }

  return fetch(targetUrl, init)
}

export default async function handler(req, res) {
  const path = getProxyPath(req)
  const queryString = getQueryString(req)
  const candidatePaths = getCandidatePaths(path)

  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,PATCH,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  try {
    let lastResponse
    let lastText = ''
    let lastTargetUrl = ''

    for (const candidatePath of candidatePaths) {
      const targetUrl = buildTargetUrl(candidatePath, queryString)
      console.log(`[PROXY] ${req.method} ${targetUrl}`)

      const upstream = await callUpstream(req, targetUrl)
      const text = await upstream.text()
      console.log(`[PROXY] upstream status: ${upstream.status}`)
      console.log(`[PROXY] upstream body (first 300): ${text.substring(0, 300)}`)

      lastResponse = upstream
      lastText = text
      lastTargetUrl = targetUrl

      if (upstream.status !== 404 || candidatePath === candidatePaths[candidatePaths.length - 1]) {
        break
      }

      console.warn(`[PROXY] ${targetUrl} returned 404; retrying next candidate path`)
    }

    const contentType = lastResponse?.headers.get('content-type') ?? 'application/json'
    res.setHeader('Content-Type', contentType)
    res.setHeader('X-Proxy-Target', lastTargetUrl.replace(BACKEND_BASE_URL, 'BACKEND_BASE_URL'))

    return res.status(lastResponse?.status ?? 502).send(lastText)
  } catch (err) {
    console.error('[PROXY] FETCH ERROR:', err)
    return res.status(502).json({
      error: 'Proxy fetch failed',
      detail: String(err),
      targetBase: BACKEND_BASE_URL,
      path,
    })
  }
}
