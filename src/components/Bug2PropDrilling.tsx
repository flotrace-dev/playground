// Bug 2 — Prop drilling, 5 levels deep.
// `user` is passed through Layout → Page → Sidebar → Profile and only used
// at the bottom in Avatar. Refactoring is risky because the chain isn't visible.
// In FloTrace: DFS chain detection flags the drill, severity = high.

import { useState } from "react";

interface User {
  name: string;
  initials: string;
}

export function Bug2PropDrilling() {
  const [user, setUser] = useState<User>({ name: "Ada", initials: "AL" });
  return (
    <section className="bug">
      <span className="label">Bug 2 · Prop drilling</span>
      <h2>One value, threaded through 5 components</h2>
      <p className="description">
        <code>user</code> is handed from <code>App</code> to{" "}
        <code>Layout → Page → Sidebar → Profile → Avatar</code>. Only{" "}
        <code>Avatar</code> uses it.
      </p>
      <div className="demo">
        <Layout user={user} />
        <button
          className="btn btn-secondary"
          style={{ marginTop: 12 }}
          onClick={() =>
            setUser((u) =>
              u.name === "Ada"
                ? { name: "Grace", initials: "GH" }
                : { name: "Ada", initials: "AL" }
            )
          }
        >
          Toggle user
        </button>
      </div>
    </section>
  );
}

function Layout({ user }: { user: User }) {
  return <Page user={user} />;
}
function Page({ user }: { user: User }) {
  return <Sidebar user={user} />;
}
function Sidebar({ user }: { user: User }) {
  return <Profile user={user} />;
}
function Profile({ user }: { user: User }) {
  return <Avatar user={user} />;
}
function Avatar({ user }: { user: User }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: "50%",
          background: "#2563eb",
          color: "white",
          display: "grid",
          placeItems: "center",
          fontSize: 13,
          fontWeight: 600,
        }}
      >
        {user.initials}
      </div>
      <span>{user.name}</span>
    </div>
  );
}
