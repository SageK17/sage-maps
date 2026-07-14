import { haversine, makeCursor, METERS_PER_MILE, type LngLat } from '../lib/geo'

/** A maneuver the nav banner announces (OSRM step boundaries, flattened). */
export interface Maneuver {
  /** meters from route start where the maneuver happens */
  at: number
  type: string // turn | merge | fork | arrive | depart | ...
  modifier?: string // left | right | slight right | straight | ...
  /** street being turned onto (or destination text for arrive) */
  name: string
}

export interface TrafficSeg {
  frac: number
  level: 'green' | 'amber' | 'grey'
}

export interface SageRoute {
  id: string
  title: string
  geometry: LngLat[]
  distance: number // meters
  duration: number // seconds
  calm: number // 0–100
  chips: [string, string]
  maneuvers: Maneuver[]
  isPick: boolean
  isFastest: boolean
  traffic: TrafficSeg[]
  insight: string
}

interface OsrmStep {
  distance: number
  duration: number
  name: string
  ref?: string
  destinations?: string
  maneuver: { type: string; modifier?: string; location: [number, number] }
}

interface OsrmRoute {
  distance: number
  duration: number
  geometry: { coordinates: [number, number][] }
  legs: { steps: OsrmStep[] }[]
}

const OSRM = 'https://router.project-osrm.org/route/v1/driving'

function stepName(s: OsrmStep): string {
  return s.name || s.ref || s.destinations?.split(',')[0] || 'the road'
}

/**
 * Flatten legs into banner maneuvers. Leg boundaries on via routes produce
 * 'arrive'+'depart' pairs — the depart is dropped and the mid-route arrive is
 * labelled with the waypoint's name so it never reads as the final arrival.
 */
function flattenManeuvers(r: OsrmRoute, waypointNames: string[] = []): Maneuver[] {
  const out: Maneuver[] = []
  let at = 0
  for (let leg = 0; leg < r.legs.length; leg++) {
    const steps = r.legs[leg].steps
    const lastLeg = leg === r.legs.length - 1
    for (let i = 0; i < steps.length; i++) {
      const s = steps[i]
      const isFirstOverall = leg === 0 && i === 0
      if (!isFirstOverall && s.maneuver.type !== 'depart') {
        const isViaArrive = s.maneuver.type === 'arrive' && !lastLeg
        out.push({
          at,
          type: s.maneuver.type,
          modifier: s.maneuver.modifier,
          name: isViaArrive
            ? (waypointNames[leg] ?? 'your stop')
            : s.maneuver.type === 'arrive'
              ? '' // final arrive: nav fills in the destination name
              : stepName(s),
        })
      }
      at += s.distance
    }
  }
  return out
}

/** Heuristic calm score: fewer turns, merges and ramps per mile → calmer. */
function calmScore(r: OsrmRoute): number {
  const steps = r.legs.flatMap((l) => l.steps)
  let turns = 0
  let merges = 0
  let sharp = 0
  for (const s of steps) {
    const m = s.maneuver
    if (m.type === 'merge' || m.type === 'on ramp' || m.type === 'off ramp' || m.type === 'fork')
      merges++
    else if (m.type === 'turn' || m.type === 'end of road') {
      turns++
      if (m.modifier?.startsWith('sharp') || m.modifier === 'uturn') sharp++
    } else if (m.type === 'roundabout' || m.type === 'rotary') turns++
  }
  const miles = Math.max(0.7, r.distance / METERS_PER_MILE)
  const score = 100 - (turns / miles) * 3 - (merges / miles) * 7 - sharp * 3
  return Math.max(35, Math.min(98, Math.round(score)))
}

function routeChips(r: OsrmRoute): [string, string] {
  const steps = r.legs.flatMap((l) => l.steps)
  let turns = 0
  let merges = 0
  for (const s of steps) {
    const t = s.maneuver.type
    if (t === 'turn' || t === 'end of road' || t === 'roundabout' || t === 'rotary') turns++
    if (t === 'merge' || t === 'on ramp' || t === 'off ramp') merges++
  }
  const a = turns === 0 ? 'Straight shot' : `${turns} turn${turns === 1 ? '' : 's'}`
  const b = merges === 0 ? 'No merges' : `${merges} merge${merges === 1 ? '' : 's'}`
  return [a, b]
}

function routeTitle(r: OsrmRoute): string {
  const steps = r.legs.flatMap((l) => l.steps)
  let best = ''
  let bestDist = 0
  for (const s of steps) {
    const n = s.name || s.ref
    if (n && s.distance > bestDist) {
      bestDist = s.distance
      best = n
    }
  }
  return best ? `Via ${best}` : 'Direct route'
}

/** Deterministic pseudo-random from a string, for stable synthesized traffic bars. */
function hash(s: string): number {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return (h >>> 0) / 4294967296
}

function synthTraffic(id: string, calm: number): TrafficSeg[] {
  const r = hash(id)
  const amber = Math.max(0.04, (100 - calm) / 130)
  const g1 = 0.25 + r * 0.3
  const rest = 1 - g1 - amber
  return [
    { frac: g1, level: 'green' },
    { frac: amber, level: 'amber' },
    { frac: Math.max(0.08, rest * 0.7), level: 'green' },
    { frac: Math.max(0.05, rest * 0.3), level: 'grey' },
  ]
}

function insightFor(
  kind: 'pick' | 'fast' | 'calm' | 'both',
  deltaMin: number,
): string {
  switch (kind) {
    case 'both':
      return 'Quickest and calmest at this hour — the rare trip where both agree.'
    case 'pick':
      return deltaMin >= 1
        ? `${deltaMin === 1 ? 'A minute' : `${deltaMin} minutes`} slower than the fast way, but far fewer brake lights. Worth it, I think.`
        : 'Barely slower than the fast way, and a good deal calmer. Worth it, I think.'
    case 'fast':
      return 'The quick way. Busier than I’d choose, but it will get you there first.'
    default:
      return 'All surface streets, the gentle way around. The prettiest of the lot.'
  }
}

async function osrmFetch(coords: LngLat[], alternatives: boolean): Promise<OsrmRoute[]> {
  const path = coords.map((c) => `${c[0].toFixed(6)},${c[1].toFixed(6)}`).join(';')
  const url = `${OSRM}/${path}?alternatives=${alternatives ? '3' : 'false'}&steps=true&geometries=geojson&overview=full`
  const ctl = new AbortController()
  const timer = setTimeout(() => ctl.abort(), 8000)
  try {
    const res = await fetch(url, { signal: ctl.signal })
    if (!res.ok) throw new Error(`OSRM ${res.status}`)
    const json = (await res.json()) as { code: string; routes: OsrmRoute[] }
    if (json.code !== 'Ok' || !json.routes?.length) throw new Error('no routes')
    return json.routes
  } finally {
    clearTimeout(timer)
  }
}

/** Perpendicular detour point at the route midpoint, for synthesizing alternates. */
function detourPoint(from: LngLat, to: LngLat, side: 1 | -1): LngLat {
  const mid: LngLat = [(from[0] + to[0]) / 2, (from[1] + to[1]) / 2]
  const dx = to[0] - from[0]
  const dy = to[1] - from[1]
  const len = Math.hypot(dx, dy) || 1e-9
  // ~28% of the trip length sideways, clamped to a sane city-scale detour
  const k = Math.max(0.0025, Math.min(0.009, len * 0.28)) * side
  return [mid[0] + (-dy / len) * k, mid[1] + (dx / len) * k]
}

export async function fetchRoutes(
  from: LngLat,
  to: LngLat,
  via?: LngLat,
  viaName?: string,
): Promise<SageRoute[]> {
  if (via) {
    const raw = await osrmFetch([from, via, to], false)
    return rankRoutes(raw, viaName ? [viaName] : [])
  }
  const raw = await osrmFetch([from, to], true)
  // Short urban hops often return a single route — synthesize real detour
  // alternates so the options sheet always has choices to compare.
  if (raw.length < 3) {
    const sides: (1 | -1)[] = raw.length === 1 ? [1, -1] : [1]
    const extras = await Promise.allSettled(
      sides.map((side) => osrmFetch([from, detourPoint(from, to, side), to], false)),
    )
    for (const e of extras) {
      if (e.status !== 'fulfilled') continue
      const cand = e.value[0]
      if (!cand) continue
      const dup = raw.some(
        (r) =>
          Math.abs(r.distance - cand.distance) / r.distance < 0.04 &&
          Math.abs(r.duration - cand.duration) / Math.max(1, r.duration) < 0.08,
      )
      if (!dup && cand.distance < raw[0].distance * 2.2) raw.push(cand)
    }
  }
  return rankRoutes(raw)
}

function rankRoutes(raw: OsrmRoute[], waypointNames: string[] = []): SageRoute[] {
  const scored = raw.slice(0, 3).map((r, i) => {
    const calm = calmScore(r)
    const id = `r${i}-${Math.round(r.distance)}`
    return { r, calm, id }
  })
  const fastest = scored.reduce((a, b) => (b.r.duration < a.r.duration ? b : a))
  // Sage's pick: calmest route that isn't more than ~35% slower than the fastest
  const eligible = scored.filter((s) => s.r.duration <= fastest.r.duration * 1.35)
  const pick = (eligible.length ? eligible : scored).reduce((a, b) => (b.calm > a.calm ? b : a))

  const routes = scored.map(({ r, calm, id }) => {
    const isPick = id === pick.id
    const isFastest = id === fastest.id
    const kind = isPick && isFastest ? 'both' : isPick ? 'pick' : isFastest ? 'fast' : 'calm'
    const deltaMin = Math.round((r.duration - fastest.r.duration) / 60)
    return {
      id,
      title: routeTitle(r),
      geometry: r.geometry.coordinates as LngLat[],
      distance: r.distance,
      duration: r.duration,
      calm,
      chips: routeChips(r),
      maneuvers: flattenManeuvers(r, waypointNames),
      isPick,
      isFastest,
      traffic: synthTraffic(id, calm),
      insight: insightFor(kind, deltaMin),
    } satisfies SageRoute
  })
  // pick first, then by duration
  routes.sort((a, b) => Number(b.isPick) - Number(a.isPick) || a.duration - b.duration)
  return routes
}

/* ------------------------------------------------------------------
   Offline fallback — synthesized geometry carrying the handoff's
   canonical demo data (Meridian / Crescent / Parkside).
   ------------------------------------------------------------------ */

function synthLine(from: LngLat, to: LngLat, jog: number): LngLat[] {
  // L-shaped dogleg with a lateral jog so the three alternates fan apart
  const mid1: LngLat = [from[0] + (to[0] - from[0]) * 0.18 + jog, from[1] + (to[1] - from[1]) * 0.05]
  const mid2: LngLat = [from[0] + (to[0] - from[0]) * 0.55 + jog, from[1] + (to[1] - from[1]) * 0.6]
  const mid3: LngLat = [to[0] + jog * 0.3, from[1] + (to[1] - from[1]) * 0.88]
  const pts: LngLat[] = [from, mid1, mid2, mid3, to]
  // densify for smooth camera follow
  const out: LngLat[] = []
  for (let i = 0; i < pts.length - 1; i++) {
    for (let t = 0; t < 24; t++) {
      out.push([
        pts[i][0] + ((pts[i + 1][0] - pts[i][0]) * t) / 24,
        pts[i][1] + ((pts[i + 1][1] - pts[i][1]) * t) / 24,
      ])
    }
  }
  out.push(to)
  return out
}

export function fallbackRoutes(from: LngLat, to: LngLat): SageRoute[] {
  const mk = (
    id: string,
    title: string,
    minutes: number,
    calm: number,
    chips: [string, string],
    isPick: boolean,
    isFastest: boolean,
    jog: number,
    insight: string,
  ): SageRoute => {
    const geometry = synthLine(from, to, jog)
    // measure the synthesized geometry so maneuver positions, the banner
    // countdown and the remaining-miles readout all agree with the sim
    const total = makeCursor(geometry).total
    // canonical maneuver sequence from the handoff
    const maneuvers: Maneuver[] = [
      { at: total * 0.22, type: 'turn', modifier: 'right', name: '5th Ave' },
      { at: total * 0.48, type: 'turn', modifier: 'left', name: 'Meridian Ave' },
      { at: total * 0.78, type: 'turn', modifier: 'slight right', name: 'Juniper Way' },
      { at: total, type: 'arrive', modifier: 'right', name: '' },
    ]
    return {
      id,
      title,
      geometry,
      distance: total,
      duration: minutes * 60,
      calm,
      chips,
      maneuvers,
      isPick,
      isFastest,
      traffic: synthTraffic(id, calm),
      insight,
    }
  }
  return [
    mk(
      'fb-pick',
      'Via Meridian Ave',
      18,
      92,
      ['4 lights', 'No merges'],
      true,
      false,
      0,
      'Two minutes slower than Crescent, but forty fewer brake lights. Worth it, I think.',
    ),
    mk(
      'fb-fast',
      'Via Crescent Blvd',
      16,
      61,
      ['Heavy merge', '2 lights'],
      false,
      true,
      0.012,
      'The quick way. Busier than I’d choose, but it will get you there first.',
    ),
    mk(
      'fb-parkside',
      'Parkside — no boulevard',
      22,
      97,
      ['Zero highway', 'Past the park'],
      false,
      false,
      -0.012,
      'Hardly a light on this one. The long way, gently.',
    ),
  ]
}

/** Straight-line distance in meters between two places (for list metadata). */
export function crowDistance(a: LngLat, b: LngLat): number {
  return haversine(a, b)
}
