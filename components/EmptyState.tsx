'use client'

import { ReactElement } from 'react'
import { CURATED_VIEWS, ChartState } from '@/lib/share'

interface EmptyStateProps {
  onLoadStory: (state: ChartState) => void
}

// Fixed size icon wrapper ensures consistent positioning across all cards
const IconWrap = ({ children }: { children: ReactElement }) => (
  <div className="w-8 h-8 flex items-center justify-center mb-3 text-gray-400">
    {children}
  </div>
)

const StoryIcons: Record<string, () => ReactElement> = {
  'The housing crisis': () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
      <path d="M3 12L12 3l9 9" /><path d="M9 21V12h6v9" /><path d="M3 12v9h18v-9" />
    </svg>
  ),
  'The debt economy': () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
      <path d="M3 17l4-8 4 5 3-3 4 6" /><circle cx="19" cy="5" r="2" />
    </svg>
  ),
  'The Covid shock': () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
      <circle cx="12" cy="12" r="4" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1" />
    </svg>
  ),
  'Real wages crisis': () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
      <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  ),
  'The energy transition': () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
    </svg>
  ),
  'The tax story': () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
      <rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/><path d="M7 15h.01M11 15h2"/>
    </svg>
  ),
  'China relationship': () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  ),
}

const DefaultIcon = (): ReactElement => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
    <circle cx="12" cy="12" r="10" /><path d="M12 8v4l3 3" />
  </svg>
)

export default function EmptyState({ onLoadStory }: EmptyStateProps) {
  return (
    <div className="h-full flex flex-col items-center justify-center px-8">
      <div className="text-center mb-10">
        <h2
          className="text-5xl font-bold text-gray-900 mb-3 leading-tight"
          style={{ fontFamily: 'Georgia, serif' }}
        >
          Pick a story to <em>start.</em>
        </h2>
        <p className="text-sm text-gray-400">
          Curated combinations that tell Australia&apos;s most important stories.
        </p>
      </div>

      {/* Story cards — icon wrapped in fixed container for consistent alignment */}
      <div className="grid grid-cols-3 gap-3 max-w-3xl w-full mb-8">
        {CURATED_VIEWS.map((view, i) => {
          const Icon = StoryIcons[view.name] || DefaultIcon
          return (
            <button
              key={i}
              onClick={() => onLoadStory(view.state)}
              className="group text-left bg-white border border-gray-100 rounded-xl px-4 py-4 hover:border-gray-300 hover:shadow-md transition-all duration-150 flex flex-col"
            >
              <IconWrap><Icon /></IconWrap>
              <div className="text-[13px] font-semibold text-gray-700 group-hover:text-gray-900 leading-tight mb-1">
                {view.name}
              </div>
              <div className="text-[11px] text-gray-400 leading-relaxed flex-1">
                {view.description}
              </div>
              <div className="mt-2">
                <span className="text-[9px] uppercase tracking-widest text-gray-300 font-medium">
                  {view.state.activeIds.length} indicators · {view.state.viewMode === 'yoy' ? 'ΔYoY' : view.state.viewMode === 'cumulative' ? 'Long run' : 'Raw'} · since {view.state.startYear}
                </span>
              </div>
            </button>
          )
        })}
      </div>

      <div className="flex items-center gap-4 max-w-3xl w-full">
        <div className="flex-1 h-px bg-gray-200" />
        <span className="text-[11px] text-gray-500 tracking-widest uppercase">or</span>
        <div className="flex-1 h-px bg-gray-200" />
      </div>
      <p className="text-[12px] text-gray-600 mt-4">
        Select indicators from the left panel to build your own view.
      </p>
    </div>
  )
}
