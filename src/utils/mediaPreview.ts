/** Turn Cloudinary (and similar) URLs into ones the browser can render inline. */

export function fileNameFromUrl(url: string): string {
  try {
    const name = decodeURIComponent(url.split("/").pop() || "");
    return name.split("?")[0] || "Document";
  } catch {
    return "Document";
  }
}

export function fileStem(name: string): string {
  const base = name.split(/[\\/]/).pop() || name;
  return base.replace(/\.[^.]+$/, "") || base;
}

export function isPdfSource(urlOrName: string): boolean {
  return /\.pdf(\?|$)/i.test(urlOrName);
}

export function isImageSource(urlOrName: string): boolean {
  return /\.(png|jpe?g|gif|webp|bmp|svg)(\?|$)/i.test(urlOrName);
}

export function toInlinePreviewUrl(url: string): string {
  if (!url) return url;
  let next = url.replace(/\/upload\/fl_attachment:?[^/]*\//, "/upload/");
  if (isPdfSource(next)) {
    next = next.replace("/image/upload/", "/raw/upload/");
  } else if (isImageSource(next) || /\/raw\/upload\//.test(next)) {
    next = next.replace("/raw/upload/", "/image/upload/");
  }
  return next;
}
