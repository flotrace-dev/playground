// Bug 23 — a cascade that ONLY happens on one route.
// This is the acceptance test for route segmentation. Every other playground bug
// renders everywhere, so a route filter would look correct while doing nothing.
// This one misbehaves exclusively under /users/:id, which also exercises the
// param-normalization heuristic (a numeric segment collapses to `:id`, so visits
// to /users/1 and /users/2 aggregate into ONE route key).
// In FloTrace: filter the Analysis tab to /users/:id and this cascade appears;
// filter to any other page and it does not.

import { useEffect, useState } from 'react';
import { useNavigate, usePathname } from '../router/tinyRouter';

function Row({ label, tick }: { label: string; tick: number }) {
  return (
    <li style={{ fontSize: 12 }}>
      {label} · {tick}
    </li>
  );
}

/** Ticks state at the top of a subtree, forcing every row to re-render. */
function ProfileDetail({ userId }: { userId: string }) {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 120);
    return () => clearInterval(id);
  }, []);

  return (
    <div>
      <p style={{ fontSize: 13, color: '#9ca3af' }}>Viewing user {userId}</p>
      <ul>
        {Array.from({ length: 12 }, (_, i) => (
          <Row key={i} label={`Field ${i}`} tick={tick} />
        ))}
      </ul>
    </div>
  );
}

export function Bug23RouteScopedCascade() {
  const pathname = usePathname();
  const navigate = useNavigate();
  const match = /^\/users\/(\w+)$/.exec(pathname);

  return (
    <div className="bug">
      <h3>Bug 23 · Route-scoped cascade</h3>
      <p className="bug-desc">
        Only cascades under <code>/users/:id</code>. Visit two different ids — both aggregate under
        one route key.
      </p>
      <button onClick={() => navigate('/users/1')}>Go to /users/1</button>{' '}
      <button onClick={() => navigate('/users/2')}>Go to /users/2</button>{' '}
      <button onClick={() => navigate('/')}>Back to /</button>
      <div style={{ marginTop: 12 }}>
        {match ? (
          <ProfileDetail userId={match[1]} />
        ) : (
          <p style={{ color: '#9ca3af', fontSize: 13 }}>
            Idle — this bug is quiet on {pathname}. Navigate to /users/1 to start the cascade.
          </p>
        )}
      </div>
    </div>
  );
}
