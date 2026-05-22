// Bug 17 — XMLHttpRequest coverage.
// Every other Network bug (4, 6, 7, 12) uses `fetch`. The runtime patches
// BOTH `fetch` AND `XMLHttpRequest` (see runtime/src/networkTracker.ts), so
// this Bug exists purely to exercise the XHR side of the patch.
// In FloTrace: Network panel shows the XHR requests alongside fetch — same
// status dots, same timing badges, same component attribution.

import { useState } from "react";

interface Result {
  label: string;
  status: "idle" | "loading" | "ok" | "error";
  detail: string;
  ms: number;
}

const initial: Result[] = [
  { label: "GET 200 via XHR", status: "idle", detail: "—", ms: 0 },
  { label: "POST via XHR", status: "idle", detail: "—", ms: 0 },
  { label: "404 via XHR", status: "idle", detail: "—", ms: 0 },
];

export function Bug17Xhr() {
  const [results, setResults] = useState<Result[]>(initial);

  const run = () => {
    setResults((rs) => rs.map((r) => ({ ...r, status: "loading", detail: "…" })));

    runXhr(0, "GET", "https://jsonplaceholder.typicode.com/posts/1", undefined, setResults);
    runXhr(
      1,
      "POST",
      "https://jsonplaceholder.typicode.com/posts",
      { title: "flotrace", body: "xhr-test", userId: 1 },
      setResults,
    );
    runXhr(2, "GET", "https://jsonplaceholder.typicode.com/this-does-not-exist", undefined, setResults);
  };

  return (
    <section className="bug">
      <span className="label">Bug 17 · XMLHttpRequest</span>
      <h2>XHR requests should appear in the Network panel alongside fetch</h2>
      <p className="description">
        The runtime patches both <code>fetch</code> and{" "}
        <code>XMLHttpRequest</code>. Bugs 4, 6, 7, 12 only exercise fetch — this
        one fires raw XHR so the Network panel's XHR code path actually runs.
        Same JSONPlaceholder endpoints as Bug 12 for parity.
      </p>
      <div className="demo">
        <button className="btn" onClick={run}>
          Fire 3 XHR requests
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

function runXhr(
  idx: number,
  method: "GET" | "POST",
  url: string,
  body: unknown,
  setResults: React.Dispatch<React.SetStateAction<Result[]>>,
): void {
  const t0 = performance.now();
  const xhr = new XMLHttpRequest();
  // `responseType = 'json'` is the path the runtime tags directly (see
  // runtime/src/networkTracker.ts — the XHR `responseType==='json'` branch
  // sets the API→Store correlation tag).
  xhr.responseType = "json";
  xhr.open(method, url);
  if (method === "POST") {
    xhr.setRequestHeader("Content-Type", "application/json");
  }

  const update = (patch: Partial<Result>) => {
    setResults((rs) => rs.map((r, i) => (i === idx ? { ...r, ...patch } : r)));
  };

  xhr.onload = () => {
    const ms = Math.round(performance.now() - t0);
    if (xhr.status >= 200 && xhr.status < 300) {
      update({ status: "ok", detail: `${xhr.status} ${shortBody(xhr.response)}`, ms });
    } else {
      update({ status: "error", detail: `HTTP ${xhr.status}`, ms });
    }
  };
  xhr.onerror = () => {
    update({
      status: "error",
      detail: "network error",
      ms: Math.round(performance.now() - t0),
    });
  };

  xhr.send(body ? JSON.stringify(body) : null);
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

function shortBody(v: unknown): string {
  if (v == null) return "";
  if (typeof v === "string") return v.length > 40 ? `${v.slice(0, 40)}…` : v;
  if (typeof v === "object") {
    const obj = v as Record<string, unknown>;
    if ("id" in obj) return `id=${String(obj.id)}`;
    return Object.keys(obj).slice(0, 3).join(",");
  }
  return String(v);
}
