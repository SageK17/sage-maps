# Sage Maps

A driving-first navigation app with a built-in assistant persona, **Sage** — built from the
v1 design handoff in `../design_handoff_sage_maps/` (the source of truth for every color,
measurement, copy string, and interaction).

## Run it

```bash
npm install
npm run dev        # http://localhost:5183
npm run build      # production build in dist/
```

- **Phone app** — `/` (best at 402×874; installs to the home screen as a PWA)
- **CarPlay screens** — `/carplay` (1280×480 day + night guidance)

## Stack & architecture

| Layer | Choice | Why |
|---|---|---|
| UI | React 18 + TypeScript + Vite | Production web/PWA build; the component tree ports 1:1 to React Native later |
| Map | **MapLibre GL** on OpenFreeMap vector tiles (no API key) | Real map SDK, fully styled to the handoff's day/night map palettes (`src/map/mapStyle.ts`) |
| Routing | **OSRM** public demo (alternatives + turn-by-turn steps) | Real routes, real street names, real maneuvers; offline fallback carries the handoff's canonical demo data |
| State | zustand (`src/state/store.ts`) | Matches the handoff's state model; persists `theme` + `sageEnabled` |

```
src/
  styles/        design tokens (both themes) + component CSS — values verbatim from the kit
  brand/         route-monogram (draw-in capable), Sage avatar, wordmark
  icons/         the full 28-icon set + maneuver arrows (paths verbatim from the kit)
  map/           MapLibre styles for both palettes; route/casing/traveled/chevron layers,
                 markers (puck, destination pin, gas pin, car), camera choreography
  services/      OSRM routing + CALM scoring + detour alternates; demo places DB
  sim/           turn-by-turn simulation: 250ms ticks, 40s full route, gas offer at 40%,
                 real OSRM reroute through Juniper Fuel on accept
  screens/       Splash, Home, Search, Route options, Nav, Arrival, Explore, Saved, You
  carplay/       1280×480 CarPlay guidance (day + night)
```

## Deliberate decisions (vs. the prototype)

The handoff says the `.dc.html` files are design references, not code to copy, and asks for a
real map SDK. Accordingly:

- **Real geography.** The illustrative SVG city is replaced by a live map (default: downtown
  Seattle; recenters via geolocation when granted). The demo places (Blue Fern Coffee, Juniper
  Fuel…) are anchored to real coordinates at the handoff's stated distances, so OSRM can route
  to all of them and search/list metadata is computed live.
- **Real route data.** Route titles, ETAs, condition chips, and CALM scores derive from OSRM
  responses. When OSRM returns fewer than three alternatives, real detour routes are computed
  via perpendicular waypoints so the options sheet always has choices. The handoff's canned
  routes ("Via Meridian Ave"…) live in the offline fallback.
- **Nav follows the selected route** (the prototype always drove one hard-coded polyline).
- **Night banner/toast/badge use ink-on-pale text** per the kit's night component specs —
  the prototype had a known low-contrast bug there (cream on pale green).
- **Dismissing the home Sage card is session-only.** The prototype's ✕ disabled Sage globally;
  the You-tab toggle is the global gate, per the README.
- **The ETA clock is the real clock** (the prototype anchored it to 9:41).
- CarPlay is a faithful static guidance screen (both themes, working buttons, the annotated
  12-second Sage-banner auto-dismiss implemented).

Everything else — tokens, type scale, radii, shadows, glass, motion curves and durations,
loading language (monogram draw-in, no spinners, route draw-in, chevron march, skeleton
shimmer, rotating wait copy), copy strings, and screen anatomy — follows the handoff verbatim.
