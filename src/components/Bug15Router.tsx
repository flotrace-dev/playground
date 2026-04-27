// Bug 15 — Router tracking via History API.
// A 12-line custom router (no react-router) drives nav via window.history.
// FloTrace's web router tracker patches History API directly, so every
// pushState fires a router event in the runtime — no library needed.
// In FloTrace: Router panel populates with the route timeline, current
// pathname pill in the toolbar updates live.

import { usePathname, useNavigate } from "../router/tinyRouter";

const ROUTES = ["/", "/playground/dashboard", "/playground/inbox", "/playground/settings"];

export function Bug15Router() {
  const path = usePathname();
  const navigate = useNavigate();

  return (
    <section className="bug">
      <span className="label">Bug 15 · Router tracking</span>
      <h2>History API navigation, no react-router</h2>
      <p className="description">
        Buttons below call <code>window.history.pushState</code>. FloTrace's
        web router tracker patches the History API at runtime, so the route
        timeline populates without any router library installed.
      </p>
      <div className="demo">
        <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
          {ROUTES.map((r) => (
            <button
              key={r}
              className={r === path ? "btn" : "btn btn-secondary"}
              onClick={() => navigate(r)}
            >
              {r}
            </button>
          ))}
        </div>
        <RouteContent path={path} />
      </div>
    </section>
  );
}

function RouteContent({ path }: { path: string }) {
  if (path === "/playground/dashboard") return <Dashboard />;
  if (path === "/playground/inbox") return <Inbox />;
  if (path === "/playground/settings") return <Settings />;
  return <Home />;
}

function Home() {
  return <p className="kv">Home — pick a route above to navigate.</p>;
}

function Dashboard() {
  return <p className="kv">Dashboard — pretend metrics live here.</p>;
}

function Inbox() {
  return <p className="kv">Inbox — 0 unread.</p>;
}

function Settings() {
  return <p className="kv">Settings — toggle prefs here.</p>;
}
