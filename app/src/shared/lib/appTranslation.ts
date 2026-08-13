import { DEFAULT_LOCALE, resources } from '../../i18n'

type AppLocale = keyof typeof resources
type AppNamespace = keyof (typeof resources)[AppLocale]

const dictionaries = Object.values(resources[DEFAULT_LOCALE] ?? {}).map((namespace) => namespace.text)
const caseInsensitiveDictionaries = dictionaries.map((dictionary) =>
  Object.entries(dictionary).reduce<Record<string, string>>((entries, [key, value]) => {
    entries[key.toLowerCase()] = value as string
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
    .replace(/\bMonday\b/g, 'Montag')
    .replace(/\bTuesday\b/g, 'Dienstag')
    .replace(/\bWednesday\b/g, 'Mittwoch')
    .replace(/\bThursday\b/g, 'Donnerstag')
    .replace(/\bFriday\b/g, 'Freitag')
    .replace(/\bSaturday\b/g, 'Samstag')
    .replace(/\bSunday\b/g, 'Sonntag')
    .replace(/\bMon\b/g, 'Mo.')
    .replace(/\bTue\b/g, 'Di.')
    .replace(/\bWed\b/g, 'Mi.')
    .replace(/\bThu\b/g, 'Do.')
    .replace(/\bFri\b/g, 'Fr.')
    .replace(/\bSat\b/g, 'Sa.')
    .replace(/\bSun\b/g, 'So.')
    .replace(/\bJanuary\b/g, 'Januar')
    .replace(/\bFebruary\b/g, 'Februar')
    .replace(/\bMarch\b/g, 'März')
    .replace(/\bApril\b/g, 'April')
    .replace(/\bJune\b/g, 'Juni')
    .replace(/\bJuly\b/g, 'Juli')
    .replace(/\bAugust\b/g, 'August')
    .replace(/\bSeptember\b/g, 'September')
    .replace(/\bOctober\b/g, 'Oktober')
    .replace(/\bNovember\b/g, 'November')
    .replace(/\bDecember\b/g, 'Dezember')
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

function translateKnownObject(value: string) {
  const translated = translateExact(value)
  return translated && translated !== value ? translated : undefined
}

function translateEntity(value: string) {
  const normalized = value.trim()
  const exact = translateKnownObject(normalized)
  if (exact) return exact

  const entities: Record<string, string> = {
    account: 'Konto',
    accounts: 'Konten',
    availability: 'Verfügbarkeit',
    bonuses: 'Boni',
    category: 'Kategorie',
    categories: 'Kategorien',
    companion: 'Begleitperson',
    companions: 'Begleitpersonen',
    complaint: 'Beschwerde',
    complaints: 'Beschwerden',
    contract: 'Vertrag',
    contracts: 'Verträge',
    data: 'Daten',
    'departure date': 'Abreisedatum',
    departments: 'Abteilungen',
    'deposit required': 'Erforderliche Anzahlung',
    deductions: 'Abzüge',
    'discount amount': 'Rabattbetrag',
    employees: 'Mitarbeiter',
    guests: 'Gäste',
    inventory: 'Inventar',
    items: 'Artikel',
    leaves: 'Abwesenheiten',
    notifications: 'Benachrichtigungen',
    packages: 'Pakete',
    plans: 'Pläne',
    policies: 'Richtlinien',
    policy: 'Richtlinie',
    records: 'Datensätze',
    'meal plans': 'Verpflegungspläne',
    'number of rooms': 'Anzahl Zimmer',
    request: 'Anfrage',
    requests: 'Anfragen',
    reservation: 'Reservierung',
    reservations: 'Reservierungen',
    'room nights': 'Zimmernächte',
    'room rates': 'Zimmerraten',
    'room type': 'Zimmertyp',
    rooms: 'Zimmer',
    services: 'Dienstleistungen',
    shifts: 'Schichten',
    types: 'Typen',
    units: 'Einheiten',
  }

  return entities[normalized.toLowerCase()]
}

function translateDynamic(value: string) {
  const policyValueTranslations: Record<string, string> = {
    Allowed: 'Erlaubt',
    'Not allowed': 'Nicht erlaubt',
    ChargeRateDifference: 'Ratendifferenz berechnen',
    NoCharge: 'Keine Gebühr',
    NoRefund: 'Keine Erstattung',
    RefundDifference: 'Differenz erstatten',
  }

  const cancellationPolicySummary = value.match(/^([0-9.]+) hrs free, ([0-9.]+)% penalty(, approval required)?$/)
  if (cancellationPolicySummary) {
    return `${cancellationPolicySummary[1]} Std. kostenlos, ${cancellationPolicySummary[2]} % Strafgebühr${cancellationPolicySummary[3] ? ', Genehmigung erforderlich' : ''}`
  }

  const earlyCheckoutPolicySummary = value.match(/^([0-9.]+)% credit(, approval required)?$/)
  if (earlyCheckoutPolicySummary) {
    return `${earlyCheckoutPolicySummary[1]} % Gutschrift${earlyCheckoutPolicySummary[2] ? ', Genehmigung erforderlich' : ''}`
  }

  const lateCheckoutPolicySummary = value.match(/^Free until (.+), half ([0-9.]+)%, full ([0-9.]+)%$/)
  if (lateCheckoutPolicySummary) {
    return `Kostenlos bis ${lateCheckoutPolicySummary[1]}, halb ${lateCheckoutPolicySummary[2]} %, voll ${lateCheckoutPolicySummary[3]} %`
  }

  const extendStayPolicySummary = value.match(/^(Allowed|Not allowed)(, availability required)?(, approval required)?$/)
  if (extendStayPolicySummary) {
    return `${policyValueTranslations[extendStayPolicySummary[1]]}${extendStayPolicySummary[2] ? ', Verfügbarkeit erforderlich' : ''}${extendStayPolicySummary[3] ? ', Genehmigung erforderlich' : ''}`
  }

  const roomChangePolicySummary = value.match(/^(Move allowed|Move blocked), upgrade: (.+), downgrade: (.+)$/)
  if (roomChangePolicySummary) {
    const move = roomChangePolicySummary[1] === 'Move allowed' ? 'Wechsel erlaubt' : 'Wechsel blockiert'
    const upgrade = policyValueTranslations[roomChangePolicySummary[2]] ?? translateExact(roomChangePolicySummary[2]) ?? roomChangePolicySummary[2]
    const downgrade = policyValueTranslations[roomChangePolicySummary[3]] ?? translateExact(roomChangePolicySummary[3]) ?? roomChangePolicySummary[3]
    return `${move}, Upgrade: ${upgrade}, Downgrade: ${downgrade}`
  }

  const showing = value.match(/^Showing (\d+) to (\d+) of (\d+) (requests|items|orders|entries|employees|payroll records|records|reservations|guests|rooms|services)$/)
  if (showing) {
    const unit =
      showing[4] === 'requests'
        ? 'Anfragen'
        : showing[4] === 'items'
          ? 'Artikel'
          : showing[4] === 'orders'
            ? 'Bestellungen'
            : showing[4] === 'employees'
              ? 'Mitarbeiter'
              : showing[4] === 'payroll records'
                ? 'Lohnabrechnungsdatensätze'
                : showing[4] === 'records'
                  ? 'Datensätze'
                  : showing[4] === 'reservations'
                    ? 'Reservierungen'
                    : showing[4] === 'guests'
                      ? 'Gästen'
                      : showing[4] === 'rooms'
                        ? 'Zimmern'
                        : showing[4] === 'services'
                          ? 'Dienstleistungen'
                  : 'Einträge'
    return `Zeige ${showing[1]} bis ${showing[2]} von ${showing[3]} ${unit}`
  }

  const showingShort = value.match(/^Showing (\d+) of (\d+) (items|reservations|group reservations)$/)
  if (showingShort) {
    const unit =
      showingShort[3] === 'items'
        ? 'Artikeln'
        : showingShort[3] === 'reservations'
          ? 'Reservierungen'
          : showingShort[3] === 'group reservations'
            ? 'Gruppenreservierungen'
            : 'Einträgen'
    return `Zeige ${showingShort[1]} von ${showingShort[2]} ${unit}`
  }

  const page = value.match(/^Page (\d+) of (\d+)$/)
  if (page) return `Seite ${page[1]} von ${page[2]}`

  const requestFailed = value.match(/^Request failed \((\d+)\)$/)
  if (requestFailed) return `Anfrage fehlgeschlagen (${requestFailed[1]})`

  const totalLabel = value.match(/^Total (.+)$/)
  if (totalLabel) {
    const entity = translateEntity(totalLabel[1]) ?? translateExact(totalLabel[1]) ?? totalLabel[1]
    return `${entity} gesamt`
  }

  const dataNotFound = value.match(/^Data not found\.?$/i)
  if (dataNotFound) return 'Keine Daten gefunden'

  const noMatchesCurrentFilters = value.match(/^No (.+) match(?:es)? the current filters\.?$/)
  if (noMatchesCurrentFilters) {
    const entity = translateEntity(noMatchesCurrentFilters[1]) ?? noMatchesCurrentFilters[1]
    return `Keine ${entity} entsprechen den aktuellen Filtern`
  }

  const noFound = value.match(/^No (.+) found\.?$/)
  if (noFound) {
    const entity = translateEntity(noFound[1]) ?? noFound[1]
    return `Keine ${entity} gefunden`
  }

  const noAdded = value.match(/^No (.+) added\.?$/)
  if (noAdded) {
    const entity = translateEntity(noAdded[1]) ?? noAdded[1]
    return `Keine ${entity} hinzugefügt`
  }

  const notFound = value.match(/^(.+) not found\.?$/)
  if (notFound) {
    const entity = translateEntity(notFound[1]) ?? notFound[1]
    return `${entity} nicht gefunden`
  }

  const failedToLoad = value.match(/^Failed to load (.+)\.?$/)
  if (failedToLoad) {
    const entity = translateEntity(failedToLoad[1]) ?? failedToLoad[1]
    return `${entity} konnten nicht geladen werden`
  }

  const couldNotLoad = value.match(/^Could not load (.+)\.?$/)
  if (couldNotLoad) {
    const entity = translateEntity(couldNotLoad[1]) ?? couldNotLoad[1]
    return `${entity} konnten nicht geladen werden`
  }

  const loading = value.match(/^Loading (.+)\.\.\.$/)
  if (loading) {
    const entity = translateEntity(loading[1]) ?? loading[1]
    return `${entity} werden geladen...`
  }

  const isRequired = value.match(/^(.+) is required\.$/)
  if (isRequired) {
    const entity = translateEntity(isRequired[1]) ?? translateExact(isRequired[1]) ?? isRequired[1]
    return `${entity} ist erforderlich.`
  }

  const mustBeValidNumber = value.match(/^(.+) must be a valid number\.$/)
  if (mustBeValidNumber) {
    const entity = translateEntity(mustBeValidNumber[1]) ?? translateExact(mustBeValidNumber[1]) ?? mustBeValidNumber[1]
    return `${entity} muss eine gültige Zahl sein.`
  }

  const cannotBeNegative = value.match(/^(.+) cannot be negative\.$/)
  if (cannotBeNegative) {
    const entity = translateEntity(cannotBeNegative[1]) ?? translateExact(cannotBeNegative[1]) ?? cannotBeNegative[1]
    return `${entity} darf nicht negativ sein.`
  }

  const mustBeGreaterThanZero = value.match(/^(.+) must be greater than 0\.$/)
  if (mustBeGreaterThanZero) {
    const entity = translateEntity(mustBeGreaterThanZero[1]) ?? translateExact(mustBeGreaterThanZero[1]) ?? mustBeGreaterThanZero[1]
    return `${entity} muss größer als 0 sein.`
  }

  const charactersMin = value.match(/^(\d+) characters \(min\. (\d+)\)$/)
  if (charactersMin) return `${charactersMin[1]} Zeichen (min. ${charactersMin[2]})`

  const photosSelected = value.match(/^(\d+) \/ (\d+) photos selected$/)
  if (photosSelected) return `${photosSelected[1]} / ${photosSelected[2]} Fotos ausgewaehlt`

  const availableNow = value.match(/^(\d+) available now$/)
  if (availableNow) return `${availableNow[1]} derzeit verfügbar`

  const activeJobs = value.match(/^(\d+) active jobs$/)
  if (activeJobs) return `${activeJobs[1]} aktive Aufgaben`

  const workOrdersProgress = value.match(/^(\d+) work orders [·*] (\d+) in progress$/)
  if (workOrdersProgress) return `${workOrdersProgress[1]} Arbeitsaufträge - ${workOrdersProgress[2]} in Bearbeitung`

  const purchaseRequestLine = value.match(/^Request ID: (.+) [•] Requested by (.+)$/)
  if (purchaseRequestLine) return `Anfrage-ID: ${purchaseRequestLine[1]} - Angefragt von ${purchaseRequestLine[2]}`

  const unitsCount = value.match(/^(.+) \((\d+) units\)$/)
  if (unitsCount) return `${unitsCount[1]} (${unitsCount[2]} Einheiten)`

  const currentStockPieces = value.match(/^Current Stock: (.+) pcs$/)
  if (currentStockPieces) return `Aktueller Bestand: ${currentStockPieces[1]} Stk.`

  const employeesShown = value.match(/^(\d+) employees shown$/)
  if (employeesShown) return `${employeesShown[1]} Mitarbeiter angezeigt`

  const payrollRecords = value.match(/^(\d+) payroll records$/)
  if (payrollRecords) return `${payrollRecords[1]} Lohnabrechnungsdatensätze`

  const dayCount = value.match(/^(\d+) days$/)
  if (dayCount) return `${dayCount[1]} Tage`

  const generatedEmployee = value.match(/^Employee (\d+)$/)
  if (generatedEmployee) return `Mitarbeiter ${generatedEmployee[1]}`

  const monthlyAmount = value.match(/^([+-]?\$[\d,]+)\/mo$/)
  if (monthlyAmount) return `${monthlyAmount[1]}/Monat`

  const roomNumber = value.match(/^Room ([A-Za-z0-9-]+)$/)
  if (roomNumber) return `Zimmer ${roomNumber[1]}`

  const guestCount = value.match(/^(\d+) guests?$/)
  if (guestCount) return `${guestCount[1]} ${guestCount[1] === '1' ? 'Gast' : 'Gäste'}`

  const nightCount = value.match(/^(\d+) nights?$/)
  if (nightCount) return `${nightCount[1]} ${nightCount[1] === '1' ? 'Nacht' : 'Nächte'}`

  const totalCount = value.match(/^(\d+) (unit|units|category|categories|type|types|department|departments|position|positions|employee|employees|reservation|reservations|guest|guests|room|rooms|service|services) total$/)
  if (totalCount) {
    const unit = translateExact(totalCount[2]) ?? totalCount[2]
    return `${totalCount[1]} ${unit} gesamt`
  }

  const prefixedAction = value.match(/^(Add|Edit|View|Select|Create|Delete|Search) (.+)$/)
  if (prefixedAction) {
    const object = translateKnownObject(prefixedAction[2])
    if (object) {
      const action =
        prefixedAction[1] === 'Add'
          ? 'hinzufügen'
          : prefixedAction[1] === 'Edit'
            ? 'bearbeiten'
            : prefixedAction[1] === 'View'
              ? 'anzeigen'
              : prefixedAction[1] === 'Select'
                ? 'auswählen'
                : prefixedAction[1] === 'Create'
                  ? 'erstellen'
                  : prefixedAction[1] === 'Delete'
                    ? 'löschen'
                    : 'suchen'
      return prefixedAction[1] === 'Search' ? `${object} suchen` : `${object} ${action}`
    }
  }

  const suffixedLabel = value.match(/^(.+) (Details|Status|Date|Amount|Total|Type|Types|Count|Rate|Rates|Price|Pricing|Report|Information|Options|Settings|Summary)$/)
  if (suffixedLabel) {
    const subject = translateKnownObject(suffixedLabel[1])
    const suffix = translateKnownObject(suffixedLabel[2])
    if (subject && suffix) return `${subject} ${suffix}`
  }

  const currentStock = value.match(/^Current Stock: (.+)$/)
  if (currentStock) return `Aktueller Bestand: ${currentStock[1]}`

  const cannotWithdraw = value.match(/^Cannot withdraw more than current stock \((.+)\)\.$/)
  if (cannotWithdraw) return `Es kann nicht mehr als der aktuelle Bestand (${cannotWithdraw[1]}) entnommen werden.`

  const deleteTitle = value.match(/^Delete "(.+)"\?$/)
  if (deleteTitle) return `"${deleteTitle[1]}" löschen?`

  if (/\b(?:Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday|Mon|Tue|Wed|Thu|Fri|Sat|Sun|January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|Jun|Jul|Aug|Sep|Oct|Nov|Dec|AM|PM|am|pm)\b/.test(value)) return translateDateParts(value)

  // "Guest {name} has been successfully checked out." / "checked out early."
  const guestCheckedOut = value.match(/^Guest (.+) has been successfully checked out\.$/)
  if (guestCheckedOut) return `Gast ${guestCheckedOut[1]} wurde erfolgreich ausgecheckt.`

  const guestCheckedOutEarly = value.match(/^Guest (.+) has been successfully checked out early\.$/)
  if (guestCheckedOutEarly) return `Gast ${guestCheckedOutEarly[1]} wurde erfolgreich frühzeitig ausgecheckt.`

  // "Checked in {N} rooms successfully."
  const checkedInRooms = value.match(/^Checked in (\d+) rooms successfully\.$/)
  if (checkedInRooms) return `${checkedInRooms[1]} Zimmer erfolgreich eingecheckt.`

  // "Checked in successfully to Room {X}"
  const checkedInRoom = value.match(/^Checked in successfully to Room (.+)$/)
  if (checkedInRoom) return `Erfolgreich eingecheckt in Zimmer ${checkedInRoom[1]}`

  // "Room {X} - {guestName}"
  const roomDashGuest = value.match(/^Room (.+) - (.+)$/)
  if (roomDashGuest) return `Zimmer ${roomDashGuest[1]} – ${roomDashGuest[2]}`

  // "{N} results"
  const nResults = value.match(/^(\d+) results?$/)
  if (nResults) return `${nResults[1]} Ergebnis${nResults[1] === '1' ? '' : 'se'}`

  // "Required: {amount}"
  const required = value.match(/^Required: (.+)$/)
  if (required) return `Erforderlich: ${required[1]}`

  // "Assign all required rooms before check-in. Missing {X} of {Y}."
  const assignRooms = value.match(/^Assign all required rooms before check-in\. Missing (\d+) of (\d+)\.$/)
  if (assignRooms) return `Weisen Sie alle erforderlichen Zimmer vor dem Check-in zu. Fehlend: ${assignRooms[1]} von ${assignRooms[2]}.`

  // "Reservation {ref} has been cancelled."
  const reservationCancelled = value.match(/^Reservation (.+) has been cancelled\.$/)
  if (reservationCancelled) return `Reservierung ${reservationCancelled[1]} wurde storniert.`

  // Housekeeping Dynamic Matchers
  const hkRoomsAssigned = value.match(/^(\d+) rooms assigned$/)
  if (hkRoomsAssigned) return `${hkRoomsAssigned[1]} Zimmer zugewiesen`

  const hkMinAgo = value.match(/^(\d+) min ago$/)
  if (hkMinAgo) return `vor ${hkMinAgo[1]} Min.`

  const hkCleaningCompleted = value.match(/^Room Cleaning completed by (.+)$/)
  if (hkCleaningCompleted) return `Zimmerreinigung abgeschlossen durch ${hkCleaningCompleted[1]}`

  const hkDeepCleaning = value.match(/^Deep Cleaning started by (.+)$/)
  if (hkDeepCleaning) return `Grundreinigung gestartet durch ${hkDeepCleaning[1]}`

  const hkVipPrep = value.match(/^VIP Preparation assigned by (.+)$/)
  if (hkVipPrep) return `VIP-Vorbereitung zugewiesen durch ${hkVipPrep[1]}`

  const hkLaundryPickup = value.match(/^Laundry Pickup requested by Reception$/)
  if (hkLaundryPickup) return `Wäscheabholung durch Rezeption angefordert`

  const hkAssignStaff = value.match(/^Assign Staff to Room (.+)$/)
  if (hkAssignStaff) return `Personal für Zimmer ${hkAssignStaff[1]} zuweisen`

  const hkRoomDetails = value.match(/^Room (.+) Details$/)
  if (hkRoomDetails) return `Zimmer ${hkRoomDetails[1]} Details`

  const hkItemNumber = value.match(/^Item #(.+)$/)
  if (hkItemNumber) return `Gegenstand #${hkItemNumber[1]}`

  return undefined

}

export function translateAppText(value: string) {
  if (DEFAULT_LOCALE !== 'de') return value

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
