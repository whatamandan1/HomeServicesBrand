import { useEffect } from "react";

function releaseBodyScrollLock() {
  const { style } = document.body;
  if (style.position !== "fixed") return;

  const scrollY = Math.abs(Number.parseInt(style.top || "0", 10)) || window.scrollY;
  style.position = "";
  style.top = "";
  style.left = "";
  style.right = "";
  style.width = "";
  style.overflow = "";
  window.scrollTo(0, scrollY);
}

/** Lock document scroll when mobile nav (or similar) is open - avoids iOS overflow:hidden scroll bugs. */
export function useBodyScrollLock(locked: boolean) {
  useEffect(() => {
    if (!locked) {
      releaseBodyScrollLock();
      return;
    }

    const scrollY = window.scrollY;
    const { style } = document.body;

    style.position = "fixed";
    style.top = `-${scrollY}px`;
    style.left = "0";
    style.right = "0";
    style.width = "100%";
    style.overflow = "hidden";

    return () => {
      releaseBodyScrollLock();
    };
  }, [locked]);
}
