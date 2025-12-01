/**
 * DealSite Context - Manages shared state for the Public Access Page dashboard
 * This context stores form data and settings that are used across multiple routes
 */

"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import Cookies from "js-cookie";
import { GET_REQUEST } from "@/utils/requests";
import { URLS } from "@/utils/URLS";
import { useUserContext } from "./user-context";

// Type definitions (same as in the main page.tsx but extracted for reusability)
export interface SocialLinks {
  website?: string;
  twitter?: string;
  instagram?: string;
  facebook?: string;
  linkedin?: string;
}

export interface ContactVisibility {
  showEmail: boolean;
  showPhone: boolean;
  enableContactForm: boolean;
  showWhatsAppButton: boolean;
  whatsappNumber?: string;
}

export interface FeatureSelection {
  mode: "auto" | "manual";
  propertyIds: string;
}

export interface MarketplaceDefaults {
  defaultTab: "buy" | "rent" | "shortlet" | "jv";
  defaultSort: "newest" | "price-asc" | "price-desc";
  showVerifiedOnly: boolean;
  enablePriceNegotiationButton: boolean;
}

export interface PublicPageDesign {
  heroTitle: string;
  heroSubtitle: string;
  ctaText: string;
  ctaLink: string;
  heroImageUrl?: string;
}

export interface InspectionDesignSettings {
  allowPublicBooking: boolean;
  defaultInspectionFee: number | "";
  inspectionStatus?: string;
  negotiationEnabled?: boolean;
}

export interface AboutHeroCta {
  text?: string;
  link?: string;
  style?: string;
}

export interface AboutHero {
  title?: string;
  subTitle?: string;
  description?: string;
  backgroundImage?: string;
  backgroundVideo?: string | null;
  mobileFallbackImage?: string;
  overlayColor?: string;
  cta?: AboutHeroCta;
}

export interface AboutIdentity {
  headline?: string;
  content?: string;
  keyHighlights?: string[];
}

export interface AboutMissionVisionItem {
  title?: string;
  description?: string;
}

export interface AboutMissionVision {
  title?: string;
  items?: AboutMissionVisionItem[];
  backgroundImage?: string;
}

export interface AboutValuesItem {
  icon?: string;
  title?: string;
  description?: string;
}

export interface AboutValues {
  title?: string;
  description?: string;
  items?: AboutValuesItem[];
}

export interface AboutJourneyItem {
  year?: string;
  title?: string;
  description?: string;
}

export interface AboutJourney {
  title?: string;
  timeline?: AboutJourneyItem[];
}

export interface AboutLeadershipMember {
  name?: string;
  role?: string;
  image?: string;
  quote?: string;
}

export interface AboutLeadership {
  title?: string;
  subTitle?: string;
  members?: AboutLeadershipMember[];
}

export interface AboutStatItem {
  label?: string;
  value?: string;
}

export interface AboutStats {
  title?: string;
  subTitle?: string;
  backgroundColor?: string;
  items?: AboutStatItem[];
}

export interface AboutPartners {
  title?: string;
  subTitle?: string;
  logos?: string[];
}

export interface AboutTestimonials {
  showFromHome?: boolean;
  limit?: number;
  title?: string;
  layout?: string;
}

export interface AboutCtaSection {
  title?: string;
  subTitle?: string;
  buttonText?: string;
  link?: string;
  backgroundGradient?: string;
}

export interface AboutSection {
  hero?: AboutHero;
  identity?: AboutIdentity;
  missionVision?: AboutMissionVision;
  values?: AboutValues;
  journey?: AboutJourney;
  leadership?: AboutLeadership;
  stats?: AboutStats;
  partners?: AboutPartners;
  testimonials?: AboutTestimonials;
  cta?: AboutCtaSection;
}

export interface ContactUsSection {
  hero?: {
    title?: string;
    subTitle?: string;
    description?: string;
    backgroundImage?: string | null;
    backgroundVideo?: string | null;
    overlayColor?: string;
    cta?: { text?: string; link?: string; style?: string };
  };
  contactInfo?: {
    title?: string;
    subTitle?: string;
    items?: { icon?: string; label?: string; value?: string }[];
  };
  mapSection?: {
    title?: string;
    subTitle?: string;
    locations?: { city?: string; address?: string; coordinates?: [number | string, number | string] }[];
  };
  cta?: {
    title?: string;
    subTitle?: string;
    buttonText?: string;
    link?: string;
    backgroundGradient?: string;
  };
  officeHours?: string;
  faqs?: { question: string; answer: string }[];
}

export interface Testimonial {
  rating: number;
  description: string;
  image?: string;
  name: string;
  company: string;
}

export interface TestimonialsSection {
  title?: string;
  subTitle?: string;
  testimonials: Testimonial[];
}

export interface HomeSettings {
  testimonials?: TestimonialsSection;
  whyChooseUs?: {
    title?: string;
    subTitle?: string;
    items: Array<{ icon?: string; title: string; content: string }>;
  };
  readyToFind?: {
    title?: string;
    subTitle?: string;
    ctas?: Array<{ bgColor: string; text: string; actionLink: string }>;
    items?: Array<{ icon?: string; title: string; subTitle: string; content: string }>;
  };
}

export interface SubscribeSettings {
  title?: string;
  subTitle?: string;
  miniTitle?: string;
  backgroundColor?: string;
  cta?: {
    text?: string;
    color?: string;
  };
}

export interface FooterDetails {
  shortDescription: string;
  copyrightText: string;
}

export interface BankDetails {
  businessName?: string;
  accountNumber?: string;
  sortCode?: string;
  primaryContactEmail?: string;
  primaryContactName?: string;
  primaryContactPhone?: string;
}

export interface SecuritySettings {
  enablePasswordProtection?: boolean;
  pagePassword?: string;
  enableRateLimiting?: boolean;
  enableSpamFilter?: boolean;
  requireEmailVerification?: boolean;
}

export interface DealSiteSettings {
  publicSlug: string;
  title: string;
  keywords: string[];
  description: string;
  logoUrl?: string;
  theme: { primaryColor: string; secondaryColor: string };
  inspectionSettings: InspectionDesignSettings;
  listingsLimit: number;
  socialLinks: SocialLinks;
  contactVisibility: ContactVisibility;
  featureSelection: FeatureSelection;
  marketplaceDefaults: MarketplaceDefaults;
  publicPage: PublicPageDesign;
  footer?: FooterDetails;
  about?: AboutSection;
  contactUs?: ContactUsSection;
  paymentDetails?: BankDetails;
  homeSettings?: HomeSettings;
  subscribeSettings?: SubscribeSettings;
  securitySettings?: SecuritySettings;
  status?: string;
}

interface DealSiteContextType {
  // Settings state
  settings: DealSiteSettings;
  updateSettings: (updates: Partial<DealSiteSettings>) => void;

  // Setup state
  isSetupComplete: boolean;
  isPaused: boolean;
  isOnHold: boolean;
  slugLocked: boolean;

  // Loading state
  isLoading: boolean;
  isSaving: boolean;

  // UI helpers
  previewUrl: string | null;

  // Methods
  loadSettings: () => Promise<void>;
  saveSettings: () => Promise<void>;
  markSetupComplete: () => Promise<void>;
  pauseDealSite: () => Promise<void>;
  resumeDealSite: () => Promise<void>;
  deleteDealSite: () => Promise<void>;
}

const DealSiteContext = createContext<DealSiteContextType | undefined>(undefined);

const DEFAULT_SETTINGS: DealSiteSettings = {
  publicSlug: "",
  title: "",
  keywords: [],
  description: "",
  logoUrl: "",
  theme: { primaryColor: "#09391C", secondaryColor: "#8DDB90" },
  inspectionSettings: {
    allowPublicBooking: true,
    defaultInspectionFee: 0,
    inspectionStatus: "optional",
    negotiationEnabled: true,
  },
  listingsLimit: 6,
  socialLinks: {},
  contactVisibility: {
    showEmail: true,
    showPhone: true,
    enableContactForm: true,
    showWhatsAppButton: false,
    whatsappNumber: "",
  },
  featureSelection: { mode: "auto", propertyIds: "" },
  marketplaceDefaults: {
    defaultTab: "buy",
    defaultSort: "newest",
    showVerifiedOnly: false,
    enablePriceNegotiationButton: true,
  },
  publicPage: {
    heroTitle: "Hi, I'm your trusted agent",
    heroSubtitle: "Browse my verified listings and book inspections easily.",
    ctaText: "Browse Listings",
    ctaLink: "/market-place",
    heroImageUrl: "",
  },
  footer: { shortDescription: "", copyrightText: "" },
  paymentDetails: {},
  about: {},
  contactUs: {},
  homeSettings: {},
  subscribeSettings: {},
  securitySettings: {
    enablePasswordProtection: false,
    enableRateLimiting: true,
    enableSpamFilter: true,
    requireEmailVerification: false,
  },
};

export function DealSiteProvider({ children }: { children: ReactNode }) {
  const { user } = useUserContext();
  const [settings, setSettings] = useState<DealSiteSettings>(DEFAULT_SETTINGS);
  const [isSetupComplete, setIsSetupComplete] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isOnHold, setIsOnHold] = useState(false);
  const [slugLocked, setSlugLocked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const previewUrl = settings.publicSlug ? `https://${settings.publicSlug}.khabiteq.com` : null;

  // Load settings from API
  const loadSettings = useCallback(async () => {
    try {
      setIsLoading(true);
      const token = Cookies.get("token");
      const res = await GET_REQUEST<any>(`${URLS.BASE}/account/dealSite/details`, token);

      if (res?.success && res.data && Array.isArray(res.data) && res.data.length > 0) {
        const data = res.data[0] as any;
        setSettings((prev) => ({
          ...prev,
          publicSlug: data.publicSlug || prev.publicSlug,
          title: data.title || prev.title,
          keywords: data.keywords || prev.keywords,
          description: data.description || prev.description,
          logoUrl: data.logoUrl || prev.logoUrl,
          theme: data.theme || prev.theme,
          inspectionSettings: data.inspectionSettings || prev.inspectionSettings,
          listingsLimit: data.listingsLimit || prev.listingsLimit,
          socialLinks: data.socialLinks || prev.socialLinks,
          contactVisibility: data.contactVisibility || prev.contactVisibility,
          featureSelection: data.featureSelection || prev.featureSelection,
          marketplaceDefaults: data.marketplaceDefaults || prev.marketplaceDefaults,
          publicPage: data.publicPage || prev.publicPage,
          footer: data.footer || prev.footer,
          paymentDetails: data.paymentDetails || prev.paymentDetails,
          about: data.about || prev.about,
          contactUs: data.contactUs || prev.contactUs,
          homeSettings: data.homeSettings || prev.homeSettings,
          subscribeSettings: data.subscribeSettings || prev.subscribeSettings,
        }));
        if (data.publicSlug) setSlugLocked(true);
        if (data.paused) setIsPaused(true);
        if (data.status === "on-hold") setIsOnHold(true);
        setIsSetupComplete(!!data.publicSlug);
      }
    } catch (error) {
      console.error("Failed to load DealSite settings:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateSettings = useCallback((updates: Partial<DealSiteSettings>) => {
    setSettings((prev) => ({ ...prev, ...updates }));
  }, []);

  const saveSettings = useCallback(async () => {
    setIsSaving(true);
    try {
      // Implementation will use the requests module
      // For now, this is a placeholder
    } finally {
      setIsSaving(false);
    }
  }, []);

  const markSetupComplete = useCallback(async () => {
    setSlugLocked(true);
    setIsSetupComplete(true);
    setIsPaused(true);
  }, []);

  const pauseDealSite = useCallback(async () => {
    try {
      const token = Cookies.get("token");
      const { PUT_REQUEST } = await import("@/utils/requests");
      const res = await PUT_REQUEST(`${URLS.BASE}/account/dealSite/${settings.publicSlug}/pause`, {}, token);
      if (res?.success) {
        setIsPaused(true);
      }
    } catch (error) {
      console.error("Failed to pause deal site:", error);
    }
  }, [settings.publicSlug]);

  const resumeDealSite = useCallback(async () => {
    try {
      const token = Cookies.get("token");
      const { PUT_REQUEST } = await import("@/utils/requests");
      const res = await PUT_REQUEST(`${URLS.BASE}/account/dealSite/${settings.publicSlug}/resume`, {}, token);
      if (res?.success) {
        setIsPaused(false);
      }
    } catch (error) {
      console.error("Failed to resume deal site:", error);
    }
  }, [settings.publicSlug]);

  const deleteDealSite = useCallback(async () => {
    try {
      const token = Cookies.get("token");
      const { DELETE_REQUEST } = await import("@/utils/requests");
      const res = await DELETE_REQUEST(`${URLS.BASE}/account/dealSite/${settings.publicSlug}/delete`, undefined, token);
      if (res?.success) {
        setSettings(DEFAULT_SETTINGS);
        setSlugLocked(false);
        setIsSetupComplete(false);
        setIsPaused(false);
      }
    } catch (error) {
      console.error("Failed to delete deal site:", error);
    }
  }, [settings.publicSlug]);

  // Load settings on mount
  useEffect(() => {
    if (user?.userType === "Agent") {
      loadSettings();
    } else {
      setIsLoading(false);
    }
  }, [user, loadSettings]);

  const value: DealSiteContextType = {
    settings,
    updateSettings,
    isSetupComplete,
    isPaused,
    isOnHold,
    slugLocked,
    isLoading,
    isSaving,
    previewUrl,
    loadSettings,
    saveSettings,
    markSetupComplete,
    pauseDealSite,
    resumeDealSite,
    deleteDealSite,
  };

  return <DealSiteContext.Provider value={value}>{children}</DealSiteContext.Provider>;
}

export function useDealSite() {
  const context = useContext(DealSiteContext);
  if (!context) {
    throw new Error("useDealSite must be used within DealSiteProvider");
  }
  return context;
}
