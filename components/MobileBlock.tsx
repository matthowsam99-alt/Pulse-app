'use client'

import { useState, useEffect } from 'react'

export default function MobileBlock({ children }: { children: React.ReactNode }) {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  if (isMobile) {
    return (
      <div className="min-h-screen bg-[#FAF8F3] flex flex-col items-center justify-center px-8 text-center">
        <div className="mb-6 text-5xl" style={{ fontFamily: 'Georgia, serif' }}>
          Pulse
        </div>
        <div className="text-[11px] text-gray-400 tracking-[0.3em] uppercase mb-8">
          Australia
        </div>
        <p className="text-gray-600 text-sm leading-relaxed max-w-xs mb-3">
          Pulse is designed for desktop. A mobile experience is coming soon.
        </p>
        <p className="text-gray-400 text-[12px]">
          Please visit on a laptop or desktop.
        </p>
      </div>
    )
  }

  return <>{children}</>
}
