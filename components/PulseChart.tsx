'use client'

import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, ReferenceLine, ReferenceArea
} from 'recharts'
import { ActiveIndicator, ChartDataPoint, EventsFile, ViewMode, PulseEvent } from '@/types/pulse'
import { formatValue } from '@/lib/data'
import EmptyState from './EmptyState'

interface PulseChartProps {
  chartData: ChartDataPoint[]
  activeIndicators: ActiveIndicator[]
  viewMode: ViewMode
  startYear: number
  endYear: number
  events: EventsFile | null
  activeEventCategories: string[]
  onLoadStory?: (state: any) => void
}

const PROJECTION_START = 2026

// ── Stagger algorithm ──────────────────────────────────────────────────────────
// Assigns a vertical row (0, 1, 2) to each event based on proximity to neighbours.
// Events within MIN_GAP years of each other get bumped to different rows.
const MIN_GAP = 3 // years before we consider two events "close"
const ROW_Y = [8, 32, 56] // pixel y-offsets for rows 0, 1, 2

function assignRows(events: Array<{ year: number }>): number[] {
  const rows: number[] = new Array(events.length).fill(0)
  for (let i = 0; i < events.length; i++) {
    const usedRows = new Set<number>()
    // Look back at recent events that are close
    for (let j = Math.max(0, i - 4); j < i; j++) {
      if (Math.abs(events[i].year - events[j].year) < MIN_GAP) {
        usedRows.add(rows[j])
      }
    }
    // Assign the lowest available row
    let row = 0
    while (usedRows.has(row)) row++
    rows[i] = Math.min(row, ROW_Y.length - 1) // cap at 3 rows
  }
  return rows
}

// ── Custom event label with stagger support ───────────────────────────────────
function EventLabel({ viewBox, event, color, row, hovered, onHover, onLeave }: any) {
  if (!viewBox) return null
  const { x, height } = viewBox
  const y = ROW_Y[row] || ROW_Y[0]
  const isHovered = hovered === event.id
  const labelW = isHovered ? 140 : 80

  return (
    <g>
      {/* Dashed vertical line */}
      <line
        x1={x} x2={x} y1={0} y2={height}
        stroke={color}
        strokeWidth={isHovered ? 1.5 : 1}
        strokeDasharray="3 3"
        opacity={isHovered ? 0.9 : 0.5}
      />

      {/* Connector dot at top of line */}
      <circle cx={x} cy={y + 8} r={3} fill={color} opacity={isHovered ? 1 : 0.7} />

      {/* Label pill */}
      <foreignObject
        x={x + 5}
        y={y}
        width={labelW}
        height={22}
        style={{ overflow: 'visible', cursor: 'default' }}
        onMouseEnter={() => onHover(event.id)}
        onMouseLeave={onLeave}
      >
        <div
          style={{
            fontSize: isHovered ? '10px' : '9px',
            color: 'white',
            backgroundColor: color,
            padding: '2px 6px',
            borderRadius: '3px',
            whiteSpace: 'nowrap',
            display: 'inline-block',
            maxWidth: isHovered ? '135px' : '75px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            boxShadow: isHovered ? '0 2px 8px rgba(0,0,0,0.2)' : 'none',
            fontWeight: isHovered ? '600' : '400',
            opacity: isHovered ? 1 : 0.85,
            transition: 'all 0.15s ease',
            position: 'relative',
            zIndex: isHovered ? 10 : 1,
          }}
          title={event.description}
        >
          {event.label}
        </div>
      </foreignObject>
    </g>
  )
}

// ── Tooltip ────────────────────────────────────────────────────────────────────
function CustomTooltip({ active, payload, label, activeIndicators, viewMode }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-xs min-w-[160px]">
      <div className="font-bold text-gray-700 mb-2 text-sm">{label}</div>
      {payload.map((entry: any) => {
        const ind = activeIndicators.find((a: ActiveIndicator) => a.id === entry.dataKey)
        if (!ind) return null
        return (
          <div key={entry.dataKey} className="flex items-center justify-between gap-4 mb-1">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: entry.color }} />
              <span className="text-gray-500 truncate max-w-[100px]">{ind.label}</span>
            </div>
            <span className="font-semibold text-gray-800">
              {formatValue(entry.value, ind.unit_label, viewMode)}
            </span>
          </div>
        )
      })}
    </div>
  )
}

// ── Main chart ─────────────────────────────────────────────────────────────────
export default function PulseChart({
  chartData, activeIndicators, viewMode,
  startYear, endYear, events, activeEventCategories, onLoadStory
}: PulseChartProps) {
  const [hoveredEvent, setHoveredEvent] = React.useState<string | null>(null)

  if (activeIndicators.length === 0) {
    return <EmptyState onLoadStory={onLoadStory || (() => {})} />
  }

  const visibleEvents = (events?.events || []).filter(e => {
    if (!activeEventCategories.includes(e.category)) return false
    const year = parseInt((e.date || e.date_start || '0').substring(0, 4))
    return year >= startYear && year <= endYear
  })

  const pointEvents = visibleEvents.filter(e => e.type === 'point')
  const bandEvents = visibleEvents.filter(e => e.type === 'band')

  // Assign stagger rows to point events based on proximity
  const pointEventsWithYears = pointEvents.map(e => ({
    ...e,
    year: parseInt((e.date || '').substring(0, 4))
  }))
  const rows = assignRows(pointEventsWithYears)

  // Chart needs extra top margin to accommodate staggered label rows
  const topMargin = ROW_Y.length > 0 ? ROW_Y[ROW_Y.length - 1] + 62 : 80

  return (
    <div className="h-full w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{ top: topMargin, right: 20, bottom: 10, left: viewMode === 'raw' ? 60 : 45 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f0ede8" vertical={false} />

          <XAxis
            dataKey="date"
            tick={{ fontSize: 11, fill: '#9ca3af' }}
            tickLine={false}
            axisLine={{ stroke: '#e5e7eb' }}
            tickFormatter={v => `'${String(v).slice(2)}`}
            interval="preserveStartEnd"
          />

          <YAxis
            tick={{ fontSize: 11, fill: '#9ca3af' }}
            tickLine={false}
            axisLine={false}
            tickFormatter={v => {
              if (viewMode === 'yoy') return `${v > 0 ? '+' : ''}${v}%`
              if (viewMode === 'cumulative') return `${v}`
              if (Math.abs(v) >= 1000000) return `${(v/1000000).toFixed(1)}M`
              if (Math.abs(v) >= 1000) return `${(v/1000).toFixed(0)}k`
              return v
            }}
            width={viewMode === 'raw' ? 60 : 45}
          />

          <Tooltip
            content={<CustomTooltip activeIndicators={activeIndicators} viewMode={viewMode} />}
            cursor={{ stroke: '#d1d5db', strokeWidth: 1 }}
          />

          {viewMode === 'yoy' && (
            <ReferenceLine y={0} stroke="#9ca3af" strokeWidth={1} strokeDasharray="4 4" />
          )}
          {viewMode === 'cumulative' && (
            <ReferenceLine y={100} stroke="#9ca3af" strokeWidth={1} strokeDasharray="4 4" />
          )}

          {/* Projection zone */}
          <ReferenceArea
            x1={String(PROJECTION_START)}
            x2={String(endYear)}
            fill="#f5f3ef"
            fillOpacity={0.6}
            label={{ value: 'PROJECTED', position: 'insideTopRight', fontSize: 10, fill: '#9ca3af', dx: -10, dy: topMargin - 15 }}
          />

          {/* Event bands with staggered labels */}
          {(() => {
            // Assign stagger rows to band events based on proximity of start years
            const bandWithYears = bandEvents.map(e => ({
              ...e,
              year: parseInt((e.date_start || '').substring(0, 4))
            }))
            const bandRows = assignRows(bandWithYears)
            // Sit below the point event pills — pills occupy ROW_Y rows (8, 32, 56px)
            // Band labels start just below the last pill row + a small gap
            const BAND_LABEL_BASE = ROW_Y[ROW_Y.length - 1] + 22
            const BAND_ROW_STEP = 14
            const BAND_ROW_Y = [
              BAND_LABEL_BASE,
              BAND_LABEL_BASE + BAND_ROW_STEP,
              BAND_LABEL_BASE + BAND_ROW_STEP * 2,
            ]

            return bandWithYears.map((e, i) => {
              const color = events?.categories[e.category]?.color || '#888'
              const startYr = String(e.year)
              const endYr = String(parseInt((e.date_end || '').substring(0, 4)))
              const dy = BAND_ROW_Y[Math.min(bandRows[i], BAND_ROW_Y.length - 1)]
              return (
                <ReferenceArea
                  key={e.id}
                  x1={startYr}
                  x2={endYr}
                  fill={color}
                  fillOpacity={0.08}
                  label={{
                    value: e.label,
                    position: 'insideTopLeft',
                    fontSize: 9,
                    fill: color,
                    fontWeight: 600,
                    opacity: 0.85,
                    dy: dy - topMargin,
                  }}
                />
              )
            })
          })()}

          {/* Event point markers with staggered labels */}
          {pointEventsWithYears.map((e, i) => {
            const color = events?.categories[e.category]?.color || '#888'
            const year = String(e.year)
            return (
              <ReferenceLine
                key={e.id}
                x={year}
                stroke="transparent" // line drawn in custom label
                strokeWidth={0}
                label={
                  <EventLabel
                    event={e}
                    color={color}
                    row={rows[i]}
                    hovered={hoveredEvent}
                    onHover={setHoveredEvent}
                    onLeave={() => setHoveredEvent(null)}
                  />
                }
              />
            )
          })}

          {/* Data lines */}
          {activeIndicators.map(ind => (
            <Line
              key={ind.id}
              type="monotone"
              dataKey={ind.id}
              stroke={ind.color}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 0 }}
              connectNulls
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

// Need React for useState
import React from 'react'
