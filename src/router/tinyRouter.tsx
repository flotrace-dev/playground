// Tiny client-side router — uses the History API directly so FloTrace's web
// router tracker fires on every navigation. No react-router dep needed.
//
// The history patch is installed ONCE at module scope, not per hook call.
// It used to live inside `usePathname`'s effect, which meant every component
// calling the hook (App, Bug15Router, Bug23RouteScopedCascade) wrapped
// `history.pushState` again, and each cleanup restored the wrapper IT had
// captured. Mount/unmount in any order other than a perfect stack — which is
// exactly what route changes cause, since the route decides which components
// exist — reinstated a stale wrapper and grew the chain by a layer per
// navigation. Every layer re-dispatches `popstate`, so the duplicate render
// storm that produced looked like an app bug in the very tool being demoed.

import { useEffect, useState, useCallback } from 'react';

const subscribers = new Set<() => void>();

function notify(): void {
  for (const fn of subscribers) fn();
}

/**
 * Patch `history` once per page.
 *
 * `pushState`/`replaceState` do not dispatch `popstate`, so without this a
 * programmatic navigation would not update any subscriber. Never restored: the
 * patch's lifetime is the page's, and restoring it is precisely the operation
 * that was unsafe. The window flag keeps a Vite hot update from stacking a
 * second wrapper on top of the first.
 */
const PATCH_FLAG = '__flotracePlaygroundHistoryPatched';

function ensureHistoryPatched(): void {
  if (typeof window === 'undefined') return;
  const w = window as unknown as Record<string, unknown>;
  if (w[PATCH_FLAG]) return;
  w[PATCH_FLAG] = true;

  const origPush = history.pushState;
  const origReplace = history.replaceState;

  history.pushState = function (...args) {
    const result = origPush.apply(this, args);
    notify();
    return result;
  };
  history.replaceState = function (...args) {
    const result = origReplace.apply(this, args);
    notify();
    return result;
  };

  window.addEventListener('popstate', notify);
}

export function usePathname(): string {
  const [path, setPath] = useState(() =>
    typeof window === 'undefined' ? '/' : window.location.pathname,
  );

  useEffect(() => {
    ensureHistoryPatched();

    const onChange = () => setPath(window.location.pathname);
    subscribers.add(onChange);
    // Re-read on mount: a navigation between render and effect would be missed.
    onChange();

    return () => {
      subscribers.delete(onChange);
    };
  }, []);

  return path;
}

export function useNavigate() {
  return useCallback((to: string) => {
    if (window.location.pathname !== to) {
      window.history.pushState({}, '', to);
    }
  }, []);
}
