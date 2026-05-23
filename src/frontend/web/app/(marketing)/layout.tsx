import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { MarketingHeader } from "@/components/marketing/MarketingHeader";
import { MobileCtaBar } from "@/components/marketing/MobileCtaBar";
import { LazyGuestChat } from "@/components/marketing/LazyGuestChat";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <MarketingHeader />
      <main className="pb-20 md:pb-0">{children}</main>
      <MarketingFooter />
      <MobileCtaBar />
      <LazyGuestChat />
    </>
  );
}
