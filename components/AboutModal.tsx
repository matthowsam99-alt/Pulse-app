'use client'

import { useState } from 'react'

export default function AboutModal() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-[11px] text-gray-400 hover:text-gray-600 transition-colors"
      >
        About
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="fixed z-50 inset-0 flex items-center justify-center p-6 pointer-events-none">
            <div
              className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8 pointer-events-auto"
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'Georgia, serif' }}>
                    Pulse <em>Australia</em>
                  </h2>
                  <p className="text-sm text-gray-400 mt-0.5">The long view, since 1975</p>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="text-gray-300 hover:text-gray-500 transition-colors text-xl leading-none mt-1"
                >
                  ✕
                </button>
              </div>

              {/* About */}
              <div className="space-y-4 text-sm text-gray-600 leading-relaxed">
                <p>
                  Pulse is an interactive visualisation of Australia&apos;s social and economic health over time — exploring correlations between indicators across a 60-year window.
                </p>

                <p>
                  Built by <a href="https://www.linkedin.com/in/matthowsam/" target="_blank" rel="noopener noreferrer" className="text-gray-900 font-medium underline underline-offset-2 hover:text-gray-600">Matt Howsam</a> as a learning exercise, created with <a href="https://claude.ai" target="_blank" rel="noopener noreferrer" className="text-gray-900 font-medium underline underline-offset-2 hover:text-gray-600">Claude</a> by Anthropic.
                </p>

                {/* Disclaimer */}
                <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 text-[12px] text-amber-800 leading-relaxed">
                  <div className="font-semibold mb-1.5 flex items-center gap-1.5">
                    <span>⚠️</span> Data disclaimer
                  </div>
                  <p>
                    While we&apos;ve done our best to source verified data from official Australian government sources (ABS, RBA, Treasury, AIHW), some indicators use estimated or sample data where live sources were unavailable. Projections beyond 2025 are modelled estimates based on official forecasts.
                  </p>
                  <p className="mt-2">
                    <strong>Please do not rely on this data for research, financial, legal or policy decisions without independently verifying it from primary sources.</strong> Indicators marked <span className="font-semibold text-amber-600">~</span> in the sidebar are estimated rather than sourced from live data.
                  </p>
                </div>

                {/* Sources */}
                <div className="text-[12px] text-gray-400">
                  <div className="font-medium text-gray-500 mb-1">Primary sources</div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-0.5">
                    {[
                      ['ABS', 'abs.gov.au'],
                      ['RBA', 'rba.gov.au'],
                      ['Treasury', 'treasury.gov.au'],
                      ['AIHW', 'aihw.gov.au'],
                      ['AEMC', 'aemc.gov.au'],
                      ['BOM', 'bom.gov.au'],
                    ].map(([name, url]) => (
                      <a key={name} href={`https://www.${url}`} target="_blank" rel="noopener noreferrer"
                        className="hover:text-gray-600 transition-colors">
                        {name} ↗
                      </a>
                    ))}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
                <span className="text-[11px] text-gray-300">v1.0 · May 2026</span>
                <button
                  onClick={() => setOpen(false)}
                  className="text-[12px] px-4 py-1.5 rounded-lg bg-gray-900 text-white hover:bg-gray-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  )
}
