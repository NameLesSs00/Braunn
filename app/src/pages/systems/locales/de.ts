export const systemsDe = {
  text: {
    'Braun': 'Braun',
    'Select System': 'System auswählen',
    'Choose the system you want to view and continue your work.': 'Wählen Sie das System aus, das Sie anzeigen möchten, und setzen Sie Ihre Arbeit fort.',
    'Logout': 'Abmelden',

    'Property Management': 'Hotelverwaltung',
    'Front office dashboard, reservations, guests, rooms, reports, and policies': 'Rezeption, Übersicht, Reservierungen, Gäste, Zimmer, Berichte und Richtlinien',

    'HRM': 'HRM',
    'Employees, attendance, shifts, leave management, payroll, and settings': 'Mitarbeiter, Anwesenheit, Schichten, Abwesenheiten, Lohnabrechnung und Einstellungen',

    'Housekeeping': 'Hauswirtschaft',
    'Room status, cleaning tasks, guest requests, lost and found, and inventory': 'Zimmerstatus, Reinigungsaufgaben, Gästeanfragen, Fundsachen und Inventar',

    'Maintenance': 'Wartung',
    'Requests, work orders, preventive maintenance, assets, and inventory': 'Anfragen, Arbeitsaufträge, vorbeugende Wartung, Anlagen und Inventar',

    'Laundry': 'Wäscherei',
    'Overview, room requests, laundry inventory, and system settings': 'Übersicht, Zimmeranfragen, Wäscherei-Inventar und Systemeinstellungen',

    'Restaurant POS': 'Restaurantkasse',
    'Menu ordering, live orders, table reservations, guest meals, and kitchen views': 'Menübestellung, Live-Bestellungen, Tischreservierungen, Gästemahlzeiten und Küchenansichten',
  },
} as const

export type SystemsGermanTextKey = keyof typeof systemsDe.text
