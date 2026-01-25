/**
 * Public Access Page Payload Structures
 * Organized by sections/pages for consistent form submission
 */

// ============================================================================
// SETUP PAGE PAYLOADS
// ============================================================================

export interface SetupPayload {
  publicSlug: string;
  title: string;
  description: string;
  keywords: string[];
  paymentDetails: {
    businessName: string;
    accountNumber: string;
    sortCode: string;
  };
}

// ============================================================================
// BRANDING PAGE PAYLOADS
// ============================================================================

export interface BrandingPayload {
  title: string;
  description: string;
  keywords: string[];
  logoUrl?: string;
  heroImage?: string;
  footerDetails?: {
    businessName?: string;
    address?: string;
    phone?: string;
    email?: string;
    socialLinks?: {
      facebook?: string;
      instagram?: string;
      twitter?: string;
      linkedin?: string;
    };
  };
}

// ============================================================================
// HOME PAGE PAYLOADS
// ============================================================================

export interface HomepagePayload {
  publicPage?: {
    heroTitle: string;
    heroSubtitle: string;
    heroImage?: string;
    ctaText: string;
    ctaLink: string;
    ctaText2?: string;
    ctaLink2?: string;
  };
  homeSettings?: {
    testimonials?: {
      title: string;
      subTitle: string;
      testimonials: Array<{
        _id?: string;
        id?: string;
        rating: number;
        description: string;
        image?: string;
        name: string;
        company: string;
      }>;
    };
    whyChooseUs?: {
      title: string;
      subTitle: string;
      items: Array<{
        _id?: string;
        id?: string;
        icon: string;
        title: string;
        content: string;
      }>;
    };
  };
}

// ============================================================================
// CONTACT US PAGE PAYLOADS
// ============================================================================

export interface ContactUsPayload {
  contactUs?: {
    hero?: {
      title: string;
      description: string;
    };
    cta?: {
      title: string;
    };
  };
  contactVisibility?: {
    showEmail: boolean;
    showPhone: boolean;
    enableContactForm: boolean;
    showWhatsAppButton: boolean;
    whatsappNumber: string;
  };
}

// ============================================================================
// ABOUT PAGE PAYLOADS
// ============================================================================

export interface AboutPagePayload {
  about?: {
    hero?: {
      title: string;
      description: string;
      image?: string;
    };
    content?: {
      title: string;
      description: string;
    };
  };
}

// ============================================================================
// FEATURED LISTINGS PAYLOADS
// ============================================================================

export interface FeaturedListingsPayload {
  featuredListings?: {
    listings: Array<{
      id: string;
      propertyId: string;
      position: number;
    }>;
    displayLimit: number;
    sortBy: "newest" | "price-high" | "price-low" | "views";
  };
}

// ============================================================================
// THEME PAGE PAYLOADS
// ============================================================================

export interface ThemePayload {
  theme?: {
    primaryColor?: string;
    secondaryColor?: string;
    accentColor?: string;
    fontFamily?: string;
    layout?: "classic" | "modern" | "minimal";
  };
}

// ============================================================================
// SOCIAL MEDIA PAYLOADS
// ============================================================================

export interface SocialMediaPayload {
  socialLinks?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    linkedin?: string;
    youtube?: string;
    tiktok?: string;
  };
  socialVisibility?: {
    showSocialLinks: boolean;
    displayLocation: "header" | "footer" | "both";
  };
}

// ============================================================================
// PAYMENT SETTINGS PAYLOADS
// ============================================================================

export interface PaymentSettingsPayload {
  paymentDetails?: {
    businessName: string;
    accountNumber: string;
    sortCode: string;
    bankName?: string;
  };
  paymentVisibility?: {
    showPaymentOptions: boolean;
  };
}

// ============================================================================
// SECURITY PAYLOADS
// ============================================================================

export interface SecurityPayload {
  security?: {
    enablePasswordProtection?: boolean;
    password?: string;
    enableIPWhitelist?: boolean;
    whitelistedIPs?: string[];
    enableSSL?: boolean;
  };
}

// ============================================================================
// SUBSCRIPTION SETTINGS PAYLOADS
// ============================================================================

export interface SubscriptionSettingsPayload {
  subscriptionSettings?: {
    plan: "free" | "basic" | "premium" | "enterprise";
    autoRenew: boolean;
    billingPeriod: "monthly" | "yearly";
    enableNotifications: boolean;
  };
}

// ============================================================================
// PREFERENCES PAYLOADS (User Preferences)
// ============================================================================

export interface PreferencePayload {
  _id?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  propertyType?: string;
  preferenceMode?: "buy" | "rent" | "shortlet" | "jv";
  budget?: {
    min?: number;
    max?: number;
    minPrice?: number;
    maxPrice?: number;
  };
  location?: {
    state?: string;
    localGovernmentAreas?: string[];
    lgasWithAreas?: Array<{
      lgaName: string;
      areas: string[];
    }>;
    customLocation?: string;
  };
  status?: string;
  createdAt?: string;
}

// ============================================================================
// INSPECTION SETTINGS PAYLOADS
// ============================================================================

export interface InspectionSettingsPayload {
  inspection?: {
    enableInspection: boolean;
    inspectionDays: number[];
    inspectionTime: string;
    maxInspectionsPerDay: number;
    requireApproval: boolean;
  };
}

// ============================================================================
// UNIFIED DEAL SITE UPDATE PAYLOAD
// ============================================================================

export type UnifiedDealSitePayload = BrandingPayload &
  HomepagePayload &
  ContactUsPayload &
  AboutPagePayload &
  ThemePayload &
  SocialMediaPayload &
  PaymentSettingsPayload &
  SecurityPayload &
  SubscriptionSettingsPayload;

// ============================================================================
// PAYLOAD BUILDERS - Helper functions to create payloads
// ============================================================================

/**
 * Build a branding payload with only modified fields
 */
export const buildBrandingPayload = (fields: Partial<BrandingPayload>): BrandingPayload => {
  return {
    title: fields.title || "",
    description: fields.description || "",
    keywords: fields.keywords || [],
    logoUrl: fields.logoUrl,
    heroImage: fields.heroImage,
    footerDetails: fields.footerDetails,
  };
};

/**
 * Build a homepage payload with testimonials and why choose us sections
 */
export const buildHomepagePayload = (fields: Partial<HomepagePayload>): HomepagePayload => {
  return {
    publicPage: fields.publicPage,
    homeSettings: {
      testimonials: fields.homeSettings?.testimonials || {
        title: "",
        subTitle: "",
        testimonials: [],
      },
      whyChooseUs: fields.homeSettings?.whyChooseUs || {
        title: "",
        subTitle: "",
        items: [],
      },
    },
  };
};

/**
 * Build a contact us payload
 */
export const buildContactUsPayload = (fields: Partial<ContactUsPayload>): ContactUsPayload => {
  return {
    contactUs: fields.contactUs,
    contactVisibility: fields.contactVisibility || {
      showEmail: true,
      showPhone: true,
      enableContactForm: true,
      showWhatsAppButton: false,
      whatsappNumber: "",
    },
  };
};

/**
 * Build payment settings payload
 */
export const buildPaymentPayload = (fields: Partial<PaymentSettingsPayload>): PaymentSettingsPayload => {
  return {
    paymentDetails: fields.paymentDetails || {
      businessName: "",
      accountNumber: "",
      sortCode: "",
    },
    paymentVisibility: fields.paymentVisibility || {
      showPaymentOptions: true,
    },
  };
};

/**
 * Build social media payload
 */
export const buildSocialMediaPayload = (fields: Partial<SocialMediaPayload>): SocialMediaPayload => {
  return {
    socialLinks: fields.socialLinks || {},
    socialVisibility: fields.socialVisibility || {
      showSocialLinks: true,
      displayLocation: "footer",
    },
  };
};

/**
 * Create a combined payload from multiple sections
 */
export const buildUnifiedPayload = (...sections: Partial<UnifiedDealSitePayload>[]): UnifiedDealSitePayload => {
  return Object.assign({}, ...sections) as UnifiedDealSitePayload;
};
