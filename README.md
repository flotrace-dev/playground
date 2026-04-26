# FloTrace Playground

**Five common React perf bugs in one app. Open [FloTrace](https://flotrace.dev) and watch every one light up.**

This is a deliberately broken React 19 + Vite app for evaluating [FloTrace](https://flotrace.dev) — the desktop debugger that shows you, live, what your React tree is doing.

Each bug is isolated to its own component so you can see them light up one at a time.

## The bugs

| # | Bug | What FloTrace catches |
|---|---|---|
| 1 | Render cascade across files | Cascade tree, flame chart, render-frequency heatmap |
| 2 | Prop drilling 5 levels deep | DFS chain detection, severity badges, refactor recommendation |
| 3 | Memo bypass via inline literal | "Prop reference changed" render reason, props history, AI Memo tab |
| 4 | Duplicate API call on mount | DUP badge in Network panel, API → Store correlation arrows |
| 5 | Unmemoized Context provider | Subtree-wide heatmap, "context value reference changed" reason |

## 2-minute setup

```bash
git clone https://github.com/flotracedev/playground.git
cd playground
npm install
npm run dev
```

Then [download FloTrace](https://flotrace.dev/download), launch it, and open [http://localhost:5173](http://localhost:5173). Your tree appears automatically.

## How it's wired

- **React 19 + Vite + TypeScript** — same stack you probably ship to prod.
- **`@flotrace/runtime`** — wired in [src/main.tsx](src/main.tsx) with `appName: "FloTrace Playground"`. Zustand store + TanStack Query client are passed in for state-panel demos.
- **No backend** — the `/api/me` "fetch" in [Bug 4](src/components/Bug4DuplicateApi.tsx) is a 400ms `setTimeout` in [src/api/me.ts](src/api/me.ts), but the runtime patches `fetch` so any real network call would show up too.
- Production-build of FloTrace runtime auto-disables; this playground only runs in dev (`npm run dev`).

## Project layout

```
src/
├── App.tsx                    Top-level layout, mounts each bug
├── main.tsx                   React root + FloTraceProvider
├── api/me.ts                  Fake /api/me endpoint
├── store/userStore.ts         Zustand store for Bug 4
└── components/
    ├── Bug1Cascade.tsx        Render cascade across files
    ├── Bug2PropDrilling.tsx   Prop drill, 5 levels
    ├── Bug3MemoBypass.tsx     React.memo bypassed by inline object
    ├── Bug4DuplicateApi.tsx   Two components, same /api/me call
    └── Bug5UnmemoContext.tsx  Context value rebuilt every commit
```

## Compare against your other tools

Try opening this app in [React DevTools](https://chromewebstore.google.com/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi) or [React Scan](https://github.com/aidenybai/react-scan) and see which bugs surface — and which take five minutes of squinting at the profiler. The point of FloTrace is that every bug below shows up *visually*, *immediately*, *with an explanation of why*.

## Contributing

PRs adding more bugs are welcome. The bar:

- Real production foot-gun (not a contrived corner case)
- Self-contained in a single component file
- Keeps the playground building cleanly with `npm run typecheck`
- Add a row to the table above

Issues for FloTrace bugs go in the [main FloTrace repo](https://github.com/flotracedev). This repo is for playground content only.

## License

MIT.
