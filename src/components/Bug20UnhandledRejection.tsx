// Bug 20 — an unhandled promise rejection.
// The other half of error capture: `window.onerror` never fires for these, so
// they need their own listener (`unhandledrejection`). Historically the single
// most-missed class of frontend bug, because nothing surfaces it by default.
// In FloTrace: Analysis tab shows an `unhandled_rejection` finding. Non-Error
// rejection reasons are serialized too — `throw 'string'` is legal JS.

import { useState } from 'react';

export function Bug20UnhandledRejection() {
  const [fired, setFired] = useState(0);

  const rejectWithError = () => {
    setFired((n) => n + 1);
    // No .catch() — this is the bug.
    void Promise.reject(new Error('Checkout total failed to reconcile'));
  };

  const rejectWithString = () => {
    setFired((n) => n + 1);
    // A non-Error rejection: serializeError() has to cope with any value.
    void Promise.reject('plain string rejection');
  };

  return (
    <div className="bug">
      <h3>Bug 20 · Unhandled promise rejection</h3>
      <p className="bug-desc">
        Rejects a promise with no handler. `window.onerror` never sees these — they need the
        dedicated `unhandledrejection` listener.
      </p>
      <button onClick={rejectWithError}>Reject with Error</button>{' '}
      <button onClick={rejectWithString}>Reject with string</button>
      <p style={{ color: '#9ca3af', fontSize: 13, marginTop: 8 }}>Fired {fired} time(s).</p>
    </div>
  );
}
