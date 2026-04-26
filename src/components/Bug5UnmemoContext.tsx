// Bug 5 — Unmemoized Context provider.
// ThemeProvider creates a new value object on every render. Every consumer
// of ThemeContext re-renders even though the underlying state didn't change.
// In FloTrace: heatmap turns the consumer subtree red, render reason
// "context value reference changed", AI Review → Context tab suggests useMemo.

import { createContext, useContext, useState } from "react";

interface ThemeContextValue {
  mode: "light" | "dark";
  toggle: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("ThemeContext missing");
  return ctx;
}

export function Bug5UnmemoContext() {
  const [tick, setTick] = useState(0);

  return (
    <section className="bug">
      <span className="label">Bug 5 · Unmemoized context</span>
      <h2>Context value rebuilt on every commit</h2>
      <p className="description">
        Every render of <code>ThemeProvider</code> creates a new{" "}
        <code>{`{ mode, toggle }`}</code> object — so every consumer
        re-renders, even consumers that only read <code>mode</code>.
      </p>
      <div className="demo">
        <p className="kv">parent tick: {tick}</p>
        <ThemeProvider>
          <ThemedHeader />
          <ThemedFooter />
        </ThemeProvider>
        <button
          className="btn"
          style={{ marginTop: 12 }}
          onClick={() => setTick((t) => t + 1)}
        >
          Tick parent
        </button>
      </div>
    </section>
  );
}

function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<"light" | "dark">("dark");
  // BUG: new object every render — should be useMemo'd
  const value: ThemeContextValue = {
    mode,
    toggle: () => setMode((m) => (m === "dark" ? "light" : "dark")),
  };
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

function ThemedHeader() {
  const { mode, toggle } = useTheme();
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <span className="kv">ThemedHeader mode: {mode}</span>
      <button className="btn btn-secondary" onClick={toggle}>
        Toggle
      </button>
    </div>
  );
}

function ThemedFooter() {
  const { mode } = useTheme();
  return <p className="kv">ThemedFooter mode: {mode}</p>;
}
