import { useEffect, useRef, type ReactNode } from 'react'
import { DEFAULT_LOCALE } from '../../../../i18n'
import { restaurantPosDe } from '../locales/de'

type TranslationKey = keyof typeof restaurantPosDe.text

const dictionary = restaurantPosDe.text
const caseInsensitiveDictionary = Object.entries(dictionary).reduce<Record<string, string>>((entries, [key, value]) => {
  entries[key.toLowerCase()] = value
  return entries
}, {})
const translatableAttributes = ['placeholder', 'aria-label', 'title'] as const

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
}

function translateDynamic(value: string) {
  const totalCategories = value.match(/^Total Categories: (\d+)$/)
  if (totalCategories) return `Kategorien gesamt: ${totalCategories[1]}`

  const totalItems = value.match(/^Total Items: (\d+)$/)
  if (totalItems) return `Artikel gesamt: ${totalItems[1]}`

  const showing = value.match(/^Showing (\d+) to (\d+) of (\d+) (orders|items|entries)$/)
  if (showing) {
    const unit = showing[4] === 'orders' ? 'Bestellungen' : showing[4] === 'items' ? 'Artikel' : 'Einträge'
    return `Zeige ${showing[1]} bis ${showing[2]} von ${showing[3]} ${unit}`
  }

  const showingOrder = value.match(/^Showing (\d+) order$/)
  if (showingOrder) return `Zeige ${showingOrder[1]} Bestellung`

  const totalRevenue = value.match(/^Total Revenue: (.+)$/)
  if (totalRevenue) return `Gesamtumsatz: ${totalRevenue[1]}`

  const itemCount = value.match(/^(\d+) items?$/)
  if (itemCount) return `${itemCount[1]} Artikel`

  const seats = value.match(/^(\d+) seats$/)
  if (seats) return `${seats[1]} Sitzplätze`

  const guests = value.match(/^(\d+) guests$/)
  if (guests) return `${guests[1]} Gäste`

  const tableName = value.match(/^Table (\d+)$/)
  if (tableName) return `Tisch ${tableName[1]}`

  const itemQuantity = value.match(/^(.+) x(\d+)$/)
  if (itemQuantity) return `${translateExact(itemQuantity[1]) ?? itemQuantity[1]} x${itemQuantity[2]}`

  const activeCount = value.match(/^(Active Orders|New Orders|Preparing|Delayed Orders|Ready): (\d+)$/)
  if (activeCount) return `${translateExact(activeCount[1]) ?? activeCount[1]}: ${activeCount[2]}`

  const statusCount = value.match(/^(Available|Reserved|Occupied) \((\d+)\)$/)
  if (statusCount) return `${translateExact(statusCount[1]) ?? statusCount[1]} (${statusCount[2]})`

  const waiting = value.match(/^Waiting: (\d+) min$/)
  if (waiting) return `Wartezeit: ${waiting[1]} Min.`

  const splitWaiting = value.match(/^Waiting:$/)
  if (splitWaiting) return 'Wartezeit:'

  const orderSummary = value.match(/^Order\s+T(.+)$/)
  if (orderSummary) return `Bestellung T${orderSummary[1]}`

  const breakfastHistory = value.match(/^Breakfast - (.+)$/)
  if (breakfastHistory) return `Frühstück - ${translateDateParts(breakfastHistory[1])}`

  const checkout = value.match(/^Check-out: (.+)$/)
  if (checkout) return `Check-out: ${translateDateParts(checkout[1])}`

  if (value.startsWith('Today, ')) return translateDateParts(value.replace('Today, ', 'Heute, '))
  if (/\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|AM|PM)\b/.test(value)) return translateDateParts(value)

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

export function PosTranslationBoundary({ children }: { children: ReactNode }) {
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

  return <div ref={rootRef}>{children}</div>
}
