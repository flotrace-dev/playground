// Bug 4 — Duplicate API call on mount.
// Two components fetch the same /api/me endpoint independently. Both succeed,
// nobody notices. The store gets two writes, the tree commits twice.
// In FloTrace: Network panel marks the second call DUP and the API → Store
// correlation arrows show the same Zustand slice updated by both fetches.

import { useEffect } from "react";
import { fetchMe } from "../api/me";
import { useUserStore } from "../store/userStore";

export function Bug4DuplicateApi() {
  return (
    <section className="bug">
      <span className="label">Bug 4 · Duplicate API call</span>
      <h2>Two components, one endpoint, two requests</h2>
      <p className="description">
        Both <code>HeaderBar</code> and <code>UserProfile</code> independently
        hit <code>/api/me</code> on mount. Reload to see two requests in
        FloTrace&apos;s Network panel.
      </p>
      <div className="demo">
        <HeaderBar />
        <hr style={{ border: 0, borderTop: "1px solid #1f2429", margin: "12px 0" }} />
        <UserProfile />
      </div>
    </section>
  );
}

function HeaderBar() {
  const user = useUserStore((s) => s.user);
  const setUser = useUserStore((s) => s.setUser);

  useEffect(() => {
    fetchMe().then(setUser);
  }, [setUser]);

  return (
    <div className="kv">
      HeaderBar greeting: {user ? `Welcome, ${user.name}` : "loading..."}
    </div>
  );
}

function UserProfile() {
  const profile = useUserStore((s) => s.profile);
  const setProfile = useUserStore((s) => s.setProfile);

  useEffect(() => {
    fetchMe().then(setProfile); // duplicate of HeaderBar's fetch
  }, [setProfile]);

  return (
    <div className="kv">
      UserProfile email: {profile ? profile.email : "loading..."}
    </div>
  );
}
