import Image from "next/image";

const VARIANTS = {
  nav: { height: 34, className: "brandLogo brandLogo--nav" },
  footer: { height: 40, className: "brandLogo brandLogo--footer" },
  hero: { height: 88, className: "brandLogo brandLogo--hero" },
  auth: { height: 64, className: "brandLogo brandLogo--auth" },
} as const;

type BrandLogoVariant = keyof typeof VARIANTS;

export default function BrandLogo({ variant }: { variant: BrandLogoVariant }) {
  const { height, className } = VARIANTS[variant];
  return (
    <Image
      src="/synlego-logo.png"
      alt="Synlego"
      width={Math.round(height * 1.15)}
      height={height}
      className={className}
      priority={variant === "hero" || variant === "nav"}
    />
  );
}
