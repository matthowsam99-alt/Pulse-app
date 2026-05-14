'use client'

import { useState, useRef, useEffect } from 'react'
import { ActiveIndicator, ViewMode, EventsFile } from '@/types/pulse'
import { CURATED_VIEWS } from '@/lib/share'
import PulseChart from '@/components/PulseChart'
import { ChartState } from '@/lib/share'
import { mergeSeriesForChart } from '@/lib/data'

interface MobileChartProps {
  activeIndicators: ActiveIndicator[]
  storyIndex: number
  totalStories: number
  viewMode: ViewMode
  startYear: number
  endYear: number
  events: EventsFile | null
  activeEventCategories: string[]
  onToggleEvents: () => void
  onGoHome: () => void
  onPrevStory: () => void
  onNextStory: () => void
  onOpenIndicators: () => void
  onOpenLearnMore: () => void
  isCustomised: boolean
  onSave: () => void
  onShare: () => void
  onLoadStory: (state: ChartState) => void
}

export default function MobileChart({
  activeIndicators,
  storyIndex,
  totalStories,
  viewMode,
  startYear,
  endYear,
  events,
  activeEventCategories,
  onToggleEvents,
  onGoHome,
  onPrevStory,
  onNextStory,
  onOpenIndicators,
  onOpenLearnMore,
  isCustomised,
  onSave,
  onShare,
  onLoadStory,
}: MobileChartProps) {
  const eventsOn = activeEventCategories.length > 0
  const story = storyIndex >= 0 && storyIndex < CURATED_VIEWS.length ? CURATED_VIEWS[storyIndex] : null
  const isFirst = storyIndex === 0
  const isLast = storyIndex === totalStories - 1

  // Measure chart area height so inner div gets explicit pixels (required by ResponsiveContainer)
  const chartAreaRef = useRef<HTMLDivElement>(null)
  const [chartHeight, setChartHeight] = useState(260)
  useEffect(() => {
    if (!chartAreaRef.current) return
    const ro = new ResizeObserver(entries => {
      const h = entries[0]?.contentRect.height
      if (h && h > 0) setChartHeight(h)
    })
    ro.observe(chartAreaRef.current)
    return () => ro.disconnect()
  }, [])

  const firstYear = activeIndicators.length > 0
    ? Math.min(...activeIndicators.map(a => a.data[0]?.date ? parseInt(String(a.data[0].date).slice(0, 4)) : startYear).filter(Boolean))
    : startYear
  const displayStart = Math.max(startYear, firstYear)

  // Separator helper
  const Sep = () => (
    <span style={{ width: 1, height: 14, background: 'rgba(26,26,24,0.11)', flexShrink: 0 }} />
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, background: '#F0EDE6' }}>

      {/* ── Header ─────────────────────────────────────────── */}
      <div
        className="flex items-center shrink-0"
        style={{
          height: 40,
          padding: '0 12px',
          borderBottom: '0.5px solid rgba(26,26,24,0.11)',
          background: '#F0EDE6',
          gap: 0,
        }}
      >
        {/* Logo → home */}
        <button
          onClick={onGoHome}
          style={{ fontFamily: 'Georgia, serif', fontSize: 14, fontWeight: 700, color: '#1a1a18', letterSpacing: '-0.02em', background: 'none', border: 'none', cursor: 'pointer', padding: 0, flexShrink: 0 }}
        >
          Pulse
        </button>

        <Sep />

        {/* Story category */}
        {story && (
          <span style={{ fontSize: 9, color: '#8a8a80', letterSpacing: '0.07em', textTransform: 'uppercase', flexShrink: 0 }}>
            {String(storyIndex + 1).padStart(2, '0')}
          </span>
        )}

        {/* Right controls */}
        <div className="flex items-center" style={{ marginLeft: 'auto', gap: 4 }}>

          {/* Prev / counter / Next */}
          <div className="flex items-center" style={{ gap: 2 }}>
            <button
              onClick={onPrevStory}
              disabled={isFirst}
              aria-label="Previous story"
              style={{
                width: 26, height: 26, borderRadius: 6,
                border: '0.5px solid rgba(26,26,24,0.11)',
                background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: isFirst ? 'default' : 'pointer',
                opacity: isFirst ? 0.25 : 1,
                fontSize: 11, color: '#4a4a44',
                transition: 'opacity 0.15s',
              }}
            >
              ←
            </button>
            <span style={{ fontSize: 9, color: '#8a8a80', padding: '0 2px', letterSpacing: '0.04em', minWidth: 32, textAlign: 'center' }}>
              {String(storyIndex + 1).padStart(2, '0')}/{String(totalStories).padStart(2, '0')}
            </span>
            <button
              onClick={onNextStory}
              disabled={isLast}
              aria-label="Next story"
              style={{
                width: 26, height: 26, borderRadius: 6,
                border: '0.5px solid rgba(26,26,24,0.11)',
                background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: isLast ? 'default' : 'pointer',
                opacity: isLast ? 0.25 : 1,
                fontSize: 11, color: '#4a4a44',
                transition: 'opacity 0.15s',
              }}
            >
              →
            </button>
          </div>

          <Sep />

          {/* Share */}
          <button
            onClick={onShare}
            aria-label="Share"
            style={{ width: 28, height: 28, borderRadius: 6, border: '0.5px solid rgba(26,26,24,0.11)', background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#4a4a44' }}
          >
            <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M16 6l-4-4-4 4M12 2v13" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          {/* Save — disabled until customised */}
          <button
            onClick={isCustomised ? onSave : undefined}
            aria-label={isCustomised ? 'Save view' : 'Save (customise indicators to enable)'}
            title={isCustomised ? 'Save this view' : 'Customise indicators to enable save'}
            style={{
              width: 28, height: 28, borderRadius: 6,
              border: '0.5px solid rgba(26,26,24,0.11)',
              background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: isCustomised ? 'pointer' : 'default',
              opacity: isCustomised ? 1 : 0.28,
              color: '#4a4a44',
            }}
          >
            <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          <Sep />

          {/* Indicators pill */}
          <button
            onClick={onOpenIndicators}
            style={{
              padding: '0 10px', height: 28, borderRadius: 6,
              border: '0.5px solid rgba(26,26,24,0.11)',
              background: 'transparent', fontSize: 10, color: '#4a4a44',
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5,
              fontFamily: 'inherit', flexShrink: 0,
            }}
          >
            <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="14" y2="12"/><line x1="4" y1="18" x2="18" y2="18"/>
            </svg>
            Indicators
          </button>
        </div>
      </div>

      {/* ── Subheader strip ─────────────────────────────────── */}
      <div
        className="shrink-0"
        style={{ padding: '8px 14px 7px', borderBottom: '0.5px solid rgba(26,26,24,0.06)' }}
      >
        {/* Title row */}
        <div className="flex items-baseline" style={{ gap: 7, marginBottom: 6, flexWrap: 'nowrap' }}>
          <span style={{ fontSize: 15, fontWeight: 700, color: '#1a1a18', fontFamily: 'Georgia, serif', lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '45%' }}>
            {story?.name ?? 'Custom view'}
          </span>
          <span style={{ fontSize: 11, color: '#8a8a80', flexShrink: 0 }}>
            {displayStart}–2025
          </span>
          {story && (
            <button
              onClick={onOpenLearnMore}
              style={{ fontSize: 11, color: '#8B1A1A', cursor: 'pointer', background: 'none', border: 'none', padding: 0, fontFamily: 'inherit', flexShrink: 0 }}
            >
              Learn more
            </button>
          )}
          {/* Events toggle — right-aligned */}
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0 }}>
            <button
              onClick={onToggleEvents}
              style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: eventsOn ? '#4a4a44' : '#8a8a80', cursor: 'pointer', background: 'none', border: 'none', padding: 0, fontFamily: 'inherit' }}
            >
              <span>Show events</span>
              <span style={{
                width: 26, height: 15, borderRadius: 8,
                background: eventsOn ? '#1a1a18' : 'rgba(26,26,24,0.15)',
                border: '0.5px solid rgba(26,26,24,0.15)',
                position: 'relative', display: 'inline-block',
                transition: 'background 0.15s', flexShrink: 0,
              }}>
                <span style={{
                  width: 11, height: 11, borderRadius: '50%', background: '#fff',
                  position: 'absolute', top: 2,
                  left: eventsOn ? 13 : 2,
                  transition: 'left 0.15s', display: 'block',
                }} />
              </span>
            </button>
          </div>
        </div>

        {/* Indicator pills */}
        <div className="flex" style={{ gap: 5, overflowX: 'auto', scrollbarWidth: 'none' }}>
          {activeIndicators.map(ind => (
            <div
              key={ind.id}
              style={{
                display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0,
                padding: '3px 8px 3px 6px', borderRadius: 20,
                border: '0.5px solid rgba(26,26,24,0.11)', fontSize: 11, color: '#4a4a44',
              }}
            >
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: ind.color, flexShrink: 0, display: 'block' }} />
              {ind.label}
            </div>
          ))}
        </div>
      </div>

      {/* ── Chart ───────────────────────────────────────────── */}
      <div
        ref={chartAreaRef}
        style={{
          flex: 1,
          minHeight: 0,
          position: 'relative',
          overflowX: 'auto',
          overflowY: 'hidden',
          WebkitOverflowScrolling: 'touch',
        } as React.CSSProperties}
      >
        {/* Inner container — 680px min-width so chart never squashes on portrait */}
        <div style={{ width: 'max(100%, 680px)', height: chartHeight || 260, position: 'relative' }}>
          <PulseChart
            chartData={mergeSeriesForChart(activeIndicators.map(a => ({ id: a.id, series: a.data })))}
            activeIndicators={activeIndicators}
            viewMode={viewMode}
            startYear={startYear}
            endYear={endYear}
            events={events}
            activeEventCategories={activeEventCategories}
            onLoadStory={onLoadStory}
          />
        </div>
      </div>
    </div>
  )
}
