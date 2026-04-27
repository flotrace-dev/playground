// Bug 9 — Effect foot-guns.
// Two classic useEffect bugs in one place:
//   (a) Stale closure: setInterval captures count=0 forever because the dep
//       array is empty.
//   (b) Always-changing deps: the effect depends on an inline object, so it
//       re-runs every render even when the data didn't change.
// In FloTrace: Effects panel shows willRun on every commit, dep diffing
// highlights the unstable identity, plus a "stale dep captured" warning on
// the closure.

import { useEffect, useRef, useState } from "react";

export function Bug9EffectBugs() {
  const [tick, setTick] = useState(0);
  const [enabled, setEnabled] = useState(false);

  return (
    <section className="bug">
      <span className="label">Bug 9 · Effect foot-guns</span>
      <h2>Stale closures and always-changing deps</h2>
      <p className="description">
        Two effect bugs in one tree: a <code>setInterval</code> with empty deps
        captures a stale <code>count</code>, and an effect with an{" "}
        <code>{`{ filter }`}</code> object dep re-runs on every render. Hit{" "}
        <em>Start</em> to enable.
      </p>
      <div className="demo">
        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          <button
            className="btn"
            onClick={() => setEnabled((e) => !e)}
          >
            {enabled ? "Stop" : "Start"} interval
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => setTick((t) => t + 1)}
          >
            Re-render parent (tick={tick})
          </button>
        </div>
        {enabled && <StaleClosure />}
        <UnstableDep parentTick={tick} />
      </div>
    </section>
  );
}

function StaleClosure() {
  const [count, setCount] = useState(0);
  const seenRef = useRef<number[]>([]);

  useEffect(() => {
    const id = setInterval(() => {
      // BUG: `count` here is captured from the first render — always 0.
      seenRef.current = [...seenRef.current.slice(-4), count];
      setCount((c) => c + 1); // works — but the *log* line above is stale
    }, 700);
    return () => clearInterval(id);
    // BUG: missing `count` from dep array
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="kv">
      Counter: {count} · stale snapshots seen: [{seenRef.current.join(", ")}]
    </div>
  );
}

function UnstableDep({ parentTick }: { parentTick: number }) {
  // Ref instead of state so the effect can re-run on every parent commit
  // (the bug we want to demo) without triggering its own re-render — that
  // would form a render→effect→setState→render loop and peg the CPU.
  const runsRef = useRef(0);
  // BUG: `{ filter }` is a fresh object every render, so the effect re-runs.
  const config = { filter: "active", parentTick };

  useEffect(() => {
    runsRef.current += 1;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config]);

  return (
    <div className="kv">
      UnstableDep effect runs: {runsRef.current} · last config={JSON.stringify(config)}{" "}
      <span className="muted">(re-render parent to bump)</span>
    </div>
  );
}
