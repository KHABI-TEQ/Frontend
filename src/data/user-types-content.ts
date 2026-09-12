/** @format */

export type UserTypeId =
  | 'landlords'
  | 'developers'
  | 'ownersDevelopers'
  | 'agents'
  | 'buyers'
  | 'lawyers'
  | 'surveyors';

/** Shared buyer value prop — LASRERA certificate after transaction registration. */
export const BUYER_LASRERA_CERTIFICATE_BULLET =
  'Register your transaction and receive a LASRERA-issued certificate to protect your payment';

export const USER_TYPE_BULLETS: Record<UserTypeId, string[]> = {
  landlords: [
    'List one or multiple properties for free',
    'Receive marketing requests from verified agents',
    'Choose the agents you want to work with',
    'Your contact details remain private until you approve an agent',
    'Sell or rent faster with complete control',
  ],
  developers: [
    'Publish developments with a dedicated project page',
    'Set your commission payout percentage',
    'Let multiple verified agents request to market your project',
    'Reach more qualified buyers and sell faster',
  ],
  agents: [
    'Get your own Practitioner Page with a personalized URL',
    'Request to market landlord and developer listings',
    'Earn the commissions they offer when you close deals',
    'Listings automatically matched to buyer preferences',
    'Help qualified buyers discover your properties without extra effort',
  ],
  buyers: [
    'Submit your preference and let our system search verified agent Practitioner Pages',
    'Receive tailored property briefs matched to your needs',
    'Book inspections through the platform',
    BUYER_LASRERA_CERTIFICATE_BULLET,
    'Rate or report agents after your experience for transparency and accountability',
  ],
  ownersDevelopers: [
    'List properties or developments for sale, rent, shortlet or joint venture',
    'Let verified agents request to market your opportunity — you decide',
    'Keep contact details private until you approve a professional',
    'Set commission and track inquiries from one place',
    'Reach structured buyer demand already submitted on Khabiteq',
  ],
  lawyers: [
    'Join the document verification marketplace after KYC approval',
    'Set a clear verification fee within platform bounds',
    'Accept or decline incoming title-review jobs',
    'Submit reports and receive payouts through your settlement account',
    'Publish a professional page so clients can find and hire you',
  ],
  surveyors: [
    'Offer plan verification and site survey services',
    'Appear on the surveyor marketplace after KYC approval',
    'Accept requests, complete reports and get paid through Khabiteq',
    'Connect a payout account before going live',
    'Build a public professional page for your practice',
  ],
};
