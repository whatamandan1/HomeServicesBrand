export type CookieConsentChoice = "all" | "essential";

const STORAGE_KEY = "sorted_cookie_consent";
const STORAGE_VERSION = 1;

export type StoredCookieConsent = {
  version: number;
  choice: CookieConsentChoice;
  updatedAt: string;
};

export function readCookieConsent(): StoredCookieConsent | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredCookieConsent;
    if (parsed.version !== STORAGE_VERSION || !parsed.choice) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function writeCookieConsent(choice: CookieConsentChoice): StoredCookieConsent {
  const value: StoredCookieConsent = {
    version: STORAGE_VERSION,
    choice,
    updatedAt: new Date().toISOString(),
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  window.dispatchEvent(new CustomEvent("sorted-cookie-consent", { detail: value }));
  return value;
}

export function allowsMarketingCookies(consent: StoredCookieConsent | null): boolean {
  return consent?.choice === "all";
}
