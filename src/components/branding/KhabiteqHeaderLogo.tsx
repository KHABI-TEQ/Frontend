import {
  KHABITEQ_LOGO_ALT,
  KHABITEQ_LOGO_HEADER_CONTAINER,
  KHABITEQ_LOGO_SRC,
} from "@/constants/branding";

type KhabiteqHeaderLogoProps = {
  priority?: boolean;
  className?: string;
};

/** Native img avoids Next/Image SVG caching and serves the public SVG directly. */
export default function KhabiteqHeaderLogo({
  priority = false,
  className = "",
}: KhabiteqHeaderLogoProps) {
  return (
    <div className={`${KHABITEQ_LOGO_HEADER_CONTAINER.className} ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={KHABITEQ_LOGO_SRC}
        alt={KHABITEQ_LOGO_ALT}
        className="h-full w-full object-contain object-left"
        loading={priority ? "eager" : "lazy"}
        decoding="async"
      />
    </div>
  );
}
