import { AppHeader } from "@/components/marketing/AppHeader";
import { ImpersonationBanner } from "@/components/admin/ImpersonationBanner";
import "leaflet/dist/leaflet.css";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ImpersonationBanner />
      <AppHeader />
      <main className="mx-auto max-w-5xl px-4 py-6 md:py-8">{children}</main>
    </>
  );
}
