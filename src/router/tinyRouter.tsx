// 14-line client-side router — uses History API directly so FloTrace's web
// router tracker fires on every navigation. No react-router dep needed.

import { useEffect, useState, useCallback } from "react";

export function usePathname(): string {
  const [path, setPath] = useState(() =>
    typeof window === "undefined" ? "/" : window.location.pathname
  );

  useEffect(() => {
    const onChange = () => setPath(window.location.pathname);
    // pushState/replaceState don't dispatch popstate by default — patch them
    // once so any navigation (including ours) updates the hook.
    const origPush = history.pushState;
    const origReplace = history.replaceState;
    history.pushState = function (...args) {
      const result = origPush.apply(this, args);
      window.dispatchEvent(new PopStateEvent("popstate"));
      return result;
    };
    history.replaceState = function (...args) {
      const result = origReplace.apply(this, args);
      window.dispatchEvent(new PopStateEvent("popstate"));
      return result;
    };
    window.addEventListener("popstate", onChange);
    return () => {
      window.removeEventListener("popstate", onChange);
      history.pushState = origPush;
      history.replaceState = origReplace;
    };
  }, []);

  return path;
}

export function useNavigate() {
  return useCallback((to: string) => {
    if (window.location.pathname !== to) {
      window.history.pushState({}, "", to);
    }
  }, []);
}
