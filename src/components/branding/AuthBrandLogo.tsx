import Link from "next/link";
import {
  KHABITEQ_LOGO_ALT,
  KHABITEQ_LOGO_NAV_WHITE_SRC,
  KHABITEQ_LOGO_SRC,
} from "@/constants/branding";

type AuthBrandLogoProps = {
  variant?: "onDark" | "onLight";
  className?: string;
};

export default function AuthBrandLogo({
  variant = "onDark",
  className = "",
}: AuthBrandLogoProps) {
  const onDark = variant === "onDark";
  return (
    <Link
      href="/"
      className={
        onDark
          ? `inline-flex items-center rounded-2xl bg-black/25 px-4 py-3 ${className}`
          : `inline-flex items-center ${className}`
      }
      aria-label="Khabiteq home"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={onDark ? KHABITEQ_LOGO_NAV_WHITE_SRC : KHABITEQ_LOGO_SRC}
        alt={KHABITEQ_LOGO_ALT}
        className="h-8 w-auto object-contain object-left sm:h-9"
        width={169}
        height={36}
      />
    </Link>
  );
}
