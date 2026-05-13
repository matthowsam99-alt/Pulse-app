'use client'

import { ActiveIndicator, ViewMode } from '@/types/pulse'
import { formatValue } from '@/lib/data'

interface KpiCardsProps {
  activeIndicators: ActiveIndicator[]
  viewMode: ViewMode
  startYear: number
}

export default function KpiCards({ activeIndicators, viewMode, startYear }: KpiCardsProps) {
  if (activeIndicators.length === 0) return null

  // Show max 5 cards then overflow indicator
  const visible = activeIndicators.slice(0, 5)
  const overflow = activeIndicators.length - visible.length

  return (
    <div className="px-6 pb-2 shrink-0">
      <div className="flex gap-2 overflow-x-auto pb-1">
        {visible.map(ind => {
          const series = ind.data
          if (!series.length) return null

          const latest = series[series.length - 1]
          const prev10 = series.find(p => {
            const year = parseInt(p.date)
            return year === parseInt(latest.date) - 10
          })

          const latestYear = latest.date.substring(0, 4)
          const changeLabel = prev10
            ? `${((latest.value - prev10.value) / Math.abs(prev10.value) * 100) > 0 ? '+' : ''}${((latest.value - prev10.value) / Math.abs(prev10.value) * 100).toFixed(1)}% / 10y`
            : ''

          const isPositive = prev10 ? latest.value > prev10.value : true

          return (
            <div
              key={ind.id}
              className="shrink-0 bg-white border rounded-lg px-3 py-2 min-w-[140px] max-w-[200px]"
              style={{ borderColor: ind.color, borderTopWidth: '3px' }}
            >
              <div className="text-[10px] uppercase tracking-widest text-gray-400 mb-1 truncate">
                {ind.label}
              </div>
              <div className="text-xl font-bold text-gray-900 leading-tight">
                {formatValue(latest.value, ind.unit_label, viewMode)}
              </div>
              <div className="flex items-center justify-between mt-0.5">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-gray-400">{latestYear}</span>
                  {(ind as any).real_adjusted && (
                    <span className="text-[9px] px-1 py-0.5 rounded bg-blue-50 text-blue-400 font-medium tracking-wide">real</span>
                  )}
                </div>
                {changeLabel && (
                  <span className={`text-[10px] font-medium ${isPositive ? 'text-emerald-500' : 'text-red-400'}`}>
                    {isPositive ? '↑' : '↓'} {changeLabel}
                  </span>
                )}
              </div>
            </div>
          )
        })}

        {overflow > 0 && (
          <div className="shrink-0 bg-white border border-gray-200 rounded-lg px-3 py-2 min-w-[60px] flex items-center justify-center">
            <span className="text-sm text-gray-400 font-medium">+{overflow}</span>
          </div>
        )}
      </div>
    </div>
  )
}
