// Bug 21 — a slow interaction (INP), caused by React render work.
// 43% of sites fail the INP threshold, and it is the Core Web Vital most often
// blamed on the wrong layer. FloTrace can do what no RUM tool can: overlap the
// interaction's handler window against React commits and name the component
// (see shared/analysis/vitalsAttribution.ts).
// In FloTrace: Analysis tab shows "…ms click — SlowList re-rendered", with the
// React share of the total broken out.

import { useState } from 'react';

const ROWS = 1500;

/** Deliberately expensive: formats every row on every render, unmemoized. */
function SlowList({ filter }: { filter: string }) {
  const rows = [];
  for (let i = 0; i < ROWS; i++) {
    // Busy work per row so the commit is measurably long.
    const label = `Item ${i} · ${Math.sqrt(i).toFixed(6)} · ${filter}`;
    if (label.includes(filter)) rows.push(label);
  }
  return (
    <ul style={{ maxHeight: 120, overflow: 'auto', fontSize: 12, margin: '8px 0 0 0' }}>
      {rows.slice(0, 20).map((r) => (
        <li key={r}>{r}</li>
      ))}
    </ul>
  );
}

export function Bug21SlowInteraction() {
  const [filter, setFilter] = useState('Item');
  const [clicks, setClicks] = useState(0);

  const onClick = () => {
    // Synchronous state update forces the expensive commit inside the handler,
    // which is exactly what puts it in the INP window.
    setClicks((c) => c + 1);
    setFilter((f) => (f === 'Item' ? 'Item 1' : 'Item'));
  };

  return (
    <div className="bug">
      <h3>Bug 21 · Slow interaction (INP)</h3>
      <p className="bug-desc">
        A click handler that triggers a {ROWS}-row unmemoized render. FloTrace attributes the
        interaction time to the component responsible.
      </p>
      <button onClick={onClick}>Trigger slow click ({clicks})</button>
      <SlowList filter={filter} />
    </div>
  );
}
