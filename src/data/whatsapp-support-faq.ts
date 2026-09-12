export type SupportFaqAudience =
  | "all"
  | "agent"
  | "developer"
  | "landlord"
  | "field_agent"
  | "client"
  | "syndicating_partner";

/** Roles shown in the support widget — maps to `SupportFaqAudience` (except client label). */
export type SupportFaqRoleTab =
  | "agent"
  | "developer"
  | "landlord"
  | "client"
  | "syndicating_partner";

export type SupportFaqRoleTabConfig = {
  id: SupportFaqRoleTab;
  label: string;
  description: string;
  /** Full-width card on the role grid (e.g. Syndicating Partner). */
  fullWidth?: boolean;
  /** Tailwind classes for idle / active role cards (standard CSS via utility classes). */
  cardClass: string;
  cardActiveClass: string;
  /** Colored shadow on hover (pairs with widget hover lift animation). */
  cardHoverShadowClass: string;
  /** Soft pulse behind card on hover / when selected. */
  cardGlowClass: string;
  labelClass: string;
  descriptionClass: string;
};

export const SUPPORT_FAQ_ROLE_TABS: SupportFaqRoleTabConfig[] = [
  {
    id: "agent",
    label: "Agent",
    description: "Listings, marketplace, verification, subscriptions",
    cardClass:
      "border-sky-200/90 bg-gradient-to-br from-sky-100 via-sky-50 to-blue-200 text-sky-950 shadow-sm hover:border-sky-400 hover:from-sky-200 hover:via-sky-100 hover:to-blue-300",
    cardActiveClass:
      "border-sky-500 bg-gradient-to-br from-sky-200 via-sky-100 to-blue-300 ring-2 ring-sky-400/60 shadow-lg shadow-sky-200/50",
    cardHoverShadowClass: "hover:shadow-xl hover:shadow-sky-300/45",
    cardGlowClass: "bg-gradient-to-br from-sky-300/40 to-blue-400/25",
    labelClass: "text-sky-900",
    descriptionClass: "text-sky-700/90",
  },
  {
    id: "developer",
    label: "Developer",
    description: "Projects, inspections, agent requests",
    cardClass:
      "border-violet-200/90 bg-gradient-to-br from-violet-100 via-violet-50 to-purple-200 text-violet-950 shadow-sm hover:border-violet-400 hover:from-violet-200 hover:via-violet-100 hover:to-purple-300",
    cardActiveClass:
      "border-violet-500 bg-gradient-to-br from-violet-200 via-violet-100 to-purple-300 ring-2 ring-violet-400/60 shadow-lg shadow-violet-200/50",
    cardHoverShadowClass: "hover:shadow-xl hover:shadow-violet-300/45",
    cardGlowClass: "bg-gradient-to-br from-violet-300/40 to-purple-400/25",
    labelClass: "text-violet-900",
    descriptionClass: "text-violet-700/90",
  },
  {
    id: "landlord",
    label: "Landlord",
    description: "Listings, commissions, agent requests",
    cardClass:
      "border-amber-200/90 bg-gradient-to-br from-amber-100 via-amber-50 to-orange-200 text-amber-950 shadow-sm hover:border-amber-400 hover:from-amber-200 hover:via-amber-100 hover:to-orange-300",
    cardActiveClass:
      "border-amber-500 bg-gradient-to-br from-amber-200 via-amber-100 to-orange-300 ring-2 ring-amber-400/60 shadow-lg shadow-amber-200/50",
    cardHoverShadowClass: "hover:shadow-xl hover:shadow-amber-300/45",
    cardGlowClass: "bg-gradient-to-br from-amber-300/40 to-orange-400/25",
    labelClass: "text-amber-900",
    descriptionClass: "text-amber-800/90",
  },
  {
    id: "client",
    label: "Client / Buyer",
    description: "Preferences, inspections, buying or renting",
    cardClass:
      "border-teal-200/90 bg-gradient-to-br from-teal-100 via-teal-50 to-emerald-200 text-teal-950 shadow-sm hover:border-teal-400 hover:from-teal-200 hover:via-teal-100 hover:to-emerald-300",
    cardActiveClass:
      "border-teal-500 bg-gradient-to-br from-teal-200 via-teal-100 to-emerald-300 ring-2 ring-teal-400/60 shadow-lg shadow-teal-200/50",
    cardHoverShadowClass: "hover:shadow-xl hover:shadow-teal-300/45",
    cardGlowClass: "bg-gradient-to-br from-teal-300/40 to-emerald-400/25",
    labelClass: "text-teal-900",
    descriptionClass: "text-teal-700/90",
  },
  {
    id: "syndicating_partner",
    label: "Syndicating Partner",
    description: "Partner API, listing syndication, B2B onboarding",
    fullWidth: true,
    cardClass:
      "border-indigo-200/90 bg-gradient-to-br from-indigo-100 via-indigo-50 to-blue-200 text-indigo-950 shadow-sm hover:border-indigo-400 hover:from-indigo-200 hover:via-indigo-100 hover:to-blue-300",
    cardActiveClass:
      "border-indigo-500 bg-gradient-to-br from-indigo-200 via-indigo-100 to-blue-300 ring-2 ring-indigo-400/60 shadow-lg shadow-indigo-200/50",
    cardHoverShadowClass: "hover:shadow-xl hover:shadow-indigo-300/45",
    cardGlowClass: "bg-gradient-to-br from-indigo-300/40 to-blue-400/25",
    labelClass: "text-indigo-900",
    descriptionClass: "text-indigo-700/90",
  },
];

export type SupportFaqItem = {
  id: string;
  question: string;
  answer: string;
  audiences: SupportFaqAudience[];
  /** Pre-filled WhatsApp message when the user needs more help on this topic. */
  whatsappMessage: string;
};

export const WHATSAPP_SUPPORT_FAQ: SupportFaqItem[] = [
  {
    id: "what-is-khabi-teq",
    question: "What is Khabi-Teq?",
    answer:
      "Khabi-Teq is a property platform that connects people looking for homes or investments with verified agents, developers, and landlords. You can submit what you are looking for, browse listings, arrange inspections, and work through deals in one place.",
    audiences: ["all"],
    whatsappMessage: "Hi, I would like to learn more about Khabi-Teq services.",
  },
  {
    id: "create-account",
    question: "How do I create an account?",
    answer:
      "Select Get Started or Register, then choose whether you are a Landlord, Agent, or Developer. Verify your email and sign in. Landlords and developers can go straight to their dashboard. Agents should finish the agent setup steps in their account. Field Agents are added by our team—you cannot sign up as a Field Agent on your own.",
    audiences: ["landlord", "developer","agent"],
    whatsappMessage: "Hi, I need help creating or accessing my Khabi-Teq account.",
  },
  {
    id: "client-submit-preference",
    question: "How do I tell the platform what property I want (as a buyer or renter)?",
    answer:
      "Use Submit Your Property Preference from the website menu. Choose whether you want to buy, rent, shortlet, joint venture, or off-plan, then fill in location, budget, and property details. You do not need a professional account. After you submit, your request may be reviewed before agents can see it.",
    audiences: ["client"],
    whatsappMessage: "Hi, I need help submitting or updating my property preference on Khabi-Teq.",
  },
  {
    id: "client-preference-visibility",
    question: "When will agents see my submitted preference?",
    answer:
      "Your preference is checked automatically by the preference-listing matching engine to match your preference with relevant listings that matches your preference. You will get a notification immediately via submitted email either a match is found now or later. The system stores your preference in-memory to notifiy you anytime a match is found.",
    audiences: ["client"],
    whatsappMessage: "Hi, i didn't get a match notification for my preference. Please assist.",
  },
  {
    id: "client-inspection-negotiation",
    question: "How do property inspections and secure negotiation work?",
    answer:
      "Inspection dates and updates are usually sent by email or by your agent—follow the link in that message to continue or confirm your booking. For price or offer discussions, use only the secure links sent to you for your deal. Do not share personal banking details outside official platform messages.",
    audiences: ["client", "all"],
    whatsappMessage: "Hi, I need help with a property inspection or negotiation on Khabi-Teq.",
  },
  {
    id: "document-verification",
    question: "What is document verification on the platform?",
    answer:
      "Document verification lets you check property title and related documents through our verification service. This is separate from agent identity verification. Agents must complete their own verification before they can publish listings. If you paid for a verification service, follow the payment confirmation steps shown after checkout.",
    audiences: ["all"],
    whatsappMessage: "Hi, I need help with document or title verification on Khabi-Teq.",
  },
  {
    id: "agent-onboarding-kyc",
    question: "As an Agent, what must I complete before listing properties?",
    answer:
      "Verify your email, complete agent onboarding in your account, and finish agent identity verification. You cannot publish listings until verification is approved. Some features also need an active subscription plan—verification is required before you can subscribe.",
    audiences: ["agent"],
    whatsappMessage: "Hi, I am an Agent and need help with onboarding or verification on Khabi-Teq.",
  },
  {
    id: "agent-post-property",
    question: "How do I list a property for sale, rent, shortlet, JV or Off-Plan?",
    answer:
      "Open List Property from your dashboard or profile menu. Choose the listing type and property category, then complete the form or use the guided AI option. View, edit, or manage published and draft listings from My Listings.",
    audiences: ["agent"],
    whatsappMessage: "Hi, I am an Agent and need help posting or editing a property listing.",
  },
  {
    id: "agent-marketplace",
    question: "What is the Agent Marketplace?",
    answer:
      "The Agent Marketplace shows what buyers and renters are looking for. You can respond to those requests or list a property that matches a specific buyer need. This is different from Listing owner properties, where you ask permission to market someone else’s property.",
    audiences: ["agent"],
    whatsappMessage: "Hi, I am an Agent and need help using the Agent Marketplace or matching a brief.",
  },
  {
    id: "agent-lasrera-request",
    question: "Where will i see properties listed by Developers and Landlords to request-to-market?",
    answer:
      "You will get them from the Listing owner properties tab on your dashboard. You can request permission to market a listing on their behalf. Track your outgoing requests under My Request to Market. The listing owner approves or declines from their Agent Requests area.",
    audiences: ["agent"],
    whatsappMessage: "Hi, I am an Agent and need help with Lasrera or request-to-market.",
  },
  {
    id: "agent-subscription-payments",
    question: "Subscriptions, payments, and inspection access for Agents",
    answer:
      "Manage your plan from Subscription in your profile menu. After you pay online, complete any payment confirmation steps if you are prompted. Some features, such as certain inspection tools or broadcast messages, need an active subscription. Your payment history is available under Transactions.",
    audiences: ["agent"],
    whatsappMessage: "Hi, I am an Agent and need help with subscription or payment on Khabi-Teq.",
  },
  {
    id: "agent-syndication-dealsite",
    question: "Syndication and my practitioner (deal) site",
    answer:
      "Syndication lets you connect external listing systems to Khabi-Teq from your dashboard. Your practitioner or deal site is your branded public page where clients can find you, send enquiries, and book inspections according to your settings.",
    audiences: ["agent"],
    whatsappMessage: "Hi, I am an Agent and need help with syndication or my deal site on Khabi-Teq.",
  },
  {
    id: "landlord-listings",
    question: "As a Landlord, how do I list and manage properties?",
    answer:
      "Use List Property and My Listings from your dashboard. When posting for sale, rent, shortlet, or joint venture, you can set the agent commission offered (up to the limit shown on the form). Edit an existing listing anytime from My Listings.",
    audiences: ["landlord"],
    whatsappMessage: "Hi, I am a Landlord and need help listing or managing my properties.",
  },
  {
    id: "landlord-agent-requests",
    question: "How do I handle agent requests to market my property?",
    answer:
      "Open Agent Requests from your profile menu to see agents who want to market your property. You can accept or decline each request. If you accept, follow the next steps shown for payment or recording a sale, depending on the arrangement.",
    audiences: ["landlord"],
    whatsappMessage: "Hi, I am a Landlord and need help with agent requests to market my property.",
  },
  {
    id: "developer-listings-inspections",
    question: "How do I manage my projects, inspections, and agent requests as a developer?",
    answer:
      "Add and manage your projects from List Property and My Listings, including joint venture where offered. Review inspection requests from buyers, and add inspection representatives so the right contact handles viewings. Agent marketing requests appear under Agent Requests.",
    audiences: ["developer"],
    whatsappMessage: "Hi, I am a Developer and need help with listings or inspections on Khabi-Teq.",
  },
  {
    id: "developer-inspection-representative",
    question: "How do I register an inspection representative for a listed property?",
    answer:
      "Open Inspection representatives from your developer dashboard (or go to the inspection representatives page). Choose an approved listing, then add a representative with their name, email, and WhatsApp number. They receive inspection-related notifications for that property only. You can add, edit, or remove representatives per listing at any time.",
    audiences: ["developer"],
    whatsappMessage:
      "Hi, I am a Developer and need help registering an inspection representative for my listed property on Khabi-Teq.",
  },
  {
    id: "developer-subscription-syndication",
    question: "Why can’t I access developer features like syndication and listing actions?",
    answer:
      "Some developer actions need an active subscription and confirmed payment. Syndication connects your listings with partner systems from your dashboard. If developer registration is not available when you sign up, contact support—we can check your account type.",
    audiences: ["developer"],
    whatsappMessage: "Hi, I am a Developer and need help with subscription or syndication.",
  },
  {
    id: "field-agent-inspections",
    question: "As a Field Agent, what can I do on the platform?",
    answer:
      "Field Agents work on property inspections assigned to them. View your assigned visits from the dashboard, complete each inspection report, and update your profile in Account Settings. You cannot post properties or use the agent marketplace.",
    audiences: ["field_agent"],
    whatsappMessage: "Hi, I am a Field Agent and need help with assigned inspections on Khabi-Teq.",
  },
  {
    id: "developer-landlord-agent-request-to-market",
    question: "What is the Agent Request-to-market workflow?",
    answer:
      "When an agent requests to market your listed property, you’ll see the request in your dashboard. Review the agent’s profile, set a temporary commission fee of up to 5%, and approve agents you trust. Once approved, the property will automatically appear on their practitioner page and become available for inspection bookings.",
    audiences: ["landlord", "developer"],
    whatsappMessage: "Hi, I need help with the request-to-market workflow on Khabi-Teq.",
  },
  {
    id: "agent-request-to-market",
    question: "How does my Request-to-market property works",
    answer:
      "You can submit a marketing request for any listing from your dashboard. The Developer or Landlord will review it, set a temporary commission fee capped at 5%, and approve trusted agents. Once approved, the property will appear on your practitioner page and be open for inspection bookings",
    audiences: ["agent"],
    whatsappMessage: "Hi, As an Agent, I need help with the request-to-market workflow on Khabi-Teq.",
  },
  {
    id: "partner-who-is-syndicating-partner",
    question: "Who is a Syndicating Partner on Khabi-Teq?",
    answer:
      "Syndicating Partners are external listing platforms and property marketplaces that connect their catalogue to Khabi-Teq through our Partner API. This is separate from agents, developers, landlords, and buyers who use the main platform. If you run another property portal and want to syndicate listings into Khabi-Teq, this category applies to you.",
    audiences: ["syndicating_partner"],
    whatsappMessage: "Hi, I am a Syndicating Partner and would like to learn about Khabi-Teq partner syndication.",
  },
  {
    id: "partner-apply-onboarding",
    question: "How do I apply for partner syndication onboarding?",
    answer:
      "Go to Partner API from the website footer or homepage partner section and start partner onboarding. You will submit your company details and the website addresses for your listings and login page. Applications are reviewed by our team before integration is activated.",
    audiences: ["syndicating_partner"],
    whatsappMessage: "Hi, I need help applying for Khabi-Teq syndicating partner onboarding.",
  },
  {
    id: "partner-api",
    question: "Partner API and syndication integration",
    answer:
      "After approval, use the Partner API and integration guide to connect your property system to Khabi-Teq. You will need technical details for your listings feed and authentication. Step-by-step setup instructions are on the syndication integration guide page. Contact support if you need help during implementation.",
    audiences: ["syndicating_partner"],
    whatsappMessage: "Hi, I need help with the Khabi-Teq partner API or syndication integration.",
  },
  {
    id: "partner-integration-guide",
    question: "Where is the syndication integration guide?",
    answer:
      "Open the Syndication Integration Guide from the partner section of the website or go directly to the integration guide page linked from Partner API onboarding. It covers API credentials, listing formats, and how to keep your syndicated catalogue in sync with Khabi-Teq.",
    audiences: ["syndicating_partner"],
    whatsappMessage: "Hi, I am a Syndicating Partner and need help with the Khabi-Teq integration guide.",
  },
  // {
  //   id: "referrals-transactions",
  //   question: "Referrals and transaction history",
  //   answer:
  //     "Agents, developers, and landlords can use the Referral section from the profile menu to share the platform and track referrals. Payment and transaction records are listed under Transactions. Check Notifications for important updates about your account.",
  //   audiences: ["agent", "developer", "landlord"],
  //   whatsappMessage: "Hi, I need help with referrals or transactions on Khabi-Teq.",
  // },
  {
    id: "access-denied-usertype",
    question: "I see “access denied” or the wrong dashboard",
    answer:
      "Each account is set up as Agent, Landlord, Developer, or Field Agent. Sign out, then sign in again with the correct email. Avoid using the same browser for more than one account at a time. If you still see the wrong dashboard or cannot open a page, contact support with your registered email.",
    audiences: ["all"],
    whatsappMessage: "Hi, I am having access or wrong user role issues on Khabi-Teq. My email is: ",
  },
];

export function faqsForRole(role: SupportFaqRoleTab): SupportFaqItem[] {
  return WHATSAPP_SUPPORT_FAQ.filter(
    (item) => item.audiences.includes("all") || item.audiences.includes(role),
  );
}

export function partitionFaqsForRole(role: SupportFaqRoleTab): {
  general: SupportFaqItem[];
  forYou: SupportFaqItem[];
} {
  const filtered = faqsForRole(role);
  const general = filtered.filter(
    (item) => item.audiences.includes("all") && !item.audiences.includes(role),
  );
  const forYou = filtered.filter((item) => item.audiences.includes(role));
  return { general, forYou };
}
