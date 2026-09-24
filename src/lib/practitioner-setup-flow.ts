export const PRACTITIONER_SETUP_PATH = "/public-access-page/setup";
export const PRACTITIONER_SETUP_COMPLETE_PATH = "/public-access-page?setup=complete";

/** Linear first-time setup after slug creation. Matches sidebar order. */
export const PRACTITIONER_SETUP_STEPS = [
  "/public-access-page/branding",
  "/public-access-page/theme",
  "/public-access-page/home-page",
  "/public-access-page/featured",
  "/public-access-page/website-content",
  "/public-access-page/about",
  "/public-access-page/contact-us",
  "/public-access-page/social",
  "/public-access-page/faqs",
  "/public-access-page/custom-pages",
  "/public-access-page/navigation",
  "/public-access-page/preview",
  "/public-access-page/inspection",
  "/public-access-page/payment",
  "/public-access-page/subscribe-settings",
] as const;

export function nextPractitionerSetupPath(currentPath: string): string {
  const normalized = (currentPath || "").split("?")[0].replace(/\/$/, "") || "/";
  const index = PRACTITIONER_SETUP_STEPS.findIndex((step) => step === normalized);
  if (index === -1 || index >= PRACTITIONER_SETUP_STEPS.length - 1) {
    return PRACTITIONER_SETUP_COMPLETE_PATH;
  }
  return PRACTITIONER_SETUP_STEPS[index + 1];
}

export function markPractitionerSetupJustFinished() {
  try {
    sessionStorage.setItem("khabiteq-public-page-just-saved", "1");
  } catch {
    /* ignore */
  }
}

export function goToNextPractitionerSetup(
  router: { push: (href: string) => void },
  currentPath: string,
) {
  const next = nextPractitionerSetupPath(currentPath);
  if (next === PRACTITIONER_SETUP_COMPLETE_PATH) {
    markPractitionerSetupJustFinished();
  }
  router.push(next);
}
