import { useEffect, useRef, useState } from 'react'
import { useApp } from '../state/store'
import { Icon, Sparkle } from '../icons'
import { RECENT_IDS, byId, catIcon, searchPlaces, distanceLabel } from '../services/places'
import { geocode, type GeoResult } from '../services/geocode'
import type { LngLat } from '../lib/geo'

interface RowPlace {
  id: string
  name: string
  addr: string
  cat: string
  pos: LngLat
}

function PlaceRow({ place, onPick }: { place: RowPlace; onPick: (p: RowPlace) => void }) {
  const origin = useApp((s) => s.origin)
  return (
    <button className="sg-place-row pressable" onClick={() => onPick(place)}>
      <span className="sg-row-circle">
        <Icon name={catIcon(place.cat)} size={18} stroke="var(--ink2)" />
      </span>
      <span style={{ flex: 1, minWidth: 0 }}>
        <span className="ellipsis" style={{ display: 'block', fontSize: 15, fontWeight: 700 }}>
          {place.name}
        </span>
        <span
          className="ellipsis"
          style={{ display: 'block', fontSize: 12.5, color: 'var(--ink2)' }}
        >
          {[place.addr, distanceLabel(origin, place.pos)].filter(Boolean).join(' · ')}
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

const localResults = (q: string): GeoResult[] =>
  searchPlaces(q).map((p) => ({ id: p.id, name: p.name, addr: p.addr, cat: p.cat, pos: p.pos }))

export function SearchScreen() {
  const query = useApp((s) => s.query)
  const setQuery = useApp((s) => s.setQuery)
  const setScreen = useApp((s) => s.setScreen)
  const openRoutes = useApp((s) => s.openRoutes)
  const sageEnabled = useApp((s) => s.sageEnabled)
  const origin = useApp((s) => s.origin)
  const inputRef = useRef<HTMLInputElement>(null)

  const [results, setResults] = useState<GeoResult[]>([])
  const [searching, setSearching] = useState(false)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  // Real place search (debounced), biased to the user's location.
  const q = query.trim()
  useEffect(() => {
    if (q.length < 2) {
      setResults([])
      setSearching(false)
      return
    }
    setSearching(true)
    const ctl = new AbortController()
    const t = setTimeout(async () => {
      try {
        const r = await geocode(q, origin, ctl.signal)
        setResults(r.length ? r : localResults(q))
      } catch {
        if (ctl.signal.aborted) return
        setResults(localResults(q)) // offline / geocoder down → local demo places
      } finally {
        if (!ctl.signal.aborted) setSearching(false)
      }
    }, 250)
    return () => {
      clearTimeout(t)
      ctl.abort()
    }
  }, [q, origin])

  const close = () => {
    setQuery('')
    setScreen('home')
  }
  const pick = (p: RowPlace) =>
    openRoutes({ id: p.id, name: p.name, addr: p.addr, pos: p.pos, cat: p.cat })

  const recents = RECENT_IDS.map(byId)

  return (
    <div className="sg-search-screen">
      <div className="sg-search-head">
        <button className="sg-back-circle pressable" onClick={close} aria-label="Back">
          <Icon name="back" size={18} stroke="var(--ink)" strokeWidth={2.2} />
        </button>
        <div className="sg-input-pill" onClick={() => inputRef.current?.focus()}>
          <Icon name="search" size={18} stroke="var(--ac)" strokeWidth={2.2} />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && results[0]) pick(results[0])
            }}
            placeholder="Search places, addresses, cities…"
            aria-label="Search"
            type="text"
            inputMode="search"
            enterKeyHint="search"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="words"
            spellCheck={false}
          />
          {q.length > 0 && (
            <button
              className="sg-clear-22 pressable"
              onClick={() => {
                setQuery('')
                inputRef.current?.focus()
              }}
              aria-label="Clear"
            >
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
              {searching && !results.length
                ? 'Searching…'
                : `${results.length} result${results.length === 1 ? '' : 's'}`}
            </div>
            {results.map((p) => (
              <PlaceRow key={p.id} place={p} onPick={pick} />
            ))}
            {!searching && !results.length && (
              <div
                className="t-sage"
                style={{ padding: '10px 20px', fontSize: 14.5, color: 'var(--ink2)' }}
              >
                Nothing by that name near you. Try a street or city.
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
