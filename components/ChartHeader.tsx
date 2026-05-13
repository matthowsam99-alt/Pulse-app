'use client'

import { ReactNode } from 'react'
import { ActiveIndicator, ViewMode } from '@/types/pulse'
import { CURATED_VIEWS } from '@/lib/share'

interface ChartHeaderProps {
  activeIndicators: ActiveIndicator[]
  startYear: number
  endYear: number
  viewMode: ViewMode
  onStartYearChange: (year: number) => void
  activeStoryName: string | null
  activeStoryIndex: number
  onNextStory: () => void
  shareBar?: ReactNode
}

const PRESET_RANGES = [
  { label: 'Pre-GFC', start: 1990 },
  { label: 'GFC era', start: 2005 },
  { label: 'Post-Covid', start: 2018 },
  { label: 'Full', start: 1975 },
]

const QUICK_RANGES = [
  { label: '10yr', years: 10 },
  { label: '20yr', years: 20 },
  { label: '30yr', years: 30 },
  { label: 'Max', years: 60 },
]

function buildTitle(activeIndicators: ActiveIndicator[], viewMode: ViewMode, startYear: number, activeStoryName: string | null) {
  const n = activeIndicators.length
  const modeLabel = viewMode === 'yoy' ? 'year-on-year change'
    : viewMode === 'cumulative' ? 'cumulative change' : 'raw values'
  const hasReal = activeIndicators.some(i => i.real_adjusted)
  const realNote = hasReal ? ' · Some values in real 2022–23 $' : ''

  if (activeStoryName) return {
    main: activeStoryName,
    sub: `${n} indicators · ${modeLabel} · ${startYear}–2035 · Sources ABS · RBA · Treasury${realNote}`,
    isStory: true,
  }
  if (n === 1) return {
    main: `${activeIndicators[0].label}, since ${startYear}.`,
    sub: `Showing ${modeLabel} · ${startYear}–2035 · Sources ABS · RBA · Treasury${realNote}`,
    isStory: false,
  }
  if (n === 2) return {
    main: `${activeIndicators[0].label} vs ${activeIndicators[1].label}, since ${startYear}.`,
    sub: `Showing ${modeLabel} · ${startYear}–2035${realNote}`,
    isStory: false,
  }
  return {
    main: `${n} indicators tell Australia's story, since ${startYear}.`,
    sub: `Showing ${modeLabel} · ${startYear}–2035 · Sources ABS · RBA · Treasury${realNote}`,
    isStory: false,
  }
}

export default function ChartHeader({
  activeIndicators, startYear, viewMode, onStartYearChange,
  activeStoryName, activeStoryIndex, onNextStory, shareBar
}: ChartHeaderProps) {
  const currentYear = 2026
  const hasContent = activeIndicators.length > 0

  if (!hasContent) {
    return (
      <div className="px-6 pt-4 pb-1 shrink-0">
        <div className="flex items-center justify-between">
          <div className="text-[11px] text-gray-300 tracking-wide uppercase">
            Interactive · 0 lines · 1990—2035
          </div>
          <div className="flex items-center gap-2">
            {shareBar}
            <div className="w-px h-4 bg-gray-200 mx-1" />
            <div className="flex items-center gap-1">
              {QUICK_RANGES.map(r => {
                const yr = Math.max(1975, currentYear - r.years)
                return (
                  <button key={r.label} onClick={() => onStartYearChange(yr)}
                    className="text-[11px] px-2 py-0.5 rounded text-gray-300 hover:text-gray-500 transition-all">
                    {r.label}
                  </button>
                )
              })}
              <span className="text-gray-200 mx-0.5">|</span>
              {PRESET_RANGES.map(r => (
                <button key={r.label} onClick={() => onStartYearChange(r.start)}
                  className="text-[11px] px-2 py-0.5 rounded text-gray-300 hover:text-gray-500 transition-all">
                  {r.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  const { main, sub, isStory } = buildTitle(activeIndicators, viewMode, startYear, activeStoryName)

  return (
    <div className="px-6 pt-4 pb-2 shrink-0">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <div className="text-[11px] text-gray-400 tracking-wide uppercase">
            Interactive · {activeIndicators.length} line{activeIndicators.length !== 1 ? 's' : ''} · {startYear}—2035
          </div>

        </div>
        <div className="flex items-center gap-2">
          {shareBar}
          <div className="w-px h-4 bg-gray-200 mx-1" />
          <div className="flex items-center gap-1">
            {QUICK_RANGES.map(r => {
              const yr = Math.max(1975, currentYear - r.years)
              const isActive = startYear === yr
              return (
                <button key={r.label} onClick={() => onStartYearChange(yr)}
                  className={`text-[11px] px-2 py-0.5 rounded transition-all ${isActive ? 'bg-gray-900 text-white' : 'text-gray-400 hover:text-gray-600'}`}>
                  {r.label}
                </button>
              )
            })}
            <span className="text-gray-200 mx-0.5">|</span>
            {PRESET_RANGES.map(r => (
              <button key={r.label} onClick={() => onStartYearChange(r.start)}
                className={`text-[11px] px-2 py-0.5 rounded transition-all ${startYear === r.start ? 'bg-gray-900 text-white' : 'text-gray-400 hover:text-gray-600'}`}>
                {r.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold leading-tight text-gray-900 mb-0.5" style={{ fontFamily: 'Georgia, serif' }}>
            <em>{main}</em>
          </h1>
          <div className="text-[11px] text-gray-400">{sub}</div>
        </div>

        {/* Next story — prominent pill matching Story badge style */}
        <button
          onClick={onNextStory}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gray-900 text-white text-[11px] font-medium hover:bg-gray-700 transition-all shrink-0 ml-4 mb-1"
          title="Load next story"
        >
          <span>✦</span>
          <span>{activeStoryIndex >= 0 ? `Story ${activeStoryIndex + 1}/${CURATED_VIEWS.length}` : 'Stories'}</span>
          <span className="opacity-60">→</span>
        </button>
      </div>
    </div>
  )
}
