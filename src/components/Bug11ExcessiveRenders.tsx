// Bug 11 — Excessive render frequency (high-frequency state churn).
// A `setInterval(setState, 16)` drives setState at ~60fps. FloTrace's render
// frequency metric jumps into the "excessive renders" tier and the node
// flash-animation goes constant. Off by default — flip the switch to start.

import { useEffect, useState } from "react";

export function Bug11ExcessiveRenders() {
  const [enabled, setEnabled] = useState(false);
  const [hz, setHz] = useState(60);

  return (
    <section className="bug">
      <span className="label">Bug 11 · Excessive render frequency</span>
      <h2>60 setState calls per second</h2>
      <p className="description">
        <code>FastTicker</code> calls <code>setState</code> on a{" "}
        <code>setInterval</code> at {hz}Hz. FloTrace logs the &quot;excessive
        renders&quot; warning, the node flashes constantly, and the top
        renderers panel pins it at #1.
      </p>
      <div className="demo">
        <div style={{ display: "flex", gap: 8, marginBottom: 12, alignItems: "center" }}>
          <button
            className="btn"
            onClick={() => setEnabled((e) => !e)}
          >
            {enabled ? "Stop" : "Start"} ticker
          </button>
          <label className="kv">
            Hz:{" "}
            <input
              type="number"
              value={hz}
              min={1}
              max={120}
              onChange={(e) => setHz(Number(e.target.value) || 1)}
              style={{ width: 60, marginLeft: 4 }}
            />
          </label>
        </div>
        {enabled ? <FastTicker hz={hz} /> : <p className="muted">Idle.</p>}
      </div>
    </section>
  );
}

function FastTicker({ hz }: { hz: number }) {
  const [n, setN] = useState(0);

  useEffect(() => {
    const period = Math.max(1, Math.round(1000 / hz));
    const id = setInterval(() => setN((v) => v + 1), period);
    return () => clearInterval(id);
  }, [hz]);

  return <div className="kv">FastTicker count: {n}</div>;
}
