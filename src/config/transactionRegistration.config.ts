/**
 * Transaction registration copy and guidelines for the main website portal.
 * Display-only — fee amounts at checkout come from the register API response.
 */

export interface SafeTransactionGuidelines {
  title: string;
  introduction: string;
  sections: {
    heading: string;
    content: string[];
  }[];
}

export const SAFE_TRANSACTION_GUIDELINES: SafeTransactionGuidelines = {
  title: "Safe Transaction Guidelines",
  introduction:
    "As the buyer or tenant, review these requirements before you register your transaction with KHABITEQ. Registration is your responsibility — your agent may help with due diligence, but you submit the registration yourself.",
  sections: [
    {
      heading: "Required Documentation Checklist",
      content: [
        "Your valid ID (e.g. NIN, international passport, or driver's licence).",
        "A receipt or proof of payment for the transaction value you paid to the seller or landlord.",
      ],
    },
    {
      heading: "Ownership Verification Standards",
      content: [
        "Ask the seller or landlord for proof they own the property or have authority to sell or let.",
        "For completed property, request a Certificate of Occupancy or registered title and check the name matches.",
        "For off-plan purchases, confirm the developer's title and project approvals before you commit.",
      ],
    },
    {
      heading: "Title Verification Recommendations",
      content: [
        "Use Check property status on this page, or search the land registry, before you commit.",
        "Confirm there are no active registrations, encumbrances, liens, or disputes on the property.",
        "Verify the person you are dealing with is the registered owner or has written authority to act for them.",
      ],
    },
    {
      heading: "Dispute Resolution Procedures",
      content: [
        "If a dispute arises after you register, you may seek help through KHABITEQ support channels for mediation.",
        "Your registered transaction can be referred to KHABITEQ for dispute resolution support.",
        "Legal action remains available if mediation does not resolve the matter.",
      ],
    },
    {
      heading: "Mandatory Data Disclosure Requirements",
      content: [
        "You must provide the property address and/or GPS coordinates as required for the property type.",
        "You must declare the transaction type, value, and your contact details for the registry.",
        "You must upload a proof of payment for the transaction value you paid to the seller or landlord.",
        "You must upload your valid ID.",
        "By submitting registration, you confirm the information you provide is true and complete.",
      ],
    },
  ],
};

export type TransactionGuidelinesContent = {
  requiredDocumentation: string[];
  ownershipVerification: string[];
  titleVerification: string[];
  disputeResolution: string[];
  mandatoryDataDisclosure: string[];
};

const SECTION_KEYS: Record<string, keyof TransactionGuidelinesContent> = {
  "Required Documentation Checklist": "requiredDocumentation",
  "Ownership Verification Standards": "ownershipVerification",
  "Title Verification Recommendations": "titleVerification",
  "Dispute Resolution Procedures": "disputeResolution",
  "Mandatory Data Disclosure Requirements": "mandatoryDataDisclosure",
};

export const TRANSACTION_GUIDELINES: TransactionGuidelinesContent = SAFE_TRANSACTION_GUIDELINES.sections.reduce(
  (acc, section) => {
    const key = SECTION_KEYS[section.heading];
    if (key) acc[key] = section.content;
    return acc;
  },
  {} as TransactionGuidelinesContent
);

export type KhabiteqGuidelineAccent = "violet" | "teal" | "indigo" | "amber" | "sky";

export type KhabiteqGuidelineBlock = {
  key: keyof TransactionGuidelinesContent;
  title: string;
  intro: string;
  accent: KhabiteqGuidelineAccent;
  defaultOpen?: boolean;
  items: string[];
};

export const KHABITEQ_GUIDELINE_BLOCKS: KhabiteqGuidelineBlock[] = [
  {
    key: "requiredDocumentation",
    title: "Documents to prepare",
    intro: "Gather these before you open the registration form.",
    accent: "violet",
    defaultOpen: true,
    items: TRANSACTION_GUIDELINES.requiredDocumentation,
  },
  {
    key: "ownershipVerification",
    title: "Verify the seller or landlord",
    intro: "Confirm the other party has the right to sell or let the property.",
    accent: "teal",
    items: TRANSACTION_GUIDELINES.ownershipVerification,
  },
  {
    key: "titleVerification",
    title: "Check the property title",
    intro: "Do your due diligence before you commit your money.",
    accent: "indigo",
    items: TRANSACTION_GUIDELINES.titleVerification,
  },
  {
    key: "disputeResolution",
    title: "If something goes wrong",
    intro: "How disputes may be handled after you register.",
    accent: "amber",
    items: TRANSACTION_GUIDELINES.disputeResolution,
  },
  {
    key: "mandatoryDataDisclosure",
    title: "What you must declare",
    intro: "Information you provide when you submit registration.",
    accent: "sky",
    items: TRANSACTION_GUIDELINES.mandatoryDataDisclosure,
  },
];
