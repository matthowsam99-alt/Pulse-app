'use client'

import { useState, useEffect } from 'react'

type Orientation = 'landscape' | 'portrait' | 'desktop'

interface MobileBlockProps {
  children: React.ReactNode
  mobileContent?: React.ReactNode
}

export default function MobileBlock({ children, mobileContent }: MobileBlockProps) {
  const [orientation, setOrientation] = useState<Orientation>('desktop')

  useEffect(() => {
    const check = () => {
      const w = window.innerWidth
      const h = window.innerHeight
      if (w >= 1024) { setOrientation('desktop'); return }
      setOrientation(w > h ? 'landscape' : 'portrait')
    }
    check()
    window.addEventListener('resize', check)
    window.addEventListener('orientationchange', check)
    return () => {
      window.removeEventListener('resize', check)
      window.removeEventListener('orientationchange', check)
    }
  }, [])

  if (orientation === 'desktop') return <>{children}</>

  if (orientation === 'portrait') {
    return (
      <div style={{ minHeight: '100svh', background: '#F0EDE6', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, padding: '0 32px', textAlign: 'center' }}>
        <div style={{ fontFamily: 'Georgia, serif', fontSize: 20, fontWeight: 700, color: '#1a1a18', letterSpacing: '-0.02em' }}>Pulse</div>
        <div style={{ width: 52, height: 52, borderRadius: 11, border: '1.5px solid rgba(26,26,24,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'rotateHint 3s ease-in-out infinite' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="rgba(26,26,24,0.5)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="5" y="2" width="14" height="20" rx="2"/>
            <line x1="12" y1="18" x2="12.01" y2="18" strokeWidth="2"/>
          </svg>
        </div>
        <p style={{ fontSize: 14, color: '#4a4a44', margin: 0 }}>Rotate to landscape</p>
        <p style={{ fontSize: 11, color: '#8a8a80', margin: 0 }}>for the full picture</p>
        <style>{`@keyframes rotateHint { 0%,55%{transform:rotate(0deg)} 75%,100%{transform:rotate(90deg)} }`}</style>
      </div>
    )
  }

  // Mobile landscape
  if (mobileContent) return <div style={{ width: '100vw', height: '100svh', overflow: 'hidden' }}>{mobileContent}</div>

  return <div style={{ minHeight: '100svh', background: '#F0EDE6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><p style={{ fontSize: 13, color: '#8a8a80' }}>Mobile experience loading…</p></div>
}
