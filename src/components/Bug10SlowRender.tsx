// Bug 10 — Slow render (heatmap red).
// SlowChild does ~30ms of synchronous work in its render body — well past the
// 16ms frame budget. FloTrace's per-component render-frequency heatmap colors
// the node red and the slow-render warning shows up in the metrics panel.
// Toggle the workload to see the heatmap calm down on the same node.

import { useState } from "react";

function busyWait(ms: number) {
  const end = performance.now() + ms;
  // eslint-disable-next-line no-empty
  while (performance.now() < end) {}
}

export function Bug10SlowRender() {
  const [tick, setTick] = useState(0);
  const [heavy, setHeavy] = useState(true);

  return (
    <section className="bug">
      <span className="label">Bug 10 · Slow render</span>
      <h2>30ms of sync work in the render body</h2>
      <p className="description">
        Each click to <em>Tick</em> re-renders <code>SlowChild</code>, which
        burns ~30ms in a busy loop — past the 16ms frame budget. FloTrace's
        heatmap turns the node red and the &quot;slow render&quot; metric
        spikes.
      </p>
      <div className="demo">
        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          <button className="btn" onClick={() => setTick((t) => t + 1)}>
            Tick (re-render)
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => setHeavy((h) => !h)}
          >
            {heavy ? "Disable" : "Enable"} 30ms workload
          </button>
        </div>
        <SlowChild tick={tick} heavy={heavy} />
      </div>
    </section>
  );
}

function SlowChild({ tick, heavy }: { tick: number; heavy: boolean }) {
  if (heavy) busyWait(30);
  return (
    <div className="kv">
      SlowChild rendered (tick={tick}, heavy={String(heavy)}) — 30ms blocking work
      ran inside render body.
    </div>
  );
}
