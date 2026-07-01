/** @format */

// Validate environment variables and provide fallback
const getApiBaseUrl = (): string => {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;

  if (!baseUrl || baseUrl.includes('undefined')) {
    console.warn('⚠️ NEXT_PUBLIC_API_URL not configured. API features may not work. Set this environment variable for full functionality.');
    return 'http://localhost:3001/api';
  }

  return baseUrl;
};

export const URLS = {
  BASE: getApiBaseUrl(),

  /**
   * Upload Image
   */
  uploadImg: "/upload-image",
  uploadSingleImg: "/upload-single-file",

  deleteUploadedSingleImg: "/delete-single-file",

  submitVerificationDocs: "/submitVerificationDocs",
  verifyPayment: "/verify-payment",

  /**
   * Upload file
   */
  uploadFile: "/upload-file",
  /**
   * Property Endpoints
   */
  propertyBaseUrl: "/properties",
  /**
   * Settings
   */
  accountSettingsBaseUrl: "/account",
  /** GET — agent KYC / trial / subscription policy snapshot */
  agentEligibility: "/account/agent/eligibility",
  /** GET — 25-listing cap snapshot for landlord, agent, developer */
  publisherListingEligibility: "/account/publisher/listing-eligibility",
  /** GET — Portfolio Unlimited offer (only when at standard cap) */
  publisherUnlimitedListingPlan: "/account/publisher/unlimited-listing-plan",

  /**
   * Preference Endpoints
   */
  preferenceBaseUrl: "/preferences",

  /**
   * Request for inspection
   */
  requestInspection: "/inspections/request-inspection",

  /**
   * Testimonials Url
   */
  testimonialsURL: "/testimonials",

  /**
   * Secure Negotition Base Url
   */
  inspectionBaseUrl: "/inspections",
  /** Reopen expired inspection - try "reopen" first; backend may use "reOpen" */
  inspectionReopen: (inspectionId: string) => `/inspections/${inspectionId}/reopen`,
  inspectionReopenCamel: (inspectionId: string) => `/inspections/${inspectionId}/reOpen`,

  /**
   * Account endpoints
   */
  accountInspectionBaseUrl: "/account/my-inspections",
  /** GET /account/my-inspections/:inspectionId — single inspection (guide §8.2) */
  accountMyInspectionGetOne: (inspectionId: string) => `/account/my-inspections/${inspectionId}`,
  /** POST /account/my-inspections/:inspectionId/respond { action: "accept" | "reject", note?: string, inspectionFee?: number } (guide §8.3) */
  accountInspectionRespond: (inspectionId: string) => `/account/my-inspections/${inspectionId}/respond`,
  /** Field Agent representation — no Paystack; commission settled outside app */
  fieldAgentRepresentationTerms: "/account/field-agents/representation-terms",
  fieldAgentsAvailable: "/account/field-agents/available",
  requestFieldAgentForInspection: (inspectionId: string) =>
    `/account/my-inspections/${inspectionId}/request-field-agent`,
  cancelFieldAgentRequest: (inspectionId: string) =>
    `/account/my-inspections/${inspectionId}/field-agent-request`,
  fieldAgentRepresentationRequests: "/account/inspectionsFieldAgent/representation-requests",
  fieldAgentRepresentationRespond: (inspectionId: string) =>
    `/account/inspectionsFieldAgent/${inspectionId}/representation/respond`,
  /** Landlord / Developer: CRUD for inspection notification contacts (email + WhatsApp) */
  accountInspectionRepresentatives: "/account/inspection-representatives",
  accountInspectionRepresentative: (representativeId: string) =>
    `/account/inspection-representatives/${representativeId}`,
  /** Per approved listing: inspection notification contacts (Developer / Landowner publishers) */
  propertyInspectionRepresentatives: (propertyId: string) =>
    `/account/properties/${propertyId}/inspection-representatives`,
  propertyInspectionRepresentative: (propertyId: string, representativeId: string) =>
    `/account/properties/${propertyId}/inspection-representatives/${representativeId}`,
  accountBookingsBaseUrl: "/account/my-bookings",
  accountPropertyBaseUrl: "/account/properties",
  /** POST /account/properties/create (guide: listingScope for KHABITEQ marketplace, e.g. lasrera_marketplace) */
  accountPropertyCreate: "/account/properties/create",
  /** PATCH /account/properties/:propertyId/edit */
  accountPropertyEdit: (propertyId: string) => `/account/properties/${propertyId}/edit`,
  fetchDashboardStats: "/account/dashboard",
  /** POST /account/agent/broadcast { subject, body } - email all subscribers */
  agentBroadcast: "/account/agent/broadcast",
  submitKyc: "/account/submitKyc",

  /** GET /account/marketplace/general-preferences — agent marketplace (main-site preferences, auth) */
  accountMarketplaceGeneralPreferences: "/account/marketplace/general-preferences",
  /** POST /account/marketplace/preferences/:preferenceId/match — auto-pair agent listings with preference */
  accountMarketplaceMatchPreference: (preferenceId: string) =>
    `/account/marketplace/preferences/${preferenceId}/match`,

  /**
   * Auth Endpoints (see docs/FRONTEND_API_GUIDE.md)
   */
  authLogin: "/auth/login",
  authRegister: "/auth/register",
  authGoogle: "/auth/googleAuth",
  authFacebook: "/auth/facebookAuth",
  authVerifyAccount: "/auth/verifyAccount",
  authResendVerificationToken: "/auth/resendVerificationToken",
  authResetPasswordRequest: "/auth/resetPasswordRequest",
  authVerifyPasswordResetCode: "/auth/verifyPasswordResetCode",
  authResetPassword: "/auth/resetPassword",
  /** @deprecated use authResendVerificationToken */
  authResendVerficationToken: "/auth/resendVerificationToken",
  authResendResetPasswordToken: "/auth/resendPasswordCode",
  authRequestResetPassword: "/auth/resetPasswordRequest",

  /**
   * Agent auth (used by agent login/register pages)
   */
  agent: "/agent",
  agentLogin: "/agent/auth/login",
  agentSignup: "/agent/auth/register",
  requestPasswordReset: "/auth/resetPasswordRequest",
  googleLogin: "/auth/googleAuth",
  googleSignup: "/auth/googleAuth",
  resetPassword: "/auth/resetPassword",
  verifyEmail: "/auth/verifyAccount",

  /**
   * Agent briefs / requests (used by overview, RquestsTable, etc.)
   */
  getAllRequests: "/requests",
  confirmAvailability: "/confirm-availability",

  /**
   * Agent briefs creation / fetch
   */
  agentCreateBrief: "/agent/briefs/create",
  agentfetchTotalBriefs: "/agent/briefs",
  landLordCreateBrief: "/landlord/briefs/create",
  buyersSearchBrief: "/briefs/search",
  buyersFetchBriefs: "/briefs",

  /**
   * Inspection slots
   */
  allAvailableSLots: "/inspections/slots",
  scheduleInspection: "/inspections/schedule",

  /**
   * Subscription Endpoints
   */
  subscriptionBaseUrl: "/subscriptions",
  getAgentSubscriptions: "/subscriptions/agent",
  createSubscription: "/subscriptions/create",
  renewSubscription: "/subscriptions/renew",
  cancelSubscription: "/subscriptions/cancel",
  getSubscriptionPlans: "/subscriptions/plans",
  getSubscriptionTransactions: "/account/transactions/fetchAll",

  /**
   * Agent Verification & Upgrade Endpoints
   */
  agentBaseUrl: "/agent",
  agentUpgrade: "/agent/upgrade",
  agentVerificationStatus: "/agent/verification-status",
  agentPublicProfile: "/agent/public-profile",
  updateAgentProfile: "/agent/profile",
  setInspectionFee: "/agent/inspection-fee",
  getAgentStats: "/agent/stats",

  /**
   * Features Catalog
   */
  featuresGetAll: "/features/getAll",

  /**
   * Third Party Verification Endpoints
   */
  thirdPartyVerificationBaseUrl: "/third-party",
  /** Public partner onboarding endpoint (no auth) */
  syndicationPlatformApplications: "/third-party/syndication/platform-applications",
  /** Account syndication: list approved platform blueprints */
  accountSyndicationPlatforms: "/account/syndication/platforms",
  /** Account syndication: create/list user's platform connections */
  accountSyndicationConnections: "/account/syndication/connections",
  /** Account syndication: enable/disable one connection */
  accountSyndicationToggleConnection: (connectionId: string) =>
    `/account/syndication/connections/${connectionId}/toggle`,
  verifyAccessCode: "/third-party/verifyAccessCode",
  getDocumentDetails: "/third-party/getDocumentDetails",
  submitReport: "/third-party/submit-report",

  /**
   * System Settings Endpoints
   */
  getSystemSettings: "/getSystemSettings",

  /**
   * KHABITEQ Market Place (see docs/FRONTEND_API_GUIDE.md §3)
   */
  lasreraMarketplaceProperties: "/lasrera-marketplace/properties",

  /**
   * Request To Market (Agents request; Publishers accept/reject) (guide §4)
   */
  requestToMarketCreate: "/account/request-to-market",
  requestToMarketList: "/account/request-to-market",
  requestToMarketRespond: (requestId: string) => `/account/request-to-market/${requestId}/respond`,
  requestToMarketRegisterSale: (requestId: string) => `/account/request-to-market/${requestId}/register-sale`,

  /**
   * Transaction registration (public/DealSite) (guide §5–6)
   */
  transactionRegistrationBase: "/transaction-registration",
  transactionRegistrationTypes: "/transaction-registration/types",
  transactionRegistrationGuidelines: "/transaction-registration/guidelines",
  transactionRegistrationSearch: "/transaction-registration/search",
  transactionRegistrationCheck: "/transaction-registration/check",
  transactionRegistrationEgisValidate: "/transaction-registration/egis-validate",
  transactionRegistrationRegister: "/transaction-registration/register",
  transactionRegistrationCertificateDownload: "/transaction-registration/certificate/download",

  /** Public file upload (documents, images, etc.) */
  uploadSingleFile: "/upload-single-file",

  /**
   * AI-assisted form filling (OpenAI) — see FRONTEND_API_GUIDE.md §10
   */
  /** POST /account/ai/suggest-property — Agent, Landlord, Developer; Bearer token */
  aiSuggestProperty: "/account/ai/suggest-property",
  /** POST /ai/suggest-preference — Public (no auth) */
  aiSuggestPreference: "/ai/suggest-preference",

  /**
   * Practitioner Page Endpoints
   */
  dealSiteDetails: "/account/dealSite/details",
  dealSiteSetup: "/account/dealSite/setUp",
  dealSiteUpdate: "/account/dealSite/update",
  dealSitePause: "/account/dealSite/:slug/pause",
  dealSiteResume: "/account/dealSite/:slug/resume",
  dealSiteDelete: "/account/dealSite/:slug/delete",
  dealSiteLogs: "/account/dealSite/:slug/logs",
  dealSiteSlugAvailability: "/account/dealSite/slugAvailability",
};
