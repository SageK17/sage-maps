import type { LngLat } from '../lib/geo'

/**
 * Real place search via Photon (photon.komoot.io) — a free, key-less,
 * CORS-enabled geocoder over OpenStreetMap, biased toward the user's location.
 * Falls back to the local demo places when the network is unavailable.
 */

export interface GeoResult {
  id: string
  name: string
  addr: string
  cat: string
  pos: LngLat
}

const PHOTON = 'https://photon.komoot.io/api/'

interface PhotonProps {
  name?: string
  street?: string
  housenumber?: string
  city?: string
  town?: string
  village?: string
  district?: string
  county?: string
  state?: string
  country?: string
  postcode?: string
  osm_key?: string
  osm_value?: string
  osm_type?: string
  osm_id?: number
}

/** Map an OSM key/value pair to one of the app's category icons. */
function osmCategory(p: PhotonProps): string {
  const { osm_key: k, osm_value: v } = p
  if (k === 'amenity') {
    if (v === 'cafe' || v === 'coffee_shop') return 'coffee'
    if (v === 'fuel') return 'gas'
    if (v === 'parking' || v === 'parking_entrance') return 'parking'
    if (v === 'restaurant' || v === 'fast_food' || v === 'food_court' || v === 'bar' || v === 'pub')
      return 'food'
    if (v === 'charging_station') return 'ev'
    if (v === 'hospital' || v === 'clinic' || v === 'doctors' || v === 'pharmacy' || v === 'dentist')
      return 'health'
  }
  if (k === 'shop') {
    if (v === 'supermarket' || v === 'convenience' || v === 'grocery' || v === 'greengrocer')
      return 'grocery'
    if (v === 'coffee') return 'coffee'
  }
  if (k === 'leisure' && (v === 'park' || v === 'garden' || v === 'nature_reserve')) return 'park'
  return 'pin'
}

/** Build a human "618 Meridian Ave · Seattle" style line from OSM fields. */
function addrString(p: PhotonProps): string {
  const parts: string[] = []
  if (p.housenumber && p.street) parts.push(`${p.housenumber} ${p.street}`)
  else if (p.street) parts.push(p.street)
  const locality = p.city || p.town || p.village || p.district || p.county
  if (locality) parts.push(locality)
  else if (p.state) parts.push(p.state)
  if (!parts.length && p.country) parts.push(p.country)
  return parts.join(' · ')
}

interface PhotonFeature {
  properties?: PhotonProps
  geometry?: { coordinates?: [number, number] }
}

export async function geocode(
  query: string,
  near: LngLat,
  signal?: AbortSignal,
): Promise<GeoResult[]> {
  const q = query.trim()
  if (q.length < 2) return []
  const url =
    `${PHOTON}?q=${encodeURIComponent(q)}&limit=6&lang=en` +
    `&lat=${near[1].toFixed(4)}&lon=${near[0].toFixed(4)}`
  const res = await fetch(url, { signal })
  if (!res.ok) throw new Error(`photon ${res.status}`)
  const json = (await res.json()) as { features?: PhotonFeature[] }
  const seen = new Set<string>()
  const out: GeoResult[] = []
  for (const f of json.features ?? []) {
    const c = f.geometry?.coordinates
    if (!c) continue
    const p = f.properties ?? {}
    const name = p.name || p.street || p.city || p.town || 'Result'
    const addr = addrString(p)
    // dedupe near-identical entries (same name + locality)
    const key = `${name}|${addr}`.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    out.push({
      id: `${p.osm_type ?? 'x'}${p.osm_id ?? out.length}`,
      name,
      addr,
      cat: osmCategory(p),
      pos: [c[0], c[1]],
    })
  }
  return out
}
