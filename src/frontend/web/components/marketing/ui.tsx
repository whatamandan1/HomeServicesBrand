import Link from "next/link";
import type { ReactNode } from "react";

type ButtonProps = {
  href: string;
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  className?: string;
};

const variants = {
  primary: "bg-gardens-primary text-white hover:bg-gardens-dark shadow-soft",
  secondary: "bg-white text-gardens-dark border border-gardens-primary/20 hover:bg-gardens-light",
  ghost: "text-gardens-primary hover:bg-gardens-light",
};

export function Button({ href, children, variant = "primary", className = "" }: ButtonProps) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold transition ${variants[variant]} ${className}`}
    >
      {children}
    </Link>
  );
}

export function Section({
  id,
  title,
  subtitle,
  children,
  className = "",
}: {
  id?: string;
  title: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section id={id} className={`py-16 md:py-24 ${className}`}>
      <div className="mx-auto max-w-6xl px-4">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-semibold text-gardens-dark md:text-4xl">{title}</h2>
          {subtitle && <p className="mt-4 text-lg text-stone-600 text-balance">{subtitle}</p>}
        </div>
        <div className="mt-12">{children}</div>
      </div>
    </section>
  );
}
