// Bug 13 — Concurrent rendering with React 19's useTransition.
// Typing in the input drives a heavy filter across 20k items. Without
// startTransition the input would lag; with it, React keeps the input
// responsive and shows the filtered list as a non-urgent update.
// In FloTrace: the concurrent-update signal lights up on every transition,
// the metrics panel splits "urgent" vs "transition" render time, and the
// React 19 panel marks the component as benefiting from the compiler.

import { useMemo, useState, useTransition } from "react";

const HAYSTACK = Array.from({ length: 20_000 }, (_, i) => `entry-${i.toString(36)}`);

export function Bug13UseTransition() {
  const [input, setInput] = useState("");
  const [filter, setFilter] = useState("");
  const [pending, startTransition] = useTransition();

  return (
    <section className="bug">
      <span className="label">Bug 13 · useTransition (React 19)</span>
      <h2>Heavy filter wrapped in a transition</h2>
      <p className="description">
        Typing updates the input synchronously (urgent) and schedules the
        20k-item filter as a transition. FloTrace surfaces the concurrent
        update signal and shows render time split into urgent vs transition.
      </p>
      <div className="demo">
        <input
          placeholder="Type to filter 20k entries…"
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            startTransition(() => setFilter(e.target.value));
          }}
          style={{ width: "100%", marginBottom: 12 }}
        />
        <p className="muted">Pending: {String(pending)}</p>
        <HeavyList query={filter} />
      </div>
    </section>
  );
}

function HeavyList({ query }: { query: string }) {
  const matches = useMemo(() => {
    if (!query) return HAYSTACK.slice(0, 10);
    return HAYSTACK.filter((s) => s.includes(query)).slice(0, 10);
  }, [query]);
  return (
    <ul className="list">
      {matches.map((m) => (
        <li key={m}>{m}</li>
      ))}
      {matches.length === 0 && <li className="muted">no matches</li>}
    </ul>
  );
}
