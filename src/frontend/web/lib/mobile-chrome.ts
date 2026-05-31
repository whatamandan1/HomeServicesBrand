/** Total height of the homepage fixed bottom CTA bar (matches MobileCtaBar). */
export const MOBILE_HOME_CTA_BAR_HEIGHT =
  "calc(0.75rem + 3rem + max(0.75rem, env(safe-area-inset-bottom)))";

/** Main content padding above the homepage CTA bar (Tailwind class fragment). */
export const MOBILE_HOME_MAIN_PADDING_CLASS =
  "max-md:pb-[calc(0.75rem+3rem+max(0.75rem,env(safe-area-inset-bottom)))]";

/** Signup sticky footer: back/continue row + log-in line + safe area (keep in sync with signup page footer). */
export const SIGNUP_MOBILE_STICKY_FOOTER_HEIGHT =
  "calc(0.75rem + 3rem + 0.75rem + 1.25rem + 1rem + max(0.75rem, env(safe-area-inset-bottom)))";

export const SIGNUP_MOBILE_BOTTOM_PADDING_CLASS =
  "max-md:pb-[calc(0.75rem+3rem+0.75rem+1.25rem+1rem+max(0.75rem,env(safe-area-inset-bottom)))]";

/**
 * Guest chat closed FAB. Use simple bottom offsets on mobile - nested calc()+max()
 * in arbitrary Tailwind classes fails on some Android browsers and leaves the FAB top-right.
 */
export function guestChatFabClosedClass(pathname: string): string {
  const shared =
    "fixed z-50 top-auto max-md:left-4 max-md:right-auto md:left-auto md:right-4 md:bottom-6";
  if (pathname === "/") return `${shared} max-md:bottom-28`;
  if (pathname === "/signup") return `${shared} max-md:bottom-32`;
  return `${shared} max-md:bottom-20`;
}

/** Open chat panel anchor (not the same as the closed FAB). */
export function guestChatPanelClass(): string {
  return "fixed z-50 top-auto max-md:inset-x-4 max-md:bottom-4 md:inset-auto md:left-auto md:right-4 md:bottom-6";
}

/** @deprecated Use guestChatFabClosedClass */
export function guestChatFabPosition(pathname: string): string {
  return guestChatFabClosedClass(pathname);
}
