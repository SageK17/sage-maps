import { useEffect, useRef } from 'react'
import { useApp } from '../state/store'
import { Icon, Sparkle } from '../icons'
import {
  RECENT_IDS,
  byId,
  catIcon,
  searchPlaces,
  distanceLabel,
  type Place,
} from '../services/places'

function PlaceRow({ place, onPick }: { place: Place; onPick: (p: Place) => void }) {
  const origin = useApp((s) => s.origin)
  return (
    <button className="sg-place-row pressable" onClick={() => onPick(place)}>
      <span className="sg-row-circle">
        <Icon name={catIcon(place.cat)} size={18} stroke="var(--ink2)" />
      </span>
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: 'block', fontSize: 15, fontWeight: 700 }}>{place.name}</span>
        <span
          className="ellipsis"
          style={{ display: 'block', fontSize: 12.5, color: 'var(--ink2)' }}
        >
          {place.addr} · {distanceLabel(origin, place.pos)}
        </span>
      </span>
      <Icon
        name="insert"
        size={17}
        stroke="var(--ink3)"
        style={{ transform: 'rotate(45deg)', flexShrink: 0 }}
      />
    </button>
  )
}

export function SearchScreen() {
  const query = useApp((s) => s.query)
  const setQuery = useApp((s) => s.setQuery)
  const setScreen = useApp((s) => s.setScreen)
  const openRoutes = useApp((s) => s.openRoutes)
  const sageEnabled = useApp((s) => s.sageEnabled)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const close = () => {
    setQuery('')
    setScreen('home')
  }
  const pick = (p: Place) =>
    openRoutes({ id: p.id, name: p.name, addr: p.addr, pos: p.pos, cat: p.cat })

  const q = query.trim()
  const results = searchPlaces(q)
  const recents = RECENT_IDS.map(byId)

  return (
    <div className="sg-search-screen">
      <div className="sg-search-head">
        <button className="sg-back-circle pressable" onClick={close} aria-label="Back">
          <Icon name="back" size={18} stroke="var(--ink)" strokeWidth={2.2} />
        </button>
        <div className="sg-input-pill">
          <Icon name="search" size={18} stroke="var(--ac)" strokeWidth={2.2} />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search places, streets, categories…"
            aria-label="Search"
          />
          {q.length > 0 && (
            <button className="sg-clear-22 pressable" onClick={() => setQuery('')} aria-label="Clear">
              <Icon name="close" size={11} stroke="var(--ink2)" strokeWidth={2.6} />
            </button>
          )}
          <Icon name="micRound" size={18} stroke="var(--ink2)" />
        </div>
      </div>

      <div className="scroll-y" style={{ flex: 1, paddingBottom: 16 }}>
        {q.length === 0 ? (
          <>
            {sageEnabled && (
              <button className="sg-day-strip pressable" onClick={() => pick(byId('patel'))}>
                <Sparkle size={17} fill="var(--gold)" />
                <span className="t-sage" style={{ fontSize: 14.5, color: 'var(--ink)', flex: 1 }}>
                  On your day — Dr. Patel at 2:00. Leave by 1:38.
                </span>
                <Icon name="chevron" size={15} stroke="var(--gold)" strokeWidth={2.4} />
              </button>
            )}
            <div className="sg-section-label" style={{ padding: '2px 18px 6px' }}>
              Recent
            </div>
            {recents.map((p) => (
              <PlaceRow key={p.id} place={p} onPick={pick} />
            ))}
          </>
        ) : (
          <>
            <div className="sg-section-label" style={{ padding: '8px 18px 6px' }}>
              {results.length} result{results.length === 1 ? '' : 's'}
            </div>
            {results.map((p) => (
              <PlaceRow key={p.id} place={p} onPick={pick} />
            ))}
          </>
        )}
      </div>
    </div>
  )
}
