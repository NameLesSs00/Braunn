export function publicAsset(path: string) {
  const base = import.meta.env.BASE_URL ?? '/'
  return `${base.replace(/\/$/, '')}/${path.replace(/^\//, '')}`
}

export function formatMoney(value?: number | string | null, currency: string = '$') {
  const CURRENCY_SYMBOLS: Record<string, string> = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    SAR: 'SAR ',
    AED: 'AED ',
    EGP: 'EGP ',
    JOD: 'JOD ',
    KWD: 'KWD ',
  }

  const resolveCurrency = (curr: string): string => {
    // If it's already a symbol character, use as-is
    if (['$', '€', '£'].includes(curr)) return curr
    // Map ISO code to symbol, or fall back to the code itself with a trailing space
    return CURRENCY_SYMBOLS[curr.toUpperCase()] ?? `${curr} `
  }

  const formatWithCurrency = (n: number, curr: string) => {
    const sym = resolveCurrency(curr)
    return `${sym}${n.toFixed(2)}`
  }

  if (value === undefined || value === null || value === '') return formatWithCurrency(0, currency)
  const n = Number(value)
  if (Number.isNaN(n)) return formatWithCurrency(0, currency)
  return formatWithCurrency(n, currency)
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
