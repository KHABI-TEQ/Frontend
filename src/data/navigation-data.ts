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
    name: "Client",
    url: "/preference",
    isClicked: false,
    subItems: [
      {
        name: "Buy",
        url: "/preference?type=buy",
        isClicked: false,
      },
      {
        name: "Rent",
        url: "/preference?type=rent",
        isClicked: false,
      },
      {
        name: "Shortlet",
        url: "/preference?type=shortlet",
        isClicked: false,
      },
      {
        name: "Joint Venture",
        url: "/preference?type=joint-venture",
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
        name: "Sell",
        url: "/my-listings",
        isClicked: false,
      },
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
    name: "Client",
    url: "/preference",
    isClicked: false,
    subItems: [
      {
        name: "Buy a property",
        url: "/preference?type=buy",
        isClicked: false,
      },
      {
        name: "Rent a property",
        url: "/preference?type=rent",
        isClicked: false,
      },
      {
        name: "Shortlet",
        url: "/preference?type=shortlet",
        isClicked: false,
      },
      {
        name: "Joint Venture",
        url: "/preference?type=joint-venture",
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
        name: "Sell",
        url: "/my-listings",
        isClicked: false,
      },
      {
        name: "Agent Market Place",
        url: "/agent-marketplace",
        isClicked: false,
      },
      {
        name: "Publisher Properties (Request to Market)",
        url: "/lasrera-marketplace",
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
    url: "/preference?type=buy",
    isClicked: false,
  },
  {
    name: "Rent",
    url: "/preference?type=rent",
    isClicked: false,
  },
  {
    name: "Shortlet",
    url: "/preference?type=shortlet",
    isClicked: false,
  },
  {
    name: "Joint Venture",
    url: "/preference?type=joint-venture",
    isClicked: false,
  },
  {
    name: "Verify Documents",
    url: "/document-verification",
    isClicked: false,
  },
];
