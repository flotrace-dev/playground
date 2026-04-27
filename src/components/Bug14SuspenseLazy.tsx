// Bug 14 — Suspense boundary + React.lazy.
// `LazyProductGrid` is code-split via React.lazy and waits on a real network
// fetch via TanStack Query's `useSuspenseQuery`. The parent wraps it in
// <Suspense> with a fallback. In FloTrace the Suspense boundary appears as
// its own subtree, the concurrent-update signal fires when the boundary
// resolves, and the network panel shows the dummyjson.com request.

import { lazy, Suspense, useState } from "react";

const LazyProductGrid = lazy(() => import("./_LazyProductGrid"));

export function Bug14SuspenseLazy() {
  const [show, setShow] = useState(false);

  return (
    <section className="bug">
      <span className="label">Bug 14 · Suspense + React.lazy</span>
      <h2>Code-split route, suspended on a real network fetch</h2>
      <p className="description">
        <code>LazyProductGrid</code> is loaded with <code>React.lazy</code> and
        suspends on <code>useSuspenseQuery</code> against{" "}
        <code>dummyjson.com/products</code>. FloTrace shows the Suspense
        boundary as a distinct subtree and lights up the concurrent-update
        signal when it resolves.
      </p>
      <div className="demo">
        <button
          className="btn"
          onClick={() => setShow((s) => !s)}
          style={{ marginBottom: 12 }}
        >
          {show ? "Hide" : "Load"} grid
        </button>
        {show && (
          <Suspense fallback={<p className="muted">Loading product grid…</p>}>
            <LazyProductGrid />
          </Suspense>
        )}
      </div>
    </section>
  );
}
