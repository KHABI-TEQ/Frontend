/** Shared “WHAT ARE YOU LOOKING TO DO?” paths — navbar shortcut. */

export type LookingToDoIcon = "home" | "building" | "briefcase" | "compass" | "scale";

export interface LookingToDoPath {
  id: string;
  title: string;
  shortTitle: string;
  meta: string;
  cta: string;
  href: string;
  icon: LookingToDoIcon;
}

export const LOOKING_TO_DO_HEADING = "WHAT ARE YOU LOOKING TO DO?";
export const LOOKING_TO_DO_OVERVIEW_HREF = "/home";

export const LOOKING_TO_DO_PATHS: LookingToDoPath[] = [
  {
    id: "find-property",
    title: "I WANT TO FIND PROPERTY",
    shortTitle: "I want to find property",
    meta: "Buy · Rent · Invest",
    cta: "SUBMIT YOUR PREFERENCE",
    href: "/preference",
    icon: "home",
  },
  {
    id: "have-property",
    title: "I HAVE A PROPERTY",
    shortTitle: "I have a property",
    meta: "Owner · Developer",
    cta: "PRESENT YOUR PROPERTY",
    href: "/post-property",
    icon: "building",
  },
  {
    id: "professional",
    title: "I'M A PROFESSIONAL",
    shortTitle: "I'm a professional",
    meta: "Agent · Lawyer · Surveyor · Valuer",
    cta: "JOIN KHABITEQ",
    href: "/for-professionals",
    icon: "briefcase",
  },
  {
    id: "property-opportunity",
    title: "I HAVE A PROPERTY OPPORTUNITY",
    shortTitle: "I have a property opportunity",
    meta: "Property Scout",
    cta: "BECOME A PROPERTY SCOUT",
    href: "/property-scout",
    icon: "compass",
  },
  {
    id: "paid-service",
    title: "I NEED A PAID PROFESSIONAL SERVICE",
    shortTitle: "I need a paid professional service",
    meta: "Lawyer · Surveyor · Valuer",
    cta: "VIEW SERVICES AND PRICES",
    href: "/professional-services",
    icon: "scale",
  },
];
