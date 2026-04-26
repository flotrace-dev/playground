// Bug 3 — Memo bypass via inline literal.
// ExpensiveList is wrapped in React.memo, but the parent passes
// `options={{ sort: 'asc' }}` inline. Every parent commit creates a new
// object identity, so the memo is silently useless.
// In FloTrace: render reason "prop reference changed: options",
// AI Review → Memo tab flags it.

import { memo, useState } from "react";

const ITEMS = ["Alpha", "Bravo", "Charlie", "Delta", "Echo"];

export function Bug3MemoBypass() {
  const [tick, setTick] = useState(0);

  return (
    <section className="bug">
      <span className="label">Bug 3 · Memo bypass</span>
      <h2>React.memo defeated by an inline object literal</h2>
      <p className="description">
        Click &quot;Tick&quot; — only the parent state changed, but{" "}
        <code>ExpensiveList</code> still re-renders because{" "}
        <code>{`options={{ sort: 'asc' }}`}</code> is a new object every commit.
      </p>
      <div className="demo">
        <p className="kv">parent tick: {tick}</p>
        <ExpensiveList items={ITEMS} options={{ sort: "asc" }} />
        <button className="btn" onClick={() => setTick((t) => t + 1)}>
          Tick
        </button>
      </div>
    </section>
  );
}

interface ListOptions {
  sort: "asc" | "desc";
}

const ExpensiveList = memo(function ExpensiveList({
  items,
  options,
}: {
  items: string[];
  options: ListOptions;
}) {
  const sorted = [...items].sort((a, b) =>
    options.sort === "asc" ? a.localeCompare(b) : b.localeCompare(a)
  );
  return (
    <ul className="list" style={{ marginBottom: 12 }}>
      {sorted.map((it) => (
        <li key={it}>{it}</li>
      ))}
    </ul>
  );
});
