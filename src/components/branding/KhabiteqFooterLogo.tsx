import {
  KHABITEQ_LOGO_ALT,
  KHABITEQ_LOGO_FOOTER,
  KHABITEQ_LOGO_FOOTER_SRC,
} from "@/constants/branding";

type KhabiteqFooterLogoProps = {
  className?: string;
};

/** Native img avoids Next/Image optimizer rejecting cache-bust query params in production. */
export default function KhabiteqFooterLogo({
  className = "",
}: KhabiteqFooterLogoProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={KHABITEQ_LOGO_FOOTER_SRC}
      alt={KHABITEQ_LOGO_ALT}
      width={KHABITEQ_LOGO_FOOTER.width}
      height={KHABITEQ_LOGO_FOOTER.height}
      className={`${KHABITEQ_LOGO_FOOTER.className} ${className}`.trim()}
      loading="lazy"
      decoding="async"
    />
  );
}
