import Image from "next/image";
import Link from "next/link";

type LogoProps = {
  variant?: "full" | "icon";
  className?: string;
  href?: string;
};

export function Logo({ variant = "full", className = "", href = "/" }: LogoProps) {
  const src = variant === "icon" ? "/logo-icon.svg" : "/logo.svg";
  const width = variant === "icon" ? 40 : 200;
  const height = variant === "icon" ? 40 : 40;

  const img = (
    <Image
      src={src}
      alt="GardensSorted"
      width={width}
      height={height}
      className={className}
      priority={variant === "full"}
    />
  );

  if (!href) return img;
  return (
    <Link href={href} className="inline-flex shrink-0 items-center">
      {img}
    </Link>
  );
}
