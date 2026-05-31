/** Total height of the homepage fixed bottom CTA bar (matches MobileCtaBar). */
export const MOBILE_HOME_CTA_BAR_HEIGHT =
  "calc(0.75rem + 3rem + max(0.75rem, env(safe-area-inset-bottom)))";

/** Main content padding above the homepage CTA bar (Tailwind class fragment). */
export const MOBILE_HOME_MAIN_PADDING_CLASS =
  "max-md:pb-[calc(0.75rem+3rem+max(0.75rem,env(safe-area-inset-bottom)))]";

/** Signup sticky footer: back/continue row + log-in line + safe area (keep in sync with signup page footer). */
export const SIGNUP_MOBILE_STICKY_FOOTER_HEIGHT =
  "calc(0.75rem + 3rem + 0.75rem + 1.25rem + 1rem + max(0.75rem, env(safe-area-inset-bottom)))";

/** Space below signup content for the fixed mobile footer (also set in globals.css on [data-signup-wizard]). */
export const SIGNUP_MOBILE_WIZARD_PADDING_CLASS =
  "max-md:pb-[calc(0.75rem+3rem+0.75rem+1.25rem+1rem+2rem+max(0.75rem,env(safe-area-inset-bottom)))]";

/** CSS class modifiers for .guest-chat-fab (see globals.css). */
export function guestChatFabVariant(pathname: string): string {
  if (pathname === "/") return "guest-chat-fab--home";
  if (pathname === "/signup") return "guest-chat-fab--signup";
  return "guest-chat-fab--default";
}
