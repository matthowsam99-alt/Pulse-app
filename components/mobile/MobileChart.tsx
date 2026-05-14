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

const Sep = () => (
  <span style={{ width: 1, height: 16, background: 'rgba(26,26,24,0.11)', flexShrink: 0, display: 'inline-block' }} />
)

export default function MobileChart({
  activeIndicators, storyIndex, totalStories, viewMode, startYear, endYear,
  events, activeEventCategories, onToggleEvents, onGoHome, onPrevStory,
  onNextStory, onOpenIndicators, onOpenLearnMore, isCustomised, onSave, onShare, onLoadStory,
}: MobileChartProps) {
  const eventsOn = activeEventCategories.length > 0
  const story = storyIndex >= 0 && storyIndex < CURATED_VIEWS.length ? CURATED_VIEWS[storyIndex] : null
  const isFirst = storyIndex === 0
  const isLast = storyIndex === totalStories - 1

  // Measure chart area height — ResponsiveContainer needs explicit pixel height
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
    ? Math.min(...activeIndicators.map(a =>
        a.data[0]?.date ? parseInt(String(a.data[0].date).slice(0, 4)) : startYear
      ).filter(Boolean))
    : startYear
  const displayStart = Math.max(startYear, firstYear)

  // Touch drag detection — suppress tooltip while scrolling
  const touchStartX = useRef(0)
  const touchStartY = useRef(0)
  const isDragging = useRef(false)
  const [tooltipActive, setTooltipActive] = useState(true)

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
    touchStartY.current = e.touches[0].clientY
    isDragging.current = false
  }
  const handleTouchMove = (e: React.TouchEvent) => {
    const dx = Math.abs(e.touches[0].clientX - touchStartX.current)
    const dy = Math.abs(e.touches[0].clientY - touchStartY.current)
    if (dx > 8 || dy > 8) {
      isDragging.current = true
      if (tooltipActive) setTooltipActive(false)
    }
  }
  const handleTouchEnd = () => {
    if (!isDragging.current) setTooltipActive(true)
    setTimeout(() => setTooltipActive(true), 350)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, background: '#F0EDE6' }}>

      {/* ── Header ── */}
      <div style={{ height: 48, padding: '0 14px', borderBottom: '0.5px solid rgba(26,26,24,0.11)', background: '#F0EDE6', display: 'flex', alignItems: 'center', flexShrink: 0, gap: 8 }}>
        <button onClick={onGoHome} style={{ fontFamily: 'Georgia, serif', fontSize: 18, fontWeight: 700, color: '#1a1a18', letterSpacing: '-0.02em', background: 'none', border: 'none', cursor: 'pointer', padding: 0, flexShrink: 0 }}>
          Pulse
        </button>
        <Sep />
        {story && (
          <span style={{ fontSize: 10, color: '#8a8a80', letterSpacing: '0.07em', textTransform: 'uppercase', flexShrink: 0 }}>
            {String(storyIndex + 1).padStart(2, '0')}
          </span>
        )}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4 }}>
          {/* Prev/counter/next */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <button onClick={onPrevStory} disabled={isFirst} aria-label="Previous story"
              style={{ width: 28, height: 28, borderRadius: 6, border: '0.5px solid rgba(26,26,24,0.11)', background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: isFirst ? 'default' : 'pointer', opacity: isFirst ? 0.25 : 1, fontSize: 13, color: '#4a4a44' }}>
              ←
            </button>
            <span style={{ fontSize: 10, color: '#8a8a80', padding: '0 3px', minWidth: 34, textAlign: 'center' }}>
              {String(storyIndex + 1).padStart(2, '0')}/{String(totalStories).padStart(2, '0')}
            </span>
            <button onClick={onNextStory} disabled={isLast} aria-label="Next story"
              style={{ width: 28, height: 28, borderRadius: 6, border: '0.5px solid rgba(26,26,24,0.11)', background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: isLast ? 'default' : 'pointer', opacity: isLast ? 0.25 : 1, fontSize: 13, color: '#4a4a44' }}>
              →
            </button>
          </div>
          <Sep />
          <button onClick={onShare} aria-label="Share" style={{ width: 30, height: 30, borderRadius: 6, border: '0.5px solid rgba(26,26,24,0.11)', background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#4a4a44' }}>
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M16 6l-4-4-4 4M12 2v13" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
          <button onClick={isCustomised ? onSave : undefined} aria-label="Save"
            style={{ width: 30, height: 30, borderRadius: 6, border: '0.5px solid rgba(26,26,24,0.11)', background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: isCustomised ? 'pointer' : 'default', opacity: isCustomised ? 1 : 0.28, color: '#4a4a44' }}>
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
          <Sep />
          <button onClick={onOpenIndicators} style={{ padding: '0 11px', height: 30, borderRadius: 6, border: '0.5px solid rgba(26,26,24,0.11)', background: 'transparent', fontSize: 11, color: '#4a4a44', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, fontFamily: 'inherit', flexShrink: 0 }}>
            <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="14" y2="12"/><line x1="4" y1="18" x2="18" y2="18"/></svg>
            Indicators
          </button>
        </div>
      </div>

      {/* ── Subheader ── */}
      <div style={{ padding: '9px 14px 8px', borderBottom: '0.5px solid rgba(26,26,24,0.06)', flexShrink: 0 }}>
        {/* Row 1: title (wraps) + Events toggle */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 5 }}>
          <span style={{ fontSize: 15, fontWeight: 700, color: '#1a1a18', fontFamily: 'Georgia, serif', lineHeight: 1.28, flex: 1 }}>
            {story?.name ?? 'Custom view'}
          </span>
          <button onClick={onToggleEvents}
            style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: eventsOn ? '#4a4a44' : '#8a8a80', cursor: 'pointer', background: 'none', border: 'none', padding: 0, fontFamily: 'inherit', flexShrink: 0, marginTop: 2 }}>
            <span>Events</span>
            <span style={{ width: 26, height: 15, borderRadius: 8, background: eventsOn ? '#1a1a18' : 'rgba(26,26,24,0.18)', position: 'relative', display: 'inline-block', transition: 'background 0.15s', flexShrink: 0 }}>
              <span style={{ width: 11, height: 11, borderRadius: '50%', background: '#fff', position: 'absolute', top: 2, left: eventsOn ? 13 : 2, transition: 'left 0.15s', display: 'block' }} />
            </span>
          </button>
        </div>
        {/* Row 2: date + learn more */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <span style={{ fontSize: 11, color: '#8a8a80' }}>{displayStart}–2025</span>
          {story && (
            <button onClick={onOpenLearnMore} style={{ fontSize: 11, color: '#8B1A1A', cursor: 'pointer', background: 'none', border: 'none', padding: 0, fontFamily: 'inherit' }}>
              Learn more
            </button>
          )}
        </div>
        {/* Indicator pills */}
        <div style={{ display: 'flex', gap: 5, overflowX: 'auto', scrollbarWidth: 'none' } as React.CSSProperties}>
          {activeIndicators.map(ind => (
            <div key={ind.id} style={{ display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0, padding: '3px 8px 3px 6px', borderRadius: 20, border: '0.5px solid rgba(26,26,24,0.11)', fontSize: 11, color: '#4a4a44' }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: ind.color, flexShrink: 0, display: 'block' }} />
              {ind.label}
            </div>
          ))}
        </div>
      </div>

      {/* ── Chart ── */}
      <div
        ref={chartAreaRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{ flex: 1, minHeight: 0, position: 'relative', overflowX: 'auto', overflowY: 'hidden', WebkitOverflowScrolling: 'touch' } as React.CSSProperties}
      >
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
            tooltipActive={tooltipActive}
          />
        </div>
      </div>
    </div>
  )
}
