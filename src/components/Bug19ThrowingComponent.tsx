// Bug 19 — an uncaught render error.
// Before the Live Analysis work the runtime could see everything about HOW an
// app rendered and nothing about how it FAILED. This exercises the new error
// tracker (runtime/src/errorTracker.ts).
// In FloTrace: Analysis tab shows a `critical` error finding with the stack's
// first frame as evidence. Errors carry no observation threshold — one throw is
// already proof, unlike a heuristic about avoidable re-renders.
//
// Wrapped in an ErrorBoundary so the rest of the playground survives the throw —
// which is exactly why the boundary has to report the error itself. React 19
// sends a boundary-CAUGHT error to `onCaughtError` (console.error by default),
// not to `window.onerror`; only an error that reaches no boundary is surfaced
// via `reportError()`. So a fixture that both catches and expects the window
// listener to fire tests nothing. `flotraceRecoverableErrorHandler` is the
// documented hook for exactly this case, and it is what a real app with
// boundaries would wire up.

import { Component, useState, type ErrorInfo, type ReactNode } from 'react';
import { flotraceErrorBoundaryHandler } from '@flotrace/runtime';

class Boundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Hand it to FloTrace explicitly — nothing else will.
    flotraceErrorBoundaryHandler(error, {
      componentStack: info.componentStack ?? undefined,
    });
    console.warn('[playground] boundary caught:', error.message, info.componentStack);
  }

  render() {
    if (this.state.failed) {
      return (
        <p style={{ color: '#f87171', fontSize: 13 }}>
          Boundary caught the error. Reload to arm it again.
        </p>
      );
    }
    return this.props.children;
  }
}

function Exploding({ armed }: { armed: boolean }) {
  if (armed) {
    // Reading a property off undefined — the single most common React crash.
    const config = undefined as unknown as { theme: { color: string } };
    return <span>{config.theme.color}</span>;
  }
  return <span style={{ color: '#9ca3af', fontSize: 13 }}>Not armed.</span>;
}

export function Bug19ThrowingComponent() {
  const [armed, setArmed] = useState(false);

  return (
    <div className="bug">
      <h3>Bug 19 · Uncaught render error</h3>
      <p className="bug-desc">
        Throws a TypeError during render. FloTrace captures it with its stack and surfaces it as a
        critical finding.
      </p>
      <button onClick={() => setArmed(true)}>Throw during render</button>
      <div style={{ marginTop: 12 }}>
        <Boundary>
          <Exploding armed={armed} />
        </Boundary>
      </div>
    </div>
  );
}
