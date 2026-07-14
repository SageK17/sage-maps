import { useApp, type NavTick, type NavManeuver } from '../state/store'
import {
  makeCursor,
  pointAlong,
  sliceUntil,
  formatClock,
  METERS_PER_MILE,
  type LineCursor,
  type LngLat,
} from '../lib/geo'
import { fetchRoutes, type Maneuver, type SageRoute } from '../services/routing'
import { byId } from '../services/places'

/**
 * Turn-by-turn simulation — drives the selected route's real geometry.
 * Tick every 250ms, +0.00625 progress → 40s full route (per handoff).
 */

const TICK_MS = 250
const TICK_DT = 0.00625
export const SPEED_LIMIT = 25

interface SimState {
  timer: number | null
  cursor: LineCursor
  maneuvers: Maneuver[]
  duration: number // seconds (route estimate, for ETA display)
  destName: string
  /** listeners for map overlays (traveled slice + active line geometry) */
  onTick: ((tick: NavTick, traveled: LngLat[], line: LngLat[]) => void) | null
  rerouted: boolean
}

let sim: SimState | null = null

export function onSimTick(cb: (tick: NavTick, traveled: LngLat[], line: LngLat[]) => void) {
  if (sim) sim.onTick = cb
}

export function startNav(route: SageRoute, destName: string) {
  stopNav()
  const cursor = makeCursor(route.geometry)
  sim = {
    timer: null,
    cursor,
    maneuvers: route.maneuvers,
    duration: route.duration,
    destName,
    onTick: null,
    rerouted: false,
  }
  const app = useApp.getState()
  app.setGasOffer('hidden')
  app.setScreen('nav')
  emit(0)
  sim.timer = window.setInterval(() => {
    const s = useApp.getState()
    if (!sim) return
    let t = (s.nav?.t ?? 0) + TICK_DT
    // Sage's mid-drive gas offer: shows at 40%, auto-dismisses at 78%
    if (s.sageEnabled && t >= 0.4 && s.gasOffer === 'hidden') s.setGasOffer('shown')
    if (s.gasOffer === 'shown' && t >= 0.78) s.setGasOffer('dismissed')
    if (t >= 1) {
      t = 1
      emit(t)
      stopTimer()
      s.setScreen('arrived')
      return
    }
    emit(t)
  }, TICK_MS)
}

function stopTimer() {
  if (sim?.timer != null) {
    clearInterval(sim.timer)
    sim.timer = null
  }
}

export function stopNav() {
  stopTimer()
  sim = null
}

export function endNav() {
  stopNav()
  useApp.getState().goHome()
}

function maneuverToNav(m: Maneuver | undefined, destName: string): NavManeuver {
  if (!m || m.type === 'arrive') {
    // a named arrive is a waypoint stop (e.g. Juniper Fuel); unnamed = destination
    return {
      type: 'arrive',
      modifier: m?.modifier,
      street: m?.name || destName,
      arrive: true,
    }
  }
  return { type: m.type, modifier: m.modifier, street: m.name, arrive: false }
}

function emit(t: number) {
  if (!sim) return
  const s = useApp.getState()
  const { cursor, maneuvers, duration, destName } = sim
  const traveledM = t * cursor.total
  const p = pointAlong(cursor, traveledM)

  // upcoming maneuver = first one still ahead
  let man: Maneuver | undefined
  let next: Maneuver | undefined
  for (let i = 0; i < maneuvers.length; i++) {
    if (maneuvers[i].at > traveledM + 1) {
      man = maneuvers[i]
      next = maneuvers[i + 1]
      break
    }
  }
  const manAt = man ? man.at : cursor.total
  const distMeters = Math.max(0, manAt - traveledM)

  const gasOn = s.gasOffer === 'accepted'
  const etaSec = (1 - t) * duration + (gasOn && !sim.rerouted ? 120 : 0)
  const etaMin = Math.max(1, Math.round(etaSec / 60))
  const etaClock = formatClock(new Date(Date.now() + etaMin * 60000))
  const remainingMi =
    ((1 - t) * cursor.total) / METERS_PER_MILE + (gasOn && !sim.rerouted ? 0.3 : 0)
  const speed = t <= 0.01 ? 0 : Math.round(26 + 7 * Math.sin(t * 9.3))

  const tick: NavTick = {
    t,
    pos: p.pos,
    bearingDeg: p.bearing,
    man: maneuverToNav(man, destName),
    // prototype §13.1: on the final approach the "Then" pill keeps showing
    // the destination (steps[min(k+1,4)] clamps to the arrive step)
    next: maneuverToNav(next, destName),
    distMeters,
    etaMin,
    etaClock,
    etaMi: remainingMi.toFixed(1),
    speed,
    over: speed > SPEED_LIMIT,
  }

  s.setNav(tick)
  sim.onTick?.(tick, sliceUntil(cursor, traveledM), cursor.line)
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
 * then attempt a real OSRM reroute through Juniper Fuel from the current spot.
 */
export async function acceptGasStop() {
  const s = useApp.getState()
  s.setGasOffer('accepted')
  toast('Stop added — Sage rerouted')
  if (!sim) return
  const dest = s.dest
  if (!dest) return
  const gas = byId('juniper')
  // snapshot the splice point BEFORE the fetch — the reroute is requested
  // from here, so the merged line must also be spliced here
  const oldCursor = sim.cursor
  const spliceM = (s.nav?.t ?? 0) * oldCursor.total
  const traveled = sliceUntil(oldCursor, spliceM)
  const from = traveled[traveled.length - 1]
  try {
    const alt = await fetchRoutes(from, dest.pos, gas.pos, gas.name)
    if (!sim || sim.cursor !== oldCursor || useApp.getState().gasOffer !== 'accepted') return
    const newRoute = alt[0]
    const merged: LngLat[] = [...traveled, ...newRoute.geometry]
    const newCursor = makeCursor(merged)
    // the sim kept driving during the fetch — continue from the same total
    // distance so the car never moves backwards
    const drivenM = Math.max(spliceM, (useApp.getState().nav?.t ?? 0) * oldCursor.total)
    const tNew = Math.min(0.999, drivenM / newCursor.total)
    sim.cursor = newCursor
    sim.maneuvers = newRoute.maneuvers.map((m) => ({ ...m, at: m.at + spliceM }))
    // rescale so the remaining sim time reads as the new route's duration
    sim.duration = newRoute.duration / Math.max(0.05, 1 - tNew)
    sim.rerouted = true
    emit(tNew)
  } catch {
    // cosmetic fallback (+2 min / +0.3 mi already applied via gasOffer flag)
  }
}

export function skipGasStop() {
  useApp.getState().setGasOffer('dismissed')
}
