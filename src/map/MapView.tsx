import { useEffect, useRef } from 'react'
import maplibregl, { Map as MLMap, Marker, GeoJSONSource } from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { buildMapStyle, DAY_PALETTE, NIGHT_PALETTE, type MapPalette } from './mapStyle'
import { useApp, type Screen, type Tab } from '../state/store'
import type { SageRoute } from '../services/routing'
import { easeCamera, easeDraw } from '../lib/easing'
import { onSimTick } from '../sim/navSim'
import { byId } from '../services/places'
import type { LngLat } from '../lib/geo'

/* ------------------------------------------------------------------ */
/* GeoJSON helpers                                                     */
/* ------------------------------------------------------------------ */

const line = (coords: LngLat[]): GeoJSON.Feature => ({
  type: 'Feature',
  properties: {},
  geometry: { type: 'LineString', coordinates: coords },
})
const fc = (features: GeoJSON.Feature[]): GeoJSON.FeatureCollection => ({
  type: 'FeatureCollection',
  features,
})
const EMPTY = fc([])

/* ------------------------------------------------------------------ */
/* Marker elements — static SVG markup, colors ride on CSS vars so     */
/* they retint automatically with the theme.                           */
/* ------------------------------------------------------------------ */

function svgMarker(className: string, svg: string): HTMLDivElement {
  const el = document.createElement('div')
  el.className = className
  const doc = new DOMParser().parseFromString(svg, 'image/svg+xml')
  el.appendChild(doc.documentElement)
  return el
}

function puckEl(): HTMLDivElement {
  const el = document.createElement('div')
  el.className = 'sg-puck'
  const pulse = document.createElement('div')
  pulse.className = 'sg-puck-pulse'
  const dot = document.createElement('div')
  dot.className = 'sg-puck-dot'
  el.append(pulse, dot)
  return el
}

const destPinEl = () =>
  svgMarker(
    'sg-dest-pin',
    `<svg xmlns="http://www.w3.org/2000/svg" width="34" height="42" viewBox="0 0 34 42">
      <path d="M17 40 C 6 26 3 16 8 8 A 12 12 0 0 1 26 8 C 31 16 28 26 17 40 Z" fill="var(--acS)" stroke="var(--sf)" stroke-width="3"/>
      <circle cx="17" cy="14" r="5.5" fill="var(--sf)"/>
    </svg>`,
  )

const gasPinEl = () =>
  svgMarker(
    'sg-gas-pin',
    `<svg xmlns="http://www.w3.org/2000/svg" width="26" height="32" viewBox="0 0 26 32">
      <path d="M13 30 C 5 20 3 13 7 7 A 9 9 0 0 1 19 7 C 23 13 21 20 13 30 Z" fill="var(--warn)" stroke="var(--sf)" stroke-width="2.5"/>
      <circle cx="13" cy="11.5" r="4" fill="var(--sf)"/>
    </svg>`,
  )

const carEl = () =>
  svgMarker(
    'sg-car',
    `<svg xmlns="http://www.w3.org/2000/svg" width="42" height="42" viewBox="0 0 42 42">
      <circle cx="21" cy="21" r="15" fill="var(--ac)" stroke="var(--sf)" stroke-width="4"/>
      <path d="M21 13.5 L27 26.5 L21 23 L15 26.5 Z" fill="var(--sf)"/>
    </svg>`,
  )

/* ------------------------------------------------------------------ */
/* Overlay sources & layers                                            */
/* ------------------------------------------------------------------ */

/**
 * Marching-dash phase: dash `d`, gap `g` (in line-width units), offset o∈[0,1).
 * The dash's leading edge sits at o·P from the line start and advances with o,
 * wrapping seamlessly (dash split across the pattern boundary near o→1).
 */
const chevronPhase = (o: number, d: number, g: number): number[] => {
  const P = d + g
  const off = o * P
  if (off + d <= P) return [0, off, d, P - off - d]
  const lead = off + d - P
  return [lead, g, d - lead]
}

function addOverlays(map: MLMap, p: MapPalette) {
  if (!map.getSource('alt-routes')) {
    map.addSource('alt-routes', { type: 'geojson', data: EMPTY })
    map.addSource('traffic-seg', { type: 'geojson', data: EMPTY })
    map.addSource('sel-route', { type: 'geojson', data: EMPTY, lineMetrics: true })
    map.addSource('traveled', { type: 'geojson', data: EMPTY })
  }

  const amber = p === DAY_PALETTE ? '#D2802F' : '#E09A4C'
  const layers: maplibregl.LayerSpecification[] = [
    {
      id: 'alt-routes-line',
      type: 'line',
      source: 'alt-routes',
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: { 'line-color': p.altRoute, 'line-width': 6.5 },
    },
    {
      id: 'alt-routes-hit',
      type: 'line',
      source: 'alt-routes',
      paint: { 'line-color': 'rgba(0,0,0,0)', 'line-width': 26 },
    },
    {
      id: 'traffic-seg-line',
      type: 'line',
      source: 'traffic-seg',
      layout: { 'line-cap': 'round' },
      paint: {
        'line-color': amber,
        'line-width': 6.5,
        'line-dasharray': [2, 1.5],
        'line-opacity': 0.85,
      },
    },
    {
      id: 'sel-casing',
      type: 'line',
      source: 'sel-route',
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: {
        'line-color': p.routeCasing,
        'line-width': ['interpolate', ['linear'], ['zoom'], 12, 10, 15.5, 17] as never,
      },
    },
    {
      id: 'sel-line',
      type: 'line',
      source: 'sel-route',
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: {
        'line-color': p.route,
        'line-width': ['interpolate', ['linear'], ['zoom'], 12, 6, 15.5, 11] as never,
      },
    },
    {
      id: 'traveled-line',
      type: 'line',
      source: 'traveled',
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: {
        'line-color': p.casing,
        'line-width': ['interpolate', ['linear'], ['zoom'], 12, 6, 15.5, 11] as never,
        'line-opacity': 0.62,
      },
    },
    {
      id: 'chevrons',
      type: 'line',
      source: 'sel-route',
      paint: {
        'line-color': 'rgba(255,255,255,0.95)',
        'line-width': 4.5,
        'line-dasharray': chevronPhase(0, 1.9, 7.9) as never,
      },
    },
  ]
  for (const l of layers) if (!map.getLayer(l.id)) map.addLayer(l)
}

/* ------------------------------------------------------------------ */
/* Camera                                                              */
/* ------------------------------------------------------------------ */

function applyCamera(
  map: MLMap,
  screen: Screen,
  tab: Tab,
  origin: LngLat,
  sel: SageRoute | null,
) {
  const cam = { duration: 850, easing: easeCamera }
  if (screen === 'routes' && sel) {
    const b = sel.geometry.reduce(
      (acc, c) => acc.extend(c),
      new maplibregl.LngLatBounds(sel.geometry[0], sel.geometry[0]),
    )
    map.fitBounds(b, { ...cam, padding: { top: 130, bottom: 480, left: 56, right: 56 } })
    return
  }
  if (screen === 'home' && tab === 'explore') {
    // sheet covers from 318px down — keep focus in the visible top strip
    map.easeTo({ ...cam, center: origin, zoom: 13.6, offset: [0, -278] })
    return
  }
  if (screen === 'home' || screen === 'search') {
    // bottom sheet ≈300px: lift the focal point above it
    map.easeTo({ ...cam, center: origin, zoom: 14.6, offset: [0, -120] })
  }
  // nav/arrived: per-tick follow handles the camera
}

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

export function MapView() {
  const holder = useRef<HTMLDivElement>(null)
  const mapRef = useRef<MLMap | null>(null)
  const markers = useRef<{
    puck: Marker | null
    dest: Marker | null
    gas: Marker | null
    car: Marker | null
  }>({ puck: null, dest: null, gas: null, car: null })
  const drawAnim = useRef<number | null>(null)
  const chevronTimer = useRef<number | null>(null)
  const navEntered = useRef(false)

  /* ---------- init once ---------- */
  useEffect(() => {
    const s = useApp.getState()
    const map = new maplibregl.Map({
      container: holder.current!,
      style: buildMapStyle(s.theme === 'day' ? DAY_PALETTE : NIGHT_PALETTE),
      center: s.origin,
      zoom: 14.6,
      attributionControl: false,
      dragRotate: false,
      pitchWithRotate: false,
      fadeDuration: 150,
    })
    map.touchZoomRotate.disableRotation()
    map.addControl(new maplibregl.AttributionControl({ compact: true }), 'top-left')
    map.once('load', () => {
      // start collapsed; the ⓘ toggle still expands it
      holder.current
        ?.querySelector('details.maplibregl-compact')
        ?.removeAttribute('open')
    })
    map.on('error', (e) => {
      const msg = e.error?.message ?? ''
      // aborted tile/glyph fetches are routine during restyles and unmounts
      if (!msg || /abort/i.test(msg)) return
      console.error('[map]', msg)
    })
    if (import.meta.env.DEV) {
      ;(window as unknown as Record<string, unknown>).__sgmap = map
    }
    mapRef.current = map

    markers.current.puck = new Marker({ element: puckEl() }).setLngLat(s.origin).addTo(map)

    map.on('style.load', () => {
      addOverlays(map, useApp.getState().theme === 'day' ? DAY_PALETTE : NIGHT_PALETTE)
      syncRoutes()
    })

    map.on('click', 'alt-routes-hit', (e) => {
      const id = e.features?.[0]?.properties?.routeId as string | undefined
      if (id) useApp.getState().selectRoute(id)
    })
    map.on('mouseenter', 'alt-routes-hit', () => (map.getCanvas().style.cursor = 'pointer'))
    map.on('mouseleave', 'alt-routes-hit', () => (map.getCanvas().style.cursor = ''))

    // chevron march — 1.15s linear loop, 24 phase steps (nav screens only)
    let phase = 0
    chevronTimer.current = window.setInterval(() => {
      const scr = useApp.getState().screen
      if (scr !== 'nav' && scr !== 'arrived') return
      phase = (phase + 1 / 24) % 1
      if (map.getLayer('chevrons')) {
        map.setPaintProperty('chevrons', 'line-dasharray', chevronPhase(phase, 1.9, 7.9))
      }
    }, Math.round(1150 / 24))

    // recenter on the user's real location when granted
    navigator.geolocation?.getCurrentPosition(
      (loc) => useApp.getState().setOrigin([loc.coords.longitude, loc.coords.latitude]),
      () => {},
      { enableHighAccuracy: false, timeout: 4000 },
    )

    return () => {
      if (chevronTimer.current) clearInterval(chevronTimer.current)
      if (drawAnim.current) cancelAnimationFrame(drawAnim.current)
      map.remove()
      mapRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /* ---------- theme → restyle (overlays re-added on style.load) ---------- */
  const theme = useApp((s) => s.theme)
  const firstTheme = useRef(true)
  useEffect(() => {
    if (firstTheme.current) {
      firstTheme.current = false
      return
    }
    mapRef.current?.setStyle(buildMapStyle(theme === 'day' ? DAY_PALETTE : NIGHT_PALETTE))
  }, [theme])

  /* ---------- origin → puck + camera ---------- */
  const origin = useApp((s) => s.origin)
  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    markers.current.puck?.setLngLat(origin)
    const { screen, tab } = useApp.getState()
    if (screen === 'home') applyCamera(map, screen, tab, origin, null)
  }, [origin])

  const routes = useApp((s) => s.routes)
  const selectedRouteId = useApp((s) => s.selectedRouteId)
  const screen = useApp((s) => s.screen)
  const tab = useApp((s) => s.tab)
  const dest = useApp((s) => s.dest)
  const gasOffer = useApp((s) => s.gasOffer)

  /* ---------- routes & selection → overlay sources ---------- */
  function syncRoutes() {
    const map = mapRef.current
    if (!map || !map.getSource('sel-route')) return
    const s = useApp.getState()
    const sel = s.routes.find((r) => r.id === s.selectedRouteId) ?? null
    const alts = s.routes.filter((r) => r.id !== s.selectedRouteId)
    const inRouteFlow = s.screen === 'routes' || s.screen === 'nav' || s.screen === 'arrived'

    ;(map.getSource('alt-routes') as GeoJSONSource).setData(
      s.screen === 'routes'
        ? fc(alts.map((r) => ({ ...line(r.geometry), properties: { routeId: r.id } })))
        : EMPTY,
    )

    // amber dashed traffic-heavy segment on the busiest corridor (the fast route)
    const busiest =
      s.routes.find((r) => r.isFastest && !r.isPick) ??
      [...s.routes].sort((a, b) => a.calm - b.calm)[0]
    if (busiest && s.screen === 'routes') {
      const g = busiest.geometry
      const seg = g.slice(Math.floor(g.length * 0.5), Math.ceil(g.length * 0.68))
      ;(map.getSource('traffic-seg') as GeoJSONSource).setData(
        fc(seg.length > 1 ? [line(seg)] : []),
      )
    } else {
      ;(map.getSource('traffic-seg') as GeoJSONSource).setData(EMPTY)
    }

    ;(map.getSource('sel-route') as GeoJSONSource).setData(
      inRouteFlow && sel ? fc([line(sel.geometry)]) : EMPTY,
    )
    if (!inRouteFlow || !sel) {
      ;(map.getSource('traveled') as GeoJSONSource).setData(EMPTY)
    }

    // chevrons belong to turn-by-turn only (routes screen shows the draw-in)
    if (map.getLayer('chevrons')) {
      map.setLayoutProperty(
        'chevrons',
        'visibility',
        s.screen === 'nav' || s.screen === 'arrived' ? 'visible' : 'none',
      )
    }

    // draw-in: animate a line-gradient edge 0→1 over 1.1s on the draw curve
    const p = s.theme === 'day' ? DAY_PALETTE : NIGHT_PALETTE
    if (s.screen === 'routes' && sel) {
      if (drawAnim.current) cancelAnimationFrame(drawAnim.current)
      const t0 = performance.now()
      const step = () => {
        const m2 = mapRef.current
        if (!m2 || !m2.getLayer('sel-line')) return
        const k = Math.min(1, (performance.now() - t0) / 1100)
        const e = easeDraw(k)
        m2.setPaintProperty(
          'sel-line',
          'line-gradient',
          e >= 1
            ? (['literal', p.route] as never)
            : ([
                'step',
                ['line-progress'],
                p.route,
                Math.max(0.001, e),
                'rgba(0,0,0,0)',
              ] as never),
        )
        if (k < 1) drawAnim.current = requestAnimationFrame(step)
      }
      drawAnim.current = requestAnimationFrame(step)
    } else if (map.getLayer('sel-line')) {
      map.setPaintProperty('sel-line', 'line-gradient', ['literal', p.route] as never)
    }
  }

  useEffect(syncRoutes, [routes, selectedRouteId, screen])

  /* ---------- destination pin ---------- */
  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    const showPin = dest && (screen === 'routes' || screen === 'nav' || screen === 'arrived')
    if (showPin && dest) {
      if (!markers.current.dest) {
        markers.current.dest = new Marker({ element: destPinEl(), anchor: 'bottom' })
          .setLngLat(dest.pos)
          .addTo(map)
      } else {
        markers.current.dest.setLngLat(dest.pos)
      }
    } else if (markers.current.dest) {
      markers.current.dest.remove()
      markers.current.dest = null
    }
  }, [dest, screen])

  /* ---------- gas waypoint pin ---------- */
  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    if (gasOffer === 'accepted' && (screen === 'nav' || screen === 'arrived')) {
      if (!markers.current.gas) {
        markers.current.gas = new Marker({ element: gasPinEl(), anchor: 'bottom' })
          .setLngLat(byId('juniper').pos)
          .addTo(map)
      }
    } else if (markers.current.gas) {
      markers.current.gas.remove()
      markers.current.gas = null
    }
  }, [gasOffer, screen])

  /* ---------- puck visibility + camera per screen ---------- */
  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    const puckElm = markers.current.puck?.getElement()
    if (puckElm) puckElm.style.display = screen === 'nav' || screen === 'arrived' ? 'none' : ''
    const s = useApp.getState()
    const sel = s.routes.find((r) => r.id === s.selectedRouteId) ?? null
    if (screen !== 'nav' && screen !== 'arrived') {
      navEntered.current = false
      if (markers.current.car) {
        markers.current.car.remove()
        markers.current.car = null
      }
      applyCamera(map, screen, tab, s.origin, sel)
    }
  }, [screen, tab, selectedRouteId, routes])

  /* ---------- nav simulation → car, traveled, camera follow ---------- */
  const navLineRef = useRef<unknown>(null)
  useEffect(() => {
    if (screen !== 'nav') return
    onSimTick((tick, traveled, navLine) => {
      const map = mapRef.current
      if (!map) return
      if (!markers.current.car) {
        markers.current.car = new Marker({ element: carEl(), rotationAlignment: 'map' })
          .setLngLat(tick.pos)
          .addTo(map)
      }
      markers.current.car.setLngLat(tick.pos).setRotation(tick.bearingDeg)
      // reroutes (gas stop) swap the sim geometry — keep the drawn line in sync
      if (navLine !== navLineRef.current && map.getSource('sel-route')) {
        navLineRef.current = navLine
        ;(map.getSource('sel-route') as GeoJSONSource).setData(fc([line(navLine)]))
      }
      if (map.getSource('traveled')) {
        ;(map.getSource('traveled') as GeoJSONSource).setData(
          traveled.length > 1 ? fc([line(traveled)]) : EMPTY,
        )
      }
      // car sits ~54% down the screen (design keeps the map north-up)
      const follow = {
        center: tick.pos as [number, number],
        zoom: 16.2,
        offset: [0, 35] as [number, number],
      }
      if (!navEntered.current) {
        navEntered.current = true
        map.easeTo({ ...follow, duration: 850, easing: easeCamera })
      } else {
        map.easeTo({ ...follow, duration: 270, easing: (t) => t })
      }
    })
  }, [screen])

  return (
    <div className="sg-map-wrap">
      <div ref={holder} className="sg-map" />
    </div>
  )
}
