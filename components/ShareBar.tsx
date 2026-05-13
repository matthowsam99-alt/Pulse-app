'use client'

import { useState } from 'react'
import { ChartState, buildShareUrl, saveView, getSavedViews, deleteSavedView, SavedView, CURATED_VIEWS } from '@/lib/share'

interface ShareBarProps {
  autoSaveName?: string
  currentState: ChartState
  onLoadState: (state: ChartState) => void
}

export default function ShareBar({ currentState, onLoadState, autoSaveName }: ShareBarProps) {
  const [copied, setCopied] = useState(false)
  const [showSaveInput, setShowSaveInput] = useState(false)
  const [saveName, setSaveName] = useState('')
  const [savedViews, setSavedViews] = useState<SavedView[]>(() => getSavedViews())
  const [showViews, setShowViews] = useState(false)
  const [showCurated, setShowCurated] = useState(false)

  const handleCopyLink = async () => {
    const url = buildShareUrl(currentState)
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSave = () => {
    if (!saveName.trim()) return
    saveView(saveName.trim(), currentState)
    setSavedViews(getSavedViews())
    setSaveName('')
    setShowSaveInput(false)
    setShowViews(true)
  }

  const handleDelete = (id: string) => {
    deleteSavedView(id)
    setSavedViews(getSavedViews())
  }

  const hasActiveIndicators = currentState.activeIds.length > 0

  return (
    <div className="relative flex items-center gap-2">

      {/* Copy link */}
      <button
        onClick={handleCopyLink}
        disabled={!hasActiveIndicators}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-[11px] font-medium transition-all ${
          hasActiveIndicators
            ? copied
              ? 'bg-green-50 text-green-600 border border-green-200'
              : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-400'
            : 'bg-gray-50 text-gray-300 border border-gray-100 cursor-not-allowed'
        }`}
        title="Copy shareable link"
      >
        {copied ? '✓ Copied' : '⤴ Share'}
      </button>

      {/* Save view */}
      {hasActiveIndicators && !showSaveInput && (
        <button
          onClick={() => { setSaveName(autoSaveName || ''); setShowSaveInput(true) }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded text-[11px] font-medium bg-white text-gray-600 border border-gray-200 hover:border-gray-400 transition-all"
          title="Save this view"
        >
          ♡ Save
        </button>
      )}

      {/* Save name input */}
      {showSaveInput && (
        <div className="flex items-center gap-1">
          <input
            autoFocus
            type="text"
            value={saveName}
            onChange={e => setSaveName(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleSave(); if (e.key === 'Escape') setShowSaveInput(false) }}
            placeholder="Name this view..."
            className="text-[11px] px-2 py-1.5 border border-gray-300 rounded w-36 outline-none focus:border-gray-500"
          />
          <button onClick={handleSave}
            className="text-[11px] px-2 py-1.5 bg-gray-900 text-white rounded hover:bg-gray-700 transition-colors">
            Save
          </button>
          <button onClick={() => setShowSaveInput(false)}
            className="text-[11px] text-gray-400 hover:text-gray-600 px-1">✕</button>
        </div>
      )}

      {/* Saved views dropdown */}
      <div className="relative">
        <button
          onClick={() => { setShowViews(v => !v); setShowCurated(false) }}
          className={`flex items-center gap-1 px-3 py-1.5 rounded text-[11px] font-medium border transition-all ${
            showViews
              ? 'bg-gray-900 text-white border-gray-900'
              : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-400'
          }`}
        >
          ☆ Saved {savedViews.length > 0 && <span className="ml-0.5 bg-gray-200 text-gray-700 rounded-full px-1.5 text-[9px]">{savedViews.length}</span>}
        </button>

        {showViews && (
          <>
            <div className="fixed inset-0 z-30" onClick={() => setShowViews(false)} />
            <div className="absolute right-0 top-9 z-40 w-64 bg-white border border-gray-200 rounded-lg shadow-xl overflow-hidden">
              {savedViews.length === 0 ? (
                <div className="px-4 py-6 text-center text-xs text-gray-400">
                  No saved views yet.<br />Configure the chart and click Save.
                </div>
              ) : (
                <div className="max-h-72 overflow-y-auto">
                  {savedViews.map(view => (
                    <div key={view.id}
                      className="flex items-center justify-between px-3 py-2.5 hover:bg-gray-50 border-b border-gray-50 group">
                      <button
                        onClick={() => { onLoadState(view.state); setShowViews(false) }}
                        className="flex-1 text-left"
                      >
                        <div className="text-[12px] font-medium text-gray-700">{view.name}</div>
                        <div className="text-[10px] text-gray-400 mt-0.5">
                          {view.state.activeIds.length} indicators · {view.state.viewMode} · from {view.state.startYear}
                        </div>
                      </button>
                      <button
                        onClick={() => handleDelete(view.id)}
                        className="text-gray-300 hover:text-red-400 text-[11px] ml-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      >✕</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Curated stories */}
      <div className="relative">
        <button
          onClick={() => { setShowCurated(v => !v); setShowViews(false) }}
          className={`flex items-center gap-1 px-3 py-1.5 rounded text-[11px] font-medium border transition-all ${
            showCurated
              ? 'bg-gray-900 text-white border-gray-900'
              : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-400'
          }`}
        >
          ✦ Stories
        </button>

        {showCurated && (
          <>
            <div className="fixed inset-0 z-30" onClick={() => setShowCurated(false)} />
            <div className="absolute right-0 top-9 z-40 w-72 bg-white border border-gray-200 rounded-lg shadow-xl overflow-hidden">
              <div className="px-3 py-2 border-b border-gray-100">
                <div className="text-[10px] font-bold tracking-widest uppercase text-gray-400">Curated stories</div>
              </div>
              {CURATED_VIEWS.map((view, i) => (
                <button
                  key={i}
                  onClick={() => { onLoadState(view.state); setShowCurated(false) }}
                  className="w-full text-left px-3 py-2.5 hover:bg-gray-50 border-b border-gray-50 transition-colors"
                >
                  <div className="text-[12px] font-medium text-gray-700">{view.name}</div>
                  <div className="text-[10px] text-gray-400 mt-0.5">{view.description}</div>
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
