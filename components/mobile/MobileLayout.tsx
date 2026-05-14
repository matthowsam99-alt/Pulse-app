'use client'

import { useState, useCallback } from 'react'
import { Manifest, EventsFile, Indicator, ActiveIndicator, ViewMode } from '@/types/pulse'
import { ChartState, CURATED_VIEWS } from '@/lib/share'
import { getIndicatorColor } from '@/lib/colors'
import { transformSeries } from '@/lib/data'
import MobileLanding from './MobileLanding'
import MobileChart from './MobileChart'
import MobileIndicators from './MobileIndicators'
import MobileLearnMore from './MobileLearnMore'

type MobileView = 'landing' | 'chart'

interface MobileLayoutProps {
  manifest: Manifest | null
  events: EventsFile | null
  activeIds: string[]
  loadedIndicators: Record<string, Indicator>
  viewMode: ViewMode
  startYear: number
  endYear: number
  activeEventCategories: string[]
  onToggleIndicator: (id: string) => void
  onLoadState: (state: ChartState) => void
  onToggleEventCategory: (cat: string) => void
  mountedDate: string
}

export default function MobileLayout({
  manifest,
  events,
  activeIds,
  loadedIndicators,
  viewMode,
  startYear,
  endYear,
  activeEventCategories,
  onToggleIndicator,
  onLoadState,
  onToggleEventCategory,
  mountedDate,
}: MobileLayoutProps) {
  const [view, setView] = useState<MobileView>('landing')
  const [storyIndex, setStoryIndex] = useState(0)
  const [showIndicators, setShowIndicators] = useState(false)
  const [showLearnMore, setShowLearnMore] = useState(false)
  // Track the "canonical" activeIds when a story was loaded — to detect customisation
  const [canonicalIds, setCanonicalIds] = useState<string[]>([])

  const isCustomised = view === 'chart' && (
    activeIds.length !== canonicalIds.length ||
    !activeIds.every(id => canonicalIds.includes(id))
  )

  const activeIndicators: ActiveIndicator[] = activeIds
    .filter(id => loadedIndicators[id])
    .map(id => {
      const ind = loadedIndicators[id]
      return {
        id,
        label: ind.label,
        color: getIndicatorColor(id),
        unit_label: ind.unit_label,
        data: transformSeries(ind.series, viewMode, startYear, id),
        description: ind.description,
        explainer: (ind as any).explainer,
        projection_source: (ind as any).projection_source,
        source: ind.source,
        source_url: ind.source_url,
        real_adjusted: ind.real_adjusted,
        base_year: ind.base_year,
      }
    })

  const handleSelectStory = useCallback((index: number) => {
    const story = CURATED_VIEWS[index]
    if (!story) return
    setStoryIndex(index)
    setCanonicalIds([...story.state.activeIds])
    onLoadState(story.state)
    setView('chart')
  }, [onLoadState])

  const handlePrevStory = useCallback(() => {
    const prev = Math.max(0, storyIndex - 1)
    handleSelectStory(prev)
  }, [storyIndex, handleSelectStory])

  const handleNextStory = useCallback(() => {
    const next = Math.min(CURATED_VIEWS.length - 1, storyIndex + 1)
    handleSelectStory(next)
  }, [storyIndex, handleSelectStory])

  const handleToggleEvents = useCallback(() => {
    // Toggle all event categories on/off
    if (activeEventCategories.length > 0) {
      // Turn off — clear all
      ;['election', 'recession', 'crisis', 'policy', 'global'].forEach(cat => {
        if (activeEventCategories.includes(cat)) onToggleEventCategory(cat)
      })
    } else {
      // Turn on defaults
      ;['election', 'recession', 'crisis', 'policy'].forEach(cat => {
        if (!activeEventCategories.includes(cat)) onToggleEventCategory(cat)
      })
    }
  }, [activeEventCategories, onToggleEventCategory])

  const handleOpenIndicators = useCallback(() => {
    setShowLearnMore(false)
    setShowIndicators(true)
    if (view === 'landing') setView('chart')
  }, [view])

  return (
    <div className="relative w-full" style={{ minHeight: '100svh', background: '#F0EDE6' }}>

      {/* ── Landing ──────────────────────────────────────── */}
      <div
        style={{
          position: view === 'landing' ? 'relative' : 'absolute',
          inset: 0,
          opacity: view === 'landing' ? 1 : 0,
          pointerEvents: view === 'landing' ? 'all' : 'none',
          transition: 'opacity 0.2s',
          zIndex: 1,
          minHeight: '100svh',
        }}
      >
        <MobileLanding
          onSelectStory={handleSelectStory}
          onOpenIndicators={handleOpenIndicators}
          mountedDate={mountedDate}
        />
      </div>

      {/* ── Chart ────────────────────────────────────────── */}
      <div
        style={{
          position: view === 'chart' ? 'relative' : 'absolute',
          inset: 0,
          opacity: view === 'chart' ? 1 : 0,
          pointerEvents: view === 'chart' ? 'all' : 'none',
          transition: 'opacity 0.2s',
          zIndex: 2,
          minHeight: '100svh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <MobileChart
          activeIndicators={activeIndicators}
          storyIndex={storyIndex}
          totalStories={CURATED_VIEWS.length}
          viewMode={viewMode}
          startYear={startYear}
          endYear={endYear}
          events={events}
          activeEventCategories={activeEventCategories}
          onToggleEvents={handleToggleEvents}
          onGoHome={() => setView('landing')}
          onPrevStory={handlePrevStory}
          onNextStory={handleNextStory}
          onOpenIndicators={handleOpenIndicators}
          onOpenLearnMore={() => setShowLearnMore(true)}
          isCustomised={isCustomised}
          onSave={() => {/* wire to ShareBar save flow if desired */}}
          onShare={() => {/* wire share URL copy */}}
          onLoadStory={onLoadState}
        />

        {/* Indicators drawer — overlays chart */}
        <MobileIndicators
          manifest={manifest}
          activeIds={activeIds}
          onToggle={(id) => {
            onToggleIndicator(id)
          }}
          onApply={() => setShowIndicators(false)}
          open={showIndicators}
        />

        {/* Learn more sheet — overlays chart */}
        <MobileLearnMore
          storyIndex={storyIndex}
          open={showLearnMore}
          onClose={() => setShowLearnMore(false)}
        />
      </div>
    </div>
  )
}
