import { APP_LANGUAGE } from '../../config/appConfig'

export const APP_DATE_LOCALE = APP_LANGUAGE === 'de' ? 'de-DE' : 'en-US'

export function formatAppDate(value: Date | string | number, options?: Intl.DateTimeFormatOptions) {
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)

  return new Intl.DateTimeFormat(APP_DATE_LOCALE, options).format(date)
}

export function formatAppShortWeekday(value: Date | string | number) {
  return formatAppDate(value, { weekday: 'short' })
}

export function formatAppMonthYear(value: Date | string | number) {
  return formatAppDate(value, { month: 'long', year: 'numeric' })
}

export function formatAppShortMonthDay(value: Date | string | number) {
  return formatAppDate(value, { month: 'short', day: 'numeric' })
}
