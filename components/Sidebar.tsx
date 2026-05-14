'use client'

import { Manifest, EventsFile, ViewMode } from '@/types/pulse'
import InfoTooltip from './InfoTooltip'
import { getIndicatorColor } from '@/lib/colors'

interface SidebarProps {
  manifest: Manifest | null
  activeIds: string[]
  onToggle: (id: string) => void
  viewMode: ViewMode
  onViewModeChange: (mode: ViewMode) => void
  events: EventsFile | null
  activeEventCategories: string[]
  onToggleEventCategory: (cat: string) => void
  onReset: () => void
  indicatorMeta: Record<string, {
    description?: string
    explainer?: string
    projection_source?: string
    source?: string
    source_url?: string
    notes?: string
    data_quality?: string
  }>
}

const CATEGORY_ORDER = ['economy', 'housing', 'demographics', 'wellbeing', 'government', 'environment', 'health']

const VIEW_MODES: { key: ViewMode; label: string; tip: string }[] = [
  { key: 'yoy',        label: 'ΔYoY',    tip: 'Year-on-year % change — best for spotting turning points' },
  { key: 'cumulative', label: 'Long run', tip: 'Indexed to start of period = 100 — shows cumulative divergence' },
  { key: 'raw',        label: 'Raw',      tip: 'Actual values — hover to see real numbers' },
]

function QualityBadge({ quality }: { quality?: string }) {
  if (!quality || quality === 'verified') return null
  if (quality === 'estimated') return (
    <span className="text-[8px] px-1 py-0.5 rounded bg-amber-50 text-amber-400 font-semibold shrink-0" title="Sample data — estimated, not from live source">~</span>
  )
  if (quality === 'derived') return (
    <span className="text-[8px] px-1 py-0.5 rounded bg-blue-50 text-blue-400 font-semibold shrink-0" title="Derived/calculated indicator">∑</span>
  )
  return null
}

export default function Sidebar({
  manifest, activeIds, onToggle,
  viewMode, onViewModeChange,
  events, activeEventCategories, onToggleEventCategory,
  onReset, indicatorMeta
}: SidebarProps) {

  const indicatorsByCategory = CATEGORY_ORDER.reduce((acc, cat) => {
    acc[cat] = (manifest?.indicators || []).filter(i => i.category === cat && i.available)
    return acc
  }, {} as Record<string, NonNullable<typeof manifest>['indicators']>)

  return (
    <div className="w-64 shrink-0 flex flex-col h-full border-r border-gray-200 bg-white overflow-y-auto">

      {/* Logo — clicking resets */}
      <div className="px-5 pt-5 pb-3 border-b border-gray-100">
        <button onClick={onReset} className="w-full text-left group" title="Return to start">
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold tracking-tight group-hover:opacity-70 transition-opacity" style={{ fontFamily: 'Georgia, serif' }}>Pulse</span>
            <span className="text-[10px] text-gray-400 tracking-widest uppercase">Australia</span>
          </div>
          <div className="text-[11px] text-gray-400 mt-0.5">The long view, since 1975 — projected to 2035.</div>
        </button>
      </div>

      {/* View mode toggle */}
      <div className="px-4 pt-3 pb-2">
        <div className="flex rounded-md overflow-hidden border border-gray-200 text-[11px]">
          {VIEW_MODES.map(m => (
            <button key={m.key} onClick={() => onViewModeChange(m.key)} title={m.tip}
              className={`flex-1 py-1.5 text-center transition-colors font-medium tracking-wide ${
                viewMode === m.key ? 'bg-gray-900 text-white' : 'bg-white text-gray-500 hover:bg-gray-50'
              }`}>
              {m.label}
            </button>
          ))}
        </div>
        <p className="text-[10px] text-gray-400 mt-1.5 leading-relaxed">
          {VIEW_MODES.find(m => m.key === viewMode)?.tip}
        </p>
      </div>

      {/* Indicators by category */}
      <div className="flex-1 overflow-y-auto px-4 pb-2">
        {CATEGORY_ORDER.map(cat => {
          const indicators = indicatorsByCategory[cat] || []
          if (indicators.length === 0) return null
          const catMeta = manifest?.categories[cat]
          const activeCount = indicators.filter(i => activeIds.includes(i.id)).length

          return (
            <div key={cat} className="mb-4">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full inline-block shrink-0" style={{ backgroundColor: catMeta?.color }} />
                  <span className="text-[10px] font-bold tracking-[0.12em] uppercase text-gray-500">
                    {catMeta?.label || cat}
                  </span>
                </div>
                <span className="text-[10px] text-gray-300">{activeCount}/{indicators.length}</span>
              </div>

              {indicators.map(ind => {
                const isActive = activeIds.includes(ind.id)
                const color = getIndicatorColor(ind.id)
                const meta = indicatorMeta[ind.id]
                const quality = meta?.data_quality || (ind as any).data_quality

                return (
                  <div key={ind.id}
                    className={`flex items-center gap-1.5 px-2 py-1.5 rounded mb-0.5 transition-all group ${
                      isActive ? 'bg-gray-50' : 'hover:bg-gray-50'
                    }`}>
                    <button onClick={() => onToggle(ind.id)} className="flex items-center gap-1.5 flex-1 min-w-0 text-left">
                      <span
                        className={`w-3 h-3 rounded-sm shrink-0 border transition-all ${isActive ? 'border-transparent' : 'border-gray-300 bg-white'}`}
                        style={isActive ? { backgroundColor: color } : {}}
                      />
                      <span className={`text-[12px] flex-1 leading-tight truncate ${isActive ? 'text-gray-800 font-medium' : 'text-gray-500'}`}>
                        {ind.label}
                      </span>
                    </button>
                    <QualityBadge quality={quality} />
                    <InfoTooltip
                      description={meta?.description || ind.description || ''}
                      explainer={meta?.explainer}
                      projection_source={meta?.projection_source}
                      source={meta?.source || ind.source}
                      source_url={meta?.source_url}
                      notes={meta?.notes}
                      data_quality={quality}
                    />
                  </div>
                )
              })}
            </div>
          )
        })}
      </div>

      {/* Events section */}
      {events && (
        <div className="px-4 py-3 border-t border-gray-100">
          <div className="text-[10px] font-bold tracking-[0.12em] uppercase text-gray-500 mb-2">Events</div>
          <div className="grid grid-cols-2 gap-1">
            {Object.entries(events.categories).map(([key, cat]) => {
              const isActive = activeEventCategories.includes(key)
              return (
                <button key={key} onClick={() => onToggleEventCategory(key)}
                  className={`flex items-center gap-1.5 px-2 py-1 rounded text-[11px] transition-all ${isActive ? 'opacity-100' : 'opacity-40'}`}>
                  <span className="w-2 h-2 rounded-sm shrink-0" style={{ backgroundColor: cat.color }} />
                  <span className="text-gray-600">{cat.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Clear all — single button, logo already resets */}
      <div className="px-4 pb-4 pt-2 border-t border-gray-100">
        <button onClick={onReset}
          className="w-full text-[11px] px-2.5 py-1.5 rounded border border-gray-200 text-gray-400 hover:border-gray-400 hover:text-gray-700 transition-all text-center">
          Clear all
        </button>
      </div>
    </div>
  )
}
