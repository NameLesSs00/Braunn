import 'i18next'
import { resources } from './i18n'

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'restaurantPOS'
    resources: (typeof resources)['de']
  }
}
