import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import { APP_LANGUAGE, type AppLanguage } from './config/appConfig'
import { hrmDe } from './pages/HRMPages/locales/de'
import { laundryDe } from './pages/laundry/locales/de'
import { pmsDe } from './pages/PMSPages/locales/de'
import { restaurantPosDe } from './pages/POSPages/restaurant/locales/de'

export const DEFAULT_LOCALE: AppLanguage = APP_LANGUAGE

export const resources = {
  de: {
    hrm: hrmDe,
    laundry: laundryDe,
    pms: pmsDe,
    restaurantPOS: restaurantPosDe,
  },
  en: {
    hrm: { text: {} },
    laundry: { text: {} },
    pms: { text: {} },
    restaurantPOS: { text: {} },
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
