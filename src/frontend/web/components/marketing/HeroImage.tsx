import Image from "next/image";

export function HeroImage() {
  return (
    <div className="relative mx-auto w-full max-w-lg">
      <div className="relative aspect-[4/3] overflow-hidden rounded-2xl shadow-2xl ring-1 ring-white/20">
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
