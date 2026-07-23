import { DEFAULT_LOCALE, resources } from '../../i18n'

type AppLocale = keyof typeof resources
type AppNamespace = keyof (typeof resources)[AppLocale]

const dictionaries = Object.values(resources[DEFAULT_LOCALE] ?? {}).map((namespace) => namespace.text)
const caseInsensitiveDictionaries = dictionaries.map((dictionary) =>
  Object.entries(dictionary).reduce<Record<string, string>>((entries, [key, value]) => {
    entries[key.toLowerCase()] = value
    return entries
  }, {}),
)

function translateExact(value: string) {
  for (const dictionary of dictionaries) {
    const translated = dictionary[value as keyof typeof dictionary]
    if (translated) return translated
  }

  const lowerValue = value.toLowerCase()
  for (const dictionary of caseInsensitiveDictionaries) {
    const translated = dictionary[lowerValue]
    if (translated) return translated
  }

  return undefined
}

function translateDateParts(value: string) {
  return value
    .replace(/\bJan\b/g, 'Jan.')
    .replace(/\bFeb\b/g, 'Feb.')
    .replace(/\bMar\b/g, 'März')
    .replace(/\bApr\b/g, 'Apr.')
    .replace(/\bMay\b/g, 'Mai')
    .replace(/\bJun\b/g, 'Juni')
    .replace(/\bJul\b/g, 'Juli')
    .replace(/\bAug\b/g, 'Aug.')
    .replace(/\bSep\b/g, 'Sept.')
    .replace(/\bOct\b/g, 'Okt.')
    .replace(/\bNov\b/g, 'Nov.')
    .replace(/\bDec\b/g, 'Dez.')
    .replace(/\bAM\b/g, 'vorm.')
    .replace(/\bPM\b/g, 'nachm.')
    .replace(/\bam\b/g, 'vorm.')
    .replace(/\bpm\b/g, 'nachm.')
}

function translateDynamic(value: string) {
  const showing = value.match(/^Showing (\d+) to (\d+) of (\d+) (requests|items|orders|entries)$/)
  if (showing) {
    const unit =
      showing[4] === 'requests'
        ? 'Anfragen'
        : showing[4] === 'items'
          ? 'Artikel'
          : showing[4] === 'orders'
            ? 'Bestellungen'
            : 'Einträge'
    return `Zeige ${showing[1]} bis ${showing[2]} von ${showing[3]} ${unit}`
  }

  const showingShort = value.match(/^Showing (\d+) of (\d+) items$/)
  if (showingShort) return `Zeige ${showingShort[1]} von ${showingShort[2]} Artikeln`

  const page = value.match(/^Page (\d+) of (\d+)$/)
  if (page) return `Seite ${page[1]} von ${page[2]}`

  const totalCount = value.match(/^(\d+) (unit|units|category|categories|type|types) total$/)
  if (totalCount) {
    const unit = translateExact(totalCount[2]) ?? totalCount[2]
    return `${totalCount[1]} ${unit} gesamt`
  }

  const currentStock = value.match(/^Current Stock: (.+)$/)
  if (currentStock) return `Aktueller Bestand: ${currentStock[1]}`

  const cannotWithdraw = value.match(/^Cannot withdraw more than current stock \((.+)\)\.$/)
  if (cannotWithdraw) return `Es kann nicht mehr als der aktuelle Bestand (${cannotWithdraw[1]}) entnommen werden.`

  const deleteTitle = value.match(/^Delete "(.+)"\?$/)
  if (deleteTitle) return `"${deleteTitle[1]}" löschen?`

  if (/\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|AM|PM|am|pm)\b/.test(value)) return translateDateParts(value)

  return undefined
}

export function translateAppText(value: string) {
  const leading = value.match(/^\s*/)?.[0] ?? ''
  const trailing = value.match(/\s*$/)?.[0] ?? ''
  const trimmed = value.trim()
  if (!trimmed) return value

  const exact = translateExact(trimmed)
  if (exact) return `${leading}${exact}${trailing}`

  const dynamic = translateDynamic(trimmed)
  if (dynamic) return `${leading}${dynamic}${trailing}`

  return value
}

export function translateAppDomTree(root: HTMLElement) {
  if (DEFAULT_LOCALE !== 'de') return

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const parent = node.parentElement
      if (!parent) return NodeFilter.FILTER_REJECT
      if (['SCRIPT', 'STYLE', 'NOSCRIPT'].includes(parent.tagName)) return NodeFilter.FILTER_REJECT
      return NodeFilter.FILTER_ACCEPT
    },
  })

  const textNodes: Text[] = []
  while (walker.nextNode()) textNodes.push(walker.currentNode as Text)
  textNodes.forEach((node) => {
    const translated = translateAppText(node.nodeValue ?? '')
    if (translated !== node.nodeValue) node.nodeValue = translated
  })

  ;(['placeholder', 'aria-label', 'title', 'alt'] as const).forEach((attribute) => {
    root.querySelectorAll<HTMLElement>(`[${attribute}]`).forEach((element) => {
      const value = element.getAttribute(attribute)
      if (!value) return
      const translated = translateAppText(value)
      if (translated !== value) element.setAttribute(attribute, translated)
    })
  })
}

export type { AppNamespace }
