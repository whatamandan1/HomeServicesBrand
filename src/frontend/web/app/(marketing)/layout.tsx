import { CookieConsent } from "@/components/marketing/CookieConsent";
import { MarketingAnalytics } from "@/components/marketing/MarketingAnalytics";
import { MarketingFooterSignupAware } from "@/components/marketing/MarketingFooterSignupAware";
import { MarketingHeader } from "@/components/marketing/MarketingHeader";
import { MarketingMain } from "@/components/marketing/MarketingMain";
import { MobileCtaBar } from "@/components/marketing/MobileCtaBar";
import { LazyGuestChat } from "@/components/marketing/LazyGuestChat";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-svh flex-col">
      <MarketingHeader />
      <MarketingMain>{children}</MarketingMain>
      <MarketingFooterSignupAware />
      <MobileCtaBar />
      <LazyGuestChat />
      <CookieConsent />
      <MarketingAnalytics />
    </div>
  );
}
