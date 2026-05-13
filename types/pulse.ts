export interface DataPoint {
  date: string
  value: number
  projected: boolean
}

export interface Indicator {
  id: string
  label: string
  category: string
  unit: string
  unit_label: string
  frequency: string
  source: string
  source_url: string
  description: string
  explainer?: string
  projection_source?: string
  first_year: number
  last_updated: string
  projection_start: string
  series: DataPoint[]
  notes?: string
  real_adjusted?: boolean
  base_year?: string
}

export type DataQuality = 'verified' | 'estimated' | 'derived'

export interface IndicatorMeta {
  id: string
  label: string
  category: string
  unit: string
  unit_label: string
  available: boolean
  last_updated: string | null
  data_points: number
  first_year?: number
  source?: string
  description?: string
  frequency?: string
  data_quality?: DataQuality
}

export interface Category {
  label: string
  color: string
}

export interface Manifest {
  version: string
  generated: string
  categories: Record<string, Category>
  indicators: IndicatorMeta[]
}

export interface PulseEvent {
  id: string
  label: string
  date?: string
  date_start?: string
  date_end?: string
  category: string
  description: string
  type: 'point' | 'band'
}

export interface EventsFile {
  version: string
  last_updated: string
  categories: Record<string, { label: string; color: string }>
  events: PulseEvent[]
}

export type ViewMode = 'yoy' | 'cumulative' | 'raw'

export interface ActiveIndicator {
  id: string
  label: string
  color: string
  unit_label: string
  data: DataPoint[]
  explainer?: string
  projection_source?: string
  description?: string
  source?: string
  source_url?: string
  real_adjusted?: boolean
  base_year?: string
}

export interface ChartDataPoint {
  date: string
  [key: string]: number | string | boolean
}

// Extended indicator fields for real/nominal labelling
export interface IndicatorExtra {
  real_adjusted?: boolean
  base_year?: string
}
