# SmartRide+

SmartRide+ is a public-transport planning prototype built for the MLSC Hackathon 2025. It combines local Delhi GTFS static data with a Next.js interface. The bus feed currently uses generated positions and occupancy values; it does not provide verified live vehicle tracking.

## Status

| Area | Status |
| --- | --- |
| GTFS stop and route browsing | Implemented from the checked-in static feed |
| Bus positions, speed, ETA, occupancy and crowd level | Simulated; values are generated in the buses API |
| Route optimization | Dijkstra implementation exists; route inputs and traffic/crowd data are not verified live data |
| Emergency services | Google Places server route exists when `GOOGLE_PLACES_API_KEY` is configured; otherwise it returns mock San Francisco entries |
| Delhi OTD live feed | Not configured; access, credential, and integration are still required |
| Firebase crowd reporting and persistent data | Configuration-dependent; not verified in this audit |
| Deployment | A Vercel URL is listed below; deployment health and provider configuration were not verified |

This is a prototype, not an emergency response service or a production transit information system. Do not rely on simulated vehicle, crowd, ETA, or emergency data for real-world decisions.

## Architecture

- Next.js App Router and TypeScript provide the UI and API routes.
- `src/app/api/buses/route.ts` generates sample bus state and can draw stop/route labels from the local GTFS parser. Generated coordinates, speeds, occupancy, and ETAs are not observed vehicle telemetry.
- `src/lib/algorithms/dijkstra.ts` implements a weighted shortest-path graph.
- `src/app/api/emergency/nearby/route.ts` uses a server-side Google Places key when configured and otherwise returns mock locations.
- `gtfs/` contains static feed files. The Delhi OTD GTFS-Realtime integration is not enabled.

## Run locally

Requirements: Node.js 18 or newer and npm.

```bash
git clone https://github.com/007-SARANG/smartride-plus.git
cd smartride-plus
npm ci
cp .env.example .env.local
npm run dev
```

Set only the provider values you have configured in `.env.local`. Browser-visible variables prefixed with `NEXT_PUBLIC_` are public; never put a private credential in one. Mapbox may be needed for map rendering. Google Places requests use the server-side `GOOGLE_PLACES_API_KEY`. Firebase variables are required only for the Firebase paths enabled by the app. Delhi OTD variables do not enable live tracking by themselves: the feed integration and approved access must also be completed.

Open `http://localhost:3000`.

## Checks

```bash
npm run type-check
npm run lint
npm run build
```

The repository currently has no automated test suite or CI workflow. Dependency installation completed during this audit; npm reported 42 advisories (1 low, 17 moderate, 21 high, 3 critical). Review and update dependencies deliberately before deployment.

## Deployment

The README previously listed [smartride-plus.vercel.app](https://smartride-plus.vercel.app) as a demo. Its current availability and environment configuration were not verified as part of this audit.

## Limitations and next steps

- Connect and validate an approved Delhi OTD feed before describing bus locations as live.
- Replace generated occupancy, crowd, speed, and ETA values with sourced data or label them as simulation in the UI.
- Configure Firebase and verify persistence before claiming crowd reports are shared or historical.
- Replace mock emergency fallback behavior with an explicit unavailable state; mock San Francisco locations are unsafe for a Delhi safety workflow.
- Add automated tests for routing, API validation, and the simulated/live data-source boundary.
- Add CI, a license, and a maintained dependency update process.
