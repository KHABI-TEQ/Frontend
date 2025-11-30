export interface Promotion {
  id: string;
  slot: string;
  imageUrl: string;
  link?: string;
  active?: boolean;
  pages?: string[]; // optional list of pathnames where this promo applies
  weight?: number;
}

// Default set of promotions. This can be replaced by a remote fetch or CMS integration later.
export const PROMOTIONS: Promotion[] = [
  {
    id: 'promo-top-1',
    slot: 'top-header',
    imageUrl: '/placeholder-property.svg',
    link: '/market-place',
    active: true,
    pages: ['/', '/market-place'],
    weight: 10,
  },
  {
    id: 'promo-home-1',
    slot: 'homepage-top',
    imageUrl: '/khabi-teq.svg',
    link: '/preference',
    active: true,
    pages: ['/'],
    weight: 8,
  },
  {
    id: 'promo-home-inline-1',
    slot: 'homepage-inline',
    imageUrl: '/check.svg',
    link: '/contact-us',
    active: true,
    pages: ['/'],
    weight: 5,
  },
  {
    id: 'promo-market-1',
    slot: 'marketplace-top',
    imageUrl: '/vercel.svg',
    link: '/market-place?tab=buy',
    active: true,
    pages: ['/market-place'],
    weight: 9,
  },
];
