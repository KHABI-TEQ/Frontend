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

  /**
   * Account endpoints
   */
  accountInspectionBaseUrl: "/account/my-inspections",
  /** POST /account/my-inspections/:inspectionId/respond { action: "accept" | "reject", note?: string } */
  accountInspectionRespond: (inspectionId: string) => `/account/my-inspections/${inspectionId}/respond`,
  accountBookingsBaseUrl: "/account/my-bookings",
  accountPropertyBaseUrl: "/account/properties", // Create, edit, delete, getOne
  fetchDashboardStats: "/account/dashboard",
  /** POST /account/agent/broadcast { subject, body } - email all subscribers */
  agentBroadcast: "/account/agent/broadcast",
  submitKyc: "/account/submitKyc",

  /**
   * Auth Endpoints
   */
  authLogin: "/auth/login",
  authRegister: "/auth/register",
  authGoogle: "/auth/googleAuth",
  authFacebook: "/auth/facebookAuth",
  authVerifyPasswordResetCode: "/auth/verifyPasswordResetCode",
  authResendResetPasswordToken: "/auth/resendPasswordCode",
  authRequestResetPassword: "/auth/resetPasswordRequest",
  authResendVerficationToken: "/auth/resendVerificationToken",
  authResetPassword: "/auth/resetPassword",
  authVerifyAccount: "/auth/verifyAccount",

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
  verifyAccessCode: "/third-party/verifyAccessCode",
  getDocumentDetails: "/third-party/getDocumentDetails",
  submitReport: "/third-party/submit-report",

  /**
   * System Settings Endpoints
   */
  getSystemSettings: "/getSystemSettings",

  /**
   * Deal Site / Public Access Page Endpoints
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
