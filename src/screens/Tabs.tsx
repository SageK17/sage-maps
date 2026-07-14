import { useApp } from '../state/store'
import { Icon, Sparkle, type IconName } from '../icons'
import {
  byId,
  catIcon,
  distanceLabel,
  etaLabel,
  OPEN_NOW_IDS,
  SAVED_PLACES,
  type Place,
} from '../services/places'

/* ------------------------------ Explore ------------------------------ */

const PICKS: { title: string; meta: string; icon: IconName }[] = [
  { title: 'Quiet cafés for deep work', meta: '4 spots · curated today', icon: 'coffee' },
  { title: 'Golden-hour lookouts', meta: '3 spots · 20 min loop', icon: 'day' },
  // gas pick's price is localised at render (see ExploreSheet)
  { title: 'Cheapest gas this week', meta: 'Juniper Fuel', icon: 'gas' },
]

const BROWSE: { label: string; q: string; icon: IconName }[] = [
  { label: 'Coffee', q: 'coffee', icon: 'coffee' },
  { label: 'Food', q: 'food', icon: 'food' },
  { label: 'Gas', q: 'gas', icon: 'gas' },
  { label: 'Parking', q: 'parking', icon: 'parking' },
  { label: 'Grocery', q: 'grocery', icon: 'grocery' },
  { label: 'Parks', q: 'park', icon: 'park' },
  { label: 'EV', q: 'ev', icon: 'ev' },
  { label: 'More', q: '', icon: 'more' },
]

export function ExploreSheet() {
  const sageEnabled = useApp((s) => s.sageEnabled)
  const setScreen = useApp((s) => s.setScreen)
  const setQuery = useApp((s) => s.setQuery)
  const openRoutes = useApp((s) => s.openRoutes)
  const origin = useApp((s) => s.origin)
  const fuelPrice = useApp((s) => s.fuelPrice)
  const picks = PICKS.map((p) =>
    p.icon === 'gas' ? { ...p, meta: `${p.meta} · ${fuelPrice}` } : p,
  )

  const goSearch = (q: string) => {
    setQuery(q)
    setScreen('search')
  }
  const pick = (p: Place) =>
    openRoutes({ id: p.id, name: p.name, addr: p.addr, pos: p.pos, cat: p.cat })

  return (
    <div className="sg-sheet" style={{ top: 318 }}>
      <div className="sg-sheet-panel">
        <div className="sg-grabber-wrap" style={{ padding: '9px 0 2px' }}>
          <div className="sg-grabber" />
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'baseline',
            justifyContent: 'space-between',
            padding: '6px 18px 10px',
          }}
        >
          <span style={{ fontSize: 21, fontWeight: 800, letterSpacing: '-0.02em' }}>
            Explore nearby
          </span>
          <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--ink2)' }}>
            Rowan District
          </span>
        </div>

        <div className="scroll-y" style={{ flex: 1, paddingBottom: 20 }}>
          {sageEnabled && (
            <>
              <div
                style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '4px 18px 8px' }}
              >
                <Sparkle size={14} fill="var(--gold)" />
                <span
                  className="sg-section-label"
                  style={{ color: 'var(--acD)', padding: 0 }}
                >
                  Sage's picks
                </span>
              </div>
              <div className="scroll-x" style={{ display: 'flex', gap: 10, padding: '0 18px 16px' }}>
                {picks.map((p) => (
                  <button key={p.title} className="sg-pick-card pressable">
                    <span className="sg-icon-tile-38">
                      <Icon name={p.icon} size={19} stroke="var(--acD)" />
                    </span>
                    <span
                      style={{
                        display: 'block',
                        fontSize: 14.5,
                        fontWeight: 700,
                        lineHeight: 1.25,
                        marginBottom: 4,
                      }}
                    >
                      {p.title}
                    </span>
                    <span style={{ display: 'block', fontSize: 12, color: 'var(--ink2)' }}>
                      {p.meta}
                    </span>
                  </button>
                ))}
              </div>
            </>
          )}

          <div className="sg-section-label" style={{ padding: '2px 18px 8px' }}>
            Browse
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr 1fr',
              gap: 8,
              padding: '0 18px 16px',
            }}
          >
            {BROWSE.map((b) => (
              <button key={b.label} className="sg-browse-cell pressable" onClick={() => goSearch(b.q)}>
                <Icon name={b.icon} size={20} stroke="var(--acD)" />
                {b.label}
              </button>
            ))}
          </div>

          <div className="sg-section-label" style={{ padding: '2px 18px 8px' }}>
            Open now
          </div>
          {OPEN_NOW_IDS.map(byId).map((p) => (
            <button key={p.id} className="sg-place-row pressable" onClick={() => pick(p)}>
              <span className="sg-row-tile">
                <Icon name={catIcon(p.cat)} size={18} stroke="var(--ink2)" />
              </span>
              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={{ display: 'block', fontSize: 14.5, fontWeight: 700 }}>{p.name}</span>
                <span style={{ display: 'block', fontSize: 12, color: 'var(--ink2)' }}>
                  {p.open} · {distanceLabel(origin, p.pos)}
                </span>
              </span>
              <Icon name="chevron" size={16} stroke="var(--ink3)" strokeWidth={2.2} />
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ------------------------------- Saved ------------------------------- */

export function SavedSheet() {
  const openRoutes = useApp((s) => s.openRoutes)
  const origin = useApp((s) => s.origin)

  return (
    <div className="sg-sheet" style={{ top: 170 }}>
      <div className="sg-sheet-panel">
        <div className="sg-grabber-wrap" style={{ padding: '9px 0 2px' }}>
          <div className="sg-grabber" />
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '6px 18px 12px',
          }}
        >
          <span style={{ fontSize: 21, fontWeight: 800, letterSpacing: '-0.02em' }}>Saved</span>
          <button className="sg-new-pill pressable">
            <Icon name="plus" size={14} stroke="var(--acD)" strokeWidth={2.4} />
            New
          </button>
        </div>

        <div
          className="scroll-y"
          style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8, padding: '0 14px 20px' }}
        >
          {SAVED_PLACES.map((p) => (
            <button
              key={p.id}
              className="sg-saved-row pressable"
              onClick={() => openRoutes({ id: p.id, name: p.name, addr: p.addr, pos: p.pos, cat: p.cat })}
            >
              <span className="sg-saved-circle">
                <Icon name={p.icon} size={18} stroke="var(--acD)" />
              </span>
              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={{ display: 'block', fontSize: 14.5, fontWeight: 700 }}>{p.name}</span>
                <span style={{ display: 'block', fontSize: 12, color: 'var(--ink2)' }}>{p.sub}</span>
              </span>
              <span style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--acD)' }}>
                {etaLabel(origin, p.pos)}
              </span>
            </button>
          ))}
          <button className="sg-saved-row pressable">
            <span className="sg-saved-circle">
              <Icon name="saved" size={18} stroke="var(--acD)" />
            </span>
            <span style={{ flex: 1, minWidth: 0 }}>
              <span style={{ display: 'block', fontSize: 14.5, fontWeight: 700 }}>
                Weekend hikes
              </span>
              <span style={{ display: 'block', fontSize: 12, color: 'var(--ink2)' }}>
                List · 6 places
              </span>
            </span>
          </button>
        </div>
      </div>
    </div>
  )
}

/* -------------------------------- You -------------------------------- */

export function YouSheet() {
  const theme = useApp((s) => s.theme)
  const setTheme = useApp((s) => s.setTheme)
  const sageEnabled = useApp((s) => s.sageEnabled)
  const setSageEnabled = useApp((s) => s.setSageEnabled)

  return (
    <div className="sg-sheet" style={{ top: 170 }}>
      <div className="sg-sheet-panel">
        <div className="sg-grabber-wrap" style={{ padding: '9px 0 2px' }}>
          <div className="sg-grabber" />
        </div>
        <div className="scroll-y" style={{ flex: 1, padding: '6px 18px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '8px 0 16px' }}>
            <span
              style={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                background: 'var(--acD)',
                color: 'var(--on-deep)',
                fontSize: 21,
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              A
            </span>
            <span>
              <span
                style={{
                  display: 'block',
                  fontSize: 19,
                  fontWeight: 800,
                  letterSpacing: '-0.01em',
                }}
              >
                Alex Rivera
              </span>
              <span style={{ display: 'block', fontSize: 12.5, color: 'var(--ink2)' }}>
                Navigating with Sage since 2024
              </span>
            </span>
          </div>

          <div style={{ display: 'flex', gap: 8, marginBottom: 18 }}>
            <div className="sg-stat-tile" style={{ background: 'var(--acT)' }}>
              <div
                className="t-num"
                style={{ fontSize: 19, fontWeight: 800, color: 'var(--acD)' }}
              >
                6.4 hrs
              </div>
              <div style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--ink2)' }}>
                saved by Sage this year
              </div>
            </div>
            <div className="sg-stat-tile" style={{ background: 'var(--goldT)' }}>
              <div className="t-num" style={{ fontSize: 19, fontWeight: 800, color: 'var(--gold)' }}>
                1,284 mi
              </div>
              <div style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--ink2)' }}>
                guided together
              </div>
            </div>
          </div>

          <div className="sg-section-label" style={{ paddingBottom: 8 }}>
            Appearance
          </div>
          <div className="sg-seg">
            <button
              className={`sg-seg-btn pressable${theme === 'day' ? ' active' : ''}`}
              onClick={() => setTheme('day')}
            >
              Day
            </button>
            <button
              className={`sg-seg-btn pressable${theme === 'night' ? ' active' : ''}`}
              onClick={() => setTheme('night')}
            >
              Night
            </button>
          </div>

          <div className="sg-section-label" style={{ paddingBottom: 8 }}>
            Sage
          </div>
          <div className="sg-settings-card">
            <div className="sg-settings-row">
              <span style={{ flex: 1 }}>
                <span style={{ display: 'block', fontSize: 14.5, fontWeight: 700 }}>
                  Suggestions
                </span>
                <span style={{ display: 'block', fontSize: 12, color: 'var(--ink2)' }}>
                  Proactive tips on your day and route
                </span>
              </span>
              <button
                className="sg-toggle pressable"
                style={{ background: sageEnabled ? 'var(--ac)' : 'var(--ln)' }}
                role="switch"
                aria-checked={sageEnabled}
                aria-label="Sage suggestions"
                onClick={() => setSageEnabled(!sageEnabled)}
              >
                <span
                  className="sg-toggle-knob"
                  style={{
                    display: 'block',
                    transform: sageEnabled ? 'translateX(20px)' : 'translateX(0)',
                  }}
                />
              </button>
            </div>
            <button className="sg-settings-row hoverable pressable">
              <span style={{ flex: 1 }}>
                <span style={{ display: 'block', fontSize: 14.5, fontWeight: 700 }}>Voice</span>
                <span style={{ display: 'block', fontSize: 12, color: 'var(--ink2)' }}>
                  Calm · softly spoken, fewer prompts
                </span>
              </span>
              <Icon name="chevron" size={16} stroke="var(--ink3)" strokeWidth={2.2} />
            </button>
          </div>

          <div className="sg-section-label" style={{ paddingBottom: 8 }}>
            General
          </div>
          <div className="sg-settings-card keep-borders">
            {(
              [
                { label: 'Voice & alerts', icon: 'volume' },
                { label: 'Offline maps', icon: 'download' },
                { label: 'Privacy & data', icon: 'shield' },
              ] as { label: string; icon: IconName }[]
            ).map((r) => (
              <button key={r.label} className="sg-settings-row general hoverable pressable">
                <Icon name={r.icon} size={18} stroke="var(--ink2)" />
                <span style={{ flex: 1, fontSize: 14.5, fontWeight: 600 }}>{r.label}</span>
                <Icon name="chevron" size={16} stroke="var(--ink3)" strokeWidth={2.2} />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
