'use client'

import { useEffect, useRef } from 'react'
import { Manifest } from '@/types/pulse'
import { getIndicatorColor } from '@/lib/colors'

interface MobileIndicatorsProps {
  manifest: Manifest | null
  activeIds: string[]
  onToggle: (id: string) => void
  onApply: () => void
  open: boolean
}

const CATEGORY_ORDER = ['health', 'economy', 'housing', 'wellbeing', 'demographics', 'government', 'environment']
const CATEGORY_LABELS: Record<string, string> = {
  health: 'Health',
  economy: 'Economy',
  housing: 'Housing',
  wellbeing: 'Wellbeing',
  demographics: 'Demographics',
  government: 'Government',
  environment: 'Environment',
}

// Tiny inline sparkline path generator (just a linear placeholder by category)
function SparkPath({ id, color }: { id: string; color: string }) {
  // Deterministic pseudo-random path from id string
  const seed = id.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  const pts = [0, 1, 2, 3, 4].map(i => {
    const v = Math.abs(Math.sin(seed * (i + 1) * 0.7)) * 14 + 3
    return `${i * 10},${18 - v}`
  })
  return (
    <svg width="40" height="20" viewBox="0 0 40 20" aria-hidden="true" style={{ flexShrink: 0 }}>
      <polyline points={pts.join(' ')} fill="none" stroke={color} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function MobileIndicators({ manifest, activeIds, onToggle, onApply, open }: MobileIndicatorsProps) {
  const panelRef = useRef<HTMLDivElement>(null)

  // Group indicators by category
  const byCategory: Record<string, NonNullable<typeof manifest>['indicators']> = {}
  if (manifest) {
    for (const ind of manifest.indicators) {
      if (!ind.available) continue
      const cat = ind.category || 'economy'
      if (!byCategory[cat]) byCategory[cat] = []
      byCategory[cat].push(ind)
    }
  }

  const orderedCats = CATEGORY_ORDER.filter(c => byCategory[c]?.length > 0)

  return (
    <>
      {/* Scrim */}
      <div
        onClick={onApply}
        style={{
          position: 'absolute', inset: 0, zIndex: 30,
          background: 'rgba(26,26,24,0.3)',
          opacity: open ? 1 : 0,
          pointerEvents: open ? 'all' : 'none',
          transition: 'opacity 0.25s',
        }}
      />

      {/* Panel — slides in from right */}
      <div
        ref={panelRef}
        style={{
          position: 'absolute', top: 0, right: 0, bottom: 0,
          width: '82%',
          background: '#ffffff',
          zIndex: 31,
          display: 'flex', flexDirection: 'column',
          boxShadow: '-4px 0 24px rgba(0,0,0,0.14)',
          transform: open ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.28s cubic-bezier(0.4,0,0.2,1)',
          overflow: 'hidden',
        }}
      >
        {/* Panel header */}
        <div style={{
          padding: '12px 14px 10px',
          borderBottom: '0.5px solid rgba(26,26,24,0.1)',
          display: 'flex', alignItems: 'center', flexShrink: 0,
        }}>
          <span style={{ fontSize: 15, fontWeight: 700, color: '#1a1a18', fontFamily: 'Georgia, serif' }}>
            Indicators
          </span>
          <span style={{ fontSize: 9, color: '#8a8a80', letterSpacing: '0.05em', textTransform: 'uppercase', marginLeft: 8 }}>
            {activeIds.length} on chart · {manifest?.indicators.filter(i => i.available).length ?? 0} available
          </span>
          <button
            onClick={onApply}
            style={{
              marginLeft: 'auto', padding: '5px 14px', borderRadius: 20,
              background: '#1a1a18', color: '#fff', fontSize: 10, fontWeight: 500,
              border: 'none', cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            Apply
          </button>
        </div>

        {/* Scrollable list */}
        <div style={{ flex: 1, overflowY: 'auto', scrollbarWidth: 'none' }}>
          {orderedCats.map(cat => (
            <div key={cat}>
              <div style={{
                padding: '10px 14px 3px',
                fontSize: 8, fontWeight: 500, color: '#8a8a80',
                textTransform: 'uppercase', letterSpacing: '0.07em',
                borderBottom: '0.5px solid rgba(26,26,24,0.06)',
              }}>
                {CATEGORY_LABELS[cat] ?? cat}
              </div>
              {byCategory[cat].map(ind => {
                const isOn = activeIds.includes(ind.id)
                const color = getIndicatorColor(ind.id)
                return (
                  <button
                    key={ind.id}
                    onClick={() => onToggle(ind.id)}
                    style={{
                      width: '100%', display: 'flex', alignItems: 'center', gap: 9,
                      padding: '7px 14px',
                      borderBottom: '0.5px solid rgba(26,26,24,0.06)',
                      background: 'transparent',
                      cursor: 'pointer', textAlign: 'left',
                      fontFamily: 'inherit',
                      transition: 'background 0.1s',
                    }}
                    onPointerEnter={e => (e.currentTarget.style.background = '#f7f5f0')}
                    onPointerLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    {/* Checkbox */}
                    <span style={{
                      width: 14, height: 14, borderRadius: 3, flexShrink: 0,
                      border: `0.5px solid ${isOn ? (color || '#1a1a18') : 'rgba(26,26,24,0.25)'}`,
                      background: isOn ? (color || '#1a1a18') : '#fff',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all 0.12s',
                    }}>
                      {isOn && (
                        <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                          <polyline points="1,4 3,6 7,2" stroke="#fff" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </span>

                    {/* Name */}
                    <span style={{
                      flex: 1, fontSize: 11, color: '#1a1a18',
                      fontWeight: isOn ? 500 : 400,
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    }}>
                      {ind.label}
                    </span>

                    {/* Sparkline */}
                    <SparkPath id={ind.id} color={isOn ? color : '#b8b4aa'} />

                    {/* Unit */}
                    <span style={{ fontSize: 9, color: '#8a8a80', flexShrink: 0, width: 32, textAlign: 'right' }}>
                      {ind.unit_label || ind.unit}
                    </span>
                  </button>
                )
              })}
            </div>
          ))}
          <div style={{ height: 16 }} />
        </div>
      </div>
    </>
  )
}
