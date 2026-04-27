// Bug 12 — Network errors and slow requests.
// Hits three real endpoints in one click:
//   - jsonplaceholder.typicode.com/posts/1            (200, fast)
//   - jsonplaceholder.typicode.com/this-doesnt-exist  (404)
//   - jsonplaceholder.typicode.com/posts?_delay=2500  (200, ~2.5s)
// In FloTrace: Network panel renders green/red status dots, slow-request
// timing badge fires on the third call, method/URL/status all visible.

import { useState } from "react";
import { fetchPost, fetchBroken404, fetchSlow } from "../api/jsonPlaceholder";

interface Result {
  label: string;
  status: "idle" | "loading" | "ok" | "error";
  detail: string;
  ms: number;
}

const initial: Result[] = [
  { label: "200 fast", status: "idle", detail: "—", ms: 0 },
  { label: "404 broken", status: "idle", detail: "—", ms: 0 },
  { label: "200 slow (~2.5s)", status: "idle", detail: "—", ms: 0 },
];

export function Bug12NetworkErrors() {
  const [results, setResults] = useState<Result[]>(initial);

  const run = async () => {
    setResults((rs) => rs.map((r) => ({ ...r, status: "loading", detail: "…" })));
    const update = (idx: number, patch: Partial<Result>) =>
      setResults((rs) => rs.map((r, i) => (i === idx ? { ...r, ...patch } : r)));

    const time = async (idx: number, fn: () => Promise<unknown>) => {
      const t0 = performance.now();
      try {
        const data = await fn();
        update(idx, {
          status: "ok",
          detail: typeof data === "string" ? data : "ok",
          ms: Math.round(performance.now() - t0),
        });
      } catch (err) {
        update(idx, {
          status: "error",
          detail: (err as Error).message,
          ms: Math.round(performance.now() - t0),
        });
      }
    };

    // Fire all three in parallel — FloTrace's network panel groups them by
    // origin so the row order matches the order they resolve.
    await Promise.all([
      time(0, () => fetchPost(1).then((p) => `id=${p.id}`)),
      time(1, fetchBroken404),
      time(2, () => fetchSlow(2500).then((arr) => `${arr.length} posts`)),
    ]);
  };

  return (
    <section className="bug">
      <span className="label">Bug 12 · Network errors + slow requests</span>
      <h2>One click, three real requests, mixed outcomes</h2>
      <p className="description">
        Triggers a healthy GET, a 404, and a deliberately slow (~2.5s) GET
        against JSONPlaceholder. FloTrace's network panel shows status dots
        (green/red), method/URL, and a slow-request timing badge.
      </p>
      <div className="demo">
        <button className="btn" onClick={run}>
          Fire 3 requests
        </button>
        <ul className="list" style={{ marginTop: 12 }}>
          {results.map((r) => (
            <li key={r.label}>
              <span style={{ color: statusColor(r.status) }}>●</span>{" "}
              <strong>{r.label}</strong> — {r.detail}{" "}
              <span className="muted">({r.ms}ms)</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function statusColor(s: Result["status"]): string {
  switch (s) {
    case "ok":
      return "#34d399";
    case "error":
      return "#f87171";
    case "loading":
      return "#fbbf24";
    default:
      return "#6b7280";
  }
}
