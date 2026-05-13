'use client'

import { useState, useRef, useEffect } from 'react'

interface InfoTooltipProps {
  description: string
  explainer?: string
  projection_source?: string
  source?: string
  source_url?: string
  notes?: string
  data_quality?: string
}

export default function InfoTooltip({
  description, explainer, projection_source, source, source_url, notes, data_quality
}: InfoTooltipProps) {
  const [open, setOpen] = useState(false)
  const [tooltipTop, setTooltipTop] = useState(0)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)

  // Calculate exact screen position of the button when opening
  const handleOpen = () => {
    if (!open && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      // Position tooltip vertically centred on the button, clamped to viewport
      const top = Math.min(
        Math.max(rect.top - 8, 8),
        window.innerHeight - 400  // keep tooltip on screen
      )
      setTooltipTop(top)
    }
    setOpen(o => !o)
  }

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  // Close on scroll so tooltip doesn't drift
  useEffect(() => {
    if (!open) return
    const handleScroll = () => setOpen(false)
    window.addEventListener('scroll', handleScroll, true)
    return () => window.removeEventListener('scroll', handleScroll, true)
  }, [open])

  return (
    <div ref={wrapperRef} className="relative inline-block shrink-0">
      <button
        ref={buttonRef}
        onClick={handleOpen}
        className="w-3.5 h-3.5 rounded-full border border-gray-300 text-gray-400 hover:border-gray-500 hover:text-gray-600 transition-colors flex items-center justify-center text-[9px] font-bold leading-none"
        title="About this indicator"
      >
        i
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div
            className="fixed z-50 w-72 bg-white border border-gray-200 rounded-lg shadow-xl p-3 text-xs"
            style={{
              left: '268px',
              top: tooltipTop,
              maxHeight: '75vh',
              overflowY: 'auto',
            }}
          >
            <p className="text-gray-700 leading-relaxed mb-2 font-medium">{description}</p>

            {explainer && (
              <>
                <div className="border-t border-gray-100 my-2" />
                <p className="text-gray-500 leading-relaxed">{explainer}</p>
              </>
            )}

            {projection_source && (
              <>
                <div className="border-t border-gray-100 my-2" />
                <div>
                  <span className="font-semibold text-gray-500 uppercase tracking-wide text-[9px]">Projections · </span>
                  <span className="text-gray-400 leading-relaxed">{projection_source}</span>
                </div>
              </>
            )}

            {notes && (
              <>
                <div className="border-t border-gray-100 my-2" />
                <p className="text-gray-400 italic leading-relaxed">{notes}</p>
              </>
            )}

            {source && (
              <div className="border-t border-gray-100 mt-2 pt-2">
                <span className="text-gray-400 text-[10px]">Source: </span>
                {source_url ? (
                  <a href={source_url} target="_blank" rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-600 text-[10px]">
                    {source}
                  </a>
                ) : (
                  <span className="text-gray-400 text-[10px]">{source}</span>
                )}
              </div>
            )}
            {data_quality && data_quality !== 'verified' && (
              <div className="mt-2 pt-2 border-t border-gray-100">
                {data_quality === 'estimated' && (
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-50 text-amber-500 font-semibold">~ Sample data</span>
                    <span className="text-[9px] text-gray-400">Estimated — will be replaced with live ABS/RBA data before public launch.</span>
                  </div>
                )}
                {data_quality === 'derived' && (
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-500 font-semibold">∑ Derived</span>
                    <span className="text-[9px] text-gray-400">Calculated from other indicators using published methodology.</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
