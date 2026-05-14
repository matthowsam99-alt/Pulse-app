/**
 * URL state encoding/decoding for shareable chart configurations.
 * Encodes the full chart state into URL query params — no database needed.
 *
 * Format: /?i=cash_rate,cpi,median_house_price&mode=yoy&from=1990&events=election,policy
 */

import { ViewMode } from '@/types/pulse'

export interface ChartState {
  activeIds: string[]
  viewMode: ViewMode
  startYear: number
  activeEventCategories: string[]
}

export function encodeState(state: ChartState): string {
  const params = new URLSearchParams()
  if (state.activeIds.length > 0) {
    params.set('i', state.activeIds.join(','))
  }
  if (state.viewMode !== 'yoy') {
    params.set('mode', state.viewMode)
  }
  if (state.startYear !== 1990) {
    params.set('from', String(state.startYear))
  }
  const defaultEvents = ['election', 'recession', 'crisis', 'policy']
  const eventsChanged = 
    state.activeEventCategories.length !== defaultEvents.length ||
    !defaultEvents.every(e => state.activeEventCategories.includes(e))
  if (eventsChanged) {
    params.set('events', state.activeEventCategories.join(','))
  }
  const str = params.toString()
  return str ? `?${str}` : ''
}

export function decodeState(search: string): Partial<ChartState> {
  const params = new URLSearchParams(search)
  const state: Partial<ChartState> = {}

  const i = params.get('i')
  if (i) state.activeIds = i.split(',').filter(Boolean)

  const mode = params.get('mode')
  if (mode === 'yoy' || mode === 'cumulative' || mode === 'raw') {
    state.viewMode = mode
  }

  const from = params.get('from')
  if (from) {
    const year = parseInt(from)
    if (year >= 1975 && year <= 2030) state.startYear = year
  }

  const events = params.get('events')
  if (events) state.activeEventCategories = events.split(',').filter(Boolean)

  return state
}

export function buildShareUrl(state: ChartState): string {
  if (typeof window === 'undefined') return ''
  return `${window.location.origin}${encodeState(state)}`
}

// ── Named saved views (localStorage) ─────────────────────────────────────────

export interface SavedView {
  id: string
  name: string
  state: ChartState
  savedAt: string
}

const STORAGE_KEY = 'pulse_saved_views'

export function getSavedViews(): SavedView[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function saveView(name: string, state: ChartState): SavedView {
  const views = getSavedViews()
  const view: SavedView = {
    id: Date.now().toString(),
    name,
    state,
    savedAt: new Date().toISOString(),
  }
  views.unshift(view) // newest first
  localStorage.setItem(STORAGE_KEY, JSON.stringify(views.slice(0, 20))) // max 20
  return view
}

export function deleteSavedView(id: string): void {
  const views = getSavedViews().filter(v => v.id !== id)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(views))
}

// ── Curated starter views ────────────────────────────────────────────────────
// Pre-built combinations that ship with the app

export const CURATED_VIEWS: Array<{ name: string; description: string; state: ChartState }> = [
  {
    name: 'The housing crisis',
    description: 'How house prices, wages and migration diverged',
    state: {
      activeIds: ['median_house_price', 'price_to_income', 'median_wage', 'net_migration'],
      viewMode: 'cumulative',
      startYear: 1990,
      activeEventCategories: ['election', 'policy'],
    }
  },
  {
    name: 'The debt economy',
    description: 'Money supply, household debt and house prices',
    state: {
      activeIds: ['m2_money_supply', 'household_debt_ratio', 'median_house_price', 'gross_govt_debt'],
      viewMode: 'cumulative',
      startYear: 1990,
      activeEventCategories: ['recession', 'crisis', 'policy'],
    }
  },
  {
    name: 'The Covid shock',
    description: 'How the economy, migration and debt responded',
    state: {
      activeIds: ['gdp_per_capita', 'net_migration', 'unemployment', 'gross_govt_debt'],
      viewMode: 'cumulative',
      startYear: 2015,
      activeEventCategories: ['election', 'recession', 'crisis', 'policy'],
    }
  },
  {
    name: 'Real wages crisis',
    description: 'When prices outran wages — the squeeze since 2010',
    state: {
      activeIds: ['wage_price_index', 'cpi', 'cash_rate', 'unemployment'],
      viewMode: 'cumulative',
      startYear: 2010,
      activeEventCategories: ['election', 'policy'],
    }
  },
  {
    name: 'The energy transition',
    description: 'Emissions, renewables and electricity prices',
    state: {
      activeIds: ['co2_emissions', 'renewable_energy', 'electricity_price'],
      viewMode: 'cumulative',
      startYear: 2000,
      activeEventCategories: ['election', 'policy'],
    }
  },
  {
    name: 'The tax story',
    description: 'What government takes — and how the burden has shifted',
    state: {
      activeIds: ['tax_revenue_per_capita', 'median_tax_burden', 'median_wage', 'gross_govt_debt'],
      viewMode: 'cumulative',
      startYear: 1990,
      activeEventCategories: ['election', 'policy'],
    }
  },
  {
    name: 'The quiet crisis',
    description: 'Mental health, prescriptions and prosperity since 2000 — Australia got wealthier and more distressed simultaneously',
    state: {
      activeIds: ['antidepressant_prescriptions', 'mental_health_hospitalisations', 'psychological_distress', 'gdp_per_capita'],
      viewMode: 'cumulative',
      startYear: 2000,
      activeEventCategories: ['election', 'crisis', 'policy'],
    }
  },
  {
    name: 'China relationship',
    description: 'How the mining boom shaped Australia',
    state: {
      activeIds: ['terms_of_trade', 'gdp_per_capita', 'asx200', 'unemployment'],
      viewMode: 'cumulative',
      startYear: 1995,
      activeEventCategories: ['global', 'election'],
    }
  },
]
