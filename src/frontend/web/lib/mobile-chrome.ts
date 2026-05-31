/** Total height of the homepage fixed bottom CTA bar (matches MobileCtaBar). */
export const MOBILE_HOME_CTA_BAR_HEIGHT =
  "calc(0.75rem + 3rem + max(0.75rem, env(safe-area-inset-bottom)))";

/** Main content padding above the homepage CTA bar (Tailwind class fragment). */
export const MOBILE_HOME_MAIN_PADDING_CLASS =
  "max-md:pb-[calc(0.75rem+3rem+max(0.75rem,env(safe-area-inset-bottom)))]";

/** Mobile FAB on the left so it does not cover header menu / CTAs on the right. */
const GUEST_CHAT_FAB_MOBILE_X = "max-md:left-4 max-md:right-auto";

/** Guest chat FAB - just above the homepage CTA bar (full Tailwind position classes). */
export const GUEST_CHAT_FAB_CLASS_HOME =
  `fixed right-4 z-50 ${GUEST_CHAT_FAB_MOBILE_X} max-md:bottom-[calc(0.75rem+3rem+max(0.75rem,env(safe-area-inset-bottom))+0.75rem)] md:bottom-6`;

/** Signup sticky footer: back/continue row + log-in line + safe area (keep in sync with signup page footer). */
export const SIGNUP_MOBILE_STICKY_FOOTER_HEIGHT =
  "calc(0.75rem + 3rem + 0.75rem + 1.25rem + 1rem + max(0.75rem, env(safe-area-inset-bottom)))";

export const SIGNUP_MOBILE_BOTTOM_PADDING_CLASS =
  "max-md:pb-[calc(0.75rem+3rem+0.75rem+1.25rem+1rem+max(0.75rem,env(safe-area-inset-bottom)))]";

/** Signup wizard fixed footer - above sticky bar + safe area. */
export const GUEST_CHAT_FAB_CLASS_SIGNUP =
  `fixed right-4 z-50 ${GUEST_CHAT_FAB_MOBILE_X} max-md:bottom-[calc(0.75rem+3rem+0.75rem+1.25rem+1rem+max(0.75rem,env(safe-area-inset-bottom))+0.75rem)] md:bottom-6`;

export const GUEST_CHAT_FAB_CLASS_DEFAULT =
  `fixed right-4 z-50 ${GUEST_CHAT_FAB_MOBILE_X} max-md:bottom-[calc(1rem+env(safe-area-inset-bottom))] md:bottom-6`;

export function guestChatFabPosition(pathname: string): string {
  if (pathname === "/") return GUEST_CHAT_FAB_CLASS_HOME;
  if (pathname === "/signup") return GUEST_CHAT_FAB_CLASS_SIGNUP;
  return GUEST_CHAT_FAB_CLASS_DEFAULT;
}
