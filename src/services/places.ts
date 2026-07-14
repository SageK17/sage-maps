import type { LngLat } from '../lib/geo'
import { haversine, METERS_PER_MILE } from '../lib/geo'
import type { IconName } from '../icons'

/**
 * Demo place database from the design handoff, anchored to real
 * downtown-Seattle coordinates so OSRM can route to every entry.
 */

export interface Place {
  id: string
  name: string
  addr: string
  cat: string
  pos: LngLat
  open: string
}

export const PLACES: Place[] = [
  { id: 'bluefern', name: 'Blue Fern Coffee', addr: '618 Meridian Ave', cat: 'coffee', pos: [-122.3148, 47.6222], open: 'Open · closes 6 pm' },
  { id: 'solstice', name: 'Solstice Bakery', addr: '201 5th Ave', cat: 'coffee', pos: [-122.342, 47.5962], open: 'Open' },
  { id: 'juniper', name: 'Juniper Fuel', addr: '480 Meridian Ave', cat: 'gas', pos: [-122.3196, 47.6172], open: '$3.89 regular' },
  { id: 'northgate', name: 'Northgate Parking', addr: '22 Juniper Way', cat: 'parking', pos: [-122.363, 47.6115], open: '$2 / hr' },
  { id: 'greenlake', name: 'Greenlake Park', addr: 'Rowan District', cat: 'park', pos: [-122.3215, 47.6135], open: 'Open until dusk' },
  { id: 'alder', name: 'Alder & Vine Grocery', addr: '129 Alder St', cat: 'grocery', pos: [-122.334, 47.6022], open: 'Open · closes 10 pm' },
  { id: 'cedar', name: 'Cedar & Salt', addr: '75 Juniper Way', cat: 'food', pos: [-122.358, 47.618], open: 'Dinner from 5 pm' },
  { id: 'patel', name: 'Dr. Patel — Dental', addr: '310 5th Ave', cat: 'health', pos: [-122.333, 47.6222], open: 'Appt today 2:00 pm' },
]

export const SAVED_PLACES = [
  { id: 'home', name: 'Home', sub: '44 Rowan Lane', icon: 'home' as IconName, cat: 'home', pos: [-122.385, 47.655] as LngLat, addr: '44 Rowan Lane' },
  { id: 'work', name: 'Work', sub: 'Meridian Studio, 5th Ave', icon: 'work' as IconName, cat: 'work', pos: [-122.282, 47.678] as LngLat, addr: 'Meridian Studio' },
  { id: 'gym', name: 'Cascade Club', sub: 'Gym · Tue & Thu', icon: 'gym' as IconName, cat: 'gym', pos: [-122.362, 47.645] as LngLat, addr: '9 Birch Loop' },
]

export const RECENT_IDS = ['patel', 'solstice', 'northgate']
export const OPEN_NOW_IDS = ['bluefern', 'alder', 'cedar']

export const CAT_ICON: Record<string, IconName> = {
  coffee: 'coffee',
  gas: 'gas',
  parking: 'parking',
  park: 'park',
  grocery: 'grocery',
  food: 'food',
  health: 'health',
  ev: 'ev',
  home: 'home',
  work: 'work',
  gym: 'gym',
}

export function catIcon(cat: string): IconName {
  return CAT_ICON[cat] ?? 'pin'
}

/** Live substring filter across name + address + category (per prototype). */
export function searchPlaces(query: string): Place[] {
  const q = query.trim().toLowerCase()
  if (!q) return []
  return PLACES.filter((p) => `${p.name} ${p.addr} ${p.cat}`.toLowerCase().includes(q))
}

export function byId(id: string): Place {
  return PLACES.find((p) => p.id === id)!
}

export function distanceLabel(from: LngLat, to: LngLat): string {
  const mi = haversine(from, to) / METERS_PER_MILE
  return `${mi < 9.95 ? mi.toFixed(1) : Math.round(mi)} mi`
}

/** Rough drive-time estimate for shortcut tiles (surface streets ≈ 3 min/mi + 2). */
export function etaLabel(from: LngLat, to: LngLat): string {
  const mi = haversine(from, to) / METERS_PER_MILE
  return `${Math.max(1, Math.round(mi * 2.6 + 2))} min`
}
