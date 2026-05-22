import Link from "next/link";
import { Logo } from "@/components/marketing/Logo";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header className="border-b border-gardens-primary/10 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <Logo />
          <nav className="flex gap-4 text-sm text-stone-600">
            <Link href="/portal" className="hover:text-gardens-primary">Portal</Link>
            <Link href="/login" className="hover:text-gardens-primary">Switch account</Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
    </>
  );
}
