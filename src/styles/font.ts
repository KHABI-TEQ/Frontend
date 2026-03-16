/** @format */

/**
 * Font definitions. Fonts are loaded at runtime via <link> in layout.tsx
 * (Google Fonts) so the build does not need network access.
 * These exports match the previous next/font shape so existing usage (e.g. archivo.className) still works.
 */
const fontRobotoVar = "font-roboto-var";
const fontArchivoVar = "font-archivo-var";
const fontEpilogueVar = "font-epilogue-var";

export const roboto = {
  variable: fontRobotoVar,
  className: "font-[var(--font-roboto)]",
};

export const archivo = {
  variable: fontArchivoVar,
  className: "font-[var(--font-archivo)]",
};

export const epilogue = {
  variable: fontEpilogueVar,
  className: "font-[var(--font-epilogue)]",
};
