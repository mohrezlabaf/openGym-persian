import { dateLocale } from './i18n-core.js'
import { isoOf } from './format.js'

const calendar = () => dateLocale().startsWith('fa') ? 'persian' : 'gregory'
let cachedCalendar, cachedFormatter

export function calendarParts(date) {
  const kind = calendar()
  if (cachedCalendar !== kind) {
    cachedCalendar = kind
    cachedFormatter = new Intl.DateTimeFormat('en-US', {
      calendar: kind, numberingSystem: 'latn',
      year: 'numeric', month: 'numeric', day: 'numeric'
    })
  }
  const parts = Object.fromEntries(
    cachedFormatter.formatToParts(date).map(p => [p.type, p.value])
  )
  return { year: +parts.year, month: +parts.month, day: +parts.day }
}

export function calendarDate(value = new Date()) {
  const d = typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)
    ? new Date(value + 'T12:00:00')
    : new Date(value)
  if (!Number.isFinite(+d)) throw new Error('Invalid calendar date')
  d.setHours(12, 0, 0, 0)
  return d
}

export function calendarMonthStart(value) {
  const d = calendarDate(value)
  d.setDate(d.getDate() - calendarParts(d).day + 1)
  return d
}

export function shiftCalendarMonth(value, direction) {
  const d = calendarMonthStart(value)
  d.setDate(d.getDate() + (direction < 0 ? -1 : 35))
  return calendarMonthStart(d)
}

export function calendarMonth(value) {
  const start = calendarMonthStart(value)
  const next = shiftCalendarMonth(start, 1)
  const days = []
  for (const d = new Date(start); d < next; d.setDate(d.getDate() + 1)) {
    days.push(isoOf(d))
  }
  return {
    start, next, days,
    firstISO: isoOf(start),
    nextISO: isoOf(next),
    label: start.toLocaleDateString(dateLocale(), {
      calendar: calendar(), month: 'long', year: 'numeric'
    })
  }
}
