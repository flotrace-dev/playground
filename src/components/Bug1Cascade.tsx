// Bug 1 — Render cascade across files.
// Typing in the filter input updates state at the top of the tree.
// Every descendant re-renders on every keystroke — Layout → Page → List → Row × N.
// In FloTrace: Cascade tree shows the trigger fanning out into 60+ commits.

import { useState } from "react";

const ROWS = Array.from({ length: 12 }, (_, i) => ({
  id: i,
  name: `Item ${i + 1}`,
}));

export function Bug1Cascade() {
  const [filter, setFilter] = useState("");
  return (
    <section className="bug">
      <span className="label">Bug 1 · Render cascade</span>
      <h2>One state change re-renders the whole tree</h2>
      <p className="description">
        Type below. Every keystroke re-renders Layout → Page → List → 12 Rows
        because <code>filter</code> lives at the top and nothing is memoized.
      </p>
      <div className="demo">
        <Layout filter={filter} onChange={setFilter} />
      </div>
    </section>
  );
}

function Layout({
  filter,
  onChange,
}: {
  filter: string;
  onChange: (v: string) => void;
}) {
  return <Page filter={filter} onChange={onChange} />;
}

function Page({
  filter,
  onChange,
}: {
  filter: string;
  onChange: (v: string) => void;
}) {
  return (
    <>
      <input
        placeholder="Type to trigger the cascade..."
        value={filter}
        onChange={(e) => onChange(e.target.value)}
        style={{ width: "100%", marginBottom: 12 }}
      />
      <List filter={filter} />
    </>
  );
}

function List({ filter }: { filter: string }) {
  const items = ROWS.filter((r) =>
    r.name.toLowerCase().includes(filter.toLowerCase())
  );
  return (
    <ul className="list">
      {items.map((r) => (
        <Row key={r.id} name={r.name} />
      ))}
    </ul>
  );
}

function Row({ name }: { name: string }) {
  return <li>{name}</li>;
}
