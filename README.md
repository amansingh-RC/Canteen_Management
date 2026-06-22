# Royal Chain — Canteen Management System (Admin)

Admin dashboard for a face-verification based canteen coupon system, built with
**Vite + React 19**, **Tailwind CSS v4**, and **shadcn/ui** components.

## Getting started

```bash
npm install
npm run dev      # start dev server
npm run build    # production build
npm run lint     # eslint
```

## Architecture

The app is organized so that **every feature is self-contained**. A feature owns
its page, its mock data file, and its service function — nothing else imports
across feature boundaries. Removing a feature is a localized change.

```
src/
├─ components/
│  ├─ ui/          # shadcn primitives (button, card, table, select, …)
│  ├─ layout/      # AppLayout, Sidebar, Topbar
│  ├─ shared/      # cross-feature pieces (KpiCard, StatusBadge, PageHeader, …)
│  └─ charts/      # dependency-free SVG/CSS charts
├─ config/         # navigation, site branding, meal/status vocab
├─ data/           # base mock datasets (deterministically generated)
├─ services/       # API layer — pages call these, never fetch directly
├─ hooks/          # useAsyncData (loading/error/poll), useTheme
├─ lib/            # cn(), formatting, seeded RNG, aggregations
├─ pages/          # one file per screen
└─ routes/         # route table (path → page)
```

### Dynamic, derived data

The data is **generated and derived**, not hardcoded:

- `data/users.js` generates a deterministic 1,420-user directory (seeded RNG in
  `lib/random.js`, so it's identical on every reload).
- `data/coupons.js` builds one coupon per user × meal from that list.
- Every summary metric (dashboard KPIs, charts, per-meal breakdown, face stats,
  live session counts) is **computed** from those two arrays via the pure
  helpers in `lib/aggregations.js` — so all screens always agree.

Two standard, API-shaped behaviors are built in so the swap to a real backend is
seamless:

- **Pagination** — `getUsers` / `getCoupons` accept `{ page, pageSize, …filters }`
  and return `{ items, total, page, pageSize, totalPages }` (see the `Pagination`
  component). Tables request one page at a time, just like a real endpoint.
- **Polling** — live screens pass `{ pollInterval }` to `useAsyncData`, which
  silently refetches in the background (no loading flicker). Live Monitoring and
  Face Verification stream fresh rows via the non-seeded `liveRng`.

### Adding or removing a feature

To **remove** a feature (e.g. "Bulk Upload"):

1. Comment out / delete its entry in [`src/config/navigation.js`](src/config/navigation.js) — removes it from the sidebar.
2. Comment out / delete its route in [`src/routes/index.jsx`](src/routes/index.jsx).
3. Delete its page (`src/pages/BulkUploadPage.jsx`), data (`src/data/bulkUpload.js`) and service (`src/services/bulkUploadService.js`).

No other feature is affected — there are no cross-feature imports.

### Wiring the real backend

Pages never call `fetch`. They call service functions in `src/services/*`, which
today return local mock data via `mockRequest()`.

To switch a feature to the real API:

1. Set environment variables (see [`.env.example`](.env.example)):
   ```
   VITE_API_BASE_URL=https://api.example.com
   VITE_USE_MOCK=false
   ```
2. In the relevant service file, replace the `mockRequest(...)` call with
   `apiRequest("/your/path", { ... })` from [`src/services/apiClient.js`](src/services/apiClient.js).

Because the mock data shape mirrors the expected API response, the consuming
pages don't change. You can migrate one feature at a time.

### Theming

Design tokens (brand, status colors, sidebar) live as CSS variables in
[`src/index.css`](src/index.css) and are exposed to Tailwind via `@theme inline`.
Change a color once there and it propagates everywhere. Dark mode toggles a
`.dark` class on `<html>` (managed by `useTheme`).
