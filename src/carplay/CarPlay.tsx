import { useEffect, useState } from 'react'
import { MONOGRAM_PATH } from '../brand/Monogram'

/**
 * CarPlay — Active Guidance, 1280×480 reference canvas, day + night.
 * Values verbatim from the design handoff's CarPlay screens.
 */

interface CpTheme {
  land: string
  water: string
  road: string
  casing: string
  park: string
  building: string
  labels: string
  routeCasing: string
  route: string
  chevron: string
  pinFill: string
  pinStroke: string
  carFill: string
  carStroke: string
  railBg: string
  railBorder: string
  ink: string
  ink2: string
  ink3: string
  ln: string
  glass88: string
  glass90: string
  glass94: string
  tileBg: string
  tileBorder: string
  sageTile: string
  sageTileShadow: string
  monoStroke: string
  monoDot: string
  cardBg: string
  cardInk: string
  cardShadow: string
  streetOpacity: number
  etaAccent: string
  etaShadow: string
  endBg: string
  endInk: string
  avatarBg: string
  avatarBorder: string
  avatarStroke: string
  avatarDot: string
  primaryBg: string
  primaryInk: string
  skipBg: string
  skipBorder: string
  skipInk: string
  barOn: string
  barOff: string
}

const DAY: CpTheme = {
  land: '#EFEDE2',
  water: '#C4DADD',
  road: '#FFFFFF',
  casing: '#DBD8C6',
  park: '#D5E3CB',
  building: '#E0DECD',
  labels: '#8D9184',
  routeCasing: '#FFFFFF',
  route: '#3F6B4F',
  chevron: 'rgba(255,255,255,.95)',
  pinFill: '#2C4A37',
  pinStroke: '#FFFFFF',
  carFill: '#3F6B4F',
  carStroke: '#FFFFFF',
  railBg: 'rgba(255,255,255,.86)',
  railBorder: '#E4E6DB',
  ink: '#1D241C',
  ink2: '#5C665B',
  ink3: '#99A196',
  ln: '#E4E6DB',
  glass88: 'rgba(255,255,255,.88)',
  glass90: 'rgba(255,255,255,.9)',
  glass94: 'rgba(255,255,255,.94)',
  tileBg: '#FFFFFF',
  tileBorder: '#E4E6DB',
  sageTile: '#3F6B4F',
  sageTileShadow: '0 2px 8px rgba(44,74,55,.35)',
  monoStroke: '#F3F1E6',
  monoDot: '#EBC670',
  cardBg: '#2C4A37',
  cardInk: '#F3F1E6',
  cardShadow: '0 14px 36px rgba(29,36,28,.25)',
  streetOpacity: 0.92,
  etaAccent: '#3F6B4F',
  etaShadow: '0 14px 36px rgba(29,36,28,.18)',
  endBg: 'rgba(191,74,50,.12)',
  endInk: '#BF4A32',
  avatarBg: '#F7EDD6',
  avatarBorder: '#EBDCB2',
  avatarStroke: '#2C4A37',
  avatarDot: '#BE8F35',
  primaryBg: '#3F6B4F',
  primaryInk: '#F7F6EE',
  skipBg: '#FFFFFF',
  skipBorder: '#E4E6DB',
  skipInk: '#5C665B',
  barOn: '#1D241C',
  barOff: '#99A196',
}

const NIGHT: CpTheme = {
  land: '#161A13',
  water: '#132029',
  road: '#2A3227',
  casing: '#20271E',
  park: '#1B291D',
  building: '#232A20',
  labels: '#778272',
  routeCasing: '#101408',
  route: '#8FC79E',
  chevron: 'rgba(16,20,8,.8)',
  pinFill: '#C9E4CF',
  pinStroke: '#101408',
  carFill: '#8FBE9C',
  carStroke: '#101408',
  railBg: 'rgba(20,26,18,.85)',
  railBorder: '#2B3329',
  ink: '#EDEFE6',
  ink2: '#A8B1A2',
  ink3: '#6E786B',
  ln: '#2B3329',
  glass88: 'rgba(23,29,21,.88)',
  glass90: 'rgba(23,29,21,.9)',
  glass94: 'rgba(27,33,26,.94)',
  tileBg: '#1B211A',
  tileBorder: '#2B3329',
  sageTile: '#8FBE9C',
  sageTileShadow: 'none',
  monoStroke: '#12160F',
  monoDot: '#12160F',
  cardBg: '#C9E4CF',
  cardInk: '#12160F',
  cardShadow: '0 14px 36px rgba(0,0,0,.4)',
  streetOpacity: 0.8,
  etaAccent: '#8FBE9C',
  etaShadow: '0 14px 36px rgba(0,0,0,.4)',
  endBg: 'rgba(225,116,92,.15)',
  endInk: '#E1745C',
  avatarBg: '#2E2712',
  avatarBorder: '#4A3D1C',
  avatarStroke: '#C9E4CF',
  avatarDot: '#EBC670',
  primaryBg: '#8FBE9C',
  primaryInk: '#12160F',
  skipBg: '#1B211A',
  skipBorder: '#2B3329',
  skipInk: '#A8B1A2',
  barOn: '#EDEFE6',
  barOff: '#6E786B',
}

function CpMap({ t }: { t: CpTheme }) {
  return (
    <svg
      viewBox="0 0 1280 480"
      preserveAspectRatio="xMidYMid slice"
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block' }}
    >
      <rect width={1280} height={480} fill={t.land} />
      <path d="M1130 0 C 1090 120 1160 200 1280 215 L 1280 0 Z" fill={t.water} />
      <g stroke={t.road} strokeWidth={10} strokeLinecap="round">
        <line x1={320} y1={20} x2={320} y2={460} />
        <line x1={680} y1={20} x2={680} y2={460} />
        <line x1={1040} y1={20} x2={1040} y2={460} />
        <line x1={20} y1={80} x2={1260} y2={80} />
        <line x1={20} y1={320} x2={1260} y2={320} />
        <line x1={20} y1={440} x2={1260} y2={440} />
      </g>
      <g stroke={t.road} strokeWidth={15} strokeLinecap="round">
        <line x1={140} y1={20} x2={140} y2={460} />
        <line x1={500} y1={20} x2={500} y2={460} />
        <line x1={860} y1={20} x2={860} y2={460} />
        <line x1={20} y1={200} x2={1260} y2={200} />
      </g>
      <line x1={620} y1={480} x2={1100} y2={40} stroke={t.casing} strokeWidth={20} strokeLinecap="round" />
      <line x1={620} y1={480} x2={1100} y2={40} stroke={t.road} strokeWidth={15} strokeLinecap="round" />
      <rect x={546} y={234} width={250} height={150} rx={20} fill={t.park} />
      <g fill={t.building}>
        <rect x={170} y={100} width={46} height={52} rx={6} />
        <rect x={228} y={100} width={38} height={40} rx={6} />
        <rect x={170} y={164} width={40} height={60} rx={6} />
        <rect x={352} y={222} width={50} height={44} rx={6} />
        <rect x={352} y={278} width={42} height={36} rx={6} />
        <rect x={410} y={222} width={38} height={56} rx={6} />
        <rect x={880} y={222} width={48} height={46} rx={6} />
        <rect x={880} y={280} width={40} height={38} rx={6} />
        <rect x={940} y={222} width={36} height={40} rx={6} />
      </g>
      <g
        fill={t.labels}
        style={{ fontFamily: "'Onest Variable','Onest',sans-serif", fontWeight: 600, letterSpacing: '.14em', fontSize: 15 }}
      >
        <text x={153} y={120} transform="rotate(-90 153 120)">ALDER ST</text>
        <text x={240} y={190}>5TH AVE</text>
        <text x={513} y={130} transform="rotate(-90 513 130)">MERIDIAN AVE</text>
        <text x={806} y={342} transform="rotate(-42.5 806 342)">JUNIPER WAY</text>
        {t === DAY && (
          <text x={626} y={316} style={{ fontSize: 13 }}>
            GREENLAKE
          </text>
        )}
      </g>
      <path
        d="M140 420 L140 200 L500 200 L500 80"
        fill="none"
        stroke={t.routeCasing}
        strokeWidth={19}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M140 420 L140 200 L500 200 L500 80"
        fill="none"
        stroke={t.route}
        strokeWidth={12}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M140 420 L140 200 L500 200 L500 80"
        pathLength={1}
        strokeDasharray=".012 .05"
        style={{
          fill: 'none',
          stroke: t.chevron,
          strokeWidth: 5,
          strokeLinecap: 'round',
          animation: 'sgMarchCp 1.15s linear infinite',
        }}
      />
      <path
        d="M500 74 C 481 49 481 26 500 26 C 519 26 519 49 500 74 Z"
        fill={t.pinFill}
        stroke={t.pinStroke}
        strokeWidth={4}
      />
      <circle cx={500} cy={42} r={8} fill={t.pinStroke} />
      <g transform="translate(140 330)">
        <circle r={21} fill={t.carFill} stroke={t.carStroke} strokeWidth={5} />
        <path d="M0 -10 L8 8 L0 3.5 L-8 8 Z" fill={t.carStroke} />
      </g>
    </svg>
  )
}

function Mono({ size, stroke, dot }: { size: number; stroke: string; dot: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path
        d={MONOGRAM_PATH}
        fill="none"
        stroke={stroke}
        strokeWidth={2.7}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx={16.6} cy={4.7} r={2.2} fill={dot} />
    </svg>
  )
}

export function CarPlay() {
  const [mode, setMode] = useState<'day' | 'night'>('day')
  const [sageBanner, setSageBanner] = useState(true)
  const t = mode === 'day' ? DAY : NIGHT

  // Sage banner: auto-dismiss after 12s (per handoff annotation)
  useEffect(() => {
    if (!sageBanner) return
    const timer = setTimeout(() => setSageBanner(false), 12000)
    return () => clearTimeout(timer)
  }, [sageBanner])

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', mode)
  }, [mode])

  return (
    <div
      style={{
        height: '100%',
        background: '#101210',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 18,
        padding: 20,
      }}
    >
      <div
        style={{
          fontSize: 11,
          fontWeight: 800,
          letterSpacing: '.14em',
          color: '#99A196',
          fontFamily: "'Onest Variable','Onest',sans-serif",
        }}
      >
        {mode === 'day'
          ? 'DAY · ACTIVE GUIDANCE · 1280 × 480'
          : 'NIGHT · ACTIVE GUIDANCE · AUTO-SWITCHES WITH CABIN LIGHT'}
      </div>

      <div
        className={`cp-${mode}`}
        style={{
          position: 'relative',
          width: 'min(1280px, calc(100vw - 40px))',
          aspectRatio: '1280 / 480',
          borderRadius: 14,
          overflow: 'hidden',
          background: t.land,
          boxShadow: '0 30px 70px rgba(0,0,0,.5)',
          fontFamily: "'Onest Variable','Onest',sans-serif",
          color: t.ink,
          containerType: 'inline-size',
        }}
      >
        <CpMap t={t} />

        {/* Left rail */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: 78,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '14px 0',
            gap: 14,
            background: t.railBg,
            borderRight: `1px solid ${t.railBorder}`,
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
          }}
        >
          <div className="t-num" style={{ fontSize: 15, fontWeight: 800, color: t.ink }}>
            9:41
          </div>
          <button
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: t.sageTile,
              boxShadow: t.sageTileShadow,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            aria-label="Sage Maps"
          >
            <Mono size={24} stroke={t.monoStroke} dot={t.monoDot} />
          </button>
          <button
            className="cp-tile"
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: t.tileBg,
              border: `1px solid ${t.tileBorder}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            aria-label="Music"
          >
            <svg width={19} height={19} viewBox="0 0 24 24">
              <path d="M9 18.5V5.5l11-2v13" fill="none" stroke={t.ink2} strokeWidth={2} strokeLinejoin="round" />
              <circle cx={6.8} cy={18.5} r={2.4} fill={t.ink2} />
              <circle cx={17.8} cy={16.5} r={2.4} fill={t.ink2} />
            </svg>
          </button>
          <button
            className="cp-tile"
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: t.tileBg,
              border: `1px solid ${t.tileBorder}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            aria-label="Phone"
          >
            <svg width={19} height={19} viewBox="0 0 24 24">
              <path
                d="M5 4.5h4L11 9l-2.5 2a12 12 0 0 0 4.5 4.5L15 13l4.5 2v4a1.5 1.5 0 0 1-1.7 1.5C9.5 19.6 4.4 14.5 3.5 6.2A1.5 1.5 0 0 1 5 4.5Z"
                fill="none"
                stroke={t.ink2}
                strokeWidth={2}
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <div style={{ flex: 1 }} />
          <div style={{ display: 'flex', gap: 2.5, alignItems: 'flex-end' }}>
            {[5, 8, 11, 14].map((h, i) => (
              <span
                key={h}
                style={{
                  width: 3,
                  height: h,
                  borderRadius: 1,
                  background: i < 3 ? t.barOn : t.barOff,
                }}
              />
            ))}
          </div>
        </div>

        {/* Maneuver cluster */}
        <div style={{ position: 'absolute', left: 96, top: 18, width: 270 }}>
          <div
            style={{
              borderRadius: 20,
              padding: '18px 20px',
              background: t.cardBg,
              color: t.cardInk,
              boxShadow: t.cardShadow,
              display: 'flex',
              alignItems: 'center',
              gap: 18,
            }}
          >
            <svg width={52} height={52} viewBox="0 0 24 24">
              <path
                d="M6 20v-8a3 3 0 0 1 3-3h9M18 9l-4-4M18 9l-4 4"
                fill="none"
                stroke={t.cardInk}
                strokeWidth={2.6}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <div>
              <div
                className="t-num"
                style={{ fontSize: 34, fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1 }}
              >
                600 ft
              </div>
              <div style={{ fontSize: 17, fontWeight: 600, marginTop: 5, opacity: t.streetOpacity }}>
                onto 5th Ave
              </div>
            </div>
          </div>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '9px 15px',
              borderRadius: 999,
              marginTop: 8,
              background: t.glass88,
              border: `1px solid ${t.ln}`,
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              fontSize: 14,
              fontWeight: 700,
              color: t.ink,
            }}
          >
            <span style={{ fontWeight: 600, color: t.ink2 }}>Then</span>
            <svg width={15} height={15} viewBox="0 0 24 24">
              <path
                d="M18 20v-8a3 3 0 0 0-3-3H6M6 9l4-4M6 9l4 4"
                fill="none"
                stroke={t.ink}
                strokeWidth={2.4}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Meridian Ave
          </div>
        </div>

        {/* Speed cluster */}
        <div
          style={{
            position: 'absolute',
            left: 96,
            bottom: 84,
            display: 'flex',
            gap: 8,
            alignItems: 'flex-end',
          }}
        >
          <div
            style={{
              width: 58,
              borderRadius: 12,
              background: '#FFFFFF',
              border: '3px solid #1D241C',
              textAlign: 'center',
              padding: '6px 0 7px',
              color: '#1D241C',
            }}
          >
            <div style={{ fontSize: 8.5, fontWeight: 800, letterSpacing: '.06em', lineHeight: 1.2 }}>
              SPEED
              <br />
              LIMIT
            </div>
            <div className="t-num" style={{ fontSize: 23, fontWeight: 800, lineHeight: 1.1 }}>
              25
            </div>
          </div>
          <div
            style={{
              borderRadius: 999,
              padding: '8px 14px',
              textAlign: 'center',
              background: t.glass88,
              border: `1px solid ${t.ln}`,
              color: t.ink,
            }}
          >
            <span className="t-num" style={{ fontSize: 19, fontWeight: 800 }}>
              24
            </span>
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.08em', color: t.ink2 }}>
              {' '}
              MPH
            </span>
          </div>
        </div>

        {/* ETA bar */}
        <div
          style={{
            position: 'absolute',
            left: 96,
            bottom: 16,
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            padding: '12px 14px 12px 22px',
            borderRadius: 999,
            background: t.glass90,
            border: `1px solid ${t.ln}`,
            boxShadow: t.etaShadow,
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            color: t.ink,
          }}
        >
          <div
            className="t-num"
            style={{ fontSize: 21, fontWeight: 800, letterSpacing: '-0.01em' }}
          >
            <span style={{ color: t.etaAccent }}>9:59</span>
            <span style={{ color: t.ink3, fontWeight: 600 }}> · </span>
            <span>18 min</span>
            <span style={{ color: t.ink3, fontWeight: 600 }}> · </span>
            <span style={{ color: t.ink2 }}>4.6 mi</span>
          </div>
          <button
            className="cp-end"
            style={{
              height: 44,
              padding: '0 20px',
              borderRadius: 999,
              display: 'flex',
              alignItems: 'center',
              fontSize: 15,
              fontWeight: 800,
              background: t.endBg,
              color: t.endInk,
            }}
          >
            End
          </button>
        </div>

        {/* Sage banner */}
        {sageBanner && (
          <div
            style={{
              position: 'absolute',
              right: 16,
              bottom: 16,
              width: 330,
              borderRadius: 20,
              padding: '14px 16px',
              background: t.glass94,
              border: `1px solid ${t.ln}`,
              boxShadow: t.etaShadow,
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <span
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: '50%',
                  background: t.avatarBg,
                  border: `1px solid ${t.avatarBorder}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Mono size={15} stroke={t.avatarStroke} dot={t.avatarDot} />
              </span>
              <span style={{ fontSize: 12, fontWeight: 800, color: t.ink }}>Sage</span>
              <span style={{ fontSize: 10.5, fontWeight: 600, color: t.ink3 }}>
                · spotted on route
              </span>
            </div>
            <div
              style={{
                fontFamily: "'Newsreader Variable','Newsreader',Georgia,serif",
                fontStyle: 'italic',
                fontWeight: 500,
                fontSize: 15.5,
                lineHeight: 1.35,
                marginBottom: 11,
                color: t.ink,
              }}
            >
              Gas is $3.89 at Juniper Fuel — forty seconds off route.
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                className="cp-primary"
                style={{
                  flex: 1,
                  height: 46,
                  borderRadius: 999,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 14.5,
                  fontWeight: 800,
                  background: t.primaryBg,
                  color: t.primaryInk,
                }}
                onClick={() => setSageBanner(false)}
              >
                Add stop
              </button>
              <button
                className="cp-skip"
                style={{
                  height: 46,
                  padding: '0 20px',
                  borderRadius: 999,
                  display: 'flex',
                  alignItems: 'center',
                  fontSize: 14.5,
                  fontWeight: 700,
                  border: `1px solid ${t.skipBorder}`,
                  background: t.skipBg,
                  color: t.skipInk,
                }}
                onClick={() => setSageBanner(false)}
              >
                Skip
              </button>
            </div>
          </div>
        )}

        {/* Zoom stack */}
        <div
          style={{
            position: 'absolute',
            right: 16,
            top: 18,
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
          }}
        >
          {['+', '−'].map((g) => (
            <button
              key={g}
              className="cp-zoom"
              style={{
                width: 48,
                height: 48,
                borderRadius: 14,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 22,
                fontWeight: 700,
                background: t.glass88,
                border: `1px solid ${t.ln}`,
                color: t.ink,
              }}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      {/* Day/Night switch + back to phone */}
      <div style={{ display: 'flex', gap: 10 }}>
        {(['day', 'night'] as const).map((m) => (
          <button
            key={m}
            onClick={() => {
              setMode(m)
              setSageBanner(true)
            }}
            style={{
              padding: '10px 18px',
              borderRadius: 999,
              fontSize: 13.5,
              fontWeight: 700,
              fontFamily: "'Onest Variable','Onest',sans-serif",
              background: mode === m ? '#E9EFE2' : 'transparent',
              color: mode === m ? '#1F3A2A' : '#E9EFE2',
              border: mode === m ? '1.5px solid #E9EFE2' : '1.5px solid rgba(233,239,226,.4)',
            }}
          >
            {m === 'day' ? 'Day' : 'Night'}
          </button>
        ))}
        <a
          href={import.meta.env.BASE_URL}
          style={{
            padding: '10px 18px',
            borderRadius: 999,
            fontSize: 13.5,
            fontWeight: 700,
            fontFamily: "'Onest Variable','Onest',sans-serif",
            color: '#E9EFE2',
            border: '1.5px solid rgba(233,239,226,.4)',
            textDecoration: 'none',
          }}
        >
          Phone app →
        </a>
      </div>
    </div>
  )
}
