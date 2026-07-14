/** Minimal geodesy helpers — [lng, lat] positions throughout, distances in meters. */

export type LngLat = [number, number]

const R = 6371008.8
const D2R = Math.PI / 180
const R2D = 180 / Math.PI

export function haversine(a: LngLat, b: LngLat): number {
  const dLat = (b[1] - a[1]) * D2R
  const dLng = (b[0] - a[0]) * D2R
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(a[1] * D2R) * Math.cos(b[1] * D2R) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(s))
}

/** Initial bearing from a to b, degrees 0–360. */
export function bearing(a: LngLat, b: LngLat): number {
  const φ1 = a[1] * D2R
  const φ2 = b[1] * D2R
  const Δλ = (b[0] - a[0]) * D2R
  const y = Math.sin(Δλ) * Math.cos(φ2)
  const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ)
  return (Math.atan2(y, x) * R2D + 360) % 360
}

export function lerpPos(a: LngLat, b: LngLat, t: number): LngLat {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]
}

/** Shortest-path interpolation between two bearings (degrees). */
export function lerpBearing(a: number, b: number, t: number): number {
  let d = ((b - a + 540) % 360) - 180
  return (a + d * t + 360) % 360
}

export interface LineCursor {
  /** cumulative distance (m) at each vertex, cum[0] = 0 */
  cum: number[]
  total: number
  line: LngLat[]
}

export function makeCursor(line: LngLat[]): LineCursor {
  const cum: number[] = [0]
  for (let i = 1; i < line.length; i++) {
    cum.push(cum[i - 1] + haversine(line[i - 1], line[i]))
  }
  return { cum, total: cum[cum.length - 1], line }
}

export interface PointAlong {
  pos: LngLat
  bearing: number
  /** index of segment start vertex */
  seg: number
}

/** Point at `dist` meters along the line (clamped). */
export function pointAlong(c: LineCursor, dist: number): PointAlong {
  const d = Math.max(0, Math.min(dist, c.total))
  // binary search for segment
  let lo = 0
  let hi = c.cum.length - 1
  while (lo < hi - 1) {
    const mid = (lo + hi) >> 1
    if (c.cum[mid] <= d) lo = mid
    else hi = mid
  }
  const segLen = c.cum[lo + 1] - c.cum[lo]
  const t = segLen > 0 ? (d - c.cum[lo]) / segLen : 0
  const pos = lerpPos(c.line[lo], c.line[lo + 1], t)
  return { pos, bearing: bearing(c.line[lo], c.line[lo + 1]), seg: lo }
}

/** Slice of the line from 0 to `dist` meters (for the traveled overlay). */
export function sliceUntil(c: LineCursor, dist: number): LngLat[] {
  const d = Math.max(0, Math.min(dist, c.total))
  const out: LngLat[] = []
  for (let i = 0; i < c.line.length; i++) {
    if (c.cum[i] >= d) break
    out.push(c.line[i])
  }
  const p = pointAlong(c, d)
  out.push(p.pos)
  return out
}

export const METERS_PER_MILE = 1609.344
export const FEET_PER_METER = 3.28084

/** "600 ft" (rounded to 25, min display 25) up to 950 ft, otherwise "0.4 mi". */
export function formatManeuverDistance(meters: number): string {
  const feet = meters * FEET_PER_METER
  if (feet <= 950) {
    const ft = Math.max(25, Math.round(feet / 25) * 25)
    return `${ft} ft`
  }
  const mi = meters / METERS_PER_MILE
  return `${mi < 9.95 ? mi.toFixed(1) : Math.round(mi)} mi`
}

export function formatMiles(meters: number): string {
  const mi = meters / METERS_PER_MILE
  return `${mi < 9.95 ? mi.toFixed(1) : Math.round(mi)} mi`
}

export function formatClock(date: Date): string {
  let h = date.getHours() % 12
  if (h === 0) h = 12
  const m = date.getMinutes().toString().padStart(2, '0')
  return `${h}:${m}`
}
