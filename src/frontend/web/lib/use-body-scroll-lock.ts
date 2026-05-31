import { useEffect } from "react";

const LOCK_CLASS = "mobile-nav-open";

/** Prevent background scroll while a mobile overlay menu is open (no body position:fixed). */
export function useBodyScrollLock(locked: boolean) {
  useEffect(() => {
    const root = document.documentElement;
    if (locked) {
      root.classList.add(LOCK_CLASS);
      return () => {
        root.classList.remove(LOCK_CLASS);
      };
    }
    root.classList.remove(LOCK_CLASS);
  }, [locked]);

  useEffect(
    () => () => {
      document.documentElement.classList.remove(LOCK_CLASS);
    },
    []
  );
}
