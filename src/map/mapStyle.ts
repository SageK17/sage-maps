import type { StyleSpecification } from 'maplibre-gl'

/**
 * Custom MapLibre styles rendered from the handoff's map palettes,
 * on OpenFreeMap vector tiles (OpenMapTiles schema, no API key).
 */

export interface MapPalette {
  land: string
  block: string
  building: string
  road: string
  casing: string
  park: string
  water: string
  labels: string
  altRoute: string
  route: string
  routeCasing: string
  traveled: string
}

export const DAY_PALETTE: MapPalette = {
  land: '#EFEDE2',
  block: '#E8E6D8',
  building: '#E0DECD',
  road: '#FFFFFF',
  casing: '#DBD8C6',
  park: '#D5E3CB',
  water: '#C4DADD',
  labels: '#8D9184',
  altRoute: '#B4BBAD',
  route: '#3F6B4F',
  routeCasing: '#FFFFFF',
  traveled: 'rgba(219, 216, 198, 0.62)',
}

export const NIGHT_PALETTE: MapPalette = {
  land: '#161A13',
  block: '#1D231B',
  building: '#232A20',
  road: '#2A3227',
  casing: '#20271E',
  park: '#1B291D',
  water: '#132029',
  labels: '#778272',
  altRoute: '#48524A',
  route: '#8FC79E',
  routeCasing: '#101408',
  traveled: 'rgba(32, 39, 30, 0.62)',
}

function widthExpr(mult: number): never {
  return [
    'interpolate',
    ['exponential', 1.4],
    ['zoom'],
    5,
    0.6 * mult,
    10,
    1.4 * mult,
    14,
    3.4 * mult,
    16,
    8 * mult,
    19,
    26 * mult,
  ] as never
}

const MAJOR = ['motorway', 'trunk', 'primary']
const MID = ['secondary', 'tertiary']
const MINOR = ['minor', 'service', 'unclassified', 'residential', 'living_street']

export function buildMapStyle(p: MapPalette): StyleSpecification {
  return {
    version: 8,
    glyphs: 'https://tiles.openfreemap.org/fonts/{fontstack}/{range}.pbf',
    sources: {
      omt: {
        type: 'vector',
        url: 'https://tiles.openfreemap.org/planet',
      },
    },
    layers: [
      { id: 'bg', type: 'background', paint: { 'background-color': p.land } },
      {
        id: 'landuse-block',
        type: 'fill',
        source: 'omt',
        'source-layer': 'landuse',
        filter: ['in', 'class', 'residential', 'suburb', 'neighbourhood', 'commercial', 'industrial'],
        paint: { 'fill-color': p.block },
      },
      {
        id: 'park',
        type: 'fill',
        source: 'omt',
        'source-layer': 'park',
        paint: { 'fill-color': p.park },
      },
      {
        id: 'landcover-green',
        type: 'fill',
        source: 'omt',
        'source-layer': 'landcover',
        filter: ['in', 'class', 'grass', 'wood', 'park'],
        paint: { 'fill-color': p.park, 'fill-opacity': 0.7 },
      },
      {
        id: 'water',
        type: 'fill',
        source: 'omt',
        'source-layer': 'water',
        paint: { 'fill-color': p.water },
      },
      {
        id: 'waterway',
        type: 'line',
        source: 'omt',
        'source-layer': 'waterway',
        paint: { 'line-color': p.water, 'line-width': widthExpr(0.6) },
      },
      {
        id: 'building',
        type: 'fill',
        source: 'omt',
        'source-layer': 'building',
        minzoom: 13,
        paint: { 'fill-color': p.building },
      },
      // --- roads: casing under fill, minor → major ---
      {
        id: 'road-minor-casing',
        type: 'line',
        source: 'omt',
        'source-layer': 'transportation',
        minzoom: 12,
        filter: ['in', 'class', ...MINOR],
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: { 'line-color': p.casing, 'line-width': widthExpr(0.75), 'line-gap-width': 0.5 },
      },
      {
        id: 'road-minor',
        type: 'line',
        source: 'omt',
        'source-layer': 'transportation',
        minzoom: 12,
        filter: ['in', 'class', ...MINOR],
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: { 'line-color': p.road, 'line-width': widthExpr(0.75) },
      },
      {
        id: 'road-mid-casing',
        type: 'line',
        source: 'omt',
        'source-layer': 'transportation',
        filter: ['in', 'class', ...MID],
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: { 'line-color': p.casing, 'line-width': widthExpr(1.1), 'line-gap-width': 0.5 },
      },
      {
        id: 'road-mid',
        type: 'line',
        source: 'omt',
        'source-layer': 'transportation',
        filter: ['in', 'class', ...MID],
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: { 'line-color': p.road, 'line-width': widthExpr(1.1) },
      },
      {
        id: 'road-major-casing',
        type: 'line',
        source: 'omt',
        'source-layer': 'transportation',
        filter: ['in', 'class', ...MAJOR],
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: { 'line-color': p.casing, 'line-width': widthExpr(1.5), 'line-gap-width': 0.5 },
      },
      {
        id: 'road-major',
        type: 'line',
        source: 'omt',
        'source-layer': 'transportation',
        filter: ['in', 'class', ...MAJOR],
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: { 'line-color': p.road, 'line-width': widthExpr(1.5) },
      },
      // --- labels ---
      {
        id: 'road-label',
        type: 'symbol',
        source: 'omt',
        'source-layer': 'transportation_name',
        minzoom: 13,
        layout: {
          'symbol-placement': 'line',
          'text-field': ['coalesce', ['get', 'name:en'], ['get', 'name']],
          'text-font': ['Noto Sans Regular'],
          'text-size': 12,
          'text-letter-spacing': 0.02,
        },
        paint: {
          'text-color': p.labels,
          'text-halo-color': p.land,
          'text-halo-width': 1.2,
        },
      },
      {
        id: 'place-label',
        type: 'symbol',
        source: 'omt',
        'source-layer': 'place',
        filter: ['in', 'class', 'city', 'town', 'suburb', 'neighbourhood', 'village'],
        layout: {
          'text-field': ['coalesce', ['get', 'name:en'], ['get', 'name']],
          'text-font': ['Noto Sans Regular'],
          'text-size': ['match', ['get', 'class'], 'city', 15, 'town', 13, 11.5] as never,
          'text-letter-spacing': 0.04,
          'text-transform': ['match', ['get', 'class'], 'suburb', 'uppercase', 'neighbourhood', 'uppercase', 'none'] as never,
        },
        paint: {
          'text-color': p.labels,
          'text-halo-color': p.land,
          'text-halo-width': 1.4,
        },
      },
    ],
  }
}
