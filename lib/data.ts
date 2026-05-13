import { Indicator, Manifest, EventsFile, DataPoint, ViewMode, ChartDataPoint } from '@/types/pulse'
import { getIndicatorColor } from '@/lib/colors'

const DATA_BASE = 'https://raw.githubusercontent.com/matthowsam99-alt/Pulse/main/data/output'

export async function fetchManifest(): Promise<Manifest> {
  const res = await fetch(`${DATA_BASE}/manifest.json`, { next: { revalidate: 3600 } })
  if (!res.ok) throw new Error('Failed to fetch manifest')
  return res.json()
}

export async function fetchIndicator(id: string): Promise<Indicator> {
  const res = await fetch(`${DATA_BASE}/${id}.json`, { next: { revalidate: 3600 } })
  if (!res.ok) throw new Error(`Failed to fetch indicator: ${id}`)
  return res.json()
}

export async function fetchEvents(): Promise<EventsFile> {
  const res = await fetch(`${DATA_BASE}/events.json`, { next: { revalidate: 86400 } })
  if (!res.ok) throw new Error('Failed to fetch events')
  return res.json()
}

export function filterSeries(series: DataPoint[], startYear: number, endYear: number): DataPoint[] {
  return series.filter(p => {
    const year = parseInt(p.date.substring(0, 4))
    return year >= startYear && year <= endYear
  })
}

export function toAnnual(series: DataPoint[]): DataPoint[] {
  const byYear: Record<string, DataPoint> = {}
  for (const point of series) {
    const year = point.date.substring(0, 4)
    byYear[year] = point
  }
  return Object.values(byYear).sort((a, b) => a.date.localeCompare(b.date))
}

/**
 * Indicators where YoY % change is misleading because values pass through
 * near-zero (rates, migration counts that can go negative/tiny).
 * These use absolute change instead of percentage change in YoY mode.
 */
const ABSOLUTE_CHANGE_INDICATORS = new Set([
  'cash_rate',
  'net_migration',
  'temp_anomaly',
  'current_account',
  'private_credit_growth',
])

/**
 * Cap absurd YoY values — anything beyond ±500% is almost certainly
 * a near-zero base artefact and should be clamped.
 */
const YOY_CAP = 500

export function transformSeries(
  series: DataPoint[],
  mode: ViewMode,
  startYear: number,
  indicatorId?: string
): DataPoint[] {
  if (series.length === 0) return []
  const annual = toAnnual(filterSeries(series, startYear - 1, 2035))

  if (mode === 'raw') {
    return toAnnual(filterSeries(series, startYear, 2035))
  }

  if (mode === 'cumulative') {
    const base = annual.find(p => parseInt(p.date) >= startYear)
    if (!base || base.value === 0) return []
    const baseVal = base.value
    return annual
      .filter(p => parseInt(p.date) >= startYear)
      .map(p => ({ ...p, value: parseFloat(((p.value / baseVal) * 100).toFixed(2)) }))
  }

  if (mode === 'yoy') {
    const useAbsolute = indicatorId && ABSOLUTE_CHANGE_INDICATORS.has(indicatorId)
    const result: DataPoint[] = []

    for (let i = 1; i < annual.length; i++) {
      const prev = annual[i - 1]
      const curr = annual[i]
      if (parseInt(curr.date) < startYear) continue

      let value: number

      if (useAbsolute) {
        // Absolute change — e.g. cash rate: 0.1 → 4.35 shows as +4.25pp
        value = parseFloat((curr.value - prev.value).toFixed(3))
      } else if (prev.value === 0 || Math.abs(prev.value) < 0.001) {
        // Skip near-zero base to avoid division artefacts
        continue
      } else {
        const pct = ((curr.value - prev.value) / Math.abs(prev.value)) * 100
        // Cap extreme values
        value = parseFloat(Math.max(-YOY_CAP, Math.min(YOY_CAP, pct)).toFixed(2))
      }

      result.push({ date: curr.date, value, projected: curr.projected })
    }
    return result
  }

  return annual
}

export function mergeSeriesForChart(
  indicators: Array<{ id: string; series: DataPoint[] }>
): ChartDataPoint[] {
  const dateMap: Record<string, ChartDataPoint> = {}
  for (const { id, series } of indicators) {
    for (const point of series) {
      const year = point.date.substring(0, 4)
      if (!dateMap[year]) dateMap[year] = { date: year }
      dateMap[year][id] = point.value
      dateMap[year][`${id}_projected`] = point.projected
    }
  }
  return Object.values(dateMap).sort((a, b) => String(a.date).localeCompare(String(b.date)))
}

export { getIndicatorColor }

export function formatValue(value: number, unitLabel: string, mode: ViewMode, indicatorId?: string): string {
  if (mode === 'yoy') {
    // Absolute change indicators — show with pp suffix
    if (indicatorId && ABSOLUTE_CHANGE_INDICATORS.has(indicatorId)) {
      return `${value > 0 ? '+' : ''}${value.toFixed(2)}pp`
    }
    return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`
  }
  if (mode === 'cumulative') {
    const change = value - 100
    return `${change > 0 ? '+' : ''}${change.toFixed(1)}%`
  }
  if (unitLabel === '$') {
    if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`
    if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}k`
    return `$${value.toFixed(0)}`
  }
  if (unitLabel === '$bn') return `$${value.toFixed(0)}bn`
  if (unitLabel === '%') return `${value.toFixed(1)}%`
  if (unitLabel === ' yrs') return `${value.toFixed(1)} yrs`
  if (unitLabel === 'x') return `${value.toFixed(1)}x`
  if (unitLabel === ' Mt') return `${value.toFixed(0)} Mt`
  if (unitLabel === '°C') return `${value > 0 ? '+' : ''}${value.toFixed(2)}°C`
  if (unitLabel === 'c') return `${value.toFixed(1)}c`
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}k`
  return value.toFixed(1)
}
