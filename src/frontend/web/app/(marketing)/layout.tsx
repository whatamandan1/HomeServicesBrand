import { MarketingFooterSignupAware } from "@/components/marketing/MarketingFooterSignupAware";
import { MarketingHeader } from "@/components/marketing/MarketingHeader";
import { MarketingMain } from "@/components/marketing/MarketingMain";
import { MobileCtaBar } from "@/components/marketing/MobileCtaBar";
import { LazyGuestChat } from "@/components/marketing/LazyGuestChat";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <MarketingHeader />
      <MarketingMain>{children}</MarketingMain>
      <MarketingFooterSignupAware />
      <MobileCtaBar />
      <LazyGuestChat />
    </>
  );
}
