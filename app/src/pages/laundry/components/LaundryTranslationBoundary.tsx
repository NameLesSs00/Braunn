import { useEffect, useRef, type ReactNode } from 'react'
import { DEFAULT_LOCALE } from '../../../i18n'
import { laundryDe } from '../locales/de'

type TranslationKey = keyof typeof laundryDe.text

const dictionary = laundryDe.text
const caseInsensitiveDictionary = Object.entries(dictionary).reduce<Record<string, string>>((entries, [key, value]) => {
  entries[key.toLowerCase()] = value
  return entries
}, {})
const translatableAttributes = ['placeholder', 'aria-label', 'title', 'alt'] as const

function translateExact(value: string) {
  return dictionary[value as TranslationKey] ?? caseInsensitiveDictionary[value.toLowerCase()]
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

function translateServiceItems(value: string) {
  return value
    .split(', ')
    .map((item) => {
      const match = item.match(/^(.+?) \((\d+)\)$/)
      if (!match) return translateExact(item) ?? item
      const translatedName = translateExact(match[1]) ?? match[1]
      return `${translatedName} (${match[2]})`
    })
    .join(', ')
}

function translateDynamic(value: string) {
  const showing = value.match(/^Showing (\d+) to (\d+) of (\d+) (requests|items)$/)
  if (showing) {
    const unit = showing[4] === 'requests' ? 'Anfragen' : 'Artikel'
    return `Zeige ${showing[1]} bis ${showing[2]} von ${showing[3]} ${unit}`
  }

  const page = value.match(/^Page (\d+) of (\d+)$/)
  if (page) return `Seite ${page[1]} von ${page[2]}`

  const requestCount = value.match(/^(\d+) Requests?$/)
  if (requestCount) return `${requestCount[1]} Anfragen`

  const requests = value.match(/^(\d+) requests$/)
  if (requests) return `${requests[1]} Anfragen`

  const itemCount = value.match(/^(\d+) items?$/)
  if (itemCount) return `${itemCount[1]} Artikel`

  const totalCount = value.match(/^(\d+) total$/)
  if (totalCount) return `${totalCount[1]} gesamt`

  const currentStock = value.match(/^Current Stock: (.+)$/)
  if (currentStock) return `Aktueller Bestand: ${currentStock[1]}`

  const cannotWithdraw = value.match(/^Cannot withdraw more than current stock \((.+)\)\.$/)
  if (cannotWithdraw) return `Es kann nicht mehr als der aktuelle Bestand (${cannotWithdraw[1]}) entnommen werden.`

  const deleteTitle = value.match(/^Delete "(.+)"\?$/)
  if (deleteTitle) return `"${deleteTitle[1]}" löschen?`

  if (/^(Laundry Wash|Shirt Ironing|Pants Ironing|Towel Laundry) \(\d+\)(, (Laundry Wash|Shirt Ironing|Pants Ironing|Towel Laundry) \(\d+\))*$/.test(value)) {
    return translateServiceItems(value)
  }

  if (/\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|AM|PM|am|pm)\b/.test(value)) return translateDateParts(value)

  return undefined
}

function translateValue(value: string) {
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

function translateTextNode(node: Text) {
  const translated = translateValue(node.nodeValue ?? '')
  if (translated !== node.nodeValue) node.nodeValue = translated
}

function translateAttributes(root: HTMLElement) {
  const selector = translatableAttributes.map((attribute) => `[${attribute}]`).join(',')
  root.querySelectorAll<HTMLElement>(selector).forEach((element) => {
    translatableAttributes.forEach((attribute) => {
      const value = element.getAttribute(attribute)
      if (!value) return

      const translated = translateValue(value)
      if (translated !== value) element.setAttribute(attribute, translated)
    })
  })
}

function translateTree(root: HTMLElement) {
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
  textNodes.forEach(translateTextNode)
  translateAttributes(root)
}

export function LaundryTranslationBoundary({ children }: { children: ReactNode }) {
  const rootRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (DEFAULT_LOCALE !== 'de' || !rootRef.current) return

    const root = rootRef.current
    translateTree(root)

    const observer = new MutationObserver(() => translateTree(root))
    observer.observe(root, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: [...translatableAttributes],
    })

    return () => observer.disconnect()
  }, [])

  return <div ref={rootRef} className="contents">{children}</div>
}
