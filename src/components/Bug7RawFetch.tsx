// Bug 7 — Raw fetch / no TanStack Query.
// Two components that fetch the same /users/{id} via plain `useEffect + fetch`
// — the classic pattern most apps still ship. No dedupe, no cache, two GETs.
// In FloTrace: Network panel shows duplicate GETs to api.github.com/users/...,
// effects panel shows both useEffects rerunning, causal arrows trace each
// fetch back to the component that fired it.

import { useEffect, useState } from "react";
import { fetchUser, type PublicUser } from "../api/jsonPlaceholder";

export function Bug7RawFetch() {
  const [userId, setUserId] = useState(1);

  return (
    <section className="bug">
      <span className="label">Bug 7 · Raw fetch (no TanStack)</span>
      <h2>Two useEffect + fetch consumers, no dedupe</h2>
      <p className="description">
        <code>NameCard</code> and <code>EmailCard</code> independently call
        <code> fetchUser(id) </code>via raw <code>useEffect + fetch</code>. With
        no shared cache the network panel shows two requests for every id
        switch — the classic pattern FloTrace was built to surface.
      </p>
      <div className="demo">
        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          <button
            className="btn"
            onClick={() => setUserId((id) => (id % 10) + 1)}
          >
            Next user (id={userId})
          </button>
        </div>
        <NameCard userId={userId} />
        <EmailCard userId={userId} />
      </div>
    </section>
  );
}

function NameCard({ userId }: { userId: number }) {
  const [user, setUser] = useState<PublicUser | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchUser(userId).then((u) => {
      if (!cancelled) {
        setUser(u);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  return (
    <div className="kv">
      Name: {loading ? "loading..." : user?.name ?? "—"}{" "}
      <span className="muted">({user?.company.name ?? "—"})</span>
    </div>
  );
}

function EmailCard({ userId }: { userId: number }) {
  const [user, setUser] = useState<PublicUser | null>(null);

  useEffect(() => {
    fetchUser(userId).then(setUser);
  }, [userId]);

  return (
    <div className="kv">
      Email: {user?.email ?? "loading..."}{" "}
      <span className="muted">phone {user?.phone ?? "—"}</span>
    </div>
  );
}
