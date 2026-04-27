// Bug 16 — Watch expression playground.
// Not really a "bug" — this exists so users can experiment with FloTrace's
// watch panel by pinning values from props, hooks, a Zustand store, and
// (if open) the Redux session slice. The nested objects are deliberately
// rich so dot-path resolution has interesting paths to follow.

import { useState } from "react";
import { useSelector } from "react-redux";
import { useCounterStore } from "../store/counterStore";
import type { RootState } from "../store/reduxStore";

interface Settings {
  theme: "dark" | "light";
  notifications: { email: boolean; push: boolean };
  recentSearches: string[];
  user: { id: number; profile: { name: string; tags: string[] } };
}

const INITIAL_SETTINGS: Settings = {
  theme: "dark",
  notifications: { email: true, push: false },
  recentSearches: ["react", "hooks", "memo"],
  user: { id: 7, profile: { name: "Ada", tags: ["admin", "beta"] } },
};

export function Bug16WatchDemo() {
  const count = useCounterStore((s) => s.count);
  const bumps = useCounterStore((s) => s.meta.bumps);
  const increment = useCounterStore((s) => s.increment);
  const bump = useCounterStore((s) => s.bump);
  const reset = useCounterStore((s) => s.reset);
  const [settings, setSettings] = useState<Settings>(INITIAL_SETTINGS);
  const sessionUserId = useSelector((s: RootState) => s.session.userId);

  return (
    <section className="bug">
      <span className="label">Bug 16 · Watch expression playground</span>
      <h2>Pin any value from any source</h2>
      <p className="description">
        This panel is intentionally noisy — try right-clicking any value in
        FloTrace&apos;s tree (Props, Hooks, Zustand <code>counterStore</code>,
        Redux <code>session</code>) and pinning it. Then use the buttons here to
        watch the pinned values change live.
      </p>
      <div className="demo">
        <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
          <button className="btn" onClick={increment}>
            counterStore.increment()
          </button>
          <button className="btn" onClick={() => bump(5)}>
            counterStore.bump(5)
          </button>
          <button className="btn btn-secondary" onClick={reset}>
            counterStore.reset()
          </button>
          <button
            className="btn btn-secondary"
            onClick={() =>
              setSettings((s) => ({
                ...s,
                theme: s.theme === "dark" ? "light" : "dark",
              }))
            }
          >
            toggle settings.theme
          </button>
          <button
            className="btn btn-secondary"
            onClick={() =>
              setSettings((s) => ({
                ...s,
                user: {
                  ...s.user,
                  profile: {
                    ...s.user.profile,
                    tags: [...s.user.profile.tags, `t${s.user.profile.tags.length}`],
                  },
                },
              }))
            }
          >
            push user.profile.tags
          </button>
        </div>
        <NestedConsumer settings={settings} count={count} bumps={bumps} sessionUserId={sessionUserId} />
      </div>
    </section>
  );
}

function NestedConsumer({
  settings,
  count,
  bumps,
  sessionUserId,
}: {
  settings: Settings;
  count: number;
  bumps: number;
  sessionUserId: number | null;
}) {
  return (
    <ul className="list">
      <li>
        <span className="kv">props.settings.theme = {settings.theme}</span>
      </li>
      <li>
        <span className="kv">
          props.settings.user.profile.name = {settings.user.profile.name}
        </span>
      </li>
      <li>
        <span className="kv">
          props.settings.user.profile.tags = [{settings.user.profile.tags.join(", ")}]
        </span>
      </li>
      <li>
        <span className="kv">counterStore.count = {count}</span>
      </li>
      <li>
        <span className="kv">counterStore.meta.bumps = {bumps}</span>
      </li>
      <li>
        <span className="kv">redux.session.userId = {sessionUserId ?? "—"}</span>
      </li>
    </ul>
  );
}
