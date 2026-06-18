export function publicAsset(path: string) {
  const base = import.meta.env.BASE_URL ?? '/'
  return `${base.replace(/\/$/, '')}/${path.replace(/^\//, '')}`
}

export function formatMoney(value: number) {
  return `$${value.toFixed(2)}`
}

export function parseNumberOrZero(value: string) {
  const n = Number(value)
  return Number.isFinite(n) ? n : 0
}

export function formatDateForDisplay(value: string) {
  if (!value) return ''
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  return d.toLocaleDateString(undefined, { month: 'numeric', day: 'numeric', year: 'numeric' })
}
