import { AppHeader } from "@/components/marketing/AppHeader";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AppHeader />
      <main className="mx-auto max-w-5xl px-4 py-6 md:py-8">{children}</main>
    </>
  );
}
