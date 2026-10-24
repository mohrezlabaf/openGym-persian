import { useEffect, useRef, useState } from 'react'
import { getLang, t } from '../lib/i18n-core.js'
import { fmtDate, todayISO } from '../lib/format.js'
import {
  calendarMonth, calendarMonthStart, shiftCalendarMonth
} from '../lib/calendar.js'

function PersianDateField({ value, max, min, onChange, className }) {
  const detailsRef = useRef(null)
  const [cur, setCur] = useState(() => calendarMonthStart(value || max || todayISO()))
  useEffect(() => {
    setCur(calendarMonthStart(value || max || todayISO()))
  }, [value, max])

  const month = calendarMonth(cur)
  const previous = calendarMonth(shiftCalendarMonth(cur, -1))
  const next = calendarMonth(shiftCalendarMonth(cur, 1))
  const offset = (month.start.getDay() + 1) % 7
  const weekdays = ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']

  function choose(iso) {
    onChange({ target: { value: iso } })
    if (detailsRef.current) {
      detailsRef.current.open = false
      detailsRef.current.querySelector('summary')?.focus()
    }
  }

  return <details ref={detailsRef} dir="rtl"
    style={{ width: '100%', maxWidth: 320, minWidth: 0 }}
    onKeyDown={e => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        detailsRef.current.open = false
        detailsRef.current.querySelector('summary')?.focus()
      }
    }}>
    <summary className={className}
      aria-label={t('Date')}
      style={{ cursor: 'pointer', padding: '8px 4px' }}>
      {value ? fmtDate(value, false, true) : t('Date')}
    </summary>
    <div style={{ padding: '12px 0' }}>
      <div style={{
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', gap: 8, marginBottom: 12
      }}>
        <button type="button" className="iconbtn"
          aria-label={t('Previous month')}
          disabled={!!min && previous.nextISO <= min}
          onClick={() => setCur(previous.start)}>‹</button>
        <strong aria-live="polite">{month.label}</strong>
        <button type="button" className="iconbtn"
          aria-label={t('Next month')}
          disabled={!!max && next.firstISO > max}
          onClick={() => setCur(next.start)}>›</button>
      </div>
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
        gap: 3
      }}>
        {weekdays.map(day => <div key={day} style={{
          textAlign: 'center', fontSize: 10, padding: '4px 0'
        }}>{t(day)}</div>)}
        {Array.from({ length: offset }, (_, i) => <span key={'blank-' + i} />)}
        {month.days.map((iso, i) => {
          const disabled = (!!max && iso > max) || (!!min && iso < min)
          return <button key={iso} type="button"
            className="cal-d"
            aria-label={fmtDate(iso, true, true)}
            aria-pressed={iso === value}
            aria-current={iso === todayISO() ? 'date' : undefined}
            disabled={disabled}
            onClick={() => choose(iso)}
            style={{
              minHeight: 36, padding: 0,
              opacity: disabled ? 0.3 : 1,
              outline: iso === value ? '2px solid var(--acc)' : undefined,
              outlineOffset: -2
            }}>{i + 1}</button>
        })}
      </div>
      <button type="button" className="btn"
        style={{ marginTop: 10 }}
        disabled={(!!max && todayISO() > max) || (!!min && todayISO() < min)}
        onClick={() => choose(todayISO())}>{t('Today')}</button>
    </div>
  </details>
}

export default function DateField(props) {
  return getLang() === 'fa'
    ? <PersianDateField {...props} />
    : <input type="date" {...props} />
}
