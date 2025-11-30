/** @format */

// Utility helpers to consistently resolve and encode redirect targets passed via auth query parameters.

type ParamsLike = {
  forEach: (callback: (value: string, key: string) => void) => void;
  toString?: () => string;
} | null | undefined;

const safeDecodeURIComponent = (value: string): string => {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
};

const sanitizeBasePath = (path: string): string => {
  if (/^https?:\/\//i.test(path) || path.startsWith("//")) {
    return "/";
  }
  if (!path || path === ".") {
    return "/";
  }
  return path.startsWith("/") ? path : `/${path.replace(/^\/*/, "")}`;
};

export const resolveRedirectTarget = (
  rawTarget: string | null | undefined,
  params: ParamsLike,
): string | null => {
  if (!rawTarget) {
    return null;
  }

  const decodedTarget = safeDecodeURIComponent(rawTarget);
  const questionIndex = decodedTarget.indexOf("?");
  const basePath = questionIndex >= 0 ? decodedTarget.slice(0, questionIndex) : decodedTarget;
  const initialQuery = questionIndex >= 0 ? decodedTarget.slice(questionIndex + 1) : "";

  const mergedParams = new URLSearchParams(initialQuery);

  if (params) {
    params.forEach((value, key) => {
      if (key === "from") {
        return;
      }
      if (!mergedParams.has(key)) {
        mergedParams.set(key, value);
      }
    });
  }

  const queryString = mergedParams.toString();
  const sanitizedPath = sanitizeBasePath(basePath);

  return queryString ? `${sanitizedPath}?${queryString}` : sanitizedPath;
};

export const encodeRedirectTarget = (target: string | null | undefined): string | undefined => {
  if (!target) {
    return undefined;
  }
  return encodeURIComponent(target);
};
