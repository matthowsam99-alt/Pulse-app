'use client'

import { useRef, useEffect } from 'react'
import { CURATED_VIEWS } from '@/lib/share'

interface MobileLearnMoreProps {
  storyIndex: number
  open: boolean
  onClose: () => void
}

export default function MobileLearnMore({ storyIndex, open, onClose }: MobileLearnMoreProps) {
  const story = storyIndex >= 0 && storyIndex < CURATED_VIEWS.length ? CURATED_VIEWS[storyIndex] : null

  if (!story) return null

  return (
    <>
      {/* Scrim */}
      <div
        onClick={onClose}
        style={{
          position: 'absolute', inset: 0, zIndex: 40,
          background: 'rgba(26,26,24,0.3)',
          opacity: open ? 1 : 0,
          pointerEvents: open ? 'all' : 'none',
          transition: 'opacity 0.22s',
        }}
      />

      {/* Bottom sheet */}
      <div
        style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          zIndex: 41,
          background: '#F0EDE6',
          borderRadius: '14px 14px 0 0',
          borderTop: '0.5px solid rgba(26,26,24,0.11)',
          transform: open ? 'translateY(0)' : 'translateY(100%)',
          transition: 'transform 0.26s cubic-bezier(0.4,0,0.2,1)',
          overflow: 'hidden',
        }}
      >
        {/* Handle */}
        <div style={{ width: 32, height: 3, borderRadius: 2, background: '#b8b4aa', margin: '10px auto 0' }} />

        {/* Body — no heading repeat */}
        <p style={{
          fontSize: 12, color: '#4a4a44', lineHeight: 1.7,
          padding: '12px 18px 24px',
          fontFamily: 'Georgia, serif', fontStyle: 'italic',
          margin: 0,
        }}>
          {story.description}
        </p>
      </div>
    </>
  )
}
