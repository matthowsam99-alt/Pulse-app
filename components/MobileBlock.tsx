'use client'

import { useState, useEffect } from 'react'

interface MobileBlockProps {
  children: React.ReactNode
  mobileContent?: React.ReactNode
}

export default function MobileBlock({ children, mobileContent }: MobileBlockProps) {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024)
    check()
    window.addEventListener('resize', check)
    return () => {
      window.removeEventListener('resize', check)
    }
  }, [])

  if (!isMobile) return <>{children}</>

  if (mobileContent) {
    return (
      <div style={{ width: '100vw', minHeight: '100svh', overflow: 'hidden' }}>
        {mobileContent}
      </div>
    )
  }

  return null
}
