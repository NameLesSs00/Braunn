export const systemsDe = {
  text: {
    'Braun': 'Braun',
    'Select System': 'System auswaehlen',
    'Choose the system you want to view and continue your work.': 'Waehlen Sie das System aus, das Sie anzeigen moechten, und setzen Sie Ihre Arbeit fort.',
    'Logout': 'Abmelden',

    'Property Management': 'Property Management',
    'Front office dashboard, reservations, guests, rooms, reports, and policies': 'Rezeption, Reservierungen, Gaeste, Zimmer, Berichte und Richtlinien',

    'HRM': 'HRM',
    'Employees, attendance, shifts, leave management, payroll, and settings': 'Mitarbeiter, Anwesenheit, Schichten, Abwesenheiten, Lohnabrechnung und Einstellungen',

    'Housekeeping': 'Housekeeping',
    'Room status, cleaning tasks, guest requests, lost and found, and inventory': 'Zimmerstatus, Reinigungsaufgaben, Gaesteanfragen, Fundsachen und Inventar',

    'Maintenance': 'Wartung',
    'Requests, work orders, preventive maintenance, assets, and inventory': 'Anfragen, Arbeitsauftraege, vorbeugende Wartung, Anlagen und Inventar',

    'Laundry': 'Waescherei',
    'Overview, room requests, laundry inventory, and system settings': 'Uebersicht, Zimmeranfragen, Waescherei-Inventar und Systemeinstellungen',

    'Restaurant POS': 'Restaurantkasse',
    'Menu ordering, live orders, table reservations, guest meals, and kitchen views': 'Menuebuchung, Live-Bestellungen, Tischreservierungen, Gaestemahlzeiten und Kuechenansichten',
  },
} as const

export type SystemsGermanTextKey = keyof typeof systemsDe.text
