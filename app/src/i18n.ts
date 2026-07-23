import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import { laundryDe } from './pages/laundry/locales/de'
import { restaurantPosDe } from './pages/POSPages/restaurant/locales/de'

export const DEFAULT_LOCALE = 'de' as const

export const resources = {
  de: {
    laundry: laundryDe,
    restaurantPOS: restaurantPosDe,
  },
} as const

i18n.use(initReactI18next).init({
  lng: DEFAULT_LOCALE,
  fallbackLng: DEFAULT_LOCALE,
  resources,
  interpolation: {
    escapeValue: false,
  },
  react: {
    useSuspense: false,
  },
})

export default i18n
