/** Khabiteq brand assets (trimmed for web — no excess square padding). */

/** Bump when the nav logo asset changes (cache-bust query param). */
export const KHABITEQ_LOGO_VERSION = "20260615-centered";

/** Header / nav — horizontal wordmark (icon + KHABI-TEQ, vertically centered). */
export const KHABITEQ_LOGO_PATH = "/khabi-logo-nav.svg";

/** Full URL with cache-bust version — use this in <img src>. */
export const KHABITEQ_LOGO_SRC = `${KHABITEQ_LOGO_PATH}?v=${KHABITEQ_LOGO_VERSION}`;

/** Favicon / compact icon (green K mark only, square). */
export const KHABITEQ_LOGO_ICON_SRC = "/khabiteq_logo_nobg.png";

/** Footer — white wordmark on dark green backgrounds */
export const KHABITEQ_LOGO_FOOTER_PATH = "/khabiteq-logo-footer-trimmed.png";

/** Full URL with cache-bust version — use in footer <img src>. */
export const KHABITEQ_LOGO_FOOTER_SRC = `${KHABITEQ_LOGO_FOOTER_PATH}?v=${KHABITEQ_LOGO_VERSION}`;

export const KHABITEQ_LOGO_ALT = "Khabiteq";

/** Fill-layout container for the main homepage nav logo */
export const KHABITEQ_LOGO_HEADER_CONTAINER = {
  className: "relative w-[140px] h-[28px] md:w-[180px] md:h-[32px] shrink-0",
} as const;

/** Header / nav logo — 169×36 horizontal SVG (icon + KHABI-TEQ) */
export const KHABITEQ_LOGO_HEADER_INLINE = {
  width: 169,
  height: 36,
  className:
    "md:w-[169px] md:h-[25px] w-[144px] h-[30px] object-contain object-left shrink-0",
} as const;

/** Footer logo (white text variant) */
export const KHABITEQ_LOGO_FOOTER = {
  width: 356,
  height: 101,
  className: "h-10 w-auto sm:h-11 md:h-12 max-w-[220px] object-contain",
} as const;

/** Compact contexts (admin sidebar, auth) */
export const KHABITEQ_LOGO_COMPACT = {
  width: 169,
  height: 36,
  className:
    "h-9 w-auto max-h-11 object-contain object-left sm:h-10 shrink-0",
} as const;
