import { useApp } from '../state/store'
import { Icon, NavigateGlyph, ICON_PATHS } from '../icons'
import { SageAvatar } from '../brand/Monogram'
import { byId, SAVED_PLACES, etaLabel } from '../services/places'

const CHIPS = [
  { label: 'Coffee', q: 'coffee', icon: 'coffee' as const },
  { label: 'Gas', q: 'gas', icon: 'gas' as const },
  { label: 'Parking', q: 'parking', icon: 'parking' as const },
  { label: 'Grocery', q: 'grocery', icon: 'grocery' as const },
]

export function HomeOverlay() {
  const theme = useApp((s) => s.theme)
  const toggleTheme = useApp((s) => s.toggleTheme)
  const sageEnabled = useApp((s) => s.sageEnabled)
  const sageCardDismissed = useApp((s) => s.sageCardDismissed)
  const dismissSageCard = useApp((s) => s.dismissSageCard)
  const setScreen = useApp((s) => s.setScreen)
  const setQuery = useApp((s) => s.setQuery)
  const openRoutes = useApp((s) => s.openRoutes)
  const origin = useApp((s) => s.origin)

  const goSearch = (q: string) => {
    setQuery(q)
    setScreen('search')
  }
  const goPlace = (id: string) => {
    const p = byId(id)
    openRoutes({ id: p.id, name: p.name, addr: p.addr, pos: p.pos, cat: p.cat })
  }
  const goSaved = (id: string) => {
    const p = SAVED_PLACES.find((x) => x.id === id)!
    openRoutes({ id: p.id, name: p.name, addr: p.addr, pos: p.pos, cat: p.cat })
  }

  return (
    <>
      {/* Top cluster — search pill + category chips */}
      <div className="sg-top-cluster">
        <button className="sg-search-pill glass-16 pressable" onClick={() => goSearch('')}>
          <Icon name="search" size={21} stroke="var(--ac)" strokeWidth={2.2} />
          <span className="sg-search-placeholder">Where to, Alex?</span>
          <Icon name="micRound" size={20} stroke="var(--ink2)" style={{ marginRight: 6 }} />
          <span className="sg-avatar">A</span>
        </button>
        <div className="sg-chip-row">
          {CHIPS.map((c) => (
            <button key={c.q} className="sg-chip glass-12 pressable" onClick={() => goSearch(c.q)}>
              <Icon name={c.icon} size={15} stroke="var(--ac)" />
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Right FAB stack */}
      <div className="sg-fabs">
        <button
          className="sg-fab glass-12 pressable"
          title="Toggle day / night"
          onClick={toggleTheme}
        >
          {theme === 'day' ? (
            <Icon name="night" size={18} stroke="var(--ink)" />
          ) : (
            <Icon name="sunFab" size={19} stroke="var(--ink)" />
          )}
        </button>
        <button className="sg-fab glass-12 pressable" title="Map layers">
          <Icon name="layersFab" size={19} stroke="var(--ink)" />
        </button>
        <button className="sg-fab glass-12 pressable" title="Compass">
          <svg width={19} height={19} viewBox="0 0 24 24" aria-hidden="true">
            <circle cx={12} cy={12} r={9.5} fill="none" stroke="var(--ink)" strokeWidth={2} />
            <path d="M15.8 8.2 14 14 8.2 15.8 10 10Z" fill="var(--dgr)" />
          </svg>
        </button>
      </div>

      {/* Bottom sheet */}
      <div className="sg-home-sheet">
        <div className="sg-home-card">
          <div className="sg-grabber-wrap">
            <div className="sg-grabber" />
          </div>

          {sageEnabled && !sageCardDismissed && (
            <div className="sg-sage-card">
              <div className="sg-sage-head">
                <SageAvatar size={34} />
                <div>
                  <div className="sg-sage-name">
                    Sage
                    <span className="sg-presence" />
                  </div>
                  <div className="sg-sage-meta">knows your morning · 9:41</div>
                </div>
                <button className="sg-close-26 pressable" onClick={dismissSageCard} aria-label="Dismiss">
                  <Icon name="close" size={11} stroke="var(--ink3)" strokeWidth={2.4} />
                </button>
              </div>
              <div className="sg-sage-msg">
                Coffee before your 10:00? Blue Fern is quiet right now — six minutes ahead of your
                usual route.
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="sg-btn-primary pressable" onClick={() => goPlace('bluefern')}>
                  <NavigateGlyph size={13} fill="var(--on-accent)" />
                  Take me there
                </button>
                <button className="sg-btn-ghost pressable" onClick={dismissSageCard}>
                  Not today
                </button>
              </div>
            </div>
          )}

          <div className="sg-shortcuts">
            <button className="sg-shortcut pressable" onClick={() => goSaved('home')}>
              <Icon name="home" size={20} stroke="var(--acD)" />
              <div>
                <div className="sg-shortcut-title">Home</div>
                <div className="sg-shortcut-meta">
                  <span className="sg-live-dot" style={{ background: 'var(--ac)' }} />
                  {etaLabel(origin, SAVED_PLACES[0].pos)}
                </div>
              </div>
            </button>
            <button className="sg-shortcut pressable" onClick={() => goSaved('work')}>
              <Icon name="workTile" size={20} stroke="var(--acD)" />
              <div>
                <div className="sg-shortcut-title">Work</div>
                <div className="sg-shortcut-meta">
                  <span className="sg-live-dot" style={{ background: 'var(--warn)' }} />
                  {etaLabel(origin, SAVED_PLACES[1].pos)}
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
