import type { CSSProperties } from 'react'

/**
 * Sage Maps icon set — 24 grid, 2px rounded strokes, no fills except
 * where the design calls for them. Paths verbatim from the design kit.
 */

export const ICON_PATHS = {
  search: 'M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14ZM16.8 16.8 21.5 21.5',
  mic: 'M9 2.5h6v8a3 3 0 0 1-3 3 3 3 0 0 1-3-3ZM5 11a7 7 0 0 0 14 0M12 18.5v3',
  navigate: 'M3.5 11 21 3 13 20.5 11 13Z',
  explore:
    'M12 2.5a9.5 9.5 0 1 0 0 19 9.5 9.5 0 0 0 0-19ZM15.8 8.2 14 14l-5.8 1.8L10 10Z',
  layers: 'M12 2.5 2.5 7.5 12 12.5 21.5 7.5ZM2.5 12 12 17 21.5 12',
  pin: 'M12 21s-7-5.5-7-11a7 7 0 0 1 14 0c0 5.5-7 11-7 11ZM12 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z',
  saved: 'M19 21l-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2Z',
  you: 'M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM19 21v-1.5a5 5 0 0 0-5-5h-4a5 5 0 0 0-5 5V21',
  sage: 'M12 2.8 13.9 9 20.1 10.9 13.9 12.8 12 19 10.1 12.8 3.9 10.9 10.1 9ZM19 3.5v3M20.5 5h-3',
  coffee:
    'M4.5 8.5h11v6.5a4 4 0 0 1-4 4h-3a4 4 0 0 1-4-4ZM15.5 9.5H17a2.8 2.8 0 1 1 0 5.6h-1.5M7 5.5V3.8M10 5.5V3.8M13 5.5V3.8',
  gas: 'M4.5 20.5V5.5a2 2 0 0 1 2-2h5a2 2 0 0 1 2 2v15M3 20.5h10.5M13.5 9.5h2.6l1.9 1.9v5.6a1.75 1.75 0 1 1-3.5 0v-3.5',
  parking: 'M7.5 20V4.5H13a4.75 4.75 0 0 1 0 9.5H7.5',
  grocery: 'M5.5 8h13l-1.2 12.5H6.7ZM8.8 8a3.2 3.2 0 0 1 6.4 0',
  park: 'M12 3.5l4.5 6h-2.5l3.5 5.5H6.5L10 9.5H7.5ZM12 15v5.5',
  home: 'M4 10.2 12 3.5 20 10.2M6 8.8V20h12V8.8M10 20v-6h4v6',
  work: 'M3 8.5h18v11H3ZM8.5 8.5V6.3A1.8 1.8 0 0 1 10.3 4.5h3.4a1.8 1.8 0 0 1 1.8 1.8v2.2M3 13h18',
  clock: 'M12 7v5l3.5 2.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z',
  volume: 'M11 5.5 6.5 9H3v6h3.5L11 18.5ZM15.5 9.5a4 4 0 0 1 0 5M18 7a7.5 7.5 0 0 1 0 10',
  night: 'M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8Z',
  day: 'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8ZM12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5 5l1.4 1.4M17.6 17.6 19 19M19 5l-1.4 1.4M6.4 17.6 5 19',
  ev: 'M6 3.5h9v17H6ZM9 7.5l-1.8 4h2.6l-1.8 4M18 8v6a1.5 1.5 0 0 0 3 0V9.5L19 7.5',
  alert: 'M12 3.5 22 20.5H2ZM12 10v4.5M12 17.2v.5',
  share: 'M12 3v12M8 6.5 12 2.8l4 3.7M5 12v8h14v-8',
  settings: 'M4 7h9M17 7h3M4 17h3M11 17h9M13 4.5v5M9 14.5v5',
  back: 'M19 12H5M12 19l-7-7 7-7',
  close: 'M6 6l12 12M18 6 6 18',
  check: 'M4.5 12.5l5 5 10-11',
  more: 'M5 12h.5M12 12h.5M19 12h.5',
  chevron: 'M9 5l7 7-7 7',
  compass: 'M12 2.5a9.5 9.5 0 1 0 0 19 9.5 9.5 0 0 0 0-19ZM15.8 8.2 14 14l-5.8 1.8L10 10Z',
  food: 'M17.5 3.5c-2 .5-3 2.5-3 5.5v11.5M17.5 3.5v17M6.5 3.5v4.5a2 2 0 0 0 4 0V3.5M8.5 3.5v17',
  health: 'M11 4.5h2v6h6v2h-6v6h-2v-6H5v-2h6Z',
  gym: 'M6.5 7.5v9M17.5 7.5v9M3.5 10v4M20.5 10v4M6.5 12h11',
  plus: 'M12 5v14M5 12h14',
  insert: 'M12 19V5M5 12l7-7 7 7',
  caret: 'M6 9l6 6 6-6',
  steps: 'M8 6h13M8 12h13M8 18h13M3.5 6h.5M3.5 12h.5M3.5 18h.5',
  download: 'M12 3v10M8 9l4 4 4-4M4 17v2.5h16V17',
  shield: 'M12 3l7 3v5c0 4.5-3 8.5-7 9.5-4-1-7-5-7-9.5V6Z',
  /* home-screen FAB / pill variants (prototype-specific drawings) */
  layersFab: 'M12 2.5 2.5 7.5 12 12.5 21.5 7.5ZM2.5 12 12 17 21.5 12M2.5 16.5 12 21.5 21.5 16.5',
  micRound:
    'M12 2.5a3 3 0 0 1 3 3v5a3 3 0 0 1-6 0v-5a3 3 0 0 1 3-3ZM5 11a7 7 0 0 0 14 0M12 18.5v3',
  sunFab:
    'M12 7.8a4.2 4.2 0 1 0 0 8.4 4.2 4.2 0 0 0 0-8.4ZM12 2.5V5M12 19v2.5M2.5 12H5M19 12h2.5M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M19.1 4.9l-1.8 1.8M6.7 17.3l-1.8 1.8',
  workTile:
    'M3 7.5h18v12.5H3ZM8.5 7.5V5.8A1.8 1.8 0 0 1 10.3 4h3.4a1.8 1.8 0 0 1 1.8 1.8v1.7M3 12.5h18',
} as const

export type IconName = keyof typeof ICON_PATHS

/** Filled sparkle glyph (Sage's badge). */
export const SPARKLE_PATH = 'M12 2.8 13.9 9 20.1 10.9 13.9 12.8 12 19 10.1 12.8 3.9 10.9 10.1 9Z'

export function Icon({
  name,
  size = 24,
  stroke = 'currentColor',
  strokeWidth = 2,
  fill = 'none',
  style,
  className,
}: {
  name: IconName
  size?: number
  stroke?: string
  strokeWidth?: number
  fill?: string
  style?: CSSProperties
  className?: string
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      style={style}
      className={className}
      aria-hidden="true"
    >
      <path
        d={ICON_PATHS[name]}
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function Sparkle({ size = 10, fill }: { size?: number; fill: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path d={SPARKLE_PATH} fill={fill} />
    </svg>
  )
}

/** Filled navigate glyph used inside primary CTAs. */
export function NavigateGlyph({ size = 15, fill }: { size?: number; fill: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M3.5 11 21 3 13 20.5 11 13Z" fill={fill} />
    </svg>
  )
}

/* ------------------------------------------------------------------
   Maneuver arrows — 24 grid, 2.6 stroke, derived from the kit's
   canonical "turn right" arrow: M6 20v-8a3 3 0 0 1 3-3h9M18 9l-4-4M18 9l-4 4
   ------------------------------------------------------------------ */

export const MANEUVER_PATHS: Record<string, string> = {
  right: 'M6 20v-8a3 3 0 0 1 3-3h9M18 9l-4-4M18 9l-4 4',
  left: 'M18 20v-8a3 3 0 0 0-3-3H6M6 9l4-4M6 9l4 4',
  'slight right': 'M8 20v-7l7-7M15 6h-5M15 6v5',
  'slight left': 'M16 20v-7L9 6M9 6h5M9 6v5',
  'sharp right': 'M7 20v-6l11 5M18 19v-5M18 19l-5 1.5',
  'sharp left': 'M17 20v-6L6 19M6 19v-5M6 19l5 1.5',
  straight: 'M12 20V6M12 6l-5 5M12 6l5 5',
  uturn: 'M8 20V9a4.5 4.5 0 0 1 9 0v4M17 13l-3.4-3M17 13l3.4-3',
  merge: 'M6 20c0-6 6-6 6-11M18 20c0-6-6-6-6-11M12 9V4M12 4 8.5 7.5M12 4l3.5 3.5',
  arrive:
    'M12 21s-6.5-5-6.5-10a6.5 6.5 0 0 1 13 0C18.5 16 12 21 12 21ZM12 13.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z',
  depart: 'M12 20V6M12 6l-5 5M12 6l5 5',
  roundabout: 'M12 21v-4M12 7.5a4 4 0 1 0 .01 0M12 3.5v4',
  fork: 'M6 20c0-6 6-6 6-11M18 20c0-6-6-6-6-11M12 9V4M12 4 8.5 7.5M12 4l3.5 3.5',
}

export function maneuverPath(type: string, modifier?: string): string {
  if (type === 'arrive') return MANEUVER_PATHS.arrive
  if (type === 'depart') return MANEUVER_PATHS.depart
  if (type === 'merge') return MANEUVER_PATHS.merge
  if (type === 'roundabout' || type === 'rotary') return MANEUVER_PATHS.roundabout
  if (type === 'fork') return MANEUVER_PATHS.fork
  if (modifier && MANEUVER_PATHS[modifier]) return MANEUVER_PATHS[modifier]
  return MANEUVER_PATHS.straight
}

export function ManeuverArrow({
  type,
  modifier,
  size = 46,
  stroke,
}: {
  type: string
  modifier?: string
  size?: number
  stroke: string
}) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path
        d={maneuverPath(type, modifier)}
        fill="none"
        stroke={stroke}
        strokeWidth={2.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
