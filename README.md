# FloTrace Playground

**16 React 19 debugging surfaces in one app. Open [FloTrace](https://flotrace.dev) and watch every panel light up.**

A deliberately broken React 19 + Vite app for evaluating [FloTrace](https://flotrace.dev) — the desktop debugger that shows you, live, what your React tree is doing.

Each surface lives in its own component file so you can pick one at a time, or scroll through and let them all run side-by-side.

## What's covered

| # | Demo | Group | What FloTrace catches |
|---|---|---|---|
| 1 | Render cascade across files | Render | Cascade tree, flame chart, render-frequency heatmap |
| 2 | Prop drilling 5 levels deep | Props | DFS chain detection, severity badges, recommendation card |
| 3 | Memo bypass via inline literal | Render | "prop reference changed" reason, props history, AI Memo tab |
| 4 | Duplicate API call on mount | Network (raw) | DUP badge, API → Zustand correlation arrows |
| 5 | Unmemoized Context provider | Props | Subtree-wide heatmap, "context value reference changed" |
| 6 | TanStack refetch storm | Network (TanStack) | Wasted-refetch warnings, state timeline, dedupe failures |
| 7 | Raw `useEffect + fetch` (no TanStack) | Network (raw) | Effect → fetch causal arrows, duplicate request markers |
| 8 | Redux burst dispatches + bad selector | State | Action timeline, slice change highlighting, selector reference warning |
| 9 | Effect foot-guns (stale closure + bad deps) | Effects | `willRun` warnings, dep diffing, stale-capture badge |
| 10 | Slow render (30 ms in render body) | Render | Heatmap red, "slow render" metric spike |
| 11 | Excessive render frequency (60 Hz) | Render | "Excessive renders" warning, top renderers panel |
| 12 | Network errors + slow API | Network (raw) | Status dot colors (green/red), slow-request timing badge |
| 13 | `useTransition` concurrent rendering | Concurrent | Concurrent-update signal, urgent vs transition split |
| 14 | `<Suspense>` + `React.lazy` | Concurrent | Suspense boundary subtree, fallback timing, chunk fetch |
| 15 | Router via History API | Routing | Route timeline, current pathname pill |
| 16 | Watch expression playground | State | Pin from Props / Hooks / Zustand / Redux |

## 2-minute setup

```bash
git clone https://github.com/flotrace-dev/playground.git
cd playground
npm install
npm run dev
```

Then [download FloTrace](https://flotrace.dev/download), launch it, and open [http://localhost:3003](http://localhost:3003). Your tree appears automatically.

## How it's wired

- **React 19 + Vite + TypeScript** — same stack you ship to prod.
- **`@flotrace/runtime`** — wired in [src/main.tsx](src/main.tsx) with `appName: "FloTrace Playground"`. Two Zustand stores, the Redux store, and the TanStack Query client are all passed in so every state-panel demo works.
- **Real public APIs** — [JSONPlaceholder](https://jsonplaceholder.typicode.com), [DummyJSON](https://dummyjson.com), and [GitHub Zen](https://api.github.com/zen). No backend, no API keys, CORS-friendly. See [src/api/jsonPlaceholder.ts](src/api/jsonPlaceholder.ts).
- **History API router** — a 14-line custom hook in [src/router/tinyRouter.tsx](src/router/tinyRouter.tsx). FloTrace's web router tracker patches History API directly, so no `react-router` dep is needed.
- Production-build of FloTrace runtime auto-disables; this playground only runs in dev (`npm run dev`).

## Project layout

```
src/
├── App.tsx                        Top-level layout, TOC nav, group sections
├── main.tsx                       React root + FloTraceProvider (Zustand × 2 + Redux + TanStack)
├── index.css                      Theme + TOC styling
├── api/
│   ├── jsonPlaceholder.ts         JSONPlaceholder + DummyJSON + GitHub real APIs
│   └── me.ts                      Local fake /api/me used by Bug 4
├── store/
│   ├── userStore.ts               Zustand — Bug 4
│   ├── counterStore.ts            Zustand — Bug 9 (effects) + Bug 16 (watch)
│   └── reduxStore.ts              Redux Toolkit cart + session slices — Bug 8
├── router/
│   └── tinyRouter.tsx             History-API hook — Bug 15
└── components/
    ├── Bug1Cascade.tsx            Render cascade
    ├── Bug2PropDrilling.tsx       Prop drilling 5-deep
    ├── Bug3MemoBypass.tsx         React.memo defeated by inline object
    ├── Bug4DuplicateApi.tsx       Two components, one /api/me
    ├── Bug5UnmemoContext.tsx      Context value rebuilt every commit
    ├── Bug6TanStackRefetch.tsx    Refetch storm — TanStack Query
    ├── Bug7RawFetch.tsx           Raw useEffect + fetch
    ├── Bug8ReduxBurst.tsx         Redux burst actions + bad selector
    ├── Bug9EffectBugs.tsx         Stale closure + always-changing deps
    ├── Bug10SlowRender.tsx        30 ms busy loop in render
    ├── Bug11ExcessiveRenders.tsx  60 Hz setState
    ├── Bug12NetworkErrors.tsx     200 / 404 / slow real fetches
    ├── Bug13UseTransition.tsx     React 19 useTransition
    ├── Bug14SuspenseLazy.tsx      Suspense + React.lazy
    ├── _LazyProductGrid.tsx       Lazy chunk for Bug 14
    ├── Bug15Router.tsx            History API navigation
    └── Bug16WatchDemo.tsx         Watch expressions playground
```

## Compare against your other tools

Try opening this app in [React DevTools](https://chromewebstore.google.com/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi) or [React Scan](https://github.com/aidenybai/react-scan) and see which surfaces appear — and which take five minutes of squinting at the profiler. The point of FloTrace is that every surface below shows up *visually*, *immediately*, *with an explanation of why*.

## Contributing

PRs adding more surfaces are welcome. The bar:

- Real production foot-gun (not a contrived corner case)
- Self-contained in a single component file
- Builds cleanly with `npm run typecheck`
- Add a row to the table above

Issues for FloTrace bugs go in the [main FloTrace repo](https://github.com/flotrace-dev). This repo is for playground content only.

## License

MIT.
