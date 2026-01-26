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
  featuredListings: string[];
}

export interface PublicPageDesign {
  heroTitle: string;
  heroSubtitle: string;
  ctaText: string;
  ctaLink: string;
  ctaText2: string;
  ctaLink2: string;
  heroImageUrl?: string;
}

export interface InspectionDesignSettings {
  defaultInspectionFee: number | "";
}

export interface AboutHeroCta {
  text?: string;
  link?: string;
  style?: string;
}

export interface AboutWhoWeAre {
  title?: string;
  description?: string;
}

export interface AboutOurMission {
  title?: string;
  description?: string;
}

export interface AboutOurExperience {
  title?: string;
  description?: string;
}

export interface AboutValueItem {
  title?: string;
  shortText?: string;
}

export interface AboutWhatWeStandFor {
  title?: string;
  description?: string;
  items?: AboutValueItem[];
}

export interface AboutWhatWeDoItem {
  title?: string;
}

export interface AboutWhatWeDo {
  title?: string;
  items?: AboutWhatWeDoItem[];
}

export interface AboutLocationSection {
  name?: string;
  address?: string;
  coordinates?: [number | string, number | string];
}

export interface AboutWhereWeOperate {
  title?: string;
  locations?: AboutLocationSection[];
}

export interface AboutTeamMember {
  name?: string;
  role?: string;
  image?: string;
  bio?: string;
}

export interface AboutProfile {
  members?: AboutTeamMember[];
}

export interface AboutSection {
  whoWeAre?: AboutWhoWeAre;
  ourMission?: AboutOurMission;
  ourExperience?: AboutOurExperience;
  whatWeStandFor?: AboutWhatWeStandFor;
  whatWeDo?: AboutWhatWeDo;
  whereWeOperate?: AboutWhereWeOperate;
  profile?: AboutProfile;
}

export interface ContactUsSection {
  title?: string;
  description?: string;
  hero?: {
    title?: string;
    description?: string;
  };
  cta?: {
    title?: string;
  };
  location?: {
    name?: string;
    address?: string;
    coordinates?: [number | string, number | string]
  };
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
  support?: SupportSection;
}

export interface SubscribeSettings {
  title?: string;
  subTitle?: string;
  miniTitle?: string;
  cta?: {
    text?: string;
    color?: string;
  };
  enableEmailSubscription?: boolean;
  subscriptionPlaceholder?: string;
  confirmationMessage?: string;
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

export interface SupportSection {
  title: string;
  description: string;
  showHeroCtaButtons: boolean;
  supportCards: Array<{
    cardTitle: string;
    cardIcon: string;
    description: string;
    ctaText: string;
    ctaLink: string;
  }>;
}

export interface DealSiteSettings {
  _id?: string;
  publicSlug: string;
  title: string;
  keywords: string[];
  description: string;
  logoUrl?: string;
  theme: { primaryColor: string; secondaryColor: string };
  publicPage: PublicPageDesign;
  homeSettings?: HomeSettings;
  footer?: FooterDetails;
  featureSelection: FeatureSelection;
  socialLinks: SocialLinks;
  about?: AboutSection;
  inspectionSettings: InspectionDesignSettings;
  contactVisibility: ContactVisibility;
  contactUs?: ContactUsSection;
  subscribeSettings?: SubscribeSettings;
  paymentDetails?: BankDetails;
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
  dealSiteStatus: "pending" | "running" | "paused" | "on-hold" | "deleted" | null;

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
  publicPage: {
    heroTitle: "Hi, I'm your trusted agent",
    heroSubtitle: "Browse my verified listings and book inspections easily.",
    ctaText: "Tell Us about property you want",
    ctaLink: "/market-place",
    ctaText2: "Browse Listings",
    ctaLink2: "/market-place",
    heroImageUrl: "",
  },
  homeSettings: {},
  footer: { shortDescription: "", copyrightText: "" },
  featureSelection: { mode: "auto", propertyIds: "", featuredListings: [] },
  socialLinks: {},
  inspectionSettings: {
    defaultInspectionFee: 0,
  },
  contactVisibility: {
    showEmail: true,
    showPhone: true,
    enableContactForm: true,
    showWhatsAppButton: false,
    whatsappNumber: "",
  },
  paymentDetails: {},
  about: {},
  contactUs: {},
  subscribeSettings: {},
};

export function DealSiteProvider({ children }: { children: ReactNode }) {
  const { user } = useUserContext();
  const [settings, setSettings] = useState<DealSiteSettings>(DEFAULT_SETTINGS);
  const [isSetupComplete, setIsSetupComplete] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isOnHold, setIsOnHold] = useState(false);
  const [slugLocked, setSlugLocked] = useState(false);
  const [dealSiteStatus, setDealSiteStatus] = useState<"pending" | "running" | "paused" | "on-hold" | "deleted" | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const previewUrl = settings.publicSlug ? `https://${settings.publicSlug}.khabiteq.com` : null;

  // Load settings from API
  const loadSettings = useCallback(async () => {
    try {
      setIsLoading(true);
      const token = Cookies.get("token");

      // Guard: only load if token exists
      if (!token) {
        setIsLoading(false);
        return;
      }

      const res = await GET_REQUEST<any>(`${URLS.BASE}${URLS.dealSiteDetails}`, token);

      if (res?.success && res.data) {
        // Handle both array and object responses
        const data = Array.isArray(res.data) ? res.data[0] : res.data;

        if (data) {
          setSettings((prev) => ({
            ...prev,
            _id: data._id || prev._id,
            publicSlug: data.publicSlug || prev.publicSlug,
            title: data.title || prev.title,
            keywords: data.keywords || prev.keywords,
            description: data.description || prev.description,
            logoUrl: data.logoUrl || prev.logoUrl,
            theme: data.theme || prev.theme,
            inspectionSettings: data.inspectionSettings || prev.inspectionSettings,
            socialLinks: data.socialLinks || prev.socialLinks,
            contactVisibility: data.contactVisibility || prev.contactVisibility,
            featureSelection: data.featureSelection || prev.featureSelection,
            publicPage: data.publicPage || prev.publicPage,
            footer: data.footer || prev.footer,
            paymentDetails: data.paymentDetails || prev.paymentDetails,
            about: data.about || prev.about,
            contactUs: data.contactUs || prev.contactUs,
            homeSettings: data.homeSettings || prev.homeSettings,
            subscribeSettings: data.subscribeSettings || prev.subscribeSettings,
            status: data.status || prev.status,
          }));
          if (data.publicSlug) setSlugLocked(true);
          if (data.status) {
            setDealSiteStatus(data.status);
            if (data.status === "on-hold") setIsOnHold(true);
            if (data.status === "paused") setIsPaused(true);
            if (data.status === "running") setIsPaused(false);
          }
          setIsSetupComplete(!!data.publicSlug);
        }
      }
    } catch (error) {
      // Log error but don't crash the app
      console.warn("Failed to load DealSite settings (this is normal if not yet set up):", error);
      // Use default settings as fallback
      setIsSetupComplete(false);
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
    setDealSiteStatus("paused");
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
    dealSiteStatus,
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
