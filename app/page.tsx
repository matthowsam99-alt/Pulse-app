'use client'

import { useState, useEffect, useCallback } from 'react'
import { Manifest, EventsFile, Indicator, ActiveIndicator, ViewMode } from '@/types/pulse'
import { fetchManifest, fetchEvents, fetchIndicator, transformSeries, mergeSeriesForChart } from '@/lib/data'
import { getIndicatorColor } from '@/lib/colors'
import { encodeState, decodeState, ChartState, CURATED_VIEWS } from '@/lib/share'
import Sidebar from '@/components/Sidebar'
import PulseChart from '@/components/PulseChart'
import KpiCards from '@/components/KpiCards'
import ChartHeader from '@/components/ChartHeader'
import ShareBar from '@/components/ShareBar'
import AboutModal from '@/components/AboutModal'
import MobileBlock from '@/components/MobileBlock'

const DEFAULT_STATE: ChartState = {
  activeIds: [],
  viewMode: 'yoy',
  startYear: 1990,
  activeEventCategories: ['election', 'recession', 'crisis', 'policy'],
}

function detectActiveStory(activeIds: string[], viewMode: ViewMode, startYear: number): string | null {
  for (const view of CURATED_VIEWS) {
    const sameIds = view.state.activeIds.length === activeIds.length &&
      view.state.activeIds.every(id => activeIds.includes(id))
    const sameMode = view.state.viewMode === viewMode
    const sameYear = view.state.startYear === startYear
    if (sameIds && sameMode && sameYear) return view.name
  }
  return null
}

function generateAutoName(activeIds: string[], manifest: Manifest | null): string {
  if (!manifest || activeIds.length === 0) return 'My view'
  const labels = activeIds
    .map(id => manifest.indicators.find(i => i.id === id)?.label || id)
    .slice(0, 3)
    .map(l => l.replace(/ \(.*\)/, '').replace(' rate', '').replace(' price', ''))
  if (labels.length === 1) return labels[0]
  if (labels.length === 2) return `${labels[0]} & ${labels[1]}`
  return `${labels[0]}, ${labels[1]} & more`
}

export default function PulsePage() {
  const [manifest, setManifest] = useState<Manifest | null>(null)
  const [events, setEvents] = useState<EventsFile | null>(null)
  const [activeIds, setActiveIds] = useState<string[]>(DEFAULT_STATE.activeIds)
  const [loadedIndicators, setLoadedIndicators] = useState<Record<string, Indicator>>({})
  const [viewMode, setViewMode] = useState<ViewMode>(DEFAULT_STATE.viewMode)
  const [startYear, setStartYear] = useState(DEFAULT_STATE.startYear)
  const [endYear] = useState(2035)
  const [activeEventCategories, setActiveEventCategories] = useState<string[]>(DEFAULT_STATE.activeEventCategories)
  const [loading, setLoading] = useState(true)
  const [chartLoading, setChartLoading] = useState(false)
  const [mountedDate, setMountedDate] = useState('')

  useEffect(() => {
    setMountedDate(new Date().toLocaleDateString('en-AU', { month: 'long', year: 'numeric' }))
  }, [])

  // Detect if current state matches a curated story
  const activeStoryName = detectActiveStory(activeIds, viewMode, startYear)
  const activeStoryIndex = CURATED_VIEWS.findIndex(v => v.name === activeStoryName)

  // Auto-generated name for save dialog
  const autoSaveName = generateAutoName(activeIds, manifest)

  useEffect(() => {
    const decoded = decodeState(window.location.search)
    if (decoded.viewMode) setViewMode(decoded.viewMode)
    if (decoded.startYear) setStartYear(decoded.startYear)
    if (decoded.activeEventCategories) setActiveEventCategories(decoded.activeEventCategories)
    if (decoded.activeIds) {
      sessionStorage.setItem('pulse_initial_ids', JSON.stringify(decoded.activeIds))
    }
  }, [])

  useEffect(() => {
    Promise.all([fetchManifest(), fetchEvents()])
      .then(([m, e]) => {
        setManifest(m)
        setEvents(e)
        setLoading(false)
        const storedIds = sessionStorage.getItem('pulse_initial_ids')
        if (storedIds) {
          const ids: string[] = JSON.parse(storedIds)
          sessionStorage.removeItem('pulse_initial_ids')
          ids.forEach(id => {
            fetchIndicator(id).then(data => {
              setLoadedIndicators(prev => ({ ...prev, [id]: data }))
              setActiveIds(prev => prev.includes(id) ? prev : [...prev, id])
            }).catch(() => {})
          })
        }
      })
      .catch(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (loading) return
    const state: ChartState = { activeIds, viewMode, startYear, activeEventCategories }
    const encoded = encodeState(state)
    window.history.replaceState({}, '', `${window.location.pathname}${encoded}`)
  }, [activeIds, viewMode, startYear, activeEventCategories, loading])

  const toggleIndicator = useCallback(async (id: string) => {
    if (activeIds.includes(id)) {
      setActiveIds(prev => prev.filter(i => i !== id))
      return
    }
    if (!loadedIndicators[id]) {
      setChartLoading(true)
      try {
        const data = await fetchIndicator(id)
        setLoadedIndicators(prev => ({ ...prev, [id]: data }))
      } catch {
        setChartLoading(false)
        return
      }
      setChartLoading(false)
    }
    setActiveIds(prev => [...prev, id])
  }, [activeIds, loadedIndicators])

  const loadState = useCallback(async (state: ChartState) => {
    setViewMode(state.viewMode)
    setStartYear(state.startYear)
    setActiveEventCategories(state.activeEventCategories)
    setActiveIds([])
    setChartLoading(true)
    for (const id of state.activeIds) {
      if (!loadedIndicators[id]) {
        try {
          const data = await fetchIndicator(id)
          setLoadedIndicators(prev => ({ ...prev, [id]: data }))
        } catch { continue }
      }
    }
    setChartLoading(false)
    setActiveIds(state.activeIds)
  }, [loadedIndicators])

  const handleNextStory = useCallback(() => {
    const next = activeStoryIndex >= 0
      ? (activeStoryIndex + 1) % CURATED_VIEWS.length
      : 0
    loadState(CURATED_VIEWS[next].state)
  }, [activeStoryIndex, loadState])

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
        explainer: ind.explainer,
        projection_source: ind.projection_source,
        source: ind.source,
        source_url: ind.source_url,
        real_adjusted: ind.real_adjusted,
        base_year: ind.base_year,
      }
    })

  const indicatorMeta = Object.fromEntries(
    Object.entries(loadedIndicators).map(([id, ind]) => [id, {
      description: ind.description,
      explainer: ind.explainer,
      projection_source: ind.projection_source,
      source: ind.source,
      source_url: ind.source_url,
      notes: ind.notes,
      data_quality: (ind as any).data_quality,
    }])
  )

  const chartData = mergeSeriesForChart(
    activeIndicators.map(a => ({ id: a.id, series: a.data }))
  )

  const handleReset = () => {
    setActiveIds(DEFAULT_STATE.activeIds)
    setViewMode(DEFAULT_STATE.viewMode)
    setStartYear(DEFAULT_STATE.startYear)
    setActiveEventCategories(DEFAULT_STATE.activeEventCategories)
  }

  const currentState: ChartState = { activeIds, viewMode, startYear, activeEventCategories }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#FAF8F3]">
        <div className="text-center">
          <div className="text-5xl mb-3" style={{ fontFamily: 'Georgia, serif' }}>Pulse</div>
          <div className="text-xs text-gray-400 tracking-[0.3em] uppercase">Loading Australia&apos;s data...</div>
        </div>
      </div>
    )
  }

  return (
    <MobileBlock>
    <div className="flex h-screen overflow-hidden bg-[#FAF8F3]">
      <Sidebar
        manifest={manifest}
        activeIds={activeIds}
        onToggle={toggleIndicator}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        events={events}
        activeEventCategories={activeEventCategories}
        onToggleEventCategory={(cat) => setActiveEventCategories(prev =>
          prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
        )}
        onReset={handleReset}
        indicatorMeta={indicatorMeta}
      />
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <ChartHeader
          activeIndicators={activeIndicators}
          startYear={startYear}
          endYear={endYear}
          viewMode={viewMode}
          onStartYearChange={setStartYear}
          activeStoryName={activeStoryName}
          onNextStory={handleNextStory}
          activeStoryIndex={activeStoryIndex}
          shareBar={
            <ShareBar
              currentState={currentState}
              onLoadState={loadState}
              autoSaveName={autoSaveName}
            />
          }
        />
        {activeIndicators.length > 0 && (
          <KpiCards activeIndicators={activeIndicators} viewMode={viewMode} startYear={startYear} />
        )}
        <div className="flex-1 overflow-hidden px-6 pb-2 min-h-0 relative">
          {chartLoading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#FAF8F3]/80 backdrop-blur-[1px]">
              <div className="flex items-center gap-2.5 text-gray-400">
                <div className="w-4 h-4 border-2 border-gray-200 border-t-gray-400 rounded-full animate-spin" />
                <span className="text-[12px] tracking-wide">Loading data...</span>
              </div>
            </div>
          )}
          <PulseChart
            chartData={chartData}
            activeIndicators={activeIndicators}
            viewMode={viewMode}
            startYear={startYear}
            endYear={endYear}
            events={events}
            activeEventCategories={activeEventCategories}
            onLoadStory={loadState}
          />
        </div>
        <div className="px-6 py-2 flex items-center justify-between border-t border-gray-100 shrink-0">
          <span className="text-[11px] text-gray-400">ABS · RBA · Treasury · AIHW · BOM · Updated {mountedDate} · Projections: baseline scenario</span>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 text-[10px] text-amber-400" title="Sample/estimated data">
                <span className="font-semibold">~</span> Sample
              </span>
              <span className="flex items-center gap-1 text-[10px] text-blue-400" title="Derived/calculated">
                <span className="font-semibold">∑</span> Derived
              </span>
              <span className="flex items-center gap-1 text-[10px] text-emerald-500" title="Verified from live source">
                <span className="font-semibold">✓</span> Verified
              </span>
            </div>
            <div className="w-px h-3 bg-gray-200" />
<AboutModal />
          </div>
        </div>
      </div>
    </div>
  )
  </MobileBlock>
  )
}
