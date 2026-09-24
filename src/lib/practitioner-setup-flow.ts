import type { DealSiteSettings } from "@/context/deal-site-context";

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

function filled(value?: string | number | null) {
  return String(value ?? "").trim().length > 0;
}

export type SetupChecklistItem = {
  id: string;
  label: string;
  href: string;
  complete: boolean;
};

export type SetupChecklistGroup = {
  id: string;
  label: string;
  items: SetupChecklistItem[];
  complete: boolean;
};

export function getPractitionerSetupChecklist(settings: DealSiteSettings): SetupChecklistGroup[] {
  const groups: SetupChecklistGroup[] = [
    {
      id: "content",
      label: "Content & Design",
      complete: false,
      items: [
        {
          id: "branding",
          label: "Branding & SEO",
          href: "/public-access-page/branding",
          complete: Boolean(
            filled(settings.title) &&
              (filled(settings.description) || filled(settings.logoUrl) || filled(settings.footer?.shortDescription)),
          ),
        },
        {
          id: "theme",
          label: "Theme",
          href: "/public-access-page/theme",
          complete: filled(settings.theme?.primaryColor) && filled(settings.theme?.secondaryColor),
        },
        {
          id: "home-page",
          label: "Home Page",
          href: "/public-access-page/home-page",
          complete: Boolean(
            filled(settings.practitionerPage?.heroImageUrl) ||
              (settings.homeSettings?.testimonials?.testimonials || []).some((row) => filled(row.name) && filled(row.description)) ||
              (settings.homeSettings?.whyChooseUs?.items || []).some((row) => filled(row.title) && filled(row.content)),
          ),
        },
        {
          id: "featured",
          label: "Featured Listings",
          href: "/public-access-page/featured",
          complete: (settings.featureSelection?.featuredListings || []).length > 0,
        },
        {
          id: "about",
          label: "About Us",
          href: "/public-access-page/about",
          complete: filled(settings.about?.whoWeAre?.description),
        },
        {
          id: "contact-us",
          label: "Contact Us",
          href: "/public-access-page/contact-us",
          complete: Boolean(
            filled(settings.contactUs?.title) ||
              filled(settings.contactUs?.description) ||
              filled(settings.contactUs?.location?.address),
          ),
        },
        {
          id: "social",
          label: "Social Links",
          href: "/public-access-page/social",
          complete: Object.values(settings.socialLinks || {}).some((value) => filled(value)),
        },
        {
          id: "faqs",
          label: "FAQs",
          href: "/public-access-page/faqs",
          complete: (settings.faqs?.items || []).some((item) => filled(item.question) && filled(item.answer)),
        },
        {
          id: "custom-pages",
          label: "Custom pages",
          href: "/public-access-page/custom-pages",
          complete: (settings.customPages || []).some((page) => filled(page.slug) && filled(page.title)),
        },
        {
          id: "navigation",
          label: "Navigation",
          href: "/public-access-page/navigation",
          complete: (settings.navigation?.items || []).some((item) => item.enabled !== false && filled(item.label)),
        },
      ],
    },
    {
      id: "settings",
      label: "Settings",
      complete: false,
      items: [
        {
          id: "inspection",
          label: "Inspection Settings",
          href: "/public-access-page/inspection",
          complete: Number(settings.inspectionSettings?.defaultInspectionFee) > 0,
        },
        {
          id: "payment",
          label: "Payment Details",
          href: "/public-access-page/payment",
          complete: filled(settings.paymentDetails?.businessName) && filled(settings.paymentDetails?.accountNumber),
        },
        {
          id: "subscribe",
          label: "Subscribe Settings",
          href: "/public-access-page/subscribe-settings",
          complete: filled(settings.subscribeSettings?.title) || filled(settings.subscribeSettings?.subTitle),
        },
      ],
    },
  ];

  return groups.map((group) => ({
    ...group,
    complete: group.items.every((item) => item.complete),
  }));
}
