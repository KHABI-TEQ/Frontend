"use client";

import React, { useEffect, useMemo, useState, useCallback } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { GET_REQUEST, POST_REQUEST, POST_REQUEST_FILE_UPLOAD, PUT_REQUEST, DELETE_REQUEST } from "@/utils/requests";
import { URLS } from "@/utils/URLS";
import toast from "react-hot-toast";
import {
  Trash2,
  Save,
  Link as LinkIcon,
  Image as ImageIcon,
  ShieldCheck,
  AlertCircle,
  BarChart2,
  History,
  ExternalLink,
  Copy,
  Pause,
  Play,
  Trash,
  Shield,
  Check,
  Mail,
  ArrowLeftIcon,
} from "lucide-react";
import { useUserContext } from "@/context/user-context";
import { CombinedAuthGuard } from "@/logic/combinedAuthGuard";
import Stepper from "@/components/post-property-components/Stepper";
import IconSelector from "@/components/public-access-page/IconSelector";
import dynamic from "next/dynamic";
const OverviewTab = dynamic(() => import("@/components/public-access-page/tabs/OverviewTab"), { ssr: false });
import TabsHeader from "@/components/public-access-page/TabsHeader";

const HomeSettingsTab = dynamic(() => import("@/components/public-access-page/tabs/HomeSettingsTab"), { ssr: false });
import OverlayPreloader from "@/components/general-components/OverlayPreloader";
import ModalWrapper from "@/components/general-components/modal-wrapper";
import ConfirmationModal from "@/components/modals/confirmation-modal";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import Link from "next/link";

interface SocialLinks {
  website?: string;
  twitter?: string;
  instagram?: string;
  facebook?: string;
  linkedin?: string;
}

interface ContactVisibility {
  showEmail: boolean;
  showPhone: boolean;
  enableContactForm: boolean;
  showWhatsAppButton: boolean;
  whatsappNumber?: string;
}

interface FeatureSelection {
  mode: "auto" | "manual";
  propertyIds: string;
}

interface MarketplaceDefaults {
  defaultTab: "buy" | "rent" | "shortlet" | "jv";
  defaultSort: "newest" | "price-asc" | "price-desc";
  showVerifiedOnly: boolean;
  enablePriceNegotiationButton: boolean;
}

interface PublicPageDesign {
  heroTitle: string;
  heroSubtitle: string;
  ctaText: string;
  ctaLink: string;
  heroImageUrl?: string;
}

interface InspectionDesignSettings {
  allowPublicBooking: boolean;
  defaultInspectionFee: number | "";
  inspectionStatus?: string;
  negotiationEnabled?: boolean;
}

interface CtaButton { text: string; url: string; color?: string }

interface AboutHeroCta {
  text?: string;
  link?: string;
  style?: string;
}

interface AboutHero {
  title?: string;
  subTitle?: string;
  description?: string;
  backgroundImage?: string;
  backgroundVideo?: string | null;
  mobileFallbackImage?: string;
  overlayColor?: string;
  cta?: AboutHeroCta;
}

interface AboutIdentity {
  headline?: string;
  content?: string;
  keyHighlights?: string[];
}

interface AboutMissionVisionItem {
  title?: string;
  description?: string;
}

interface AboutMissionVision {
  title?: string;
  items?: AboutMissionVisionItem[];
  backgroundImage?: string;
}

interface AboutValuesItem {
  icon?: string;
  title?: string;
  description?: string;
}

interface AboutValues {
  title?: string;
  description?: string;
  items?: AboutValuesItem[];
}

interface AboutJourneyItem {
  year?: string;
  title?: string;
  description?: string;
}

interface AboutJourney {
  title?: string;
  timeline?: AboutJourneyItem[];
}

interface AboutLeadershipMember {
  name?: string;
  role?: string;
  image?: string;
  quote?: string;
}

interface AboutLeadership {
  title?: string;
  subTitle?: string;
  members?: AboutLeadershipMember[];
}

interface AboutStatItem {
  label?: string;
  value?: string;
}

interface AboutStats {
  title?: string;
  subTitle?: string;
  backgroundColor?: string;
  items?: AboutStatItem[];
}

interface AboutPartners {
  title?: string;
  subTitle?: string;
  logos?: string[];
}

interface AboutTestimonials {
  showFromHome?: boolean;
  limit?: number;
  title?: string;
  layout?: string;
}

interface AboutCtaSection {
  title?: string;
  subTitle?: string;
  buttonText?: string;
  link?: string;
  backgroundGradient?: string;
}

interface AboutSection {
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

interface ContactUsSection {
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

interface Testimonial {
  rating: number;
  description: string;
  image?: string;
  name: string;
  company: string;
}

interface TestimonialsSection {
  title?: string;
  subTitle?: string;
  testimonials: Testimonial[];
}

interface WhyChooseUsItem {
  icon?: string;
  title: string;
  content: string;
}

interface ReadyToFindCTA {
  bgColor: string;
  text: string;
  actionLink: string;
}

interface ReadyToFindItem {
  icon?: string;
  title: string;
  subTitle: string;
  content: string;
}

interface ReadyToFindSection {
  title?: string;
  subTitle?: string;
  ctas?: ReadyToFindCTA[];
  items?: ReadyToFindItem[];
}

interface HomeSettings {
  testimonials?: TestimonialsSection;
  whyChooseUs?: {
    title?: string;
    subTitle?: string;
    items: WhyChooseUsItem[];
  };
  readyToFind?: ReadyToFindSection;
}

interface SubscribeSettings {
  title?: string;
  subTitle?: string;
  miniTitle?: string;
  backgroundColor?: string;
  cta?: {
    text?: string;
    color?: string;
  };
}

interface FooterDetails {
  shortDescription: string;
  copyrightText: string;
}

interface BankDetails {
  businessName?: string;
  accountNumber?: string;
  sortCode?: string; // bank code
  primaryContactEmail?: string;
  primaryContactName?: string;
  primaryContactPhone?: string;
}

interface DealSiteSettings {
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
  status?: string;
}

interface DealSiteLog {
  _id: string;
  dealSite?: string;
  actor?: {
    _id?: string;
    email?: string;
    firstName?: string;
    lastName?: string;
  };
  actorModel?: string;
  category?: string;
  action?: string;
  description?: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
  updatedAt?: string;
}

type PropertyItem = {
  _id: string;
  propertyType?: string;
  propertyCategory?: string;
  price?: number;
  location?: { state?: string; localGovernment?: string; area?: string };
  pictures?: string[];
  description?: string;
  title?: string;
  status?: string;
  isApproved?: boolean;
  additionalFeatures?: any;
  briefType: string;
};

type ManageTabId =
  | "overview"
  | "branding"
  | "design"
  | "theme"
  | "marketplace"
  | "inspection"
  | "contact"
  | "social"
  | "about"
  | "contact-us"
  | "payment"
  | "featured"
  | "listings"
  | "home-settings"
  | "subscribe-settings"
  | "security"
  | "service-logger";

type UpdatableSectionId = Exclude<ManageTabId, "overview" | "security" | "service-logger">;

const updatableTabSet = new Set<UpdatableSectionId>([
  "branding",
  "design",
  "theme",
  "marketplace",
  "inspection",
  "contact",
  "social",
  "about",
  "contact-us",
  "payment",
  "featured",
  "listings",
  "home-settings",
  "subscribe-settings",
]);

const SECTION_FRIENDLY_LABELS: Record<UpdatableSectionId, string> = {
  branding: "Branding & SEO",
  design: "Public Page Design",
  theme: "Theme",
  marketplace: "Marketplace",
  inspection: "Inspection Settings",
  contact: "Contact",
  social: "Social Links",
  about: "About Us",
  "contact-us": "Contact Us",
  payment: "Payment",
  featured: "Featured Listings",
  listings: "Listings",
  "home-settings": "Home Settings",
  "subscribe-settings": "Subscribe Settings",
};

const isUpdatableTab = (tab: ManageTabId): tab is UpdatableSectionId => updatableTabSet.has(tab as UpdatableSectionId);

const SERVICE_LOGS_LIMIT = 10;
const STORAGE_KEY = "deal_site_settings";
const SLUG_LOCK_KEY = "deal_site_slug_locked";

const Step0Schema = Yup.object({
  publicSlug: Yup.string()
    .required("Public Link is required")
    .matches(/^[a-z0-9]([a-z0-9-]{1,61}[a-z0-9])?$/, "Invalid subdomain format"),
  title: Yup.string().required("Title is required"),
  keywordsText: Yup.string().required("Keywords are required"),
  description: Yup.string().required("Description is required"),
});

const Step1Schema = Yup.object({
  shortDescription: Yup.string().required("Footer Details is required"),
  copyrightText: Yup.string().required("Copyright Text is required"),
});


export default function DealSitePage() {
  const router = useRouter();
  const { user } = useUserContext();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [slugLocked, setSlugLocked] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isOnHold, setIsOnHold] = useState(false);
  const [slugStatus, setSlugStatus] = useState<"idle" | "invalid" | "checking" | "available" | "taken">("idle");
  const [slugMessage, setSlugMessage] = useState<string>("");

  const [form, setForm] = useState<DealSiteSettings>({
    publicSlug: "",
    title: "",
    keywords: [],
    description: "",
    logoUrl: "",
    theme: { primaryColor: "#09391C", secondaryColor: "#8DDB90" },
    inspectionSettings: { allowPublicBooking: true, defaultInspectionFee: 0, inspectionStatus: "optional", negotiationEnabled: true },
    listingsLimit: 6,
    socialLinks: {},
    contactVisibility: { showEmail: true, showPhone: true, enableContactForm: true, showWhatsAppButton: false, whatsappNumber: "" },
    featureSelection: { mode: "auto", propertyIds: "" },
    marketplaceDefaults: { defaultTab: "buy", defaultSort: "newest", showVerifiedOnly: false, enablePriceNegotiationButton: true },
    publicPage: { heroTitle: "Hi, I'm your trusted agent", heroSubtitle: "Browse my verified listings and book inspections easily.", ctaText: "Browse Listings", ctaLink: "/market-place", heroImageUrl: "" },
    footer: { shortDescription: "", copyrightText: "" },
    paymentDetails: { businessName: "", accountNumber: "", sortCode: "", primaryContactEmail: "", primaryContactName: "", primaryContactPhone: "" },
    about: {
      hero: { title: "", subTitle: "", description: "", backgroundImage: "", backgroundVideo: null, mobileFallbackImage: "", overlayColor: "rgba(0, 0, 0, 0.55)", cta: { text: "", link: "", style: "light" } },
      identity: { headline: "", content: "", keyHighlights: [] },
      missionVision: { title: "", items: [], backgroundImage: "" },
      values: { title: "", description: "", items: [] },
      journey: { title: "", timeline: [] },
      leadership: { title: "", subTitle: "", members: [] },
      stats: { title: "", subTitle: "", backgroundColor: "#0B3B2E", items: [] },
      partners: { title: "", subTitle: "", logos: [] },
      testimonials: { showFromHome: true, limit: 3, title: "", layout: "carousel" },
      cta: { title: "", subTitle: "", buttonText: "", link: "", backgroundGradient: "linear-gradient(90deg, #0B3B2E 0%, #4BA678 100%)" },
    },
    contactUs: {
      hero: { title: "", subTitle: "", description: "", backgroundImage: "", backgroundVideo: null, overlayColor: "", cta: { text: "", link: "", style: "" }, },
      contactInfo: {
        title: "", subTitle: "", items: [],
      },
      mapSection: {
        title: "",
        subTitle: "",
        locations: [
          { city: "Lagos", address: "Plot 15, PrimeEdge Tower, Victoria Island", coordinates: [6.4281, 3.4219] },
        ],
      },
      cta: {
        title: "",
        subTitle: "Get in touch today and experience the PrimeEdge difference.",
        buttonText: "Book a Consultation",
        link: "/book-consultation",
        backgroundGradient: "linear-gradient(90deg, #09391C 0%, #4BA678 100%)",
      },
      officeHours: "Mon - Sat: 8:00am - 6:00pm",
      faqs: [],
    },
    homeSettings: {
      testimonials: { title: "", subTitle: "", testimonials: [] },
      whyChooseUs: { title: "", subTitle: "", items: [] },
      readyToFind: { title: "", subTitle: "", ctas: [], items: [] },
    },
    subscribeSettings: {
      title: "",
      subTitle: "",
      miniTitle: "",
      backgroundColor: "#8DDB90",
      cta: { text: "Subscribe Now", color: "#09391C" },
    },
  });

  // const [contactJson, setContactJson] = useState<string>(JSON.stringify(form.contactUs || {}, null, 2));

  // useEffect(() => {
  //   setContactJson(JSON.stringify(form.contactUs || {}, null, 2));
  // }, [form.contactUs]);

  const previewUrl = useMemo(() => {
    if (!form.publicSlug) return "";
    return `https://${form.publicSlug}.khabiteq.com`;
  }, [form.publicSlug]);

  // Analytics state
  const [viewsByDay, setViewsByDay] = useState<{ date: string; count: number }[]>([]);
  const [mostViewed, setMostViewed] = useState<{ id?: string; title?: string; views?: number; image?: string } | null>(null);
  const [overviewLogsLoading, setOverviewLogsLoading] = useState(false);
  const [overviewLogs, setOverviewLogs] = useState<DealSiteLog[]>([]);
  const [serviceLogsLoading, setServiceLogsLoading] = useState(false);
  const [serviceLogs, setServiceLogs] = useState<DealSiteLog[]>([]);
  const [serviceLogsPagination, setServiceLogsPagination] = useState({ page: 1, totalPages: 1, total: 0, limit: SERVICE_LOGS_LIMIT });
  const [serviceLogsPage, setServiceLogsPage] = useState(1);

  const isSetupComplete = slugLocked && !!form.publicSlug;
  const [activeView, setActiveView] = useState<"setup" | "manage">("setup");
  const [activeTab, setActiveTab] = useState<ManageTabId>("overview");
  const [setupStep, setSetupStep] = useState(0);

  // Global preloader state
  const [preloader, setPreloader] = useState<{ visible: boolean; message: string }>({ visible: false, message: "" });
  const showPreloader = (message: string) => setPreloader({ visible: true, message });
  const hidePreloader = () => setPreloader({ visible: false, message: "" });

  // Featured listings state
  const [flLoading, setFlLoading] = useState(false);
  const [properties, setProperties] = useState<PropertyItem[]>([]);
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    isAvailable: true as boolean | undefined,
    propertyType: undefined as string | undefined,
    propertyCategory: undefined as string | undefined,
    state: undefined as string | undefined,
    localGovernment: undefined as string | undefined,
    area: undefined as string | undefined,
    priceMin: undefined as number | undefined,
    priceMax: undefined as number | undefined,
    isApproved: true as boolean | undefined,
  });
  const selectedIds = useMemo<string[]>(() => form.featureSelection.propertyIds.split(",").map((s) => s.trim()).filter(Boolean), [form.featureSelection.propertyIds]);

  const [bankList, setBankList] = useState<{ name: string; code: string }[]>([]);
  const [banksLoading, setBanksLoading] = useState(false);
  useEffect(() => {
    const fetchBanks = async () => {
      try {
        setBanksLoading(true);
        const token = Cookies.get("token");
        const res = await GET_REQUEST<any>(`${URLS.BASE}/account/dealSite/bankList`, token);
        if (res?.success && Array.isArray(res.data)) setBankList(res.data as any);
      } finally {
        setBanksLoading(false);
      }
    };
    fetchBanks();
  }, []);

  useEffect(() => {
    setActiveView(isSetupComplete ? "manage" : "setup");
  }, [isSetupComplete]);

  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        try {
          if (typeof window !== "undefined") {
            window.localStorage.clear();
          }
        } catch {}
        const token = Cookies.get("token");
        showPreloader("Loading Public Access Page...");
        const res = await GET_REQUEST<any>(`${URLS.BASE}/account/dealSite/details`, token);
        hidePreloader();
        if (res?.success && res.data && Array.isArray(res.data) && res.data.length > 0) {
          const s = res.data[0] as Partial<DealSiteSettings & { paused?: boolean }>;
          setForm((prev) => ({
            ...prev,
            publicSlug: s.publicSlug || prev.publicSlug,
            title: s.title || prev.title,
            keywords: s.keywords || prev.keywords,
            description: s.description || prev.description,
            logoUrl: s.logoUrl || prev.logoUrl,
            theme: {
              primaryColor: s.theme?.primaryColor || prev.theme.primaryColor,
              secondaryColor: s.theme?.secondaryColor || prev.theme.secondaryColor,
            },
            inspectionSettings: {
              allowPublicBooking: s.inspectionSettings?.allowPublicBooking ?? prev.inspectionSettings.allowPublicBooking,
              defaultInspectionFee: s.inspectionSettings?.defaultInspectionFee ?? prev.inspectionSettings.defaultInspectionFee,
              inspectionStatus: s.inspectionSettings?.inspectionStatus ?? prev.inspectionSettings.inspectionStatus,
              negotiationEnabled: s.inspectionSettings?.negotiationEnabled ?? prev.inspectionSettings.negotiationEnabled,
            },
            listingsLimit: typeof s.listingsLimit === "number" ? s.listingsLimit : prev.listingsLimit,
            socialLinks: s.socialLinks || prev.socialLinks,
            contactVisibility: s.contactVisibility || prev.contactVisibility,
            featureSelection: s.featureSelection || prev.featureSelection,
            marketplaceDefaults: s.marketplaceDefaults || prev.marketplaceDefaults,
            publicPage: s.publicPage || prev.publicPage,
            footer: s.footer || prev.footer,
            paymentDetails: (s as any).paymentDetails || prev.paymentDetails,
            about: (s as any).about || prev.about,
            contactUs: (s as any).contactUs || prev.contactUs,
            homeSettings: (s as any).homeSettings || prev.homeSettings,
            subscribeSettings: (s as any).subscribeSettings || prev.subscribeSettings,
          }));
          if (typeof s.paused === "boolean") setIsPaused(s.paused);
          if (s.status === "on-hold") setIsOnHold(true);
          if (s.publicSlug) setSlugLocked(true);
        }
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  // Load existing deal site from profile response if available
  useEffect(() => {
    const dealSiteArray = (user as any)?.dealSite;
    const ds = Array.isArray(dealSiteArray) && dealSiteArray.length > 0 ? dealSiteArray[0] : null;

    if (!ds) return;

    setForm((prev) => ({
      ...prev,
      publicSlug: ds.publicSlug || prev.publicSlug,
      title: ds.title || prev.title,
      keywords: Array.isArray(ds.keywords) ? ds.keywords : prev.keywords,
      description: ds.description || prev.description,
      logoUrl: ds.logoUrl || prev.logoUrl,
      theme: {
        primaryColor: ds.theme?.primaryColor || prev.theme.primaryColor,
        secondaryColor: ds.theme?.secondaryColor || prev.theme.secondaryColor,
      },
      inspectionSettings: {
        allowPublicBooking: ds.inspectionSettings?.allowPublicBooking ?? prev.inspectionSettings.allowPublicBooking,
        defaultInspectionFee: ds.inspectionSettings?.defaultInspectionFee ?? prev.inspectionSettings.defaultInspectionFee,
        inspectionStatus: ds.inspectionSettings?.inspectionStatus ?? prev.inspectionSettings.inspectionStatus,
        negotiationEnabled: ds.inspectionSettings?.negotiationEnabled ?? prev.inspectionSettings.negotiationEnabled,
      },
      listingsLimit: typeof ds.listingsLimit === "number" ? ds.listingsLimit : prev.listingsLimit,
      socialLinks: ds.socialLinks || prev.socialLinks,
      contactVisibility: ds.contactVisibility || prev.contactVisibility,
      featureSelection: ds.featureSelection || prev.featureSelection,
      marketplaceDefaults: ds.marketplaceDefaults || prev.marketplaceDefaults,
      publicPage: {
        heroTitle: ds.publicPage?.heroTitle || prev.publicPage.heroTitle,
        heroSubtitle: ds.publicPage?.heroSubtitle || prev.publicPage.heroSubtitle,
        ctaText: ds.publicPage?.ctaText || prev.publicPage.ctaText,
        ctaLink: ds.publicPage?.ctaLink || prev.publicPage.ctaLink,
        heroImageUrl: ds.publicPage?.heroImage || prev.publicPage.heroImageUrl,
      },
      footer: {
        shortDescription: ds.footerSection?.shortDescription || prev.footer?.shortDescription || "",
        copyrightText: ds.footerSection?.copyrightText || prev.footer?.copyrightText || "",
      },
      paymentDetails: (ds as any).paymentDetails || prev.paymentDetails,
      about: (ds as any).about || prev.about,
      contactUs: (ds as any).contactUs || prev.contactUs,
      homeSettings: (ds as any).homeSettings || prev.homeSettings,
      subscribeSettings: (ds as any).subscribeSettings || prev.subscribeSettings,
    }));

    if (ds.publicSlug && !slugLocked) {
      setSlugLocked(true);
    }

    if (ds.status === "on-hold") setIsOnHold(true);

  }, [user, slugLocked]);

  useEffect(() => {
    if (!form.publicSlug || slugLocked) {
      setSlugStatus("idle");
      setSlugMessage("");
      return;
    }
    const sub = form.publicSlug;
    const valid = /^[a-z0-9]([a-z0-9-]{1,61}[a-z0-9])?$/.test(sub);
    if (!valid) {
      setSlugStatus("invalid");
      setSlugMessage("Use 2-63 chars: letters, numbers, hyphens. Cannot start/end with hyphen.");
      return;
    }
    let cancelled = false;
    setSlugStatus("checking");
    setSlugMessage("Checking availability...");
    const token = Cookies.get("token");
    const t = setTimeout(async () => {
      try {
        const resp = await POST_REQUEST<any>(`${URLS.BASE}/account/dealSite/slugAvailability`, { publicSlug: sub }, token);
        const available = (resp?.data?.available ?? resp?.available ?? resp?.data?.isAvailable ?? resp?.isAvailable) === true;
        if (!cancelled) {
          setSlugStatus(available ? "available" : "taken");
          setSlugMessage(available ? "Subdomain is available" : "Subdomain is taken");
        }
      } catch (e) {
        if (!cancelled) {
          setSlugStatus("taken");
          setSlugMessage("Unable to verify. Try again.");
        }
      }
    }, 400);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [form.publicSlug, slugLocked]);

  useEffect(() => {
    if (activeView !== "manage") return;
    const fetchAnalytics = async () => {
      try {
        const token = Cookies.get("token");
        const dash = await GET_REQUEST<any>(`${URLS.BASE}${URLS.fetchDashboardStats}`, token);
        if (dash?.success && dash.data?.viewsByDay) setViewsByDay(dash.data.viewsByDay);
      } catch {}
    };
    fetchAnalytics();
  }, [activeView]);

  useEffect(() => {
    if (activeView !== "manage" || activeTab !== "overview" || !form.publicSlug) {
      return;
    }

    fetchOverviewLogs();
  }, [activeView, activeTab, form.publicSlug]);

  useEffect(() => {
    if (activeView !== "manage" || activeTab !== "service-logger" || !form.publicSlug) {
      return;
    }

    fetchServiceLogs(serviceLogsPage);
  }, [activeView, activeTab, form.publicSlug, serviceLogsPage]);

  useEffect(() => {
    setServiceLogsPage(1);
    setServiceLogs([]);
    setServiceLogsPagination({ page: 1, totalPages: 1, total: 0, limit: SERVICE_LOGS_LIMIT });
  }, [form.publicSlug]);

  // Fetch agent properties for Featured Listings
  const buildQuery = (obj: Record<string, any>) =>
    Object.entries(obj)
      .filter(([, v]) => v !== undefined && v !== null && v !== "")
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
      .join("&");

  const fetchProperties = async () => {
    try {
      setFlLoading(true);
      const token = Cookies.get("token");
      const qs = buildQuery(filters);
      showPreloader("Loading your listings...");
      const res = await GET_REQUEST<{ data: PropertyItem[]; pagination?: any }>(`${URLS.BASE}/account/properties/fetchAll?${qs}`, token);
      hidePreloader();
      if (res?.success && res.data && Array.isArray(res.data)) {
        setProperties(res.data as unknown as PropertyItem[]);
      } else {
        toast.error(res?.message || "Failed to load listings");
      }
    } finally {
      setFlLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "featured") {
      fetchProperties();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, JSON.stringify(filters)]);

  const handleUploadLogo = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("for", "public-logo");
    const token = Cookies.get("token");

    showPreloader("Uploading logo...");
    const res = await POST_REQUEST_FILE_UPLOAD<{ url: string }>(`${URLS.BASE}${URLS.uploadSingleImg}`, formData, token);
    hidePreloader();
    if (res?.success && res.data && (res.data as any).url) {
      setForm((prev) => ({ ...prev, logoUrl: (res.data as any).url }));
      toast.success("Logo uploaded");
    } else {
      toast.error(res?.message || "Upload failed");
    }
  };

  const handleUploadHero = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("for", "public-hero");
    const token = Cookies.get("token");

    showPreloader("Uploading hero image...");
    const res = await POST_REQUEST_FILE_UPLOAD<{ url: string }>(`${URLS.BASE}${URLS.uploadSingleImg}`, formData, token);
    hidePreloader();
    if (res?.success && res.data && (res.data as any).url) {
      setForm((prev) => ({ ...prev, publicPage: { ...prev.publicPage, heroImageUrl: (res.data as any).url } }));
      toast.success("Hero image uploaded");
    } else {
      toast.error(res?.message || "Upload failed");
    }
  };

  // Upload media for contact section (image or video)
  const handleUploadContactMedia = async (file: File, kind: 'image' | 'video') => {
    try {
      if (kind === 'video' && file.size > 15 * 1024 * 1024) {
        toast.error('Video exceeds maximum size of 15MB');
        return;
      }

      const formData = new FormData();
      formData.append('file', file);
      formData.append('for', `contact-${kind}`);
      const token = Cookies.get('token');
      showPreloader(`Uploading ${kind}...`);
      const res = await POST_REQUEST_FILE_UPLOAD<{ url: string }>(`${URLS.BASE}${URLS.uploadSingleImg}`, formData, token);
      hidePreloader();
      if (res?.success && res.data && (res.data as any).url) {
        if (kind === 'image') updateHeroField('backgroundImage', (res.data as any).url);
        else updateHeroField('backgroundVideo', (res.data as any).url);
        toast.success(`${kind.charAt(0).toUpperCase() + kind.slice(1)} uploaded`);
      } else {
        toast.error(res?.message || 'Upload failed');
      }
    } catch (err) {
      hidePreloader();
      toast.error('Upload failed');
    }
  };

  // Drag & drop helpers
  const makeDropHandler = (kind: 'image' | 'video') => (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const files = e.dataTransfer.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    if (kind === 'video' && file.size > 15 * 1024 * 1024) {
      toast.error('Video exceeds maximum size of 15MB');
      return;
    }
    handleUploadContactMedia(file, kind);
  };

  // Delete uploaded contact media
  const handleDeleteContactMedia = async (url: string | undefined | null, kind: 'image' | 'video') => {
    if (!url) return;
    const token = Cookies.get('token');
    try {
      showPreloader('Removing uploaded file...');
      const res = await DELETE_REQUEST(`${URLS.BASE}${URLS.deleteUploadedSingleImg}`, { url }, token);
      hidePreloader();
      if (res?.success) {
        if (kind === 'image') updateHeroField('backgroundImage', '');
        else updateHeroField('backgroundVideo', '');
        toast.success('Uploaded file removed');
      } else {
        toast.error(res?.message || 'Failed to remove file');
      }
    } catch (err) {
      hidePreloader();
      toast.error('Failed to remove file');
    }
  };

  // Generic delete for uploaded files with callback to clear state
  const handleDeleteUploadedFile = async (url: string | undefined | null, onSuccess: () => void) => {
    if (!url) return;
    const token = Cookies.get('token');
    try {
      showPreloader('Removing uploaded file...');
      const res = await DELETE_REQUEST(`${URLS.BASE}${URLS.deleteUploadedSingleImg}`, { url }, token);
      hidePreloader();
      if (res?.success) {
        onSuccess();
        toast.success('Uploaded file removed');
      } else {
        toast.error(res?.message || 'Failed to remove file');
      }
    } catch (err) {
      hidePreloader();
      toast.error('Failed to remove file');
    }
  };

  // Additional upload helpers for About Us section
  const handleUploadMissionBg = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('for', 'about-mission-bg');
    const token = Cookies.get('token');
    showPreloader('Uploading mission background...');
    const res = await POST_REQUEST_FILE_UPLOAD<{ url: string }>(`${URLS.BASE}${URLS.uploadSingleImg}`, formData, token);
    hidePreloader();
    if (res?.success && res.data && (res.data as any).url) {
      setForm(prev => ({ ...prev, about: { ...(prev.about || {}), missionVision: { ...(prev.about?.missionVision || {}), backgroundImage: (res.data as any).url } } }));
      toast.success('Image uploaded');
    } else {
      toast.error(res?.message || 'Upload failed');
    }
  };

  const handleUploadMemberImage = async (file: File, index: number) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('for', 'about-member');
    const token = Cookies.get('token');
    showPreloader('Uploading member image...');
    const res = await POST_REQUEST_FILE_UPLOAD<{ url: string }>(`${URLS.BASE}${URLS.uploadSingleImg}`, formData, token);
    hidePreloader();
    if (res?.success && res.data && (res.data as any).url) {
      setForm(prev => {
        const members = [...(prev.about?.leadership?.members || [])];
        members[index] = { ...(members[index] || {}), image: (res.data as any).url };
        return { ...prev, about: { ...(prev.about || {}), leadership: { ...(prev.about?.leadership || {}), members } } };
      });
      toast.success('Image uploaded');
    } else {
      toast.error(res?.message || 'Upload failed');
    }
  };

  const handleUploadPartnerLogo = async (file: File, index: number) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('for', 'about-partner');
    const token = Cookies.get('token');
    showPreloader('Uploading partner logo...');
    const res = await POST_REQUEST_FILE_UPLOAD<{ url: string }>(`${URLS.BASE}${URLS.uploadSingleImg}`, formData, token);
    hidePreloader();
    if (res?.success && res.data && (res.data as any).url) {
      setForm(prev => {
        const logos = [...(prev.about?.partners?.logos || [])];
        logos[index] = (res.data as any).url;
        return { ...prev, about: { ...(prev.about || {}), partners: { ...(prev.about?.partners || {}), logos } } };
      });
      toast.success('Logo uploaded');
    } else {
      toast.error(res?.message || 'Upload failed');
    }
  };

  // CTA gradient helpers (store as linear-gradient string)
  const setContactCtaGradient = (start: string, end: string) => {
    const g = `linear-gradient(90deg, ${start} 0%, ${end} 100%)`;
    updateCtaField('backgroundGradient', g);
  };

  const setAboutCtaGradient = (start: string, end: string) => {
    const g = `linear-gradient(90deg, ${start} 0%, ${end} 100%)`;
    updateAboutCta('backgroundGradient', g);
  };

  // Color palette options
  const COLOR_PALETTE = ['#09391C', '#4BA678', '#8DDB90', '#0B572B', '#065F46', '#F3F4F6', '#000000', '#FFFFFF'];

  const onSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!form.publicSlug) {
      toast.error("Please set your public link");
      return;
    }
    if (!slugLocked) {
      const valid = /^[a-z0-9]([a-z0-9-]{1,61}[a-z0-9])?$/.test(form.publicSlug);
      if (!valid) {
        toast.error("Invalid subdomain format");
        return;
      }
      if (slugStatus !== "available") {
        toast.error("Subdomain not available");
        return;
      }
    }
    setSaving(true);
    try {
      const token = Cookies.get("token");
      const payload: DealSiteSettings = {
        ...form,
        keywords: form.keywords.map((k) => k.trim()).filter(Boolean),
        contactVisibility: {
          ...form.contactVisibility,
          whatsappNumber: form.contactVisibility.showWhatsAppButton ? form.contactVisibility.whatsappNumber : "",
        },
        footer: form.footer || { shortDescription: "", copyrightText: "" },
        paymentDetails: form.paymentDetails,
      };

      if (!payload?.paymentDetails?.businessName || !payload?.paymentDetails?.accountNumber || !payload?.paymentDetails?.sortCode) {
        toast.error("Please complete Bank Details: business name, account number and bank");
        setSaving(false);
        return;
      }

      if (!slugLocked) {
        showPreloader("Setting up your deal site. Please wait...");
        const res = await POST_REQUEST(`${URLS.BASE}/account/dealSite/setUp`, payload, token);
        hidePreloader();
        if ((res as any)?.success) {
          toast.success("Setup complete. Your deal site is pending activation.");
          setSlugLocked(true);
          setIsPaused(true);
          setActiveView("manage");
          setActiveTab("overview");
          return;
        }
        throw new Error((res as any)?.message || "Setup failed");
      }
    } catch (err) {
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
      hidePreloader();
    }
  };

  const copyLink = useCallback(async () => {
    if (!previewUrl) return;
    try {
      await navigator.clipboard.writeText(previewUrl);
      toast.success("Link copied");
    } catch {}
  }, [previewUrl]);

  const pauseDealSite = useCallback(async () => {
    if (!form.publicSlug) return;
    const token = Cookies.get("token");
    showPreloader("Pausing public access page...");
    const res = await PUT_REQUEST(`${URLS.BASE}/account/dealSite/${form.publicSlug}/pause`, {}, token);
    hidePreloader();
    if (res?.success) {
      setIsPaused(true);
      toast.success("Public Access Page paused");
    } else {
      toast.error(res?.message || "Failed to pause");
    }
  }, [form.publicSlug, showPreloader, hidePreloader]);

  const resumeDealSite = useCallback(async () => {
    if (!form.publicSlug) return;
    const token = Cookies.get("token");
    showPreloader("Resuming public access page...");
    const res = await PUT_REQUEST(`${URLS.BASE}/account/dealSite/${form.publicSlug}/resume`, {}, token);
    hidePreloader();
    if (res?.success) {
      setIsPaused(false);
      toast.success("Public Access Page resumed");
    } else {
      toast.error(res?.message || "Failed to resume");
    }
  }, [form.publicSlug, showPreloader, hidePreloader]);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const deleteDealSite = async () => {
    if (!form.publicSlug) return;
    const token = Cookies.get("token");
    showPreloader("Deleting public access page...");
    const res = await DELETE_REQUEST(`${URLS.BASE}/account/dealSite/${form.publicSlug}/delete`, undefined, token);
    hidePreloader();
    if (res?.success) {
      toast.success("Public Access Page deleted");
      setSlugLocked(false);
      setForm((prev) => ({ ...prev, publicSlug: "" }));
      setActiveView("setup");
    } else {
      toast.error(res?.message || "Failed to delete");
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (!user || user?.userType !== "Agent") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-6">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4 animate-pulse" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Access Denied or Connection Issue
          </h2>
          <p className="text-gray-600 mb-6">
            You either don’t have permission to access this page, or there’s a temporary internet issue.
          </p>

          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-all"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  const statusBadge = (
    <span
      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs border ${
        !slugLocked
          ? "bg-gray-50 text-gray-700 border-gray-200"
          : isPaused
          ? "bg-yellow-50 text-yellow-700 border-yellow-200"
          : "bg-emerald-50 text-emerald-700 border-emerald-200"
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${!slugLocked ? "bg-gray-400" : isPaused ? "bg-yellow-500" : "bg-emerald-500"}`} />
      {!slugLocked ? "Draft" : isPaused ? "Paused" : "Live"}
    </span>
  );


  const inputBase = "w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400";
  const checkboxBase = "h-4 w-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500";
  const selectBase = inputBase;

  // Helper functions to update nested contactUs structure
  const updateHeroField = (key: keyof NonNullable<ContactUsSection['hero']>, value: any) => {
    setForm(prev => ({
      ...prev,
      contactUs: {
        ...(prev.contactUs || {}),
        hero: {
          ...(prev.contactUs?.hero || {}),
          [key]: value,
        },
      },
    }));
  };

  const updateHeroCta = (key: 'text' | 'link' | 'style', value: any) => {
    setForm(prev => ({
      ...prev,
      contactUs: {
        ...(prev.contactUs || {}),
        hero: {
          ...(prev.contactUs?.hero || {}),
          cta: {
            ...(prev.contactUs?.hero?.cta || {}),
            [key]: value,
          },
        },
      },
    }));
  };

  const updateContactInfoField = (key: keyof NonNullable<ContactUsSection['contactInfo']>, value: any) => {
    setForm(prev => ({
      ...prev,
      contactUs: {
        ...(prev.contactUs || {}),
        contactInfo: {
          ...(prev.contactUs?.contactInfo || {}),
          [key]: value,
        },
      },
    }));
  };

  const updateContactInfoItem = (index: number, key: keyof { icon?: string; label?: string; value?: string }, value: any) => {
    setForm(prev => {
      const items = [...(prev.contactUs?.contactInfo?.items || [])];
      items[index] = { ...(items[index] || {}), [key]: value };
      return { ...prev, contactUs: { ...(prev.contactUs || {}), contactInfo: { ...(prev.contactUs?.contactInfo || {}), items } } };
    });
  };

  const addContactInfoItem = () => setForm(prev => ({ ...prev, contactUs: { ...(prev.contactUs || {}), contactInfo: { ...(prev.contactUs?.contactInfo || {}), items: [ ...(prev.contactUs?.contactInfo?.items || []), { icon: "", label: "", value: "" } ] } } }));
  const removeContactInfoItem = (index: number) => setForm(prev => { const items = [...(prev.contactUs?.contactInfo?.items || [])]; items.splice(index, 1); return { ...prev, contactUs: { ...(prev.contactUs || {}), contactInfo: { ...(prev.contactUs?.contactInfo || {}), items } } }; });

  const updateMapField = (key: keyof NonNullable<ContactUsSection['mapSection']>, value: any) => {
    setForm(prev => ({ ...prev, contactUs: { ...(prev.contactUs || {}), mapSection: { ...(prev.contactUs?.mapSection || {}), [key]: value } } }));
  };

  const updateMapLocation = (index: number, data: Partial<{ city?: string; address?: string; coordinates?: [number | string, number | string] }>) => {
    setForm(prev => {
      const locations = [...(prev.contactUs?.mapSection?.locations || [])];
      locations[index] = { ...(locations[index] || { city: "", address: "", coordinates: ["",""] }), ...(data as any) };
      return { ...prev, contactUs: { ...(prev.contactUs || {}), mapSection: { ...(prev.contactUs?.mapSection || {}), locations } } };
    });
  };

  const addMapLocation = () => setForm(prev => ({ ...prev, contactUs: { ...(prev.contactUs || {}), mapSection: { ...(prev.contactUs?.mapSection || {}), locations: [ ...(prev.contactUs?.mapSection?.locations || []), { city: "", address: "", coordinates: [0,0] } ] } } }));
  const removeMapLocation = (index: number) => setForm(prev => { const list = [...(prev.contactUs?.mapSection?.locations || [])]; list.splice(index,1); return { ...prev, contactUs: { ...(prev.contactUs || {}), mapSection: { ...(prev.contactUs?.mapSection || {}), locations: list } } }; });

  const updateCtaField = (key: keyof NonNullable<ContactUsSection['cta']>, value: any) => {
    setForm(prev => ({ ...prev, contactUs: { ...(prev.contactUs || {}), cta: { ...(prev.contactUs?.cta || {}), [key]: value } } }));
  };

  // Helper functions for About section
  const updateAboutHeroField = (key: keyof AboutHero, value: any) => {
    setForm(prev => ({ ...prev, about: { ...(prev.about || {}), hero: { ...(prev.about?.hero || {}), [key]: value } } }));
  };

  const updateAboutHeroCta = (key: keyof AboutHeroCta, value: any) => {
    setForm(prev => ({ ...prev, about: { ...(prev.about || {}), hero: { ...(prev.about?.hero || {}), cta: { ...(prev.about?.hero?.cta || {}), [key]: value } } } }));
  };

  const updateAboutIdentity = (key: keyof AboutIdentity, value: any) => {
    setForm(prev => ({ ...prev, about: { ...(prev.about || {}), identity: { ...(prev.about?.identity || {}), [key]: value } } }));
  };

  const updateAboutIdentityHighlights = (index: number, value: string) => {
    setForm(prev => {
      const highlights = [...(prev.about?.identity?.keyHighlights || [])];
      highlights[index] = value;
      return { ...prev, about: { ...(prev.about || {}), identity: { ...(prev.about?.identity || {}), keyHighlights: highlights } } };
    });
  };

  const addAboutIdentityHighlight = () => {
    setForm(prev => ({ ...prev, about: { ...(prev.about || {}), identity: { ...(prev.about?.identity || {}), keyHighlights: [...(prev.about?.identity?.keyHighlights || []), ""] } } }));
  };

  const removeAboutIdentityHighlight = (index: number) => {
    setForm(prev => {
      const highlights = [...(prev.about?.identity?.keyHighlights || [])];
      highlights.splice(index, 1);
      return { ...prev, about: { ...(prev.about || {}), identity: { ...(prev.about?.identity || {}), keyHighlights: highlights } } };
    });
  };

  const updateAboutMissionVision = (key: keyof AboutMissionVision, value: any) => {
    setForm(prev => ({ ...prev, about: { ...(prev.about || {}), missionVision: { ...(prev.about?.missionVision || {}), [key]: value } } }));
  };

  const updateAboutMissionVisionItem = (index: number, key: keyof AboutMissionVisionItem, value: string) => {
    setForm(prev => {
      const items = [...(prev.about?.missionVision?.items || [])];
      items[index] = { ...(items[index] || {}), [key]: value };
      return { ...prev, about: { ...(prev.about || {}), missionVision: { ...(prev.about?.missionVision || {}), items } } };
    });
  };

  const addAboutMissionVisionItem = () => {
    setForm(prev => ({ ...prev, about: { ...(prev.about || {}), missionVision: { ...(prev.about?.missionVision || {}), items: [...(prev.about?.missionVision?.items || []), { title: "", description: "" }] } } }));
  };

  const removeAboutMissionVisionItem = (index: number) => {
    setForm(prev => {
      const items = [...(prev.about?.missionVision?.items || [])];
      items.splice(index, 1);
      return { ...prev, about: { ...(prev.about || {}), missionVision: { ...(prev.about?.missionVision || {}), items } } };
    });
  };

  const updateAboutValues = (key: keyof AboutValues, value: any) => {
    setForm(prev => ({ ...prev, about: { ...(prev.about || {}), values: { ...(prev.about?.values || {}), [key]: value } } }));
  };

  const updateAboutValueItem = (index: number, key: keyof AboutValuesItem, value: string) => {
    setForm(prev => {
      const items = [...(prev.about?.values?.items || [])];
      items[index] = { ...(items[index] || {}), [key]: value };
      return { ...prev, about: { ...(prev.about || {}), values: { ...(prev.about?.values || {}), items } } };
    });
  };

  const addAboutValueItem = () => {
    setForm(prev => ({ ...prev, about: { ...(prev.about || {}), values: { ...(prev.about?.values || {}), items: [...(prev.about?.values?.items || []), { icon: "", title: "", description: "" }] } } }));
  };

  const removeAboutValueItem = (index: number) => {
    setForm(prev => {
      const items = [...(prev.about?.values?.items || [])];
      items.splice(index, 1);
      return { ...prev, about: { ...(prev.about || {}), values: { ...(prev.about?.values || {}), items } } };
    });
  };

  const updateAboutJourney = (key: keyof AboutJourney, value: any) => {
    setForm(prev => ({ ...prev, about: { ...(prev.about || {}), journey: { ...(prev.about?.journey || {}), [key]: value } } }));
  };

  const updateAboutJourneyItem = (index: number, key: keyof AboutJourneyItem, value: string) => {
    setForm(prev => {
      const items = [...(prev.about?.journey?.timeline || [])];
      items[index] = { ...(items[index] || {}), [key]: value };
      return { ...prev, about: { ...(prev.about || {}), journey: { ...(prev.about?.journey || {}), timeline: items } } };
    });
  };

  const addAboutJourneyItem = () => {
    setForm(prev => ({ ...prev, about: { ...(prev.about || {}), journey: { ...(prev.about?.journey || {}), timeline: [...(prev.about?.journey?.timeline || []), { year: "", title: "", description: "" }] } } }));
  };

  const removeAboutJourneyItem = (index: number) => {
    setForm(prev => {
      const items = [...(prev.about?.journey?.timeline || [])];
      items.splice(index, 1);
      return { ...prev, about: { ...(prev.about || {}), journey: { ...(prev.about?.journey || {}), timeline: items } } };
    });
  };

  const updateAboutLeadership = (key: keyof AboutLeadership, value: any) => {
    setForm(prev => ({ ...prev, about: { ...(prev.about || {}), leadership: { ...(prev.about?.leadership || {}), [key]: value } } }));
  };

  const updateAboutLeadershipMember = (index: number, key: keyof AboutLeadershipMember, value: string) => {
    setForm(prev => {
      const members = [...(prev.about?.leadership?.members || [])];
      members[index] = { ...(members[index] || {}), [key]: value };
      return { ...prev, about: { ...(prev.about || {}), leadership: { ...(prev.about?.leadership || {}), members } } };
    });
  };

  const addAboutLeadershipMember = () => {
    setForm(prev => ({ ...prev, about: { ...(prev.about || {}), leadership: { ...(prev.about?.leadership || {}), members: [...(prev.about?.leadership?.members || []), { name: "", role: "", image: "", quote: "" }] } } }));
  };

  const removeAboutLeadershipMember = (index: number) => {
    setForm(prev => {
      const members = [...(prev.about?.leadership?.members || [])];
      members.splice(index, 1);
      return { ...prev, about: { ...(prev.about || {}), leadership: { ...(prev.about?.leadership || {}), members } } };
    });
  };

  const updateAboutStats = (key: keyof AboutStats, value: any) => {
    setForm(prev => ({ ...prev, about: { ...(prev.about || {}), stats: { ...(prev.about?.stats || {}), [key]: value } } }));
  };

  const updateAboutStatItem = (index: number, key: keyof AboutStatItem, value: string) => {
    setForm(prev => {
      const items = [...(prev.about?.stats?.items || [])];
      items[index] = { ...(items[index] || {}), [key]: value };
      return { ...prev, about: { ...(prev.about || {}), stats: { ...(prev.about?.stats || {}), items } } };
    });
  };

  const addAboutStatItem = () => {
    setForm(prev => ({ ...prev, about: { ...(prev.about || {}), stats: { ...(prev.about?.stats || {}), items: [...(prev.about?.stats?.items || []), { label: "", value: "" }] } } }));
  };

  const removeAboutStatItem = (index: number) => {
    setForm(prev => {
      const items = [...(prev.about?.stats?.items || [])];
      items.splice(index, 1);
      return { ...prev, about: { ...(prev.about || {}), stats: { ...(prev.about?.stats || {}), items } } };
    });
  };

  const updateAboutPartners = (key: keyof AboutPartners, value: any) => {
    setForm(prev => ({ ...prev, about: { ...(prev.about || {}), partners: { ...(prev.about?.partners || {}), [key]: value } } }));
  };

  const updateAboutPartnerLogo = (index: number, value: string) => {
    setForm(prev => {
      const logos = [...(prev.about?.partners?.logos || [])];
      logos[index] = value;
      return { ...prev, about: { ...(prev.about || {}), partners: { ...(prev.about?.partners || {}), logos } } };
    });
  };

  const addAboutPartnerLogo = () => {
    setForm(prev => ({ ...prev, about: { ...(prev.about || {}), partners: { ...(prev.about?.partners || {}), logos: [...(prev.about?.partners?.logos || []), ""] } } }));
  };

  const removeAboutPartnerLogo = (index: number) => {
    setForm(prev => {
      const logos = [...(prev.about?.partners?.logos || [])];
      logos.splice(index, 1);
      return { ...prev, about: { ...(prev.about || {}), partners: { ...(prev.about?.partners || {}), logos } } };
    });
  };

  const updateAboutTestimonials = (key: keyof AboutTestimonials, value: any) => {
    setForm(prev => ({ ...prev, about: { ...(prev.about || {}), testimonials: { ...(prev.about?.testimonials || {}), [key]: value } } }));
  };

  const updateAboutCta = (key: keyof AboutCtaSection, value: any) => {
    setForm(prev => ({ ...prev, about: { ...(prev.about || {}), cta: { ...(prev.about?.cta || {}), [key]: value } } }));
  };

  const SetupHeader = (
    <div className="mb-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#09391C]">Public Access Page Setup</h1>
        {statusBadge}
      </div>
      <p className="text-sm text-[#5A5D63] mt-1">Follow the steps to get your public access page live.</p>
    </div>
  );

  const ManageHeader = (
    <div className="mb-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#09391C]">Public Access Page</h1>
        {statusBadge}
      </div>
      <p className="text-sm text-[#5A5D63] mt-1">Your public access page settings and analytics.</p>
    </div>
  );

  const steps = [
    { label: "Public Link", status: setupStep > 0 ? "completed" : "active" },
    { label: "Design", status: setupStep > 1 ? "completed" : setupStep === 1 ? "active" : "pending" },
    { label: "Marketplace", status: setupStep > 2 ? "completed" : setupStep === 2 ? "active" : "pending" },
    { label: "Payment", status: setupStep > 3 ? "completed" : setupStep === 3 ? "active" : "pending" },
    { label: "Review", status: setupStep === 4 ? "active" : "pending" },
  ] as const;

  const renderBrandingSeo = (
    <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
      <h2 className="text-lg font-semibold text-[#09391C]">Branding & SEO</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-gray-700 mb-1">Title</label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className={inputBase}
            placeholder="Page title"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-700 mb-1">Keywords (comma separated)</label>
          <input
            type="text"
            value={form.keywords.join(", ")}
            onChange={(e) => setForm({ ...form, keywords: e.target.value.split(",").map((k) => k.trim()).filter(Boolean) })}
            className={inputBase}
            placeholder="agent, real estate, listings"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm text-gray-700 mb-1">Description</label>
        <textarea
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className={`${inputBase} min-h-[100px]`}
          placeholder="Tell visitors about you"
        />
      </div>
      <div>
        <label className="block text-sm text-gray-700 mb-2">Logo</label>
        {form.logoUrl ? (
          <div className="flex items-center gap-3">
            <img src={form.logoUrl} alt="Logo" className="h-12 w-12 rounded border object-contain bg-white" />
            <button type="button" onClick={() => setForm({ ...form, logoUrl: "" })} className="px-3 py-2 text-sm border rounded-lg inline-flex items-center gap-2">
              <Trash2 size={16} /> Remove
            </button>
          </div>
        ) : (
          <label className="flex items-center justify-center gap-2 px-4 py-6 border-2 border-dashed rounded-lg text-sm cursor-pointer hover:bg-gray-50">
            <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files && handleUploadLogo(e.target.files[0])} />
            <ImageIcon size={16} /> <span className="text-gray-600">Drag & drop or click to upload</span>
          </label>
        )}
      </div>
    </div>
  );

  const renderPublicLink = (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-[#09391C] flex items-center gap-2"><LinkIcon size={18} /> Public Link</h2>
        {slugLocked && (
          <div className="inline-flex items-center gap-1 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded">
            <ShieldCheck size={14} /> Locked
          </div>
        )}
      </div>
      <div className="grid grid-cols-1 gap-3">
        <label className="text-sm text-gray-700">Enter your subdomain (can be set once)</label>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={form.publicSlug}
            onChange={(e) => setForm({ ...form, publicSlug: e.target.value.replace(/[^a-z0-9-]/g, '').toLowerCase() })}
            disabled={slugLocked}
            className={`${inputBase} disabled:bg-gray-100`}
            placeholder="yourname"
            required
          />
          <span className="text-sm text-gray-500 whitespace-nowrap">.khabiteq.com</span>
        </div>
        {!slugLocked && form.publicSlug && (
          <div className={`text-xs ${slugStatus === 'available' ? 'text-emerald-700' : slugStatus === 'taken' || slugStatus === 'invalid' ? 'text-red-600' : 'text-gray-600'}`}>
            {slugMessage}
          </div>
        )}
        {previewUrl && (
          <div className="flex items-center gap-2 text-sm text-emerald-700">
            <a href={previewUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1">
              Preview: {previewUrl} <ExternalLink size={14} />
            </a>
            <button type="button" onClick={copyLink} className="inline-flex items-center gap-1 text-emerald-700">
              <Copy size={14} /> Copy
            </button>
          </div>
        )}
      </div>
    </div>
  );

  const renderPublicDesign = (
    <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
      <h2 className="text-lg font-semibold text-[#09391C]">Public Page Design</h2>
      <div>
        <label className="block text-sm text-gray-700 mb-2">Hero Image</label>
        {form.publicPage.heroImageUrl ? (
          <div className="flex items-center gap-3">
            <img src={form.publicPage.heroImageUrl} alt="Hero" className="h-20 w-36 rounded border object-cover bg-white" />
            <button type="button" onClick={() => setForm({ ...form, publicPage: { ...form.publicPage, heroImageUrl: "" } })} className="px-3 py-2 text-sm border rounded-lg inline-flex items-center gap-2">
              <Trash2 size={16} /> Remove
            </button>
          </div>
        ) : (
          <label className="flex items-center justify-center gap-2 px-4 py-6 border-2 border-dashed rounded-lg text-sm cursor-pointer hover:bg-gray-50">
            <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files && handleUploadHero(e.target.files[0])} />
            <ImageIcon size={16} /> <span className="text-gray-600">Drag & drop or click to upload</span>
          </label>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-gray-700 mb-1">Hero Title</label>
          <input type="text" value={form.publicPage.heroTitle} onChange={(e) => setForm({ ...form, publicPage: { ...form.publicPage, heroTitle: e.target.value } })} className={inputBase} />
        </div>
        <div>
          <label className="block text-sm text-gray-700 mb-1">Hero Subtitle</label>
          <input type="text" value={form.publicPage.heroSubtitle} onChange={(e) => setForm({ ...form, publicPage: { ...form.publicPage, heroSubtitle: e.target.value } })} className={inputBase} />
        </div>
        <div>
          <label className="block text-sm text-gray-700 mb-1">CTA Text</label>
          <input type="text" value={form.publicPage.ctaText} onChange={(e) => setForm({ ...form, publicPage: { ...form.publicPage, ctaText: e.target.value } })} className={inputBase} />
        </div>
        <div>
          <label className="block text-sm text-gray-700 mb-1">CTA Link</label>
          <input type="text" value={form.publicPage.ctaLink} onChange={(e) => setForm({ ...form, publicPage: { ...form.publicPage, ctaLink: e.target.value } })} className={inputBase} placeholder="/market-place?tab=buy" />
        </div>
      </div>
    </div>
  );

  const handleUploadAboutHero = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("for", "public-about-hero");
    const token = Cookies.get("token");

    showPreloader("Uploading about hero...");
    const res = await POST_REQUEST_FILE_UPLOAD<{ url: string }>(`${URLS.BASE}${URLS.uploadSingleImg}`, formData, token);
    hidePreloader();
    if (res?.success && res.data && (res.data as any).url) {
      updateAboutHeroField("backgroundImage", (res.data as any).url);
      toast.success("Image uploaded");
    } else {
      toast.error(res?.message || "Upload failed");
    }
  };

  const handleUploadAboutHeroVideo = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("for", "public-about-hero-video");
    const token = Cookies.get("token");

    showPreloader("Uploading about hero video...");
    const res = await POST_REQUEST_FILE_UPLOAD<{ url: string }>(`${URLS.BASE}${URLS.uploadSingleImg}`, formData, token);
    hidePreloader();
    if (res?.success && res.data && (res.data as any).url) {
      updateAboutHeroField("backgroundVideo", (res.data as any).url);
      toast.success("Video uploaded");
    } else {
      toast.error(res?.message || "Upload failed");
    }
  };

  const handleUploadAboutMobileFallback = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("for", "public-about-mobile-fallback");
    const token = Cookies.get("token");

    showPreloader("Uploading mobile fallback image...");
    const res = await POST_REQUEST_FILE_UPLOAD<{ url: string }>(`${URLS.BASE}${URLS.uploadSingleImg}`, formData, token);
    hidePreloader();
    if (res?.success && res.data && (res.data as any).url) {
      updateAboutHeroField("mobileFallbackImage", (res.data as any).url);
      toast.success("Image uploaded");
    } else {
      toast.error(res?.message || "Upload failed");
    }
  };

  const handleUploadTestimonialImage = async (file: File, index: number) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("for", "public-testimonial");
    const token = Cookies.get("token");

    showPreloader("Uploading testimonial image...");
    const res = await POST_REQUEST_FILE_UPLOAD<{ url: string }>(`${URLS.BASE}${URLS.uploadSingleImg}`, formData, token);
    hidePreloader();
    if (res?.success && res.data && (res.data as any).url) {
      setForm((prev) => {
        const testimonials = prev.homeSettings?.testimonials || { testimonials: [] };
        if (testimonials.testimonials && testimonials.testimonials[index]) {
          testimonials.testimonials[index].image = (res.data as any).url;
        }
        return {
          ...prev,
          homeSettings: { ...(prev.homeSettings || {}), testimonials },
        };
      });
      toast.success("Image uploaded");
    } else {
      toast.error(res?.message || "Upload failed");
    }
  };

  const renderHomeSettings = (
    <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-8">
      <div>
        <h2 className="text-lg font-semibold text-[#09391C] mb-6">Home Settings</h2>

        {/* Testimonials Section */}
        <div className="mb-8 pb-8 border-b border-gray-200">
          <h3 className="text-base font-semibold text-[#09391C] mb-4">Testimonials</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm text-gray-700 mb-1">Title</label>
              <input
                type="text"
                value={form.homeSettings?.testimonials?.title || ''}
                onChange={(e) => setForm(prev => ({
                  ...prev,
                  homeSettings: {
                    ...(prev.homeSettings || {}),
                    testimonials: {
                      title: e.target.value,
                      subTitle: form.homeSettings?.testimonials?.subTitle || '',
                      testimonials: form.homeSettings?.testimonials?.testimonials || [],
                    },
                  },
                }))}
                className={inputBase}
                placeholder="What Our Clients Say"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">Subtitle</label>
              <input
                type="text"
                value={form.homeSettings?.testimonials?.subTitle || ''}
                onChange={(e) => setForm(prev => ({
                  ...prev,
                  homeSettings: {
                    ...(prev.homeSettings || {}),
                    testimonials: {
                      title: form.homeSettings?.testimonials?.title || '',
                      subTitle: e.target.value,
                      testimonials: form.homeSettings?.testimonials?.testimonials || [],
                    },
                  },
                }))}
                className={inputBase}
                placeholder="Real feedback from real clients"
              />
            </div>
          </div>

          {/* Testimonial Items */}
          <div className="space-y-4">
            {form.homeSettings?.testimonials?.testimonials?.map((testimonial, idx) => (
              <div key={idx} className="border border-gray-300 rounded-lg p-4 bg-gray-50">
                <div className="flex justify-between items-start mb-3">
                  <h4 className="font-medium text-sm text-[#09391C]">Testimonial {idx + 1}</h4>
                  <button
                    type="button"
                    onClick={() => {
                      setForm(prev => ({
                        ...prev,
                        homeSettings: {
                          ...(prev.homeSettings || {}),
                          testimonials: {
                            ...(prev.homeSettings?.testimonials || {}),
                            testimonials: form.homeSettings?.testimonials?.testimonials?.filter((_, i) => i !== idx) || [],
                          },
                        },
                      }));
                    }}
                    className="text-red-500 hover:text-red-700 text-sm flex items-center gap-1"
                  >
                    <Trash2 size={14} /> Remove
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="block text-xs text-gray-700 mb-1">Rating (1-5)</label>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          const updated = [...(form.homeSettings?.testimonials?.testimonials || [])];
                          updated[idx].rating = Math.max(1, (updated[idx].rating || 5) - 1);
                          setForm(prev => ({
                            ...prev,
                            homeSettings: {
                              ...(prev.homeSettings || {}),
                              testimonials: {
                                ...(prev.homeSettings?.testimonials || {}),
                                testimonials: updated,
                              },
                            },
                          }));
                        }}
                        className="px-2 py-1 border border-gray-300 rounded text-sm hover:bg-gray-100"
                      >
                        −
                      </button>
                      <span className="px-3 py-1 border border-gray-300 rounded text-sm font-medium w-12 text-center bg-gray-50">
                        {testimonial.rating || 5}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          const updated = [...(form.homeSettings?.testimonials?.testimonials || [])];
                          updated[idx].rating = Math.min(5, (updated[idx].rating || 5) + 1);
                          setForm(prev => ({
                            ...prev,
                            homeSettings: {
                              ...(prev.homeSettings || {}),
                              testimonials: {
                                ...(prev.homeSettings?.testimonials || {}),
                                testimonials: updated,
                              },
                            },
                          }));
                        }}
                        className="px-2 py-1 border border-gray-300 rounded text-sm hover:bg-gray-100"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-700 mb-1">Name</label>
                    <input
                      type="text"
                      value={testimonial.name || ''}
                      onChange={(e) => {
                        const updated = [...(form.homeSettings?.testimonials?.testimonials || [])];
                        updated[idx].name = e.target.value;
                        setForm(prev => ({
                          ...prev,
                          homeSettings: {
                            ...(prev.homeSettings || {}),
                            testimonials: {
                              ...(prev.homeSettings?.testimonials || {}),
                              testimonials: updated,
                            },
                          },
                        }));
                      }}
                      className={`${inputBase} text-sm`}
                      placeholder="John Doe"
                    />
                  </div>
                </div>
                <div className="mb-3">
                  <label className="block text-xs text-gray-700 mb-1">Company</label>
                  <input
                    type="text"
                    value={testimonial.company || ''}
                    onChange={(e) => {
                      const updated = [...(form.homeSettings?.testimonials?.testimonials || [])];
                      updated[idx].company = e.target.value;
                      setForm(prev => ({
                        ...prev,
                        homeSettings: {
                          ...(prev.homeSettings || {}),
                          testimonials: {
                            ...(prev.homeSettings?.testimonials || {}),
                            testimonials: updated,
                          },
                        },
                      }));
                    }}
                    className={`${inputBase} text-sm`}
                    placeholder="Company name"
                  />
                </div>
                <div className="mb-3">
                  <label className="block text-xs text-gray-700 mb-1">Description</label>
                  <textarea
                    value={testimonial.description || ''}
                    onChange={(e) => {
                      const updated = [...(form.homeSettings?.testimonials?.testimonials || [])];
                      updated[idx].description = e.target.value;
                      setForm(prev => ({
                        ...prev,
                        homeSettings: {
                          ...(prev.homeSettings || {}),
                          testimonials: {
                            ...(prev.homeSettings?.testimonials || {}),
                            testimonials: updated,
                          },
                        },
                      }));
                    }}
                    className={`${inputBase} text-sm min-h-[60px]`}
                    placeholder="Share your experience..."
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-700 mb-2">Image</label>
                  {testimonial.image ? (
                    <div className="flex items-center gap-2">
                      <img src={testimonial.image} alt="Testimonial" className="h-12 w-12 rounded object-cover border" />
                      <button
                        type="button"
                        onClick={() => {
                          const updated = [...(form.homeSettings?.testimonials?.testimonials || [])];
                          updated[idx].image = undefined;
                          setForm(prev => ({
                            ...prev,
                            homeSettings: {
                              ...(prev.homeSettings || {}),
                              testimonials: {
                                ...(prev.homeSettings?.testimonials || {}),
                                testimonials: updated,
                              },
                            },
                          }));
                        }}
                        className="text-xs px-2 py-1 border rounded hover:bg-gray-100"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <label className="flex items-center justify-center gap-1 px-2 py-2 border-2 border-dashed rounded-lg text-xs cursor-pointer hover:bg-gray-50">
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => e.target.files && handleUploadTestimonialImage(e.target.files[0], idx)}
                      />
                      <ImageIcon size={14} /> Upload
                    </label>
                  )}
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() => {
              setForm(prev => ({
                ...prev,
                homeSettings: {
                  ...(prev.homeSettings || {}),
                  testimonials: {
                    ...(prev.homeSettings?.testimonials || {}),
                    testimonials: [
                      ...(prev.homeSettings?.testimonials?.testimonials || []),
                      { rating: 5, description: '', name: '', company: '', image: '' },
                    ],
                  },
                },
              }));
            }}
            className="mt-3 px-3 py-2 text-sm border border-emerald-500 text-emerald-600 rounded-lg hover:bg-emerald-50"
          >
            + Add Testimonial
          </button>
        </div>

        {/* Why Choose Us Section */}
        <div className="mb-8 pb-8 border-b border-gray-200">
          <h3 className="text-base font-semibold text-[#09391C] mb-4">Why Choose Us</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm text-gray-700 mb-1">Title</label>
              <input
                type="text"
                value={form.homeSettings?.whyChooseUs?.title || ''}
                onChange={(e) => setForm(prev => ({
                  ...prev,
                  homeSettings: {
                    ...(prev.homeSettings || {}),
                    whyChooseUs: {
                      title: e.target.value,
                      subTitle: form.homeSettings?.whyChooseUs?.subTitle || '',
                      items: form.homeSettings?.whyChooseUs?.items || [],
                    },
                  },
                }))}
                className={inputBase}
                placeholder="Why Choose Us"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">Subtitle</label>
              <input
                type="text"
                value={form.homeSettings?.whyChooseUs?.subTitle || ''}
                onChange={(e) => setForm(prev => ({
                  ...prev,
                  homeSettings: {
                    ...(prev.homeSettings || {}),
                    whyChooseUs: {
                      title: form.homeSettings?.whyChooseUs?.title || '',
                      subTitle: e.target.value,
                      items: form.homeSettings?.whyChooseUs?.items || [],
                    },
                  },
                }))}
                className={inputBase}
                placeholder="We stand out from the rest"
              />
            </div>
          </div>

          {/* Why Choose Us Items */}
          <div className="space-y-3">
            {form.homeSettings?.whyChooseUs?.items?.map((item, idx) => (
              <div key={idx} className="border border-gray-300 rounded-lg p-3 bg-gray-50">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium text-sm text-[#09391C]">Item {idx + 1}</h4>
                  <button
                    type="button"
                    onClick={() => {
                      setForm(prev => ({
                        ...prev,
                        homeSettings: {
                          ...(prev.homeSettings || {}),
                          whyChooseUs: {
                            ...(prev.homeSettings?.whyChooseUs || {}),
                            items: form.homeSettings?.whyChooseUs?.items?.filter((_, i) => i !== idx) || [],
                          },
                        },
                      }));
                    }}
                    className="text-red-500 hover:text-red-700 text-sm flex items-center gap-1"
                  >
                    <Trash2 size={14} /> Remove
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
                  <div>
                    <label className="block text-xs text-gray-700 mb-1">Icon</label>
                    <IconSelector
                      value={item.icon}
                      onChange={(iconName) => {
                        const updated = [...(form.homeSettings?.whyChooseUs?.items || [])];
                        updated[idx].icon = iconName;
                        setForm(prev => ({
                          ...prev,
                          homeSettings: {
                            ...(prev.homeSettings || {}),
                            whyChooseUs: {
                              ...(prev.homeSettings?.whyChooseUs || {}),
                              items: updated,
                            },
                          },
                        }));
                      }}
                      className="text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-700 mb-1">Title</label>
                    <input
                      type="text"
                      value={item.title || ''}
                      onChange={(e) => {
                        const updated = [...(form.homeSettings?.whyChooseUs?.items || [])];
                        updated[idx].title = e.target.value;
                        setForm(prev => ({
                          ...prev,
                          homeSettings: {
                            ...(prev.homeSettings || {}),
                            whyChooseUs: {
                              ...(prev.homeSettings?.whyChooseUs || {}),
                              items: updated,
                            },
                          },
                        }));
                      }}
                      className={`${inputBase} text-sm`}
                      placeholder="Feature title"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-gray-700 mb-1">Content</label>
                  <textarea
                    value={item.content || ''}
                    onChange={(e) => {
                      const updated = [...(form.homeSettings?.whyChooseUs?.items || [])];
                      updated[idx].content = e.target.value;
                      setForm(prev => ({
                        ...prev,
                        homeSettings: {
                          ...(prev.homeSettings || {}),
                          whyChooseUs: {
                            ...(prev.homeSettings?.whyChooseUs || {}),
                            items: updated,
                          },
                        },
                      }));
                    }}
                    className={`${inputBase} text-sm min-h-[60px]`}
                    placeholder="Describe this feature..."
                  />
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() => {
              setForm(prev => ({
                ...prev,
                homeSettings: {
                  ...(prev.homeSettings || {}),
                  whyChooseUs: {
                    ...(prev.homeSettings?.whyChooseUs || {}),
                    items: [
                      ...(prev.homeSettings?.whyChooseUs?.items || []),
                      { icon: '', title: '', content: '' },
                    ],
                  },
                },
              }));
            }}
            className="mt-2 px-3 py-2 text-sm border border-emerald-500 text-emerald-600 rounded-lg hover:bg-emerald-50"
          >
            + Add Item
          </button>
        </div>

        {/* Ready to Find Section */}
        <div>
          <h3 className="text-base font-semibold text-[#09391C] mb-4">Ready to Find Your Perfect Property?</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm text-gray-700 mb-1">Title</label>
              <input
                type="text"
                value={form.homeSettings?.readyToFind?.title || ''}
                onChange={(e) => setForm(prev => ({
                  ...prev,
                  homeSettings: {
                    ...(prev.homeSettings || {}),
                    readyToFind: {
                      title: e.target.value,
                      subTitle: form.homeSettings?.readyToFind?.subTitle || '',
                      ctas: form.homeSettings?.readyToFind?.ctas || [],
                      items: form.homeSettings?.readyToFind?.items || [],
                    },
                  },
                }))}
                className={inputBase}
                placeholder="Ready to Find Your Perfect Property?"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">Subtitle</label>
              <input
                type="text"
                value={form.homeSettings?.readyToFind?.subTitle || ''}
                onChange={(e) => setForm(prev => ({
                  ...prev,
                  homeSettings: {
                    ...(prev.homeSettings || {}),
                    readyToFind: {
                      title: form.homeSettings?.readyToFind?.title || '',
                      subTitle: e.target.value,
                      ctas: form.homeSettings?.readyToFind?.ctas || [],
                      items: form.homeSettings?.readyToFind?.items || [],
                    },
                  },
                }))}
                className={inputBase}
                placeholder="Start your journey today"
              />
            </div>
          </div>

          {/* CTAs Section - Max 2 */}
          <div className="mb-4">
            <h4 className="text-sm font-medium text-[#09391C] mb-2">Call-to-Action Buttons (Max 2)</h4>
            <div className="space-y-3">
              {form.homeSettings?.readyToFind?.ctas?.slice(0, 2).map((cta, idx) => (
                <div key={idx} className="border border-gray-300 rounded-lg p-3 bg-gray-50">
                  <div className="flex justify-between items-start mb-2">
                    <h5 className="font-medium text-sm text-[#09391C]">CTA {idx + 1}</h5>
                    <button
                      type="button"
                      onClick={() => {
                        setForm(prev => ({
                          ...prev,
                          homeSettings: {
                            ...(prev.homeSettings || {}),
                            readyToFind: {
                              ...(prev.homeSettings?.readyToFind || {}),
                              ctas: form.homeSettings?.readyToFind?.ctas?.filter((_, i) => i !== idx) || [],
                            },
                          },
                        }));
                      }}
                      className="text-red-500 hover:text-red-700 text-sm flex items-center gap-1"
                    >
                      <Trash2 size={14} /> Remove
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    <div>
                      <label className="block text-xs text-gray-700 mb-1">Button Text</label>
                      <input
                        type="text"
                        value={cta.text || ''}
                        onChange={(e) => {
                          const updated = [...(form.homeSettings?.readyToFind?.ctas || [])];
                          updated[idx].text = e.target.value;
                          setForm(prev => ({
                            ...prev,
                            homeSettings: {
                              ...(prev.homeSettings || {}),
                              readyToFind: {
                                ...(prev.homeSettings?.readyToFind || {}),
                                ctas: updated,
                              },
                            },
                          }));
                        }}
                        className={`${inputBase} text-sm`}
                        placeholder="Browse Properties"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-700 mb-1">Button Color (Hex)</label>
                      <input
                        type="color"
                        value={cta.bgColor || '#8DDB90'}
                        onChange={(e) => {
                          const updated = [...(form.homeSettings?.readyToFind?.ctas || [])];
                          updated[idx].bgColor = e.target.value;
                          setForm(prev => ({
                            ...prev,
                            homeSettings: {
                              ...(prev.homeSettings || {}),
                              readyToFind: {
                                ...(prev.homeSettings?.readyToFind || {}),
                                ctas: updated,
                              },
                            },
                          }));
                        }}
                        className="w-full h-9 border rounded cursor-pointer"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-700 mb-1">Link/Route</label>
                      <input
                        type="text"
                        value={cta.actionLink || ''}
                        onChange={(e) => {
                          const updated = [...(form.homeSettings?.readyToFind?.ctas || [])];
                          updated[idx].actionLink = e.target.value;
                          setForm(prev => ({
                            ...prev,
                            homeSettings: {
                              ...(prev.homeSettings || {}),
                              readyToFind: {
                                ...(prev.homeSettings?.readyToFind || {}),
                                ctas: updated,
                              },
                            },
                          }));
                        }}
                        className={`${inputBase} text-sm`}
                        placeholder="/market-place"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {(form.homeSettings?.readyToFind?.ctas?.length || 0) < 2 && (
              <button
                type="button"
                onClick={() => {
                  setForm(prev => ({
                    ...prev,
                    homeSettings: {
                      ...(prev.homeSettings || {}),
                      readyToFind: {
                        ...(prev.homeSettings?.readyToFind || {}),
                        ctas: [
                          ...(prev.homeSettings?.readyToFind?.ctas || []),
                          { text: '', bgColor: '#8DDB90', actionLink: '' },
                        ],
                      },
                    },
                  }));
                }}
                className="mt-2 px-3 py-2 text-sm border border-emerald-500 text-emerald-600 rounded-lg hover:bg-emerald-50"
              >
                + Add CTA
              </button>
            )}
          </div>

          {/* Ready to Find Items - Max 2 */}
          <div>
            <h4 className="text-sm font-medium text-[#09391C] mb-2">Feature Items (Max 2)</h4>
            <div className="space-y-3">
              {form.homeSettings?.readyToFind?.items?.slice(0, 2).map((item, idx) => (
                <div key={idx} className="border border-gray-300 rounded-lg p-3 bg-gray-50">
                  <div className="flex justify-between items-start mb-2">
                    <h5 className="font-medium text-sm text-[#09391C]">Item {idx + 1}</h5>
                    <button
                      type="button"
                      onClick={() => {
                        setForm(prev => ({
                          ...prev,
                          homeSettings: {
                            ...(prev.homeSettings || {}),
                            readyToFind: {
                              ...(prev.homeSettings?.readyToFind || {}),
                              items: form.homeSettings?.readyToFind?.items?.filter((_, i) => i !== idx) || [],
                            },
                          },
                        }));
                      }}
                      className="text-red-500 hover:text-red-700 text-sm flex items-center gap-1"
                    >
                      <Trash2 size={14} /> Remove
                    </button>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <label className="block text-xs text-gray-700 mb-1">Icon</label>
                      <IconSelector
                        value={item.icon}
                        onChange={(iconName) => {
                          const updated = [...(form.homeSettings?.readyToFind?.items || [])];
                          updated[idx].icon = iconName;
                          setForm(prev => ({
                            ...prev,
                            homeSettings: {
                              ...(prev.homeSettings || {}),
                              readyToFind: {
                                ...(prev.homeSettings?.readyToFind || {}),
                                items: updated,
                              },
                            },
                          }));
                        }}
                        className="text-sm"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs text-gray-700 mb-1">Title</label>
                        <input
                          type="text"
                          value={item.title || ''}
                          onChange={(e) => {
                            const updated = [...(form.homeSettings?.readyToFind?.items || [])];
                            updated[idx].title = e.target.value;
                            setForm(prev => ({
                              ...prev,
                              homeSettings: {
                                ...(prev.homeSettings || {}),
                                readyToFind: {
                                  ...(prev.homeSettings?.readyToFind || {}),
                                  items: updated,
                                },
                              },
                            }));
                          }}
                          className={`${inputBase} text-sm`}
                          placeholder="Feature title"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-700 mb-1">Subtitle</label>
                        <input
                          type="text"
                          value={item.subTitle || ''}
                          onChange={(e) => {
                            const updated = [...(form.homeSettings?.readyToFind?.items || [])];
                            updated[idx].subTitle = e.target.value;
                            setForm(prev => ({
                              ...prev,
                              homeSettings: {
                                ...(prev.homeSettings || {}),
                                readyToFind: {
                                  ...(prev.homeSettings?.readyToFind || {}),
                                  items: updated,
                                },
                              },
                            }));
                          }}
                          className={`${inputBase} text-sm`}
                          placeholder="Feature subtitle"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-700 mb-1">Content</label>
                      <textarea
                        value={item.content || ''}
                        onChange={(e) => {
                          const updated = [...(form.homeSettings?.readyToFind?.items || [])];
                          updated[idx].content = e.target.value;
                          setForm(prev => ({
                            ...prev,
                            homeSettings: {
                              ...(prev.homeSettings || {}),
                              readyToFind: {
                                ...(prev.homeSettings?.readyToFind || {}),
                                items: updated,
                              },
                            },
                          }));
                        }}
                        className={`${inputBase} text-sm min-h-[50px]`}
                        placeholder="Describe this feature..."
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {(form.homeSettings?.readyToFind?.items?.length || 0) < 2 && (
              <button
                type="button"
                onClick={() => {
                  setForm(prev => ({
                    ...prev,
                    homeSettings: {
                      ...(prev.homeSettings || {}),
                      readyToFind: {
                        ...(prev.homeSettings?.readyToFind || {}),
                        items: [
                          ...(prev.homeSettings?.readyToFind?.items || []),
                          { icon: '', title: '', subTitle: '', content: '' },
                        ],
                      },
                    },
                  }));
                }}
                className="mt-2 px-3 py-2 text-sm border border-emerald-500 text-emerald-600 rounded-lg hover:bg-emerald-50"
              >
                + Add Item
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderSubscribeSettings = (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-[#09391C] mb-4">Subscribe Settings</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm text-gray-700 mb-1">Title</label>
          <input
            type="text"
            value={form.subscribeSettings?.title || ''}
            onChange={(e) => setForm(prev => ({
              ...prev,
              subscribeSettings: {
                ...(prev.subscribeSettings || {}),
                title: e.target.value,
              },
            }))}
            className={inputBase}
            placeholder="Subscribe to Our Newsletter"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-700 mb-1">Subtitle</label>
          <input
            type="text"
            value={form.subscribeSettings?.subTitle || ''}
            onChange={(e) => setForm(prev => ({
              ...prev,
              subscribeSettings: {
                ...(prev.subscribeSettings || {}),
                subTitle: e.target.value,
              },
            }))}
            className={inputBase}
            placeholder="Get the latest updates and offers"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-700 mb-1">Mini Title</label>
          <input
            type="text"
            value={form.subscribeSettings?.miniTitle || ''}
            onChange={(e) => setForm(prev => ({
              ...prev,
              subscribeSettings: {
                ...(prev.subscribeSettings || {}),
                miniTitle: e.target.value,
              },
            }))}
            className={inputBase}
            placeholder="Stay Updated"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-700 mb-1">Background Color</label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={form.subscribeSettings?.backgroundColor || '#8DDB90'}
              onChange={(e) => setForm(prev => ({
                ...prev,
                subscribeSettings: {
                  ...(prev.subscribeSettings || {}),
                  backgroundColor: e.target.value,
                },
              }))}
              className="h-10 w-20 border rounded cursor-pointer"
            /> 
            <input
              type="text"
              value={form.subscribeSettings?.backgroundColor || '#8DDB90'}
              onChange={(e) => setForm(prev => ({
                ...prev,
                subscribeSettings: {
                  ...(prev.subscribeSettings || {}),
                  backgroundColor: e.target.value,
                },
              }))}
              className={`${inputBase} w-32`}
              placeholder="#8DDB90"
            />
          </div>
        </div>
        <div className="border-t border-gray-200 pt-4">
          <h3 className="text-sm font-medium text-[#09391C] mb-3">CTA Button</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-700 mb-1">Button Text</label>
              <input
                type="text"
                value={form.subscribeSettings?.cta?.text || 'Subscribe Now'}
                onChange={(e) => setForm(prev => ({
                  ...prev,
                  subscribeSettings: {
                    ...(prev.subscribeSettings || {}),
                    cta: {
                      ...(prev.subscribeSettings?.cta || {}),
                      text: e.target.value,
                    },
                  },
                }))}
                className={inputBase}
                placeholder="Subscribe Now"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">Button Color</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={form.subscribeSettings?.cta?.color || '#09391C'}
                  onChange={(e) => setForm(prev => ({
                    ...prev,
                    subscribeSettings: {
                      ...(prev.subscribeSettings || {}),
                      cta: {
                        ...(prev.subscribeSettings?.cta || {}),
                        color: e.target.value,
                      },
                    },
                  }))}
                  className="h-10 w-20 border rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={form.subscribeSettings?.cta?.color || '#09391C'}
                  onChange={(e) => setForm(prev => ({
                    ...prev,
                    subscribeSettings: {
                      ...(prev.subscribeSettings || {}),
                      cta: {
                        ...(prev.subscribeSettings?.cta || {}),
                        color: e.target.value,
                      },
                    },
                  }))}
                  className={`${inputBase} w-32`}
                  placeholder="#09391C"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTheme = (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-[#09391C] mb-4">Theme</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex items-center gap-3">
          <label className="text-sm text-gray-700 w-36">Primary Color</label>
          <input type="color" value={form.theme.primaryColor} onChange={(e) => setForm({ ...form, theme: { ...form.theme, primaryColor: e.target.value } })} />
        </div>
        <div className="flex items-center gap-3">
          <label className="text-sm text-gray-700 w-36">Secondary Color</label>
          <input type="color" value={form.theme.secondaryColor} onChange={(e) => setForm({ ...form, theme: { ...form.theme, secondaryColor: e.target.value } })} />
        </div>
      </div>
    </div>
  );

  const renderFooterDetails = (
    <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
      <h2 className="text-lg font-semibold text-[#09391C]">Footer Details</h2>
      <div className="grid grid-cols-1 gap-4">
        <div>
          <label className="block text-sm text-gray-700 mb-1">Short Description</label>
          <textarea
            value={form.footer?.shortDescription || ''}
            onChange={(e) => setForm({ ...form, footer: { ...(form.footer || { shortDescription: '', copyrightText: '' }), shortDescription: e.target.value } })}
            className={`${inputBase} min-h-[80px]`}
            placeholder="Brief description shown in the footer"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-700 mb-1">Copyright Text</label>
          <input
            type="text"
            value={form.footer?.copyrightText || ''}
            onChange={(e) => setForm({ ...form, footer: { ...(form.footer || { shortDescription: '', copyrightText: '' }), copyrightText: e.target.value } })}
            className={inputBase}
            placeholder="© 2025 Your Name. All rights reserved."
          />
        </div>
      </div>
    </div>
  );

  const renderMarketplaceDefaults = (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-[#09391C] mb-4">Marketplace Defaults</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-gray-700 mb-1">Default Tab</label>
          <select value={form.marketplaceDefaults.defaultTab} onChange={(e) => setForm({ ...form, marketplaceDefaults: { ...form.marketplaceDefaults, defaultTab: e.target.value as any } })} className={selectBase}>
            <option value="buy">Buy</option>
            <option value="rent">Rent</option>
            <option value="shortlet">Shortlet</option>
            <option value="jv">Joint Venture</option>
          </select>
        </div>
        <div>
          <label className="block text-sm text-gray-700 mb-1">Default Sort</label>
          <select value={form.marketplaceDefaults.defaultSort} onChange={(e) => setForm({ ...form, marketplaceDefaults: { ...form.marketplaceDefaults, defaultSort: e.target.value as any } })} className={selectBase}>
            <option value="newest">Newest</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
          </select>
        </div>
      </div>
      <div className="mt-3 space-y-2">
        <label className="flex items-center gap-2 text-sm">
          <input className={checkboxBase} type="checkbox" checked={form.marketplaceDefaults.showVerifiedOnly} onChange={(e) => setForm({ ...form, marketplaceDefaults: { ...form.marketplaceDefaults, showVerifiedOnly: e.target.checked } })} />
          Show only listings with verified documents
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input className={checkboxBase} type="checkbox" checked={form.marketplaceDefaults.enablePriceNegotiationButton} onChange={(e) => setForm({ ...form, marketplaceDefaults: { ...form.marketplaceDefaults, enablePriceNegotiationButton: e.target.checked } })} />
          Enable price negotiation button
        </label>
      </div>
    </div>
  );

  const renderContactVisibility = (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-[#09391C] mb-4">Contact & Visibility</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="flex items-center gap-2 text-sm"><input className={checkboxBase} type="checkbox" checked={form.contactVisibility.showEmail} onChange={(e) => setForm({ ...form, contactVisibility: { ...form.contactVisibility, showEmail: e.target.checked } })} /> Show Email</label>
        <label className="flex items-center gap-2 text-sm"><input className={checkboxBase} type="checkbox" checked={form.contactVisibility.showPhone} onChange={(e) => setForm({ ...form, contactVisibility: { ...form.contactVisibility, showPhone: e.target.checked } })} /> Show Phone</label>
        <label className="flex items-center gap-2 text-sm"><input className={checkboxBase} type="checkbox" checked={form.contactVisibility.enableContactForm} onChange={(e) => setForm({ ...form, contactVisibility: { ...form.contactVisibility, enableContactForm: e.target.checked } })} /> Enable Contact Form</label>
        <label className="flex items-center gap-2 text-sm"><input className={checkboxBase} type="checkbox" checked={form.contactVisibility.showWhatsAppButton} onChange={(e) => setForm({ ...form, contactVisibility: { ...form.contactVisibility, showWhatsAppButton: e.target.checked } })} /> Show WhatsApp Button</label>
      </div>
      {form.contactVisibility.showWhatsAppButton && (
        <div className="mt-3">
          <label className="block text-sm text-gray-700 mb-1">WhatsApp Number</label>
          <input type="tel" value={form.contactVisibility.whatsappNumber} onChange={(e) => setForm({ ...form, contactVisibility: { ...form.contactVisibility, whatsappNumber: e.target.value } })} className={inputBase} placeholder="e.g. +2348012345678" />
        </div>
      )}
    </div>
  );

  const renderSocialLinks = (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-[#09391C] mb-4">Social Links</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {(["website", "twitter", "instagram", "facebook", "linkedin"] as (keyof SocialLinks)[]).map((key) => (
          <div key={key}>
            <label className="block text-sm text-gray-700 mb-1">{key.charAt(0).toUpperCase() + key.slice(1)}</label>
            <input type="url" value={(form.socialLinks?.[key] || "") as string} onChange={(e) => setForm({ ...form, socialLinks: { ...form.socialLinks, [key]: e.target.value } })} className={inputBase} placeholder={key === "website" ? "https://your-site.com" : `https://${key}.com/your-handle`} />
          </div>
        ))}
      </div>
    </div>
  );

  const PaymentDetailsSchema = Yup.object({
    businessName: Yup.string().required("Business Name is required"),
    accountNumber: Yup.string().required("Account Number is required"),
    sortCode: Yup.string().required("Settlement Bank is required"),
    primaryContactEmail: Yup.string().email("Invalid email format").optional(),
    primaryContactName: Yup.string().optional(),
    primaryContactPhone: Yup.string().optional(),
  });

  const renderBankDetails = (
    <Formik
      initialValues={{
        businessName: form.paymentDetails?.businessName || "",
        accountNumber: form.paymentDetails?.accountNumber || "",
        sortCode: form.paymentDetails?.sortCode || "",
        primaryContactEmail: form.paymentDetails?.primaryContactEmail || "",
        primaryContactName: form.paymentDetails?.primaryContactName || "",
        primaryContactPhone: form.paymentDetails?.primaryContactPhone || "",
      }}
      validationSchema={PaymentDetailsSchema}
      onSubmit={(values) => {
        setForm(prev => ({
          ...prev,
          paymentDetails: {
            businessName: values.businessName,
            accountNumber: values.accountNumber,
            sortCode: values.sortCode,
            primaryContactEmail: values.primaryContactEmail,
            primaryContactName: values.primaryContactName,
            primaryContactPhone: values.primaryContactPhone,
          }
        }));
      }}
      enableReinitialize
    >
      {({ values, errors, touched, handleChange, handleBlur }) => (
        <div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-[#09391C] mb-4">Bank Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-700 mb-1">Business Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  name="businessName"
                  value={values.businessName}
                  onChange={(e) => { handleChange(e); setForm(prev => ({ ...prev, paymentDetails: { ...prev.paymentDetails, businessName: e.target.value } })); }}
                  onBlur={handleBlur}
                  placeholder="Registered business name"
                  className={`${inputBase} ${touched.businessName && errors.businessName ? 'border-red-500 focus:ring-red-200 focus:border-red-400' : ''}`}
                />
                {touched.businessName && errors.businessName && (
                  <p className="text-red-500 text-sm mt-1">{errors.businessName}</p>
                )}
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Account Number <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  name="accountNumber"
                  value={values.accountNumber}
                  onChange={(e) => {
                    const cleaned = e.target.value.replace(/\D/g, '');
                    handleChange({ target: { name: 'accountNumber', value: cleaned } } as any);
                    setForm(prev => ({ ...prev, paymentDetails: { ...prev.paymentDetails, accountNumber: cleaned } }));
                  }}
                  onBlur={handleBlur}
                  placeholder="10-digit account number"
                  className={`${inputBase} ${touched.accountNumber && errors.accountNumber ? 'border-red-500 focus:ring-red-200 focus:border-red-400' : ''}`}
                />
                {touched.accountNumber && errors.accountNumber && (
                  <p className="text-red-500 text-sm mt-1">{errors.accountNumber}</p>
                )}
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Settlement Bank <span className="text-red-500">*</span></label>
                <select
                  name="sortCode"
                  value={values.sortCode}
                  onChange={(e) => { handleChange(e); setForm(prev => ({ ...prev, paymentDetails: { ...prev.paymentDetails, sortCode: e.target.value } })); }}
                  onBlur={handleBlur}
                  className={`${selectBase} ${touched.sortCode && errors.sortCode ? 'border-red-500 focus:ring-red-200 focus:border-red-400' : ''}`}
                >
                  <option value="" disabled>{banksLoading ? "Loading banks..." : "Select bank"}</option>
                  {bankList.map((b) => (
                    <option key={b.code} value={b.code}>{b.name}</option>
                  ))}
                </select>
                {touched.sortCode && errors.sortCode && (
                  <p className="text-red-500 text-sm mt-1">{errors.sortCode}</p>
                )}
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Primary Contact Email (optional)</label>
                <input
                  type="email"
                  name="primaryContactEmail"
                  value={values.primaryContactEmail}
                  onChange={(e) => { handleChange(e); setForm(prev => ({ ...prev, paymentDetails: { ...prev.paymentDetails, primaryContactEmail: e.target.value } })); }}
                  onBlur={handleBlur}
                  placeholder="email@example.com"
                  className={`${inputBase} ${touched.primaryContactEmail && errors.primaryContactEmail ? 'border-red-500 focus:ring-red-200 focus:border-red-400' : ''}`}
                />
                {touched.primaryContactEmail && errors.primaryContactEmail && (
                  <p className="text-red-500 text-sm mt-1">{errors.primaryContactEmail}</p>
                )}
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Primary Contact Name (optional)</label>
                <input
                  type="text"
                  name="primaryContactName"
                  value={values.primaryContactName}
                  onChange={(e) => { handleChange(e); setForm(prev => ({ ...prev, paymentDetails: { ...prev.paymentDetails, primaryContactName: e.target.value } })); }}
                  onBlur={handleBlur}
                  placeholder="Full name"
                  className={inputBase}
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Primary Contact Phone (optional)</label>
                <input
                  type="tel"
                  name="primaryContactPhone"
                  value={values.primaryContactPhone}
                  onChange={(e) => { handleChange(e); setForm(prev => ({ ...prev, paymentDetails: { ...prev.paymentDetails, primaryContactPhone: e.target.value } })); }}
                  onBlur={handleBlur}
                  placeholder="e.g. +2348012345678"
                  className={inputBase}
                />
              </div>
            </div>
            <p className="text-xs text-[#5A5D63] mt-3">These details are used for settlements.</p>
          </div>
        </div>
      )}
    </Formik>
  );

  const toggleSelect = (id: string) => {
    const set = new Set(selectedIds);
    if (set.has(id)) set.delete(id); else set.add(id);
    setForm((prev) => ({
      ...prev,
      featureSelection: {
        ...prev.featureSelection,
        mode: "manual",
        propertyIds: Array.from(set).join(","),
      },
    }));
  };

  const getPropertyTitle = (property: any) => {
    if (property.briefType === "Joint Venture") {
      return `${property.landSize?.size || 1} ${property.landSize?.measurementType || "Plot"} - ${property.briefType}`;
    }
    const bedrooms = property.additionalFeatures?.noOfBedroom;
    const building = property.typeOfBuilding || "Property";
    return bedrooms > 0 
      ? `${bedrooms} Bedroom ${building.charAt(0).toUpperCase() + building.slice(1)}`
      : building.charAt(0).toUpperCase() + building.slice(1);
  };

  const validateSection = (section: UpdatableSectionId): string | null => {
    if (section === "payment") {
      const payment = form.paymentDetails;
      if (!payment?.businessName?.trim() || !payment?.accountNumber?.trim() || !payment?.sortCode?.trim()) {
        return "Please complete Bank Details: business name, account number and bank.";
      }
    }

    if (section === "contact" && form.contactVisibility.showWhatsAppButton && !form.contactVisibility.whatsappNumber?.trim()) {
      return "Please provide a WhatsApp number or disable the WhatsApp button.";
    }

    return null;
  };

  const saveSection = async (section: UpdatableSectionId) => {
    if (!form.publicSlug) {
      toast.error("Set your public link before saving.");
      return;
    }

    const validationError = validateSection(section);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    // Map UI tabs to backend section endpoints and payloads
    const getSectionUpdates = (tab: UpdatableSectionId): { path: string; body: any }[] => {
      switch (tab) {
        case "branding": {
          return [
            {
              path: "brandingSeo",
              body: {
                title: form.title,
                keywords: form.keywords.map((k) => k.trim()).filter(Boolean),
                description: form.description,
                logoUrl: form.logoUrl,
                listingsLimit: form.listingsLimit,
              },
            },
          ];
        }
        case "design": {
          return [
            { path: "publicPage", body: { ...form.publicPage } },
            {
              path: "footerSection",
              body: {
                shortDescription: form.footer?.shortDescription || "",
                copyrightText: form.footer?.copyrightText || "",
              },
            },
          ];
        }
        case "theme":
          return [{ path: "theme", body: { ...form.theme } }];
        case "marketplace":
          return [{ path: "marketplaceDefaults", body: { ...form.marketplaceDefaults } }];
        case "inspection":
          return [{ path: "inspectionSettings", body: { ...form.inspectionSettings } }];
        case "contact":
          return [{ path: "contactVisibility", body: { ...form.contactVisibility } }];
        case "social":
          return [{ path: "socialLinks", body: { ...form.socialLinks } }];
        case "payment":
          return [{ path: "paymentDetails", body: { ...form.paymentDetails } }];
        case "about":
          return [{ path: "about", body: { ...form.about } }];
        case "contact-us":
          return [{ path: "contactUs", body: { ...form.contactUs } }];
        case "featured":
          return [{ path: "featureSelection", body: { ...form.featureSelection } }];
        case "listings": {
          // listingsLimit belongs to brandingSeo on the backend
          return [
            {
              path: "brandingSeo",
              body: {
                title: form.title,
                keywords: form.keywords.map((k) => k.trim()).filter(Boolean),
                description: form.description,
                logoUrl: form.logoUrl,
                listingsLimit: form.listingsLimit,
              },
            },
          ];
        }
        case "home-settings":
          return [{ path: "homeSettings", body: { ...form.homeSettings } }];
        case "subscribe-settings":
          return [{ path: "subscribeSettings", body: { ...form.subscribeSettings } }];
        default:
          return [];
      }
    };

    setSaving(true);
    showPreloader(`Saving ${SECTION_FRIENDLY_LABELS[section]}...`);
    const token = Cookies.get("token");

    try {
      const updates = getSectionUpdates(section);
      if (!updates.length) {
        toast.error("Unsupported section");
        return;
      }

      for (const u of updates) {
        const res = await PUT_REQUEST(`${URLS.BASE}/account/dealSite/${form.publicSlug}/${u.path}/update`, u.body, token);
        if (!res?.success) {
          throw new Error(res?.message || `Failed to update ${u.path}`);
        }
      }

      toast.success(`${SECTION_FRIENDLY_LABELS[section]} updated`);
    } catch (e: any) {
      toast.error(e?.message || `Failed to update ${SECTION_FRIENDLY_LABELS[section]}`);
    } finally {
      setSaving(false);
      hidePreloader();
    }
  };

  const cleanLogText = (value?: string) => (value ? value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim() : "");

  const formatActorName = (log: DealSiteLog) => {
    if (!log.actor) {
      return "System";
    }

    const name = [log.actor.firstName, log.actor.lastName].filter(Boolean).join(" ").trim();
    if (name) {
      return name;
    }

    return log.actor.email || "Unknown actor";
  };

  const formatDateTime = (value?: string) => {
    if (!value) {
      return "";
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return value;
    }

    const iso = date.toISOString();
    return iso.replace('T', ' ').replace(/\.\d{3}Z$/, ' UTC');
  };

  async function fetchOverviewLogs() {
    if (!form.publicSlug) {
      return;
    }

    setOverviewLogsLoading(true);
    const token = Cookies.get("token");
    try {
      const qs = buildQuery({ page: 1, limit: 5 });
      const response = await GET_REQUEST<DealSiteLog[]>(`${URLS.BASE}/account/dealSite/${form.publicSlug}/logs?${qs}`, token);
      if (response?.success && Array.isArray(response.data)) {
        setOverviewLogs(response.data.slice(0, 5));
      } else {
        setOverviewLogs([]);
      }
    } finally {
      setOverviewLogsLoading(false);
    }
  }

  async function fetchServiceLogs(page: number) {
    if (!form.publicSlug) {
      return;
    }

    setServiceLogsLoading(true);
    const token = Cookies.get("token");
    try {
      const qs = buildQuery({ page, limit: SERVICE_LOGS_LIMIT });
      const response = await GET_REQUEST<DealSiteLog[], { page?: number; totalPages?: number; total?: number; limit?: number }>(
        `${URLS.BASE}/account/dealSite/${form.publicSlug}/logs?${qs}`,
        token,
      );

      if (response?.success && Array.isArray(response.data)) {
        setServiceLogs(response.data);

        const resolvedPage = response.pagination?.page ?? page;
        const resolvedTotalPages = response.pagination?.totalPages ?? Math.max(page, 1);
        const resolvedTotal = response.pagination?.total ?? response.data.length;
        const resolvedLimit = response.pagination?.limit ?? SERVICE_LOGS_LIMIT;

        setServiceLogsPagination({
          page: resolvedPage,
          totalPages: resolvedTotalPages,
          total: resolvedTotal,
          limit: resolvedLimit,
        });

        if (resolvedPage !== page) {
          setServiceLogsPage(resolvedPage);
        }
      } else {
        setServiceLogs([]);
        setServiceLogsPagination((prev) => ({
          ...prev,
          page,
          total: 0,
          totalPages: Math.max(page, 1),
        }));
      }

    } finally {
      setServiceLogsLoading(false);
    }
  }

  const goToPreviousLogsPage = () => {
    setServiceLogsPage((prev) => (prev > 1 ? prev - 1 : prev));
  };

  const goToNextLogsPage = () => {
    setServiceLogsPage((prev) => {
      const maxPage = Math.max(serviceLogsPagination.totalPages, 1);
      return prev < maxPage ? prev + 1 : prev;
    });
  };

  const renderFeaturedListings = (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-[#09391C] mb-4">Featured Listings</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm text-gray-700 mb-1">Mode</label>
          <select value={form.featureSelection.mode} onChange={(e) => setForm({ ...form, featureSelection: { ...form.featureSelection, mode: e.target.value as any } })} className={selectBase}>
            <option value="auto">Auto (Top recent)</option>
            <option value="manual">Manual (Select from your listings)</option>
          </select>
        </div>
        <div>
          <label className="block text-sm text-gray-700 mb-1">Listings to display</label>
          <input type="number" min={1} max={50} value={form.listingsLimit} onChange={(e) => setForm({ ...form, listingsLimit: Math.max(1, Math.min(50, Number(e.target.value || 1))) })} className={inputBase} />
        </div>
      </div>

      {form.featureSelection.mode === "manual" && (
        <>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input className={inputBase} placeholder="State" value={filters.state || ""} onChange={(e) => setFilters((f) => ({ ...f, state: e.target.value || undefined, page: 1 }))} />
              <input className={inputBase} placeholder="Local Government" value={filters.localGovernment || ""} onChange={(e) => setFilters((f) => ({ ...f, localGovernment: e.target.value || undefined, page: 1 }))} />
              <input className={inputBase} placeholder="Area" value={filters.area || ""} onChange={(e) => setFilters((f) => ({ ...f, area: e.target.value || undefined, page: 1 }))} />
              <select className={selectBase} value={filters.propertyType || ""} onChange={(e) => setFilters((f) => ({ ...f, propertyType: e.target.value || undefined, page: 1 }))}>
                <option value="">All Types</option>
                <option value="duplex">Duplex</option>
                <option value="apartment">Apartment</option>
                <option value="bungalow">Bungalow</option>
              </select>
              <select className={selectBase} value={filters.propertyCategory || ""} onChange={(e) => setFilters((f) => ({ ...f, propertyCategory: e.target.value || undefined, page: 1 }))}>
                <option value="">All Categories</option>
                <option value="residential">Residential</option>
                <option value="commercial">Commercial</option>
              </select>
              <input className={inputBase} type="number" placeholder="Min Price" value={filters.priceMin ?? ""} onChange={(e) => setFilters((f) => ({ ...f, priceMin: e.target.value ? Number(e.target.value) : undefined, page: 1 }))} />
              <input className={inputBase} type="number" placeholder="Max Price" value={filters.priceMax ?? ""} onChange={(e) => setFilters((f) => ({ ...f, priceMax: e.target.value ? Number(e.target.value) : undefined, page: 1 }))} />
              <label className="flex items-center gap-2 text-sm">
                <input className={checkboxBase} type="checkbox" checked={!!filters.isApproved} onChange={(e) => setFilters((f) => ({ ...f, isApproved: e.target.checked ? true : undefined, page: 1 }))} /> Only approved
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {flLoading && (
              <div className="col-span-full flex justify-center py-8 text-sm text-gray-500">Loading...</div>
            )}

            {!flLoading && properties.length === 0 && (
              <div className="col-span-full text-sm text-gray-500">No listings found.</div>
            )}

            {properties.map((p) => {
              const isSelected = selectedIds.includes(p._id);
              
              return (
                <label
                  key={p._id}
                  className={`group relative bg-white rounded-xl overflow-hidden cursor-pointer transition-all duration-200 ${
                    isSelected 
                      ? 'ring-2 ring-emerald-500 shadow-lg scale-[1.02]' 
                      : 'shadow hover:shadow-md hover:scale-[1.01]'
                  }`}
                >
                  {/* Image Container */}
                  <div className="relative h-48 w-full bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                    {p.pictures?.[0] ? (
                      <img 
                        src={p.pictures[0]} 
                        alt={getPropertyTitle(p)}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                      </div>
                    )}
                    
                    {/* Selection Checkbox Overlay */}
                    <div className="absolute top-3 right-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-200 ${
                        isSelected 
                          ? 'bg-emerald-500 scale-110' 
                          : 'bg-white/90 backdrop-blur-sm group-hover:bg-white'
                      }`}>
                        {isSelected ? (
                          <Check className="w-4 h-4 text-white" strokeWidth={3} />
                        ) : (
                          <div className="w-4 h-4 rounded-full border-2 border-gray-400" />
                        )}
                      </div>
                    </div>

                    {/* Property Type Badge */}
                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-1 bg-white/95 backdrop-blur-sm rounded-full text-xs font-medium text-gray-700">
                        {p.briefType}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    {/* Title */}
                    <h3 className="font-semibold text-gray-900 text-base mb-1 line-clamp-1">
                      {getPropertyTitle(p)}
                    </h3>

                    {/* Location */}
                    <div className="flex items-start gap-1 mb-3">
                      <svg className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
                        {[p.location?.area, p.location?.localGovernment, p.location?.state]
                          .filter(Boolean)
                          .join(', ')}
                      </p>
                    </div>

                    {/* Price and Features */}
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      {p.price && (
                        <div className="text-lg font-bold text-emerald-700">
                          ₦{p.price.toLocaleString()}
                          {p.propertyType === 'shortlet' && (
                            <span className="text-xs font-normal text-gray-500 ml-1">/night</span>
                          )}
                        </div>
                      )}
                      
                      {p.additionalFeatures?.noOfBedroom > 0 && (
                        <div className="flex items-center gap-3 text-xs text-gray-600">
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                            {p.additionalFeatures.noOfBedroom}
                          </span>
                          {p.additionalFeatures.noOfBathroom > 0 && (
                            <span className="flex items-center gap-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
                              </svg>
                              {p.additionalFeatures.noOfBathroom}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Hidden checkbox for accessibility */}
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleSelect(p._id)}
                    className="sr-only"
                    aria-label={`Select ${getPropertyTitle(p)}`}
                  />
                </label>
              );
            })}
          </div>
        </>
      )}
    </div>
  );

  const renderListingsLimit = (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-[#09391C] mb-4">Listings</h2>
      <div className="flex items-center gap-3">
        <label className="text-sm text-gray-700 w-56">Number of listings to display</label>
        <input
          type="number"
          min={0}
          max={50}
          value={form.listingsLimit}
          onChange={(e) => setForm({ ...form, listingsLimit: Math.max(0, Math.min(50, Number(e.target.value || 0))) })}
          className={`${inputBase} w-32`}
        />
      </div>
    </div>
  );

  const renderAboutUs = (
    <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-8">
      <h2 className="text-lg font-semibold text-[#09391C]">About Us Settings</h2>

      {/* Hero Section */}
      <div className="border-t border-gray-200 pt-6">
        <h3 className="text-base font-semibold text-[#09391C] mb-4">Hero Section</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm text-gray-700 mb-1">Title</label>
            <input type="text" value={form.about?.hero?.title || ""} onChange={(e) => updateAboutHeroField('title', e.target.value)} className={inputBase} placeholder="Defining Real Estate Excellence" />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">Subtitle</label>
            <input type="text" value={form.about?.hero?.subTitle || ""} onChange={(e) => updateAboutHeroField('subTitle', e.target.value)} className={inputBase} placeholder="Where Vision Meets Value" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm text-gray-700 mb-1">Description</label>
            <textarea value={form.about?.hero?.description || ""} onChange={(e) => updateAboutHeroField('description', e.target.value)} className={`${inputBase} min-h-[100px]`} placeholder="Describe your organization..." />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">Background Image</label>
            <div>
              <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 flex items-center gap-3 mb-2">
                <div className="flex-1">
                  <input type="text" className={inputBase} placeholder="Image URL or drop an image here" value={form.about?.hero?.backgroundImage || ""} onChange={(e) => updateAboutHeroField('backgroundImage', e.target.value)} />
                  <p className="text-xs text-gray-500 mt-1">Accepts JPG, PNG. Max size depends on server limits.</p>
                </div>
                <label className="px-3 py-2 bg-gray-50 border rounded cursor-pointer text-sm inline-flex items-center gap-2">
                  Upload
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files && handleUploadAboutHero(e.target.files[0])} />
                </label>
              </div>
              {form.about?.hero?.backgroundImage ? (
                <div className="mt-2 relative">
                  <img src={form.about.hero.backgroundImage} alt="hero" className="w-full h-24 object-cover rounded shadow-sm" />
                  <button type="button" onClick={() => updateAboutHeroField('backgroundImage', "")} className="absolute top-2 right-2 bg-white p-1 rounded shadow hover:bg-gray-50 border">
                    <Trash size={16} />
                  </button>
                </div>
              ) : null}
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">Mobile Fallback Image</label>
            <div>
              <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 flex items-center gap-3 mb-2">
                <div className="flex-1">
                  <input type="text" className={inputBase} placeholder="Image URL or drop an image here" value={form.about?.hero?.mobileFallbackImage || ""} onChange={(e) => updateAboutHeroField('mobileFallbackImage', e.target.value)} />
                  <p className="text-xs text-gray-500 mt-1">Accepts JPG, PNG. Max size depends on server limits.</p>
                </div>
                <label className="px-3 py-2 bg-gray-50 border rounded cursor-pointer text-sm inline-flex items-center gap-2">
                  Upload
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files && handleUploadAboutMobileFallback(e.target.files[0])} />
                </label>
              </div>
              {form.about?.hero?.mobileFallbackImage ? (
                <div className="mt-2 relative">
                  <img src={form.about.hero.mobileFallbackImage} alt="mobile" className="w-full h-24 object-cover rounded shadow-sm" />
                  <button type="button" onClick={() => updateAboutHeroField('mobileFallbackImage', "")} className="absolute top-2 right-2 bg-white p-1 rounded shadow hover:bg-gray-50 border">
                    <Trash size={16} />
                  </button>
                </div>
              ) : null}
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">Background Video (mp4 url or upload)</label>
            <div>
              <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 flex items-center gap-3 mb-2">
                <div className="flex-1">
                  <input type="text" className={inputBase} placeholder="MP4 URL or drop a video (max 15MB)" value={form.about?.hero?.backgroundVideo || ""} onChange={(e) => updateAboutHeroField('backgroundVideo', e.target.value)} />
                  <p className="text-xs text-gray-500 mt-1">MP4 only. Max 15MB.</p>
                </div>
                <label className="px-3 py-2 bg-gray-50 border rounded cursor-pointer text-sm inline-flex items-center gap-2">
                  Upload
                  <input type="file" accept="video/mp4,video/*" className="hidden" onChange={(e) => e.target.files && handleUploadAboutHeroVideo(e.target.files[0])} />
                </label>
              </div>
              {form.about?.hero?.backgroundVideo ? (
                <div className="mt-2 relative">
                  <video src={form.about.hero.backgroundVideo} controls className="w-full h-24 object-cover rounded shadow-sm" />
                  <button type="button" onClick={() => updateAboutHeroField('backgroundVideo', null)} className="absolute top-2 right-2 bg-white p-1 rounded shadow hover:bg-gray-50 border">
                    <Trash size={16} />
                  </button>
                </div>
              ) : null}
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">Overlay Color</label>
            <div className="flex items-center gap-2">
              <input type="color" value={form.about?.hero?.overlayColor || "rgba(0, 0, 0, 0.55)"} onChange={(e) => updateAboutHeroField('overlayColor', e.target.value)} className="h-10 w-20 border rounded cursor-pointer" />
              <input type="text" value={form.about?.hero?.overlayColor || ""} onChange={(e) => updateAboutHeroField('overlayColor', e.target.value)} className={inputBase} placeholder="rgba(0, 0, 0, 0.55)" />
            </div>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm text-gray-700 mb-2">Hero CTA</label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input type="text" value={form.about?.hero?.cta?.text || ""} onChange={(e) => updateAboutHeroCta('text', e.target.value)} className={inputBase} placeholder="CTA Text" />
              <input type="text" value={form.about?.hero?.cta?.link || ""} onChange={(e) => updateAboutHeroCta('link', e.target.value)} className={inputBase} placeholder="CTA Link" />
              <input type="text" value={form.about?.hero?.cta?.style || ""} onChange={(e) => updateAboutHeroCta('style', e.target.value)} className={inputBase} placeholder="Style (light/dark)" />
            </div>
          </div>
        </div>
      </div>

      {/* Identity Section */}
      <div className="border-t border-gray-200 pt-6">
        <h3 className="text-base font-semibold text-[#09391C] mb-4">Identity / Who We Are</h3>
        <div className="space-y-3">
          <div>
            <label className="block text-sm text-gray-700 mb-1">Headline</label>
            <input type="text" value={form.about?.identity?.headline || ""} onChange={(e) => updateAboutIdentity('headline', e.target.value)} className={inputBase} placeholder="Who We Are" />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">Content</label>
            <textarea value={form.about?.identity?.content || ""} onChange={(e) => updateAboutIdentity('content', e.target.value)} className={`${inputBase} min-h-[100px]`} placeholder="Describe who you are..." />
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm text-gray-700">Key Highlights</label>
              <button type="button" onClick={addAboutIdentityHighlight} className="text-xs px-2 py-1 border rounded-lg">Add</button>
            </div>
            <div className="space-y-2">
              {(form.about?.identity?.keyHighlights || []).map((highlight, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input type="text" value={highlight} onChange={(e) => updateAboutIdentityHighlights(idx, e.target.value)} className={inputBase} placeholder="e.g. Award-winning consultancy" />
                  <button type="button" onClick={() => removeAboutIdentityHighlight(idx)} className="px-2 py-1 text-sm border rounded-lg"><Trash2 size={14} /></button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Mission & Vision Section */}
      <div className="border-t border-gray-200 pt-6">
        <h3 className="text-base font-semibold text-[#09391C] mb-4">Mission & Vision</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-700 mb-1">Section Title</label>
            <input type="text" value={form.about?.missionVision?.title || ""} onChange={(e) => updateAboutMissionVision('title', e.target.value)} className={inputBase} placeholder="Our Vision & Mission" />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">Background Image</label>
            {form.about?.missionVision?.backgroundImage ? (
              <div className="flex items-center gap-3">
                <img src={form.about.missionVision.backgroundImage} alt="Mission" className="h-12 w-20 rounded border object-cover" />
                <button type="button" onClick={() => updateAboutMissionVision('backgroundImage', "")} className="px-3 py-2 text-sm border rounded-lg"><Trash2 size={14} /></button>
              </div>
            ) : (
              <label className="flex items-center justify-center px-3 py-6 border-2 border-dashed rounded-lg text-sm cursor-pointer hover:bg-gray-50">
                <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files && handleUploadMissionBg(e.target.files[0])} />
                <ImageIcon size={16} /> <span className="text-gray-600 ml-2">Upload Mission BG</span>
              </label>
            )}
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm text-gray-700 font-medium">Mission & Vision Items</label>
              <button type="button" onClick={addAboutMissionVisionItem} className="text-xs px-2 py-1 border rounded-lg">Add Item</button>
            </div>
            <div className="space-y-3">
              {(form.about?.missionVision?.items || []).map((item, idx) => (
                <div key={idx} className="border border-gray-300 rounded-lg p-4 bg-gray-50">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-sm text-[#09391C]">Item {idx + 1}</h4>
                    <button type="button" onClick={() => removeAboutMissionVisionItem(idx)} className="text-red-500 text-sm"><Trash2 size={14} /></button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-700 mb-1">Title</label>
                      <input type="text" value={item.title || ""} onChange={(e) => updateAboutMissionVisionItem(idx, 'title', e.target.value)} className={inputBase} placeholder="Our Vision" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs text-gray-700 mb-1">Description</label>
                      <textarea value={item.description || ""} onChange={(e) => updateAboutMissionVisionItem(idx, 'description', e.target.value)} className={`${inputBase} min-h-[80px]`} placeholder="Description..." />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Values Section */}
      <div className="border-t border-gray-200 pt-6">
        <h3 className="text-base font-semibold text-[#09391C] mb-4">Values / Guided by Excellence</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-700 mb-1">Section Title</label>
            <input type="text" value={form.about?.values?.title || ""} onChange={(e) => updateAboutValues('title', e.target.value)} className={inputBase} placeholder="Guided by Excellence" />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">Section Description</label>
            <textarea value={form.about?.values?.description || ""} onChange={(e) => updateAboutValues('description', e.target.value)} className={`${inputBase} min-h-[80px]`} placeholder="Describe your values..." />
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm text-gray-700 font-medium">Values Items</label>
              <button type="button" onClick={addAboutValueItem} className="text-xs px-2 py-1 border rounded-lg">Add Item</button>
            </div>
            <div className="space-y-3">
              {(form.about?.values?.items || []).map((item, idx) => (
                <div key={idx} className="border border-gray-300 rounded-lg p-4 bg-gray-50">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-sm text-[#09391C]">Value {idx + 1}</h4>
                    <button type="button" onClick={() => removeAboutValueItem(idx)} className="text-red-500 text-sm"><Trash2 size={14} /></button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-700 mb-1">Icon (searchable)</label>
                      <IconSelector value={item.icon || ""} onChange={(val) => updateAboutValueItem(idx, 'icon', val)} />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-700 mb-1">Title</label>
                      <input type="text" value={item.title || ""} onChange={(e) => updateAboutValueItem(idx, 'title', e.target.value)} className={inputBase} placeholder="Trust" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs text-gray-700 mb-1">Description</label>
                      <textarea value={item.description || ""} onChange={(e) => updateAboutValueItem(idx, 'description', e.target.value)} className={`${inputBase} min-h-[60px]`} placeholder="Describe this value..." />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Journey Section */}
      <div className="border-t border-gray-200 pt-6">
        <h3 className="text-base font-semibold text-[#09391C] mb-4">Journey / Timeline</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-700 mb-1">Section Title</label>
            <input type="text" value={form.about?.journey?.title || ""} onChange={(e) => updateAboutJourney('title', e.target.value)} className={inputBase} placeholder="Our Journey So Far" />
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm text-gray-700 font-medium">Timeline Items</label>
              <button type="button" onClick={addAboutJourneyItem} className="text-xs px-2 py-1 border rounded-lg">Add Item</button>
            </div>
            <div className="space-y-3">
              {(form.about?.journey?.timeline || []).map((item, idx) => (
                <div key={idx} className="border border-gray-300 rounded-lg p-4 bg-gray-50">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-sm text-[#09391C]">Milestone {idx + 1}</h4>
                    <button type="button" onClick={() => removeAboutJourneyItem(idx)} className="text-red-500 text-sm"><Trash2 size={14} /></button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs text-gray-700 mb-1">Year</label>
                      <input type="text" value={item.year || ""} onChange={(e) => updateAboutJourneyItem(idx, 'year', e.target.value)} className={inputBase} placeholder="2024" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs text-gray-700 mb-1">Title</label>
                      <input type="text" value={item.title || ""} onChange={(e) => updateAboutJourneyItem(idx, 'title', e.target.value)} className={inputBase} placeholder="Major milestone" />
                    </div>
                    <div className="md:col-span-3">
                      <label className="block text-xs text-gray-700 mb-1">Description</label>
                      <textarea value={item.description || ""} onChange={(e) => updateAboutJourneyItem(idx, 'description', e.target.value)} className={`${inputBase} min-h-[60px]`} placeholder="What happened..." />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Leadership Section */}
      <div className="border-t border-gray-200 pt-6">
        <h3 className="text-base font-semibold text-[#09391C] mb-4">Leadership Team</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-700 mb-1">Section Title</label>
              <input type="text" value={form.about?.leadership?.title || ""} onChange={(e) => updateAboutLeadership('title', e.target.value)} className={inputBase} placeholder="Our Leadership Team" />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">Section Subtitle</label>
              <input type="text" value={form.about?.leadership?.subTitle || ""} onChange={(e) => updateAboutLeadership('subTitle', e.target.value)} className={inputBase} placeholder="The visionaries driving innovation..." />
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm text-gray-700 font-medium">Team Members</label>
              <button type="button" onClick={addAboutLeadershipMember} className="text-xs px-2 py-1 border rounded-lg">Add Member</button>
            </div>
            <div className="space-y-3">
              {(form.about?.leadership?.members || []).map((member, idx) => (
                <div key={idx} className="border border-gray-300 rounded-lg p-4 bg-gray-50">
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="font-medium text-sm text-[#09391C]">Member {idx + 1}</h4>
                    <button type="button" onClick={() => removeAboutLeadershipMember(idx)} className="text-red-500 text-sm"><Trash2 size={14} /></button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                    <div>
                      <label className="block text-xs text-gray-700 mb-1">Name</label>
                      <input type="text" value={member.name || ""} onChange={(e) => updateAboutLeadershipMember(idx, 'name', e.target.value)} className={inputBase} placeholder="Full Name" />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-700 mb-1">Role</label>
                      <input type="text" value={member.role || ""} onChange={(e) => updateAboutLeadershipMember(idx, 'role', e.target.value)} className={inputBase} placeholder="CEO / Director" />
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="block text-xs text-gray-700 mb-1">Photo</label>
                    {member.image ? (
                      <div className="flex items-center gap-2">
                        <img src={member.image} alt={member.name} className="h-10 w-10 rounded border object-cover" />
                        <button type="button" onClick={() => updateAboutLeadershipMember(idx, 'image', "")} className="px-2 py-1 text-sm border rounded-lg"><Trash2 size={14} /></button>
                      </div>
                    ) : (
                      <label className="flex items-center justify-center px-3 py-3 border-2 border-dashed rounded-lg text-sm cursor-pointer hover:bg-white">
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files && handleUploadMemberImage(e.target.files[0], idx)} />
                        <span>Upload Photo</span>
                      </label>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs text-gray-700 mb-1">Quote</label>
                    <textarea value={member.quote || ""} onChange={(e) => updateAboutLeadershipMember(idx, 'quote', e.target.value)} className={`${inputBase} min-h-[60px]`} placeholder="Inspirational quote..." />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="border-t border-gray-200 pt-6">
        <h3 className="text-base font-semibold text-[#09391C] mb-4">Statistics / Global Footprint</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-700 mb-1">Section Title</label>
              <input type="text" value={form.about?.stats?.title || ""} onChange={(e) => updateAboutStats('title', e.target.value)} className={inputBase} placeholder="Our Global Footprint" />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">Section Subtitle</label>
              <input type="text" value={form.about?.stats?.subTitle || ""} onChange={(e) => updateAboutStats('subTitle', e.target.value)} className={inputBase} placeholder="Driving impact and trust..." />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">Background Color</label>
              <div className="flex items-center gap-2">
                <input type="color" value={form.about?.stats?.backgroundColor || "#0B3B2E"} onChange={(e) => updateAboutStats('backgroundColor', e.target.value)} className="h-10 w-20 border rounded cursor-pointer" />
                <input type="text" value={form.about?.stats?.backgroundColor || ""} onChange={(e) => updateAboutStats('backgroundColor', e.target.value)} className={inputBase} placeholder="#0B3B2E" />
              </div>
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm text-gray-700 font-medium">Statistics Items</label>
              <button type="button" onClick={addAboutStatItem} className="text-xs px-2 py-1 border rounded-lg">Add Item</button>
            </div>
            <div className="space-y-2">
              {(form.about?.stats?.items || []).map((item, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input type="text" value={item.label || ""} onChange={(e) => updateAboutStatItem(idx, 'label', e.target.value)} className={inputBase} placeholder="Years of Experience" />
                  <input type="text" value={item.value || ""} onChange={(e) => updateAboutStatItem(idx, 'value', e.target.value)} className={inputBase} placeholder="13+" />
                  <button type="button" onClick={() => removeAboutStatItem(idx)} className="px-2 py-1 text-sm border rounded-lg"><Trash2 size={14} /></button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Partners Section */}
      <div className="border-t border-gray-200 pt-6">
        <h3 className="text-base font-semibold text-[#09391C] mb-4">Partners / Collaborations</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-700 mb-1">Section Title</label>
              <input type="text" value={form.about?.partners?.title || ""} onChange={(e) => updateAboutPartners('title', e.target.value)} className={inputBase} placeholder="Strategic Partners" />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">Section Subtitle</label>
              <input type="text" value={form.about?.partners?.subTitle || ""} onChange={(e) => updateAboutPartners('subTitle', e.target.value)} className={inputBase} placeholder="Collaborating with leaders..." />
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm text-gray-700 font-medium">Partner Logos</label>
              <button type="button" onClick={addAboutPartnerLogo} className="text-xs px-2 py-1 border rounded-lg">Add Logo</button>
            </div>
            <div className="space-y-3">
              {(form.about?.partners?.logos || []).map((logo, idx) => (
                <div key={idx} className="border border-gray-300 rounded-lg p-4 bg-gray-50">
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="font-medium text-sm text-[#09391C]">Partner Logo {idx + 1}</h4>
                    <button type="button" onClick={() => removeAboutPartnerLogo(idx)} className="text-red-500 text-sm"><Trash2 size={14} /></button>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-700 mb-2">Logo</label>
                    <div>
                      <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 flex items-center gap-3 mb-2">
                        <div className="flex-1">
                          <input type="text" className={inputBase} placeholder="Logo URL or drop an image here" value={logo || ""} onChange={(e) => updateAboutPartnerLogo(idx, e.target.value)} />
                          <p className="text-xs text-gray-500 mt-1">Accepts JPG, PNG. Max size depends on server limits.</p>
                        </div>
                        <label className="px-3 py-2 bg-gray-50 border rounded cursor-pointer text-sm inline-flex items-center gap-2">
                          Upload
                          <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files && handleUploadPartnerLogo(e.target.files[0], idx)} />
                        </label>
                      </div>
                      {logo ? (
                        <div className="mt-2 relative">
                          <img src={logo} alt="Partner Logo" className="w-full h-24 object-cover rounded shadow-sm" />
                          <button type="button" onClick={() => updateAboutPartnerLogo(idx, "")} className="absolute top-2 right-2 bg-white p-1 rounded shadow hover:bg-gray-50 border">
                            <Trash size={16} />
                          </button>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="border-t border-gray-200 pt-6">
        <h3 className="text-base font-semibold text-[#09391C] mb-4">Testimonials Settings</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-700 mb-1">Title</label>
              <input type="text" value={form.about?.testimonials?.title || ""} onChange={(e) => updateAboutTestimonials('title', e.target.value)} className={inputBase} placeholder="What Our Clients Say" />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">Layout</label>
              <input type="text" value={form.about?.testimonials?.layout || ""} onChange={(e) => updateAboutTestimonials('layout', e.target.value)} className={inputBase} placeholder="carousel" />
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.about?.testimonials?.showFromHome || false} onChange={(e) => updateAboutTestimonials('showFromHome', e.target.checked)} className={checkboxBase} />
                Show from Home
              </label>
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">Limit</label>
              <input type="number" value={form.about?.testimonials?.limit || 3} onChange={(e) => updateAboutTestimonials('limit', Number(e.target.value))} className={inputBase} placeholder="3" />
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="border-t border-gray-200 pt-6">
        <h3 className="text-base font-semibold text-[#09391C] mb-4">Final CTA Section</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-700 mb-1">Title</label>
              <input type="text" value={form.about?.cta?.title || ""} onChange={(e) => updateAboutCta('title', e.target.value)} className={inputBase} placeholder="Let's Build Your Future Together" />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">Subtitle</label>
              <input type="text" value={form.about?.cta?.subTitle || ""} onChange={(e) => updateAboutCta('subTitle', e.target.value)} className={inputBase} placeholder="Speak with our experts today..." />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">Button Text</label>
              <input type="text" value={form.about?.cta?.buttonText || ""} onChange={(e) => updateAboutCta('buttonText', e.target.value)} className={inputBase} placeholder="Schedule a Consultation" />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">Button Link</label>
              <input type="text" value={form.about?.cta?.link || ""} onChange={(e) => updateAboutCta('link', e.target.value)} className={inputBase} placeholder="/contact" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm text-gray-700 mb-2">Background Gradient</label>
              <div className="flex items-center gap-2">
                <input type="color" value={(form.about?.cta?.backgroundGradient && form.about.cta.backgroundGradient.includes('#')) ? (form.about.cta.backgroundGradient.match(/#([0-9a-fA-F]{6})/g)?.[0] || '#0B3B2E') : '#0B3B2E'} onChange={(e) => {
                  const end = (form.about?.cta?.backgroundGradient && form.about.cta.backgroundGradient.includes('#')) ? (form.about.cta.backgroundGradient.match(/#([0-9a-fA-F]{6})/g)?.[1] || '#4BA678') : '#4BA678';
                  setAboutCtaGradient(e.target.value, end);
                }} className="h-10 w-20 border rounded cursor-pointer" />
                <input type="color" value={(form.about?.cta?.backgroundGradient && form.about.cta.backgroundGradient.includes('#')) ? (form.about.cta.backgroundGradient.match(/#([0-9a-fA-F]{6})/g)?.[1] || '#4BA678') : '#4BA678'} onChange={(e) => {
                  const start = (form.about?.cta?.backgroundGradient && form.about.cta.backgroundGradient.includes('#')) ? (form.about.cta.backgroundGradient.match(/#([0-9a-fA-F]{6})/g)?.[0] || '#0B3B2E') : '#0B3B2E';
                  setAboutCtaGradient(start, e.target.value);
                }} className="h-10 w-20 border rounded cursor-pointer" />
                <div className="flex-1">
                  <input type="text" value={form.about?.cta?.backgroundGradient || ''} onChange={(e) => updateAboutCta('backgroundGradient', e.target.value)} className={inputBase} />
                </div>
              </div>
              <div className="h-8 mt-2 rounded" style={{ background: form.about?.cta?.backgroundGradient || 'linear-gradient(90deg, #0B3B2E 0%, #4BA678 100%)' }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderContactUs = (
    <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
      <h2 className="text-lg font-semibold text-[#09391C]">Contact Us</h2>

      {/* Hero */}
      <div>
        <h3 className="text-sm font-semibold text-[#09391C] mb-2">Hero</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-700 mb-1">Title</label>
            <input className={inputBase} value={form.contactUs?.hero?.title || ""} onChange={(e) => updateHeroField('title', e.target.value)} />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">Subtitle</label>
            <input className={inputBase} value={form.contactUs?.hero?.subTitle || ""} onChange={(e) => updateHeroField('subTitle', e.target.value)} />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm text-gray-700 mb-1">Description</label>
            <textarea className={inputBase + " min-h-[80px]"} value={form.contactUs?.hero?.description || ""} onChange={(e) => updateHeroField('description', e.target.value)} />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">Background Image</label>
            <div>
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={makeDropHandler('image')}
                className="border-2 border-dashed border-gray-200 rounded-lg p-4 flex items-center gap-3"
              >
                <div className="flex-1">
                  <input type="text" className={inputBase} placeholder="Image URL or drop an image here" value={form.contactUs?.hero?.backgroundImage || ""} onChange={(e) => updateHeroField('backgroundImage', e.target.value)} />
                  <p className="text-xs text-gray-500 mt-1">Accepts JPG, PNG. Max size depends on server limits.</p>
                </div>
                <label className="px-3 py-2 bg-gray-50 border rounded cursor-pointer text-sm inline-flex items-center gap-2">
                  Upload
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files && handleUploadContactMedia(e.target.files[0], 'image')} />
                </label>
              </div>
              {form.contactUs?.hero?.backgroundImage ? (
                <div className="mt-2 relative">
                  <img src={form.contactUs?.hero?.backgroundImage} alt="hero" className="w-full h-36 object-cover rounded shadow-sm" />
                  <button type="button" onClick={() => handleDeleteContactMedia(form.contactUs?.hero?.backgroundImage, 'image')} className="absolute top-2 right-2 bg-white p-1 rounded shadow hover:bg-gray-50 border">
                    <Trash size={16} />
                  </button>
                </div>
              ) : null}
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">Background Video (mp4 url or upload)</label>
            <div>
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={makeDropHandler('video')}
                className="border-2 border-dashed border-gray-200 rounded-lg p-4 flex items-center gap-3"
              >
                <div className="flex-1">
                  <input type="text" className={inputBase} placeholder="MP4 URL or drop a video (max 15MB)" value={form.contactUs?.hero?.backgroundVideo || ""} onChange={(e) => updateHeroField('backgroundVideo', e.target.value)} />
                  <p className="text-xs text-gray-500 mt-1">MP4 only. Max 15MB.</p>
                </div>
                <label className="px-3 py-2 bg-gray-50 border rounded cursor-pointer text-sm inline-flex items-center gap-2">
                  Upload
                  <input type="file" accept="video/mp4,video/*" className="hidden" onChange={(e) => e.target.files && handleUploadContactMedia(e.target.files[0], 'video')} />
                </label>
              </div>
              {form.contactUs?.hero?.backgroundVideo ? (
                <div className="mt-2 relative">
                  <video src={form.contactUs?.hero?.backgroundVideo} controls className="w-full h-36 object-cover rounded shadow-sm" />
                  <button type="button" onClick={() => handleDeleteContactMedia(form.contactUs?.hero?.backgroundVideo, 'video')} className="absolute top-2 right-2 bg-white p-1 rounded shadow hover:bg-gray-50 border">
                    <Trash size={16} />
                  </button>
                </div>
              ) : null}
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">Overlay Color</label>
            <div className="flex items-center gap-2">
              <input type="color" className="p-1 rounded border" value={form.contactUs?.hero?.overlayColor || '#000000'} onChange={(e) => updateHeroField('overlayColor', e.target.value)} />
              <input className={inputBase} value={form.contactUs?.hero?.overlayColor || ""} onChange={(e) => updateHeroField('overlayColor', e.target.value)} />
            </div>
            <div className="flex gap-2 mt-2">
              {COLOR_PALETTE.map((c) => (
                <button key={c} type="button" onClick={() => updateHeroField('overlayColor', c)} className="w-8 h-8 rounded" style={{ background: c, border: form.contactUs?.hero?.overlayColor === c ? '2px solid #00000020' : '1px solid #e5e7eb' }} />
              ))}
            </div>
          </div>
          <div className="md:col-span-1">
            <label className="block text-sm text-gray-700 mb-1">CTA Text</label>
            <input className={inputBase} value={form.contactUs?.hero?.cta?.text || ""} onChange={(e) => updateHeroCta('text', e.target.value)} />
          </div>
          <div className="md:col-span-1">
            <label className="block text-sm text-gray-700 mb-1">CTA Link</label>
            <input className={inputBase} value={form.contactUs?.hero?.cta?.link || ""} onChange={(e) => updateHeroCta('link', e.target.value)} />
          </div>
          <div className="md:col-span-1">
            <label className="block text-sm text-gray-700 mb-1">CTA Style</label>
            <input className={inputBase} value={form.contactUs?.hero?.cta?.style || ""} onChange={(e) => updateHeroCta('style', e.target.value)} />
          </div>
        </div>
      </div>

      {/* Contact Info */}
      <div>
        <h3 className="text-sm font-semibold text-[#09391C] mb-2">Contact Info</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
          <div>
            <label className="block text-sm text-gray-700 mb-1">Title</label>
            <input className={inputBase} value={form.contactUs?.contactInfo?.title || ""} onChange={(e) => updateContactInfoField('title', e.target.value)} />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">Subtitle</label>
            <input className={inputBase} value={form.contactUs?.contactInfo?.subTitle || ""} onChange={(e) => updateContactInfoField('subTitle', e.target.value)} />
          </div>
        </div>

        <div className="space-y-3">
          {(form.contactUs?.contactInfo?.items || []).map((it, idx) => (
            <div key={idx} className="grid grid-cols-1 md:grid-cols-12 gap-2 items-start">
              <div className={"md:col-span-2 " + "flex items-center"}>
                <IconSelector value={it.icon || ""} onChange={(val) => updateContactInfoItem(idx, 'icon', val)} />
              </div>
              <input className={"md:col-span-4 " + inputBase} placeholder="Label" value={it.label || ""} onChange={(e) => updateContactInfoItem(idx, 'label', e.target.value)} />
              <input className={"md:col-span-5 " + inputBase} placeholder="Value" value={it.value || ""} onChange={(e) => updateContactInfoItem(idx, 'value', e.target.value)} />
              <div className={"md:col-span-1 flex items-center gap-2"}>
                <button type="button" onClick={() => removeContactInfoItem(idx)} className="text-xs px-2 py-1 border rounded-lg">Remove</button>
              </div>
            </div>
          ))}

          <div>
            <button type="button" onClick={addContactInfoItem} className="text-xs px-2 py-1 border rounded-lg">Add Contact Item</button>
          </div>
        </div>
      </div>

      {/* Map Section */}
      <div>
        <h3 className="text-sm font-semibold text-[#09391C] mb-2">Map Section</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
          <div>
            <label className="block text-sm text-gray-700 mb-1">Title</label>
            <input className={inputBase} value={form.contactUs?.mapSection?.title || ""} onChange={(e) => updateMapField('title', e.target.value)} />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">Subtitle</label>
            <input className={inputBase} value={form.contactUs?.mapSection?.subTitle || ""} onChange={(e) => updateMapField('subTitle', e.target.value)} />
          </div>
        </div>

        <div className="space-y-3">
          {(form.contactUs?.mapSection?.locations || []).map((loc, idx) => (
            <div key={idx} className="grid grid-cols-1 md:grid-cols-12 gap-2 items-start">
              <input className={"md:col-span-3 " + inputBase} placeholder="City" value={loc.city || ""} onChange={(e) => updateMapLocation(idx, { city: e.target.value })} />
              <input className={"md:col-span-5 " + inputBase} placeholder="Address" value={loc.address || ""} onChange={(e) => updateMapLocation(idx, { address: e.target.value })} />
              <input className={"md:col-span-2 " + inputBase} placeholder={loc.coordinates ? String(loc.coordinates[0]) : "e.g. 6.4281 or 'Near Lekki'"} value={loc.coordinates ? String(loc.coordinates[0]) : ""} onChange={(e) => {
                const newLat = e.target.value;
                updateMapLocation(idx, { coordinates: [newLat, loc.coordinates ? String(loc.coordinates[1]) : ""] });
              }} />
              <input className={"md:col-span-1 " + inputBase} placeholder={loc.coordinates ? String(loc.coordinates[1]) : "e.g. 3.4219 or 'offshore'"} value={loc.coordinates ? String(loc.coordinates[1]) : ""} onChange={(e) => {
                const newLng = e.target.value;
                updateMapLocation(idx, { coordinates: [loc.coordinates ? String(loc.coordinates[0]) : "", newLng] });
              }} />
              <div className={"md:col-span-1 flex items-center gap-2"}>
                <button type="button" onClick={() => removeMapLocation(idx)} className="text-xs px-2 py-1 border rounded-lg">Remove</button>
              </div>
            </div>
          ))}

          <div>
            <button type="button" onClick={addMapLocation} className="text-xs px-2 py-1 border rounded-lg">Add Location</button>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div>
        <h3 className="text-sm font-semibold text-[#09391C] mb-2">CTA Section</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-700 mb-1">Title</label>
            <input className={inputBase} value={form.contactUs?.cta?.title || ""} onChange={(e) => updateCtaField('title', e.target.value)} />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">Subtitle</label>
            <input className={inputBase} value={form.contactUs?.cta?.subTitle || ""} onChange={(e) => updateCtaField('subTitle', e.target.value)} />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">Button Text</label>
            <input className={inputBase} value={form.contactUs?.cta?.buttonText || ""} onChange={(e) => updateCtaField('buttonText', e.target.value)} />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">Button Link</label>
            <input className={inputBase} value={form.contactUs?.cta?.link || ""} onChange={(e) => updateCtaField('link', e.target.value)} />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm text-gray-700 mb-1">Background Gradient (pick two colors)</label>
            <div className="flex items-center gap-2">
              <input type="color" className="h-9 w-12 p-0 border rounded" value={(form.contactUs?.cta?.backgroundGradient && form.contactUs.cta.backgroundGradient.includes('#')) ? (form.contactUs.cta.backgroundGradient.match(/#([0-9a-fA-F]{6})/g)?.[0] || '#09391C') : '#09391C'} onChange={(e) => {
                const end = (form.contactUs?.cta?.backgroundGradient && form.contactUs.cta.backgroundGradient.includes('#')) ? (form.contactUs.cta.backgroundGradient.match(/#([0-9a-fA-F]{6})/g)?.[1] || '#4BA678') : '#4BA678';
                setContactCtaGradient(e.target.value, end);
              }} />
              <input type="color" className="h-9 w-12 p-0 border rounded" value={(form.contactUs?.cta?.backgroundGradient && form.contactUs.cta.backgroundGradient.includes('#')) ? (form.contactUs.cta.backgroundGradient.match(/#([0-9a-fA-F]{6})/g)?.[1] || '#4BA678') : '#4BA678'} onChange={(e) => {
                const start = (form.contactUs?.cta?.backgroundGradient && form.contactUs.cta.backgroundGradient.includes('#')) ? (form.contactUs.cta.backgroundGradient.match(/#([0-9a-fA-F]{6})/g)?.[0] || '#09391C') : '#09391C';
                setContactCtaGradient(start, e.target.value);
              }} />
              <div className="flex-1">
                <input className={inputBase} value={form.contactUs?.cta?.backgroundGradient || ''} onChange={(e) => updateCtaField('backgroundGradient', e.target.value)} />
              </div>
            </div>
            <div className="h-8 mt-2 rounded" style={{ background: form.contactUs?.cta?.backgroundGradient || 'linear-gradient(90deg, #09391C 0%, #4BA678 100%)' }} />
          </div>
        </div>
      </div>
    </div>
  );

  const renderServiceLogger = (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-4">
        <h2 className="text-lg font-semibold text-[#09391C] flex items-center gap-2"><History size={18} /> Service Logger</h2>
        <div className="text-xs text-[#5A5D63]">Total activities: {serviceLogsPagination.total}</div>
      </div>
      {serviceLogsLoading ? (
        <div className="py-6 text-sm text-gray-500">Loading activities...</div>
      ) : serviceLogs.length === 0 ? (
        <div className="py-6 text-sm text-gray-500">No activities recorded yet.</div>
      ) : (
        <div className="space-y-4">
          {serviceLogs.map((log) => (
            <div key={log._id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-[#09391C]">{cleanLogText(log.action) || cleanLogText(log.category) || "Activity"}</p>
                  {cleanLogText(log.description) ? <p className="text-xs text-[#5A5D63] mt-1">{cleanLogText(log.description)}</p> : null}
                </div>
                <span className="text-xs text-[#5A5D63] whitespace-nowrap">{formatDateTime(log.createdAt)}</span>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-[#5A5D63]">
                <span>Actor: {formatActorName(log)}</span>
                {log.actorModel ? (
                  <span className="uppercase tracking-wide text-[10px] px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full">{log.actorModel}</span>
                ) : null}
                {log.ipAddress ? <span>IP: {log.ipAddress}</span> : null}
              </div>
              {log.userAgent ? <p className="mt-2 text-[11px] text-gray-400 break-words">{log.userAgent}</p> : null}
            </div>
          ))}
        </div>
      )}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={goToPreviousLogsPage}
          disabled={serviceLogsLoading || serviceLogsPagination.page <= 1}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm border border-gray-200 rounded-lg disabled:opacity-50"
        >
          Previous
        </button>
        <span className="text-xs text-[#5A5D63]">
          Page {serviceLogsPagination.page} of {Math.max(serviceLogsPagination.totalPages, 1)}
        </span>
        <button
          type="button"
          onClick={goToNextLogsPage}
          disabled={
            serviceLogsLoading ||
            serviceLogsPagination.page >= Math.max(serviceLogsPagination.totalPages, 1) ||
            serviceLogs.length === 0
          }
          className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm border border-gray-200 rounded-lg disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );

  const renderInspectionSettings = (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-[#09391C] mb-4">Inspection Settings</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="flex items-center gap-2 text-sm">
          <input className={checkboxBase} type="checkbox" checked={form.inspectionSettings.allowPublicBooking} onChange={(e) => setForm({ ...form, inspectionSettings: { ...form.inspectionSettings, allowPublicBooking: e.target.checked } })} />
          Allow Public Booking
        </label>
        <div>
          <label className="block text-sm text-gray-700 mb-1">
            Default Inspection Fee
          </label>
          <input
            type="text"
            value={
              form.inspectionSettings.defaultInspectionFee
                ? form.inspectionSettings.defaultInspectionFee.toLocaleString()
                : ""
            }
            onChange={(e) => {
              // Remove all non-numeric characters (including commas)
              const numericValue = e.target.value.replace(/\D/g, "");

              // Update state with the raw number (not formatted)
              setForm({
                ...form,
                inspectionSettings: {
                  ...form.inspectionSettings,
                  defaultInspectionFee: numericValue === "" ? "" : Number(numericValue),
                },
              });
            }}
            className={inputBase}
            placeholder="5000"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-700 mb-1">Inspection Status</label>
          <select value={form.inspectionSettings.inspectionStatus || "optional"} onChange={(e) => setForm({ ...form, inspectionSettings: { ...form.inspectionSettings, inspectionStatus: e.target.value } })} className={selectBase}>
            <option value="optional">Optional</option>
            <option value="required">Required</option>
          </select>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input className={checkboxBase} type="checkbox" checked={!!form.inspectionSettings.negotiationEnabled} onChange={(e) => setForm({ ...form, inspectionSettings: { ...form.inspectionSettings, negotiationEnabled: e.target.checked } })} />
          Enable Negotiation
        </label>
      </div>
    </div>
  );

  const renderSecuritySettings = (
    <div className="bg-white rounded-lg border border-red-200 p-6">
      <h2 className="text-lg font-semibold text-red-700 flex items-center gap-2 mb-2"><Shield size={18} /> Security Settings</h2>
      <p className="text-sm text-[#5A5D63] mb-4">Delete your public access page. This action cannot be undone.</p>
      <button onClick={() => setShowDeleteConfirm(true)} className="inline-flex items-center gap-2 px-4 py-2 border border-red-200 text-red-600 rounded-lg text-sm hover:bg-red-50">
        <Trash size={16} /> Delete Public Page
      </button>
    </div>
  );

  const renderOverview = (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-[#09391C]">Your public access page is {isPaused ? "paused" : slugLocked ? "live" : "in draft"}</h2>
            {previewUrl ? (
              <div className="mt-1 text-sm text-[#0B572B] flex items-center gap-2">
                <a href={previewUrl} target="_blank" rel="noreferrer" className="underline inline-flex items-center gap-1">{previewUrl} <ExternalLink size={14} /></a>
                <button type="button" onClick={copyLink} className="inline-flex items-center gap-1 text-emerald-700"><Copy size={14} /> Copy</button>
              </div>
            ) : (
              <p className="text-sm text-[#5A5D63]">Set your public link to go live.</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {!isPaused ? (
              <button onClick={pauseDealSite} disabled={isOnHold} className="inline-flex items-center gap-2 px-3 py-2 border rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed"><Pause size={16} /> Pause</button>
            ) : (
              <button onClick={resumeDealSite} disabled={isOnHold} className="inline-flex items-center gap-2 px-3 py-2 border rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed"><Play size={16} /> Resume</button>
            )}
            <button onClick={() => setActiveTab("branding")} disabled={isOnHold} className="px-4 py-2 border rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed">Edit Settings</button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-3">
          <h3 className="text-base font-semibold text-[#09391C] flex items-center gap-2"><History size={18} /> Recent Activities</h3>
          <button
            type="button"
            onClick={() => {
              setServiceLogsPage(1);
              setActiveTab("service-logger");
            }}
            className="inline-flex items-center gap-1 text-sm text-emerald-700 hover:text-emerald-800"
          >
            View all <ExternalLink size={14} />
          </button>
        </div>
        {overviewLogsLoading ? (
          <div className="py-6 text-sm text-gray-500">Loading activities...</div>
        ) : overviewLogs.length === 0 ? (
          <div className="py-6 text-sm text-gray-500">No activities recorded yet.</div>
        ) : (
          <div className="space-y-4">
            {overviewLogs.map((log) => (
              <div key={log._id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-[#09391C]">{cleanLogText(log.action) || cleanLogText(log.category) || "Activity"}</p>
                    {cleanLogText(log.description) ? <p className="text-xs text-[#5A5D63] mt-1">{cleanLogText(log.description)}</p> : null}
                  </div>
                  <span className="text-xs text-[#5A5D63] whitespace-nowrap">{formatDateTime(log.createdAt)}</span>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-[#5A5D63]">
                  <span>By {formatActorName(log)}</span>
                  {log.actorModel ? (
                    <span className="uppercase tracking-wide text-[10px] px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full">{log.actorModel}</span>
                  ) : null}
                  {log.ipAddress ? <span>IP: {log.ipAddress}</span> : null}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <CombinedAuthGuard requireAuth allowedUserTypes={["Agent"]} requireActiveSubscription>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
            <Link href="/dashboard" className="inline-flex items-center gap-2 text-[#8DDB90] hover:text-[#09391C] font-medium transition-colors">
              <ArrowLeftIcon size={20} />
              Back to Dashboard
            </Link>
          </div>
          {activeView === "setup" ? (
            <>
              {SetupHeader}
              <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6"><Stepper steps={steps as any} /></div>

              {setupStep === 0 && (
                <Formik
                  initialValues={{
                    publicSlug: form.publicSlug,
                    title: form.title,
                    keywordsText: form.keywords.join(", "),
                    description: form.description,
                  }}
                  validationSchema={Step0Schema}
                  onSubmit={(values) => {
                    const cleanedSlug = values.publicSlug.replace(/[^a-z0-9-]/g, '').toLowerCase();
                    setForm((prev) => ({
                      ...prev,
                      publicSlug: cleanedSlug,
                      title: values.title,
                      keywords: values.keywordsText.split(',').map((k) => k.trim()).filter(Boolean),
                      description: values.description,
                    }));
                    setSetupStep(1);
                  }}
                >
                  {({ values, errors, touched, handleChange, isValid, isSubmitting }) => (
                    <Form className="space-y-6">
                      <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h2 className="text-lg font-semibold text-[#09391C] flex items-center gap-2"><LinkIcon size={18} /> Public Link</h2>
                          {slugLocked && (
                            <div className="inline-flex items-center gap-1 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded">
                              <ShieldCheck size={14} /> Locked
                            </div>
                          )}
                        </div>
                        <div className="grid grid-cols-1 gap-3">
                          <label className="text-sm text-gray-700">Enter your subdomain (can be set once)</label>
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              name="publicSlug"
                              value={values.publicSlug}
                              onChange={(e) => {
                                const v = e.target.value.replace(/[^a-z0-9-]/g, '').toLowerCase();
                                const event = { target: { name: "publicSlug", value: v } }; // minimal event for Formik
                                handleChange(event);
                                setForm({ ...form, publicSlug: v });
                              }}
                              disabled={slugLocked}
                              className={`${inputBase} disabled:bg-gray-100 ${errors.publicSlug && touched.publicSlug ? 'border-red-500 focus:ring-red-200 focus:border-red-400' : ''}`}
                              placeholder="yourname"
                              required
                            />
                            <span className="text-sm text-gray-500 whitespace-nowrap">.khabiteq.com</span>
                          </div>
                          {!slugLocked && form.publicSlug && (
                            <div className={`text-xs ${slugStatus === 'available' ? 'text-emerald-700' : slugStatus === 'taken' || slugStatus === 'invalid' ? 'text-red-600' : 'text-gray-600'}`}>
                              {slugMessage}
                            </div>
                          )}
                          {previewUrl && (
                            <div className="flex items-center gap-2 text-sm text-emerald-700">
                              <a href={previewUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1">
                                Preview: {previewUrl} <ExternalLink size={14} />
                              </a>
                              <button type="button" onClick={copyLink} className="inline-flex items-center gap-1 text-emerald-700">
                                <Copy size={14} /> Copy
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
 
                      <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
                        <h2 className="text-lg font-semibold text-[#09391C]">Branding & SEO</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm text-gray-700 mb-1">Title</label>
                            <input
                              type="text"
                              name="title"
                              value={values.title}
                              onChange={(e) => { handleChange(e); setForm({ ...form, title: e.target.value }); }}
                              className={`${inputBase} ${errors.title && touched.title ? 'border-red-500 focus:ring-red-200 focus:border-red-400' : ''}`}
                              placeholder="Page title"
                            />
                          </div>
                          <div>
                            <label className="block text-sm text-gray-700 mb-1">Keywords (comma separated)</label>
                            <input
                              type="text"
                              name="keywordsText"
                              value={values.keywordsText}
                              onChange={(e) => { handleChange(e); setForm({ ...form, keywords: e.target.value.split(',').map((k) => k.trim()).filter(Boolean) }); }}
                              className={`${inputBase} ${errors.keywordsText && touched.keywordsText ? 'border-red-500 focus:ring-red-200 focus:border-red-400' : ''}`}
                              placeholder="agent, real estate, listings"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm text-gray-700 mb-1">Description</label>
                          <textarea
                            name="description"
                            value={values.description}
                            onChange={(e) => { handleChange(e); setForm({ ...form, description: e.target.value }); }}
                            className={`${inputBase} min-h-[100px] ${errors.description && touched.description ? 'border-red-500 focus:ring-red-200 focus:border-red-400' : ''}`}
                            placeholder="Tell visitors about you"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-gray-700 mb-2">Logo</label>
                          {form.logoUrl ? (
                            <div className="flex items-center gap-3">
                              <img src={form.logoUrl} alt="Logo" className="h-12 w-12 rounded border object-contain bg-white" />
                              <button type="button" onClick={() => setForm({ ...form, logoUrl: "" })} className="px-3 py-2 text-sm border rounded-lg inline-flex items-center gap-2">
                                <Trash2 size={16} /> Remove
                              </button>
                            </div>
                          ) : (
                            <label className="flex items-center justify-center gap-2 px-4 py-6 border-2 border-dashed rounded-lg text-sm cursor-pointer hover:bg-gray-50">
                              <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files && handleUploadLogo(e.target.files[0])} />
                              <ImageIcon size={16} /> <span className="text-gray-600">Drag & drop or click to upload</span>
                            </label>
                          )}
                        </div>

                        <div className="pt-2 flex justify-end">
                          <button
                            type="submit"
                            disabled={!isValid || isSubmitting || (!slugLocked && slugStatus !== 'available')}
                            className="inline-flex items-center gap-2 px-6 py-2 bg-[#0B572B] text-white rounded-lg disabled:opacity-60"
                          >
                            Next
                          </button>
                        </div>
                      </div>
                    </Form>
                  )}
                </Formik>
              )}
              {setupStep === 1 && (
                <Formik
                  initialValues={{
                    shortDescription: form.footer?.shortDescription || '',
                    copyrightText: form.footer?.copyrightText || '',
                  }}
                  validationSchema={Step1Schema}
                  onSubmit={(values) => {
                    setForm((prev) => ({ ...prev, footer: { shortDescription: values.shortDescription, copyrightText: values.copyrightText } }));
                    setSetupStep(2);
                  }}
                >
                  {({ values, errors, touched, handleChange, isValid, isSubmitting }) => (
                    <Form className="space-y-6">
                      {renderPublicDesign}

                      <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
                        <h2 className="text-lg font-semibold text-[#09391C]">Footer Details</h2>
                        <div className="grid grid-cols-1 gap-4">
                          <div>
                            <label className="block text-sm text-gray-700 mb-1">Short Description</label>
                            <textarea
                              name="shortDescription"
                              value={values.shortDescription}
                              onChange={(e) => { handleChange(e); setForm({ ...form, footer: { ...(form.footer || { shortDescription: '', copyrightText: '' }), shortDescription: e.target.value } }); }}
                              className={`${inputBase} min-h-[80px] ${errors.shortDescription && touched.shortDescription ? 'border-red-500 focus:ring-red-200 focus:border-red-400' : ''}`}
                              placeholder="Brief description shown in the footer"
                            />
                          </div>
                          <div>
                            <label className="block text-sm text-gray-700 mb-1">Copyright Text</label>
                            <input
                              type="text"
                              name="copyrightText"
                              value={values.copyrightText}
                              onChange={(e) => { handleChange(e); setForm({ ...form, footer: { ...(form.footer || { shortDescription: '', copyrightText: '' }), copyrightText: e.target.value } }); }}
                              className={`${inputBase} ${errors.copyrightText && touched.copyrightText ? 'border-red-500 focus:ring-red-200 focus:border-red-400' : ''}`}
                              placeholder="© 2025 Your Name. All rights reserved."
                            />
                          </div>
                        </div>

                        <div className="pt-2 flex justify-end">
                          <button
                            type="submit"
                            disabled={!isValid || isSubmitting}
                            className="inline-flex items-center gap-2 px-6 py-2 bg-[#0B572B] text-white rounded-lg disabled:opacity-60"
                          >
                            Next
                          </button>
                        </div>
                      </div>

                      {renderTheme}
                    </Form>
                  )}
                </Formik>
              )}
              {setupStep === 2 && (
                <div className="space-y-6">
                  {renderMarketplaceDefaults}
                  {renderContactVisibility}
                </div>
              )}
              {setupStep === 3 && (
                <Formik
                  initialValues={{
                    businessName: form.paymentDetails?.businessName || "",
                    accountNumber: form.paymentDetails?.accountNumber || "",
                    sortCode: form.paymentDetails?.sortCode || "",
                    primaryContactEmail: form.paymentDetails?.primaryContactEmail || "",
                    primaryContactName: form.paymentDetails?.primaryContactName || "",
                    primaryContactPhone: form.paymentDetails?.primaryContactPhone || "",
                  }}
                  validationSchema={PaymentDetailsSchema}
                  onSubmit={(values) => {
                    setForm(prev => ({
                      ...prev,
                      paymentDetails: {
                        businessName: values.businessName,
                        accountNumber: values.accountNumber,
                        sortCode: values.sortCode,
                        primaryContactEmail: values.primaryContactEmail,
                        primaryContactName: values.primaryContactName,
                        primaryContactPhone: values.primaryContactPhone,
                      }
                    }));
                    setSetupStep(4);
                  }}
                  enableReinitialize
                >
                  {({ values, errors, touched, handleChange, handleBlur, isValid, isSubmitting }) => (
                    <Form className="space-y-6">
                      <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-[#09391C] mb-4">Bank Details</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm text-gray-700 mb-1">Business Name <span className="text-red-500">*</span></label>
                            <input
                              type="text"
                              name="businessName"
                              value={values.businessName}
                              onChange={(e) => { handleChange(e); setForm(prev => ({ ...prev, paymentDetails: { ...prev.paymentDetails, businessName: e.target.value } })); }}
                              onBlur={handleBlur}
                              placeholder="Registered business name"
                              className={`${inputBase} ${touched.businessName && errors.businessName ? 'border-red-500 focus:ring-red-200 focus:border-red-400' : ''}`}
                            />
                            {touched.businessName && errors.businessName && (
                              <p className="text-red-500 text-sm mt-1">{errors.businessName}</p>
                            )}
                          </div>
                          <div>
                            <label className="block text-sm text-gray-700 mb-1">Account Number <span className="text-red-500">*</span></label>
                            <input
                              type="text"
                              name="accountNumber"
                              value={values.accountNumber}
                              onChange={(e) => {
                                const cleaned = e.target.value.replace(/\D/g, '');
                                handleChange({ target: { name: 'accountNumber', value: cleaned } } as any);
                                setForm(prev => ({ ...prev, paymentDetails: { ...prev.paymentDetails, accountNumber: cleaned } }));
                              }}
                              onBlur={handleBlur}
                              placeholder="10-digit account number"
                              className={`${inputBase} ${touched.accountNumber && errors.accountNumber ? 'border-red-500 focus:ring-red-200 focus:border-red-400' : ''}`}
                            />
                            {touched.accountNumber && errors.accountNumber && (
                              <p className="text-red-500 text-sm mt-1">{errors.accountNumber}</p>
                            )}
                          </div>
                          <div>
                            <label className="block text-sm text-gray-700 mb-1">Settlement Bank <span className="text-red-500">*</span></label>
                            <select
                              name="sortCode"
                              value={values.sortCode}
                              onChange={(e) => { handleChange(e); setForm(prev => ({ ...prev, paymentDetails: { ...prev.paymentDetails, sortCode: e.target.value } })); }}
                              onBlur={handleBlur}
                              className={`${selectBase} ${touched.sortCode && errors.sortCode ? 'border-red-500 focus:ring-red-200 focus:border-red-400' : ''}`}
                            >
                              <option value="" disabled>{banksLoading ? "Loading banks..." : "Select bank"}</option>
                              {bankList.map((b) => (
                                <option key={b.code} value={b.code}>{b.name}</option>
                              ))}
                            </select>
                            {touched.sortCode && errors.sortCode && (
                              <p className="text-red-500 text-sm mt-1">{errors.sortCode}</p>
                            )}
                          </div>
                          <div>
                            <label className="block text-sm text-gray-700 mb-1">Primary Contact Email (optional)</label>
                            <input
                              type="email"
                              name="primaryContactEmail"
                              value={values.primaryContactEmail}
                              onChange={(e) => { handleChange(e); setForm(prev => ({ ...prev, paymentDetails: { ...prev.paymentDetails, primaryContactEmail: e.target.value } })); }}
                              onBlur={handleBlur}
                              placeholder="email@example.com"
                              className={`${inputBase} ${touched.primaryContactEmail && errors.primaryContactEmail ? 'border-red-500 focus:ring-red-200 focus:border-red-400' : ''}`}
                            />
                            {touched.primaryContactEmail && errors.primaryContactEmail && (
                              <p className="text-red-500 text-sm mt-1">{errors.primaryContactEmail}</p>
                            )}
                          </div>
                          <div>
                            <label className="block text-sm text-gray-700 mb-1">Primary Contact Name (optional)</label>
                            <input
                              type="text"
                              name="primaryContactName"
                              value={values.primaryContactName}
                              onChange={(e) => { handleChange(e); setForm(prev => ({ ...prev, paymentDetails: { ...prev.paymentDetails, primaryContactName: e.target.value } })); }}
                              onBlur={handleBlur}
                              placeholder="Full name"
                              className={inputBase}
                            />
                          </div>
                          <div>
                            <label className="block text-sm text-gray-700 mb-1">Primary Contact Phone (optional)</label>
                            <input
                              type="tel"
                              name="primaryContactPhone"
                              value={values.primaryContactPhone}
                              onChange={(e) => { handleChange(e); setForm(prev => ({ ...prev, paymentDetails: { ...prev.paymentDetails, primaryContactPhone: e.target.value } })); }}
                              onBlur={handleBlur}
                              placeholder="e.g. +2348012345678"
                              className={inputBase}
                            />
                          </div>
                        </div>
                        <p className="text-xs text-[#5A5D63] mt-3">These details are used for settlements.</p>
                      </div>

                      <div className="flex items-center justify-between pt-6">
                        <button
                          type="button"
                          onClick={() => setSetupStep(2)}
                          className="inline-flex items-center gap-2 px-4 py-2 border rounded-lg text-[#0B572B] border-[#8DDB90] disabled:opacity-50"
                        >
                          Back
                        </button>
                        <button
                          type="submit"
                          disabled={!isValid || isSubmitting}
                          className="inline-flex items-center gap-2 px-6 py-2 bg-[#0B572B] text-white rounded-lg disabled:opacity-60"
                        >
                          Next
                        </button>
                      </div>
                    </Form>
                  )}
                </Formik>
              )}
              {setupStep === 4 && (
                <div className="space-y-6">
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h2 className="text-lg font-semibold text-[#09391C] mb-2">Review</h2>
                    <p className="text-sm text-[#5A5D63] mb-4">Everything looks good. Save to go live.</p>
                    <div className="text-sm grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div><span className="text-gray-500">Public Link:</span> {previewUrl || "/pv-account/" + form.publicSlug}</div>
                      <div><span className="text-gray-500">Title:</span> {form.title || "Untitled"}</div>
                      <div><span className="text-gray-500">Listings Limit:</span> {form.listingsLimit}</div>
                      <div><span className="text-gray-500">Default Tab:</span> {form.marketplaceDefaults.defaultTab}</div>
                      <div><span className="text-gray-500">Business Name:</span> {form.paymentDetails?.businessName || "Not set"}</div>
                      <div><span className="text-gray-500">Account Number:</span> {form.paymentDetails?.accountNumber ? "●●●●●●●●" + form.paymentDetails.accountNumber.slice(-2) : "Not set"}</div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-6">
                <button
                  type="button"
                  onClick={() => setSetupStep((s) => Math.max(0, s - 1))}
                  disabled={setupStep === 0}
                  className="inline-flex items-center gap-2 px-4 py-2 border rounded-lg text-[#0B572B] border-[#8DDB90] disabled:opacity-50"
                >
                  Back
                </button>

                {setupStep < 4 ? (
                  (setupStep === 0 || setupStep === 1) ? null : (
                    <button
                      type="button"
                      onClick={() => setSetupStep((s) => Math.min(4, s + 1))}
                      className="inline-flex items-center gap-2 px-6 py-2 bg-[#0B572B] text-white rounded-lg"
                    >
                      Next
                    </button>
                  )
                ) : (
                  <button
                    onClick={() => onSubmit()}
                    disabled={saving}
                    className="inline-flex items-center gap-2 px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg disabled:opacity-60"
                  >
                    <Save size={16} /> {saving ? "Saving..." : "Save & Finish Setup"}
                  </button>
                )}
              </div>
            </>
          ) : (
            <>
              {ManageHeader}

              {isPaused && slugLocked && (
                <div className="mb-4 p-4 rounded-lg border border-yellow-200 bg-yellow-50 text-yellow-800 flex items-center justify-between gap-3">
                  <div className="text-sm">
                    <span className="font-semibold">Pending activation.</span> Your public access page setup is complete but paused by default. Click Resume to make it live.
                  </div>
                  <button onClick={resumeDealSite} className="inline-flex items-center gap-2 px-3 py-2 border border-yellow-300 rounded-lg text-sm bg-white hover:bg-yellow-100">
                    <Play size={16} /> Resume now
                  </button>
                </div>
              )}

              {isOnHold && slugLocked && (
                <div className="mb-4 p-4 rounded-lg border border-red-200 bg-red-50 text-red-800 flex items-center justify-between gap-3">
                  <div className="text-sm">
                    <span className="font-semibold">Public access page on hold.</span> 
                    Your page is currently restricted due to policy or verification issues. 
                    Please contact an administrator for assistance.
                  </div>
                  <button
                    onClick={() => window.open('/contact-us', '_blank')}
                    className="inline-flex items-center gap-2 px-3 py-2 border border-red-300 rounded-lg text-sm bg-white hover:bg-red-100 transition-colors"
                  >
                    <Mail size={16} /> Contact Admin
                  </button>
                </div>
              )}


              <TabsHeader
                active={activeTab}
                onChange={(id) => setActiveTab(id as ManageTabId)}
                disabled={isOnHold}
                tabs={[
                  { id: "overview", label: "Overview", icon: <BarChart2 size={16} /> },
                  { id: "branding", label: "Branding & SEO" },
                  { id: "design", label: "Public Page Design" },
                  { id: "theme", label: "Theme" },
                  { id: "marketplace", label: "Marketplace" },
                  { id: "inspection", label: "Inspection Settings" },
                  { id: "contact", label: "Contact" },
                  { id: "social", label: "Social Links" },
                  { id: "about", label: "About Us" },
                  { id: "contact-us", label: "Contact Us" },
                  { id: "payment", label: "Payment" },
                  { id: "featured", label: "Featured Listings" },
                  { id: "listings", label: "Listings" },
                  { id: "home-settings", label: "Home Settings" },
                  { id: "subscribe-settings", label: "Subscribe Settings" },
                  { id: "service-logger", label: "Service Logger", icon: <History size={16} /> },
                  { id: "security", label: "Security Settings", icon: <Shield size={14} /> },
                ]}
              />

              <div className="mt-6 space-y-6">
                {activeTab === "overview" && (
                  <OverviewTab
                    isPaused={isPaused}
                    slugLocked={slugLocked}
                    previewUrl={previewUrl}
                    isOnHold={isOnHold}
                    overviewLogsLoading={overviewLogsLoading}
                    overviewLogs={overviewLogs}
                    onPause={pauseDealSite}
                    onResume={resumeDealSite}
                    onEditSettings={() => setActiveTab("branding")}
                    onViewAll={() => {
                      setServiceLogsPage(1);
                      setActiveTab("service-logger");
                    }}
                    onCopyLink={copyLink}
                  />
                )}
                {activeTab === "branding" && renderBrandingSeo}
                {activeTab === "design" && (
                  <div className="space-y-6">
                    {renderPublicDesign}
                    {renderFooterDetails}
                  </div>
                )}
                {activeTab === "theme" && renderTheme}
                {activeTab === "marketplace" && renderMarketplaceDefaults}
                {activeTab === "inspection" && renderInspectionSettings}
                {activeTab === "contact" && renderContactVisibility}
                {activeTab === "social" && renderSocialLinks}
                {activeTab === "about" && renderAboutUs}
                {activeTab === "contact-us" && renderContactUs}
                {activeTab === "payment" && renderBankDetails}
                {activeTab === "featured" && renderFeaturedListings}
                {activeTab === "listings" && renderListingsLimit}
                {activeTab === "home-settings" && (
                  <HomeSettingsTab
                    form={form}
                    setForm={setForm}
                    inputBase={inputBase}
                    onUploadTestimonialImage={handleUploadTestimonialImage}
                  />
                )}
                {activeTab === "subscribe-settings" && renderSubscribeSettings}
                {activeTab === "service-logger" && renderServiceLogger}
                {activeTab === "security" && renderSecuritySettings}

                {isUpdatableTab(activeTab) && (
                  <div className="flex items-center gap-3">
                    <button onClick={() => saveSection(activeTab)} disabled={saving || isOnHold} className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg disabled:opacity-60">
                      <Save size={16} /> {saving ? "Saving..." : "Save Settings"}
                    </button>
                    {isOnHold && <span className="text-sm text-red-600">Changes disabled while on hold</span>}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Global Preloader */}
      <OverlayPreloader isVisible={preloader.visible} message={preloader.message} />
 
      {/* Delete confirmation modal */}
      <ModalWrapper isOpen={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)} title="Confirm Deletion" size="sm">
        <div className="p-4">
          <ConfirmationModal
            title="Delete Public Access Page"
            message="Are you sure you want to delete your public access page? This action cannot be undone."
            type="danger"
            confirmText="Delete"
            cancelText="Cancel"
            onConfirm={deleteDealSite}
            onClose={() => setShowDeleteConfirm(false)}
          />
        </div>
      </ModalWrapper>
    </CombinedAuthGuard>
  );
}
