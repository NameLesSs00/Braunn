import 'i18next'
import { resources, DEFAULT_LOCALE } from './i18n'

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'restaurantPOS'
    resources: (typeof resources)[typeof DEFAULT_LOCALE]
  }
}
