import { useEffect, useMemo, useState } from 'react'
import { useApp, useSelectedRoute } from '../state/store'
import { Icon, Sparkle, NavigateGlyph } from '../icons'
import { distanceLabel } from '../services/places'
import { formatMiles, type LngLat } from '../lib/geo'
import type { SageRoute } from '../services/routing'
import { startNav } from '../sim/navSim'

/** Mini route-shape thumbnail: the real geometry fit into a 44×44 box. */
function RouteThumb({ route, selected }: { route: SageRoute; selected: boolean }) {
  const pts = useMemo(() => {
    const g = route.geometry
    if (g.length < 2) return ''
    let minX = Infinity
    let minY = Infinity
    let maxX = -Infinity
    let maxY = -Infinity
    for (const [x, y] of g) {
      if (x < minX) minX = x
      if (x > maxX) maxX = x
      if (y < minY) minY = y
      if (y > maxY) maxY = y
    }
    const span = Math.max(maxX - minX, maxY - minY, 1e-9)
    const pad = 9
    const size = 44 - pad * 2
    const cx = (minX + maxX) / 2
    const cy = (minY + maxY) / 2
    const proj = ([x, y]: LngLat) =>
      `${(22 + ((x - cx) / span) * size).toFixed(1)},${(22 - ((y - cy) / span) * size).toFixed(1)}`
    const step = Math.max(1, Math.floor(g.length / 14))
    const sampled = g.filter((_, i) => i % step === 0)
    if (sampled[sampled.length - 1] !== g[g.length - 1]) sampled.push(g[g.length - 1])
    return sampled.map(proj).join(' ')
  }, [route.geometry])

  const color = selected ? 'var(--ac)' : 'var(--mAlt, #B4BBAD)'
  const first = pts.split(' ')[0]?.split(',') ?? ['9', '36']
  const last = pts.split(' ').pop()?.split(',') ?? ['25', '8']

  return (
    <span className="sg-route-thumb">
      <svg width={40} height={40} viewBox="0 0 44 44" aria-hidden="true">
        <polyline
          points={pts}
          fill="none"
          stroke={color}
          strokeWidth={4}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle
          cx={first[0]}
          cy={first[1]}
          r={3}
          fill="var(--sf)"
          stroke="var(--ink3)"
          strokeWidth={2}
        />
        <circle cx={last[0]} cy={last[1]} r={3.5} fill={color} />
      </svg>
    </span>
  )
}

function RouteCard({ route, selected, onSelect }: {
  route: SageRoute
  selected: boolean
  onSelect: () => void
}) {
  const min = Math.max(1, Math.round(route.duration / 60))
  return (
    <button className={`sg-route-card pressable${selected ? ' selected' : ''}`} onClick={onSelect}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <RouteThumb route={route} selected={selected} />
        <div style={{ flex: 1, minWidth: 0 }}>
          {route.isPick && (
            <span className="sg-pick-badge">
              <Sparkle size={10} fill="var(--spark-on-deep)" />
              SAGE'S PICK
            </span>
          )}
          <div
            className="ellipsis"
            style={{ fontSize: 15.5, fontWeight: 800, letterSpacing: '-0.01em' }}
          >
            {route.title}
          </div>
          <div style={{ display: 'flex', gap: 5, marginTop: 5 }}>
            {route.chips.map((c) => (
              <span key={c} className="sg-cond-chip">
                {c}
              </span>
            ))}
          </div>
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div
            className="t-num"
            style={{
              fontSize: 22,
              fontWeight: 800,
              letterSpacing: '-0.02em',
              lineHeight: 1,
              color: selected ? 'var(--acD)' : 'var(--ink)',
            }}
          >
            {min}
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink2)' }}> min</span>
          </div>
          <div className="t-num" style={{ fontSize: 12, color: 'var(--ink2)', marginTop: 3 }}>
            {formatMiles(route.distance)}
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10 }}>
        <div style={{ flex: 1, display: 'flex', gap: 3 }}>
          {route.traffic.map((seg, i) => (
            <span
              key={i}
              className="sg-traffic-seg"
              style={{
                flexGrow: Math.max(1, Math.round(seg.frac * 20)),
                background:
                  seg.level === 'green'
                    ? 'var(--ac)'
                    : seg.level === 'amber'
                      ? 'var(--warn)'
                      : 'var(--ln)',
              }}
            />
          ))}
        </div>
        <span
          style={{
            fontSize: 10.5,
            fontWeight: 800,
            letterSpacing: '0.06em',
            color: selected ? 'var(--acD)' : 'var(--ink3)',
          }}
        >
          CALM {route.calm}
        </span>
      </div>
    </button>
  )
}

export function RoutesOverlay() {
  const dest = useApp((s) => s.dest)
  const routes = useApp((s) => s.routes)
  const loading = useApp((s) => s.routesLoading)
  const waitLine = useApp((s) => s.waitLine)
  const selected = useSelectedRoute()
  const selectRoute = useApp((s) => s.selectRoute)
  const closeRoutes = useApp((s) => s.closeRoutes)
  const sageEnabled = useApp((s) => s.sageEnabled)
  const origin = useApp((s) => s.origin)

  // "Under 700ms, show nothing — a flash of skeleton is worse than a beat of stillness."
  const [showSkeleton, setShowSkeleton] = useState(false)
  useEffect(() => {
    if (!loading) {
      setShowSkeleton(false)
      return
    }
    const t = setTimeout(() => setShowSkeleton(true), 700)
    return () => clearTimeout(t)
  }, [loading])

  if (!dest) return null
  const selMin = selected ? Math.max(1, Math.round(selected.duration / 60)) : null

  return (
    <>
      <button className="sg-routes-back glass-12 pressable" onClick={closeRoutes} aria-label="Back">
        <Icon name="back" size={18} stroke="var(--ink)" strokeWidth={2.2} />
      </button>

      <div className="sg-routes-sheet">
        <div className="sg-routes-panel">
          <div className="sg-grabber-wrap">
            <div className="sg-grabber" />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '6px 18px 4px' }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                className="ellipsis"
                style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.02em' }}
              >
                {dest.name}
              </div>
              <div style={{ fontSize: 12.5, color: 'var(--ink2)', marginTop: 1 }}>
                {dest.addr} · {distanceLabel(origin, dest.pos)}
              </div>
            </div>
            <button className="sg-close-34 pressable" onClick={closeRoutes} aria-label="Close">
              <Icon name="close" size={13} stroke="var(--ink2)" strokeWidth={2.6} />
            </button>
          </div>

          <div style={{ display: 'flex', gap: 7, padding: '8px 18px 12px' }}>
            <button className="sg-option-chip pressable">
              <Icon name="clock" size={13} stroke="var(--ink2)" />
              Leave now
              <Icon name="caret" size={11} stroke="var(--ink2)" strokeWidth={2.4} />
            </button>
            <button className="sg-option-chip pressable">Avoid tolls</button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '0 14px' }}>
            {!loading &&
              routes.map((r) => (
                <RouteCard
                  key={r.id}
                  route={r}
                  selected={selected?.id === r.id}
                  onSelect={() => selectRoute(r.id)}
                />
              ))}
          </div>

          {/* routing loader lives on the map (candidates settle); the sheet
              just speaks — one italic line, only after the 700ms grace */}
          {loading && showSkeleton && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 9,
                minHeight: 92,
                padding: '10px 20px 2px',
              }}
            >
              <Sparkle size={14} fill="var(--gold)" />
              <span
                className="t-sage"
                style={{ fontSize: 15, lineHeight: 1.45, color: 'var(--ink2)' }}
              >
                {waitLine}
              </span>
            </div>
          )}

          {!loading && sageEnabled && selected && (
            <div style={{ display: 'flex', gap: 9, padding: '12px 20px 2px' }}>
              <Sparkle size={14} fill="var(--gold)" />
              <span
                className="t-sage"
                style={{ fontSize: 14.5, lineHeight: 1.45, color: 'var(--ink2)', marginTop: -2 }}
              >
                {selected.insight}
              </span>
            </div>
          )}

          <div style={{ display: 'flex', gap: 10, padding: '14px 14px 0' }}>
            <button
              className="sg-start-btn pressable"
              disabled={!selected}
              style={selected ? undefined : { opacity: 0.6 }}
              onClick={() => selected && startNav(selected, dest.name)}
            >
              <NavigateGlyph size={18} fill="var(--on-accent)" />
              Start{selMin ? ` · ${selMin} min` : ''}
            </button>
            <button className="sg-steps-btn pressable" title="Steps">
              <Icon name="steps" size={20} stroke="var(--ink)" strokeWidth={2.2} />
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
