import { useApp } from '../state/store'
import { Icon, ManeuverArrow, maneuverPath } from '../icons'
import { Monogram } from '../brand/Monogram'
import { formatManeuverDistance } from '../lib/geo'
import { endNav, acceptGasStop, skipGasStop, SPEED_LIMIT } from '../sim/navSim'

export function NavOverlay() {
  const nav = useApp((s) => s.nav)
  const gasOffer = useApp((s) => s.gasOffer)
  const toast = useApp((s) => s.toast)
  const sageEnabled = useApp((s) => s.sageEnabled)

  if (!nav) return null

  const note =
    gasOffer === 'accepted'
      ? 'via Juniper Fuel · Sage rerouted'
      : sageEnabled
        ? 'Sage is watching traffic for you'
        : 'On the calm route'

  return (
    <>
      {/* Maneuver banner */}
      <div className="sg-banner-wrap">
        <div className="sg-banner">
          <ManeuverArrow
            type={nav.man.type}
            modifier={nav.man.modifier}
            size={46}
            stroke="var(--on-deep)"
          />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="sg-banner-dist">{formatManeuverDistance(nav.distMeters)}</div>
            <div className="sg-banner-street">
              {nav.man.arrive ? nav.man.street : `onto ${nav.man.street}`}
            </div>
          </div>
          <div className="sg-lane-pips">
            <span className="sg-lane-pip" />
            <span className="sg-lane-pip correct" />
            <span className="sg-lane-pip" />
          </div>
        </div>
        {nav.next && (
          <div className="sg-then-pill glass-12">
            <span style={{ fontWeight: 600, color: 'var(--ink2)' }}>Then</span>
            <svg width={14} height={14} viewBox="0 0 24 24" aria-hidden="true">
              <path
                d={maneuverPath(nav.next.type, nav.next.modifier)}
                fill="none"
                stroke="var(--ink)"
                strokeWidth={2.4}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="ellipsis" style={{ maxWidth: 180 }}>
              {nav.next.street}
            </span>
          </div>
        )}
      </div>

      {/* Speed cluster */}
      <div className="sg-speed-cluster">
        <div className="sg-limit-badge">
          <div style={{ fontSize: 7.5, fontWeight: 800, letterSpacing: '0.06em', lineHeight: 1.2 }}>
            SPEED
            <br />
            LIMIT
          </div>
          <div className="t-num" style={{ fontSize: 20, fontWeight: 800, lineHeight: 1.1 }}>
            {SPEED_LIMIT}
          </div>
        </div>
        <div className={`sg-speed-pill${nav.over ? ' over' : ''}`}>
          <div className="t-num" style={{ fontSize: 16, fontWeight: 800, lineHeight: 1 }}>
            {nav.speed}
          </div>
          <div style={{ fontSize: 8.5, fontWeight: 700, letterSpacing: '0.08em', opacity: 0.75 }}>
            MPH
          </div>
        </div>
      </div>

      {/* Mid-drive Sage gas offer */}
      {gasOffer === 'shown' && (
        <div className="sg-gas-card-wrap">
          <div className="sg-gas-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 6 }}>
              <span
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  background: 'var(--goldT)',
                  border: '1px solid color-mix(in oklab, var(--gold), transparent 55%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Monogram size={17} stroke="var(--acD)" dot="var(--gold)" />
              </span>
              <span style={{ fontSize: 12.5, fontWeight: 800 }}>
                Sage
                <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink3)' }}>
                  {' '}
                  · spotted on route
                </span>
              </span>
            </div>
            <div
              className="t-sage"
              style={{ fontSize: 15.5, lineHeight: 1.4, color: 'var(--ink)', marginBottom: 11 }}
            >
              You're near a quarter tank. Juniper Fuel is $3.89 — forty seconds off this
              route.
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                className="sg-btn-primary pressable"
                style={{ fontSize: 13.5, boxShadow: 'none' }}
                onClick={acceptGasStop}
              >
                Add stop · +2 min
              </button>
              <button
                className="sg-btn-ghost pressable"
                style={{ fontSize: 13.5 }}
                onClick={skipGasStop}
              >
                Skip
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="sg-toast-wrap">
          <div className="sg-toast">
            <Icon name="check" size={15} stroke="var(--spark-on-deep)" strokeWidth={2.6} />
            {toast}
          </div>
        </div>
      )}

      {/* Bottom ETA bar */}
      <div className="sg-nav-bar glass-20">
        <button className="sg-end-btn pressable" onClick={endNav}>
          End
        </button>
        <div style={{ flex: 1, textAlign: 'center', minWidth: 0 }}>
          <div
            className="t-num"
            style={{ fontSize: 19, fontWeight: 800, letterSpacing: '-0.01em' }}
          >
            <span style={{ color: 'var(--ac)' }}>{nav.etaClock}</span>
            <span style={{ color: 'var(--ink3)', fontWeight: 600 }}> · </span>
            <span>{nav.etaMin} min</span>
            <span style={{ color: 'var(--ink3)', fontWeight: 600 }}> · </span>
            <span style={{ color: 'var(--ink2)', fontWeight: 700 }}>{nav.etaMi} mi</span>
          </div>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink2)', marginTop: 1 }}>
            {note}
          </div>
        </div>
        <button className="sg-sound-btn pressable" title="Sound">
          <Icon name="volume" size={19} stroke="var(--ink)" />
        </button>
      </div>
    </>
  )
}

export function ArrivalOverlay() {
  const dest = useApp((s) => s.dest)
  const sageEnabled = useApp((s) => s.sageEnabled)
  if (!dest) return null
  return (
    <div className="sg-arrival-scrim">
      <div className="sg-arrival-card">
        <div className="sg-check-circle">
          <Icon name="check" size={30} stroke="var(--acD)" strokeWidth={2.8} />
        </div>
        <div style={{ fontSize: 23, fontWeight: 800, letterSpacing: '-0.02em' }}>
          You've arrived
        </div>
        <div style={{ fontSize: 14, color: 'var(--ink2)', marginTop: 3 }}>
          {dest.name} · {dest.addr}
        </div>
        {sageEnabled && (
          <div
            className="t-sage"
            style={{
              fontSize: 15.5,
              lineHeight: 1.45,
              color: 'var(--ink2)',
              margin: '16px auto 0',
              maxWidth: 300,
            }}
          >
            Meridian Ave parking is free for two hours. I'll remind you at 11:30.
          </div>
        )}
        <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
          <button
            className="sg-btn-primary pressable"
            style={{ height: 52, fontSize: 16, fontWeight: 800, boxShadow: 'none' }}
            onClick={endNav}
          >
            Done
          </button>
          <button
            className="sg-btn-ghost sg-share-btn pressable"
            style={{
              height: 52,
              padding: '0 20px',
              background: 'var(--sf)',
              color: 'var(--ink)',
              fontSize: 15,
              fontWeight: 700,
            }}
            onClick={endNav}
          >
            Share ETA
          </button>
        </div>
      </div>
    </div>
  )
}
