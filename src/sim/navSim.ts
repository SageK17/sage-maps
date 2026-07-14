import { useApp, type NavTick, type NavManeuver } from '../state/store'
import {
  makeCursor,
  pointAlong,
  sliceUntil,
  nearestOnLine,
  haversine,
  formatClock,
  METERS_PER_MILE,
  type LineCursor,
  type LngLat,
} from '../lib/geo'
import { fetchRoutes, type Maneuver, type SageRoute } from '../services/routing'
import { byId } from '../services/places'

/**
 * Turn-by-turn navigation.
 *
 * Primary mode ("gps"): follows the device's real position — each fix is
 * snapped onto the route to read progress, remaining distance, the upcoming
 * maneuver, live speed and ETA. Falls back to a timed simulation ("sim") only
 * when geolocation is denied or unavailable, so the app still demonstrates a
 * drive. Progress is tracked in METERS along the route in both modes.
 */

const TICK_MS = 250
const SIM_DT = 0.00625 // 160 ticks × 250ms = 40s full route (demo pace)
export const SPEED_LIMIT = 25
const MS_TO_MPH = 2.2369363
const DEFAULT_MS = 25 / MS_TO_MPH // assumed cruising speed for ETA when stopped
const ARRIVE_M = 25 // within this of the end → arrived
const GPS_FALLBACK_MS = 7000 // no fix in this long → simulate

interface EmitOpts {
  speedMph?: number
  bearing?: number
}

interface SimState {
  mode: 'gps' | 'sim'
  timer: number | null
  watchId: number | null
  fallbackTimer: number | null
  gotFix: boolean
  cursor: LineCursor
  maneuvers: Maneuver[]
  duration: number // route estimate (s), ETA baseline for sim mode
  destName: string
  onTick: ((tick: NavTick, traveled: LngLat[], line: LngLat[]) => void) | null
  rerouted: boolean
  at: number // meters travelled so far (monotonic)
  lastPos: LngLat | null
  lastPosT: number | null
}

let sim: SimState | null = null

export function onSimTick(cb: (tick: NavTick, traveled: LngLat[], line: LngLat[]) => void) {
  if (sim) sim.onTick = cb
}

export function startNav(route: SageRoute, destName: string) {
  stopNav()
  const cursor = makeCursor(route.geometry)
  sim = {
    mode: 'sim',
    timer: null,
    watchId: null,
    fallbackTimer: null,
    gotFix: false,
    cursor,
    maneuvers: route.maneuvers,
    duration: route.duration,
    destName,
    onTick: null,
    rerouted: false,
    at: 0,
    lastPos: null,
    lastPosT: null,
  }
  const app = useApp.getState()
  app.setGasOffer('hidden')
  app.setScreen('nav')
  emit(0, {})

  // Prefer following the real device location.
  if ('geolocation' in navigator) {
    sim.mode = 'gps'
    sim.watchId = navigator.geolocation.watchPosition(onGpsPos, onGpsError, {
      enableHighAccuracy: true,
      maximumAge: 1000,
      timeout: 15000,
    })
    // if no fix arrives promptly, fall back so the screen isn't frozen
    sim.fallbackTimer = window.setTimeout(() => {
      if (sim && !sim.gotFix) startSim()
    }, GPS_FALLBACK_MS)
  } else {
    startSim()
  }
}

function onGpsError() {
  // permission denied / position unavailable → demonstrate with the simulation
  if (sim && !sim.gotFix) startSim()
}

function onGpsPos(position: GeolocationPosition) {
  if (!sim || sim.mode !== 'gps') return
  if (useApp.getState().screen !== 'nav') {
    clearWatch()
    return
  }
  sim.gotFix = true
  if (sim.fallbackTimer != null) {
    clearTimeout(sim.fallbackTimer)
    sim.fallbackTimer = null
  }
  const p: LngLat = [position.coords.longitude, position.coords.latitude]
  const proj = nearestOnLine(sim.cursor, p)
  // keep progress monotonic to absorb GPS jitter, but allow a re-sync if the
  // fix is clearly behind us (backtracked or briefly off-route)
  let at = proj.at
  if (at >= sim.at - 60) at = Math.max(sim.at, at)

  const c = position.coords
  let speedMph: number
  if (c.speed != null && c.speed >= 0) {
    speedMph = c.speed * MS_TO_MPH
  } else if (sim.lastPos && sim.lastPosT != null) {
    const dt = (position.timestamp - sim.lastPosT) / 1000
    speedMph = dt > 0 ? (haversine(sim.lastPos, p) / dt) * MS_TO_MPH : 0
  } else {
    speedMph = 0
  }
  const bearing =
    c.heading != null && !Number.isNaN(c.heading) && speedMph > 1 ? c.heading : undefined

  sim.at = at
  sim.lastPos = p
  sim.lastPosT = position.timestamp
  emit(at, { speedMph, bearing })
}

function startSim() {
  if (!sim) return
  clearWatch()
  sim.mode = 'sim'
  if (sim.timer != null) return
  sim.timer = window.setInterval(() => {
    if (!sim) return
    // defensive: if we somehow left nav without endNav, stop cleanly
    if (useApp.getState().screen !== 'nav') {
      clearTimer()
      return
    }
    const nextAt = Math.min(sim.cursor.total, sim.at + SIM_DT * sim.cursor.total)
    sim.at = nextAt
    emit(nextAt, {})
  }, TICK_MS)
}

function clearTimer() {
  if (sim?.timer != null) {
    clearInterval(sim.timer)
    sim.timer = null
  }
}
function clearWatch() {
  if (sim?.watchId != null) {
    navigator.geolocation.clearWatch(sim.watchId)
    sim.watchId = null
  }
  if (sim?.fallbackTimer != null) {
    clearTimeout(sim.fallbackTimer)
    sim.fallbackTimer = null
  }
}

export function stopNav() {
  clearTimer()
  clearWatch()
  sim = null
}

export function endNav() {
  stopNav()
  useApp.getState().goHome()
}

function maneuverToNav(m: Maneuver | undefined, destName: string): NavManeuver {
  if (!m || m.type === 'arrive') {
    // a named arrive is a waypoint stop (e.g. Juniper Fuel); unnamed = destination
    return { type: 'arrive', modifier: m?.modifier, street: m?.name || destName, arrive: true }
  }
  return { type: m.type, modifier: m.modifier, street: m.name, arrive: false }
}

function emit(at: number, opts: EmitOpts) {
  if (!sim) return
  const s = useApp.getState()
  if (s.screen === 'arrived') return
  const { cursor, maneuvers, destName } = sim
  const total = cursor.total
  const clamped = Math.max(0, Math.min(at, total))
  const t = total > 0 ? clamped / total : 0
  const p = pointAlong(cursor, clamped)

  // Sage's mid-drive gas offer: shows at 40%, auto-dismisses at 78%
  if (s.sageEnabled && t >= 0.4 && s.gasOffer === 'hidden') s.setGasOffer('shown')
  if (s.gasOffer === 'shown' && t >= 0.78) s.setGasOffer('dismissed')

  // upcoming maneuver = first one still ahead
  let man: Maneuver | undefined
  let next: Maneuver | undefined
  for (let i = 0; i < maneuvers.length; i++) {
    if (maneuvers[i].at > clamped + 1) {
      man = maneuvers[i]
      next = maneuvers[i + 1]
      break
    }
  }
  const manAt = man ? man.at : total
  const distMeters = Math.max(0, manAt - clamped)

  const gasOn = s.gasOffer === 'accepted'
  const remaining = Math.max(0, total - clamped)
  const speed =
    opts.speedMph != null
      ? Math.max(0, Math.round(opts.speedMph))
      : t <= 0.01
        ? 0
        : Math.round(26 + 7 * Math.sin(t * 9.3)) // sim wobble

  let etaSec: number
  if (sim.mode === 'gps') {
    const spdMs = opts.speedMph && opts.speedMph > 2 ? opts.speedMph / MS_TO_MPH : DEFAULT_MS
    etaSec = remaining / spdMs
  } else {
    etaSec = (1 - t) * sim.duration + (gasOn && !sim.rerouted ? 120 : 0)
  }
  const etaMin = Math.max(1, Math.round(etaSec / 60))
  const etaClock = formatClock(new Date(Date.now() + etaMin * 60000))
  const remainingMi = remaining / METERS_PER_MILE + (gasOn && !sim.rerouted ? 0.3 : 0)
  const bearing = opts.bearing != null ? opts.bearing : p.bearing

  const tick: NavTick = {
    t,
    pos: p.pos,
    bearingDeg: bearing,
    man: maneuverToNav(man, destName),
    next: maneuverToNav(next, destName),
    distMeters,
    etaMin,
    etaClock,
    etaMi: remainingMi.toFixed(1),
    speed,
    over: speed > SPEED_LIMIT,
  }

  s.setNav(tick)
  sim.onTick?.(tick, sliceUntil(cursor, clamped), cursor.line)

  if (remaining <= ARRIVE_M) {
    clearTimer()
    clearWatch()
    s.setScreen('arrived')
  }
}

let toastTimer: number | null = null
export function toast(msg: string) {
  const s = useApp.getState()
  s.showToast(msg)
  if (toastTimer != null) clearTimeout(toastTimer)
  toastTimer = window.setTimeout(() => useApp.getState().clearToast(), 2800)
}

/**
 * Accept Sage's gas stop: toast + pin immediately (+2 min / +0.3 mi cosmetics),
 * then reroute through Juniper Fuel from the current spot (real OSRM).
 */
export async function acceptGasStop() {
  const s = useApp.getState()
  s.setGasOffer('accepted')
  toast('Stop added — Sage rerouted')
  if (!sim) return
  const dest = s.dest
  if (!dest) return
  const gas = byId('juniper')
  const oldCursor = sim.cursor
  const spliceM = sim.at
  const traveled = sliceUntil(oldCursor, spliceM)
  const from = traveled[traveled.length - 1]
  try {
    const alt = await fetchRoutes(from, dest.pos, gas.pos, gas.name)
    if (!sim || sim.cursor !== oldCursor || useApp.getState().gasOffer !== 'accepted') return
    const newRoute = alt[0]
    const merged: LngLat[] = [...traveled, ...newRoute.geometry]
    const newCursor = makeCursor(merged)
    const drivenM = Math.max(spliceM, sim.at)
    sim.cursor = newCursor
    sim.maneuvers = newRoute.maneuvers.map((m) => ({ ...m, at: m.at + spliceM }))
    // rescale so remaining sim time reads as the new route's duration
    sim.duration = newRoute.duration / Math.max(0.05, 1 - drivenM / newCursor.total)
    sim.rerouted = true
    sim.at = Math.min(newCursor.total - 1, drivenM)
    emit(sim.at, {})
  } catch {
    // cosmetic fallback (+2 min / +0.3 mi already applied via gasOffer flag)
  }
}

export function skipGasStop() {
  useApp.getState().setGasOffer('dismissed')
}
