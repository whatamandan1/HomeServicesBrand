import Image from "next/image";

type HeroImageProps = {
  className?: string;
  /** Full-width banner below copy (Option A editorial hero). */
  variant?: "default" | "editorial";
};

export function HeroImage({ className = "", variant = "default" }: HeroImageProps) {
  if (variant === "editorial") {
    return (
      <div className={`relative w-full overflow-hidden rounded-2xl ${className}`}>
        <div className="relative aspect-[4/3] sm:aspect-[16/9] md:aspect-[21/9] md:max-h-[420px]">
          <Image
            src="/hero-garden.jpg"
            alt="Well-maintained Yorkshire garden with green lawn and flower borders"
            fill
            className="object-cover"
            sizes="100vw"
            priority
          />
        </div>
      </div>
    );
  }

  return (
    <div className={`relative mx-auto w-full max-w-lg ${className}`}>
      <div className="relative aspect-[4/3] max-h-[280px] overflow-hidden rounded-2xl shadow-2xl ring-1 ring-white/20 sm:max-h-none">
        <Image
          src="/hero-garden.jpg"
          alt="Well-maintained Yorkshire garden with green lawn and flower borders"
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 512px"
          priority
        />
      </div>
    </div>
  );
}
