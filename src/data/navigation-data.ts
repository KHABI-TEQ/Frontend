/** @format */

export interface NavigationItem {
  name: string;
  url: string;
  isClicked: boolean;
  subItems?: NavigationItem[];
} 

export const mainNavigationData: NavigationItem[] = [
  {
    name: "Home",
    url: "/",
    isClicked: true,
  },
  {
    name: "Marketplace",
    url: "/market-place",
    isClicked: false,
    subItems: [
      {
        name: "Buy",
        url: "/market-place?tab=buy",
        isClicked: false,
      },
      {
        name: "Sell",
        url: "/my-listings",
        isClicked: false,
      },
      {
        name: "Rent",
        url: "/market-place?tab=rent",
        isClicked: false,
      },
      {
        name: "Shortlet",
        url: "/market-place?tab=shortlet",
        isClicked: false,
      },
      {
        name: "Joint Venture",
        url: "/market-place?tab=jv",
        isClicked: false,
      },
      {
        name: "Verify Documents",
        url: "/document-verification",
        isClicked: false,
      },
    ],
  },
  {
    name: "Landlord",
    url: "/landlord",
    isClicked: false,
  },
  {
    name: "Agent",
    url: "/agent",
    isClicked: false,
    subItems: [
      {
        name: "Agent Market Place",
        url: "/agent-marketplace",
        isClicked: false,
      },
    ],
  },
  {
    name: "Policies",
    url: "/policies_page",
    isClicked: false,
  },
  {
    name: "About us",
    url: "/about_us",
    isClicked: false,
  },
  {
    name: "Contact Us",
    url: "/contact-us",
    isClicked: false,
  },
];

export const agentNavigationData: NavigationItem[] = [
  {
    name: "Home",
    url: "/",
    isClicked: true,
  },
  {
    name: "Marketplace",
    url: "/market-place",
    isClicked: false,
    subItems: [
      {
        name: "list a property",
        url: "/my-listings",
        isClicked: false,
      },
      {
        name: "Buy a property",
        url: "/market-place?tab=buy",
        isClicked: false,
      },
      {
        name: "Rent a property",
        url: "/market-place?tab=rent",
        isClicked: false,
      },
      {
        name: "Shortlet",
        url: "/market-place?tab=shortlet",
        isClicked: false,
      },
      {
        name: "Joint Venture",
        url: "/market-place?tab=jv",
        isClicked: false,
      },
      {
        name: "Verify Documents",
        url: "/document-verification",
        isClicked: false,
      },
    ],
  },
  {
    name: "Landlord",
    url: "/dashboard",
    isClicked: false,
  },
  {
    name: "Agent",
    url: "/dashboard",
    isClicked: false,
    subItems: [
      {
        name: "Agent Market Place",
        url: "/agent-marketplace",
        isClicked: false,
      },
    ],
  },
  {
    name: "Policies",
    url: "/policies_page",
    isClicked: false,
  },
  {
    name: "About us",
    url: "/about_us",
    isClicked: false,
  },
  {
    name: "Contact Us",
    url: "/contact-us",
    isClicked: false,
  },
];

// Marketplace dropdown data (used in both headers)
export const marketplaceDropdownData: NavigationItem[] = [
  {
    name: "Buy",
    url: "/market-place?tab=buy",
    isClicked: false,
  },
  {
    name: "Sell",
    url: "/my-listings",
    isClicked: false,
  },
  {
    name: "Rent",
    url: "/market-place?tab=rent",
    isClicked: false,
  },
  {
    name: "Shortlet",
    url: "/market-place?tab=shortlet",
    isClicked: false,
  },
  {
    name: "Joint Venture",
    url: "/market-place?tab=jv",
    isClicked: false,
  },
  {
    name: "Verify Documents",
    url: "/document-verification",
    isClicked: false,
  },
];
