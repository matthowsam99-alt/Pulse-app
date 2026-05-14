'use client'

import { CURATED_VIEWS } from '@/lib/share'

interface MobileLandingProps {
  onSelectStory: (index: number) => void
  onOpenIndicators: () => void
  mountedDate: string
}

export default function MobileLanding({ onSelectStory, onOpenIndicators, mountedDate }: MobileLandingProps) {
  return (
    <div className="flex flex-col" style={{ minHeight: '100svh', background: '#F0EDE6' }}>
      {/* Header */}
      <div
        className="flex items-center shrink-0"
        style={{
          height: 48,
          padding: '0 16px',
          borderBottom: '0.5px solid rgba(26,26,24,0.11)',
          background: '#F0EDE6',
        }}
      >
        <span style={{ fontFamily: 'Georgia, serif', fontSize: 17, fontWeight: 700, color: '#1a1a18', letterSpacing: '-0.02em' }}>
          Pulse
        </span>
        <span style={{ width: 1, height: 16, background: 'rgba(26,26,24,0.11)', margin: '0 11px', flexShrink: 0 }} />
        <span style={{ fontSize: 10, color: '#8a8a80', fontStyle: 'italic' }}>
          Australia's economic & social time-series, plotted.
        </span>
        <span style={{ marginLeft: 'auto', fontSize: 9, color: '#8a8a80', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
          {mountedDate}
        </span>
      </div>

      {/* Intro text */}
      <div style={{ padding: '20px 16px 14px' }}>
        <div style={{ fontSize: 20, fontWeight: 700, color: '#1a1a18', fontFamily: 'Georgia, serif', lineHeight: 1.2, marginBottom: 6 }}>
          Pick a story to start.
        </div>
        <div style={{ fontSize: 13, color: '#8a8a80', lineHeight: 1.5 }}>
          Curated combinations that tell Australia's most important stories.
        </div>
      </div>

      {/* Story gallery — horizontal scroll */}
      <div className="shrink-0">
        <div
          className="flex gap-2"
          style={{ padding: '0 16px 16px', overflowX: 'auto', scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' } as React.CSSProperties}
        >
          {CURATED_VIEWS.map((view, i) => {
            const startYr = view.state.startYear
            const indCount = view.state.activeIds.length
            return (
              <button
                key={i}
                onClick={() => onSelectStory(i)}
                style={{
                  flexShrink: 0,
                  width: 148,
                  background: '#ffffff',
                  border: '0.5px solid rgba(26,26,24,0.11)',
                  borderRadius: 8,
                  padding: '10px 12px 10px',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  textAlign: 'left',
                  transition: 'background 0.1s, border-color 0.1s',
                  minHeight: 100,
                }}
                onPointerDown={e => {
                  ;(e.currentTarget as HTMLButtonElement).style.background = '#F0EDE6'
                  ;(e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(26,26,24,0.3)'
                }}
                onPointerUp={e => {
                  ;(e.currentTarget as HTMLButtonElement).style.background = '#ffffff'
                  ;(e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(26,26,24,0.11)'
                }}
                onPointerLeave={e => {
                  ;(e.currentTarget as HTMLButtonElement).style.background = '#ffffff'
                  ;(e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(26,26,24,0.11)'
                }}
              >
                <div style={{ fontSize: 9, color: '#8a8a80', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>
                  {String(i + 1).padStart(2, '0')}
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#1a1a18', lineHeight: 1.25, fontFamily: 'Georgia, serif', flex: 1 }}>
                  {view.name}
                </div>
                <div style={{ fontSize: 9, color: '#b8b4aa', marginTop: 10, display: 'flex', justifyContent: 'space-between' }}>
                  <span>{startYr}–2025</span>
                  <span>{indCount} ind.</span>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Divider */}
      <div style={{ height: '0.5px', background: 'rgba(26,26,24,0.06)', margin: '0 16px' }} />

      {/* Build your own */}
      <div style={{ padding: '16px 18px 24px' }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: '#8B1A1A', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 5 }}>
          Or build your own
        </div>
        <div style={{ fontSize: 15, fontWeight: 700, color: '#1a1a18', fontFamily: 'Georgia, serif', lineHeight: 1.3, marginBottom: 10 }}>
          Compose a story from any of 247 indicators
        </div>
        <button
          onClick={onOpenIndicators}
          style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#8a8a80', cursor: 'pointer', background: 'none', border: 'none', padding: 0, fontFamily: 'inherit' }}
        >
          <span>→</span>
          <span>Open indicator picker</span>
        </button>
      </div>
    </div>
  )
}
