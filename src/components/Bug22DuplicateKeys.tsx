// Bug 22 — duplicate React keys.
// Perfect-precision signal: React itself detects it, so there are no false
// positives. Causes silent state-mixing bugs between siblings that are very
// hard to diagnose from symptoms alone.
// In FloTrace: with the JSX runtime opt-in, `duplicate_key` findings carry the
// exact call site. Without it, the React warning is still captured via the
// error tracker's warning whitelist.

import { useState } from 'react';

const DUPLICATED = [
  { id: 1, name: 'Alpha' },
  { id: 1, name: 'Beta' }, // same id — the bug
  { id: 2, name: 'Gamma' },
];

export function Bug22DuplicateKeys() {
  const [show, setShow] = useState(false);

  return (
    <div className="bug">
      <h3>Bug 22 · Duplicate list keys</h3>
      <p className="bug-desc">
        Two siblings share `key=1`. React keeps the first and mixes state between them on reorder.
      </p>
      <button onClick={() => setShow((v) => !v)}>
        {show ? 'Hide list' : 'Render duplicate keys'}
      </button>
      {show && (
        <ul style={{ fontSize: 13, marginTop: 8 }}>
          {DUPLICATED.map((item) => (
            <li key={item.id}>{item.name}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
