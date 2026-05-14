'use client'

import { CURATED_VIEWS } from '@/lib/share'

interface MobileLandingProps {
  onSelectStory: (index: number) => void
  onOpenIndicators: () => void
  mountedDate: string
}

export default function MobileLanding({ onSelectStory, onOpenIndicators, mountedDate }: MobileLandingProps) {
  return (
    <div className="flex flex-col h-full overflow-hidden" style={{ background: '#F0EDE6' }}>
      {/* Header */}
      <div
        className="flex items-center px-4 shrink-0"
        style={{
          height: 44,
          borderBottom: '0.5px solid rgba(26,26,24,0.11)',
          background: '#F0EDE6',
        }}
      >
        <span style={{ fontFamily: 'Georgia, serif', fontSize: 15, fontWeight: 700, color: '#1a1a18', letterSpacing: '-0.02em' }}>
          Pulse
        </span>
        <span style={{ width: 1, height: 14, background: 'rgba(26,26,24,0.11)', margin: '0 10px', flexShrink: 0 }} />
        <span style={{ fontSize: 9, color: '#8a8a80', fontStyle: 'italic' }}>
          Australia's economic & social time-series, plotted.
        </span>
        <span style={{ marginLeft: 'auto', fontSize: 8, color: '#8a8a80', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
          {mountedDate}
        </span>
      </div>

      {/* Story gallery — horizontal scroll */}
      <div className="shrink-0" style={{ paddingTop: 14 }}>
        <div
          className="flex gap-2 overflow-x-auto"
          style={{ padding: '0 14px 14px', scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}
        >
          {CURATED_VIEWS.map((view, i) => {
            const cat = view.state.activeIds.length > 0 ? '' : ''
            const startYr = view.state.startYear
            const indCount = view.state.activeIds.length
            return (
              <button
                key={i}
                onClick={() => onSelectStory(i)}
                style={{
                  flexShrink: 0,
                  width: 130,
                  background: '#F0EDE6',
                  border: '0.5px solid rgba(26,26,24,0.11)',
                  borderRadius: 8,
                  padding: '9px 10px 8px',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  textAlign: 'left',
                  transition: 'background 0.1s, border-color 0.1s',
                  minHeight: 90,
                }}
                onPointerDown={e => {
                  ;(e.currentTarget as HTMLButtonElement).style.background = '#E8E4DC'
                  ;(e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(26,26,24,0.3)'
                }}
                onPointerUp={e => {
                  ;(e.currentTarget as HTMLButtonElement).style.background = '#F0EDE6'
                  ;(e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(26,26,24,0.11)'
                }}
                onPointerLeave={e => {
                  ;(e.currentTarget as HTMLButtonElement).style.background = '#F0EDE6'
                  ;(e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(26,26,24,0.11)'
                }}
              >
                <div style={{ fontSize: 7.5, color: '#8a8a80', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 5 }}>
                  {String(i + 1).padStart(2, '0')}
                </div>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#1a1a18', lineHeight: 1.25, fontFamily: 'Georgia, serif', flex: 1 }}>
                  {view.name}
                </div>
                <div style={{ fontSize: 7.5, color: '#b8b4aa', marginTop: 8, display: 'flex', justifyContent: 'space-between' }}>
                  <span>{startYr}–2025</span>
                  <span>{indCount} ind.</span>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Divider */}
      <div style={{ height: '0.5px', background: 'rgba(26,26,24,0.06)', margin: '0 14px' }} />

      {/* Build your own — fixed, does not scroll */}
      <div style={{ padding: '14px 16px 18px' }}>
        <div style={{ fontSize: 9, fontWeight: 700, color: '#8B1A1A', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 4 }}>
          Or build your own
        </div>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#1a1a18', fontFamily: 'Georgia, serif', lineHeight: 1.3, marginBottom: 8 }}>
          Compose a story from any of 247 indicators
        </div>
        <button
          onClick={onOpenIndicators}
          style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#8a8a80', cursor: 'pointer', background: 'none', border: 'none', padding: 0, fontFamily: 'inherit' }}
        >
          <span>→</span>
          <span>Open indicator picker</span>
        </button>
      </div>
    </div>
  )
}
