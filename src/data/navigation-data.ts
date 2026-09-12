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
    name: "Compliance",
    url: "/document-verification",
    isClicked: false,
    subItems: [
      {
        name: "Document Verification",
        url: "/document-verification",
        isClicked: false,
      },
      {
        name: "Survey Services",
        url: "/survey-services",
        isClicked: false,
      },
      {
        name: "Licensed Professionals",
        url: "/licensed-agents",
        isClicked: false,
      },
      {
        name: "Transaction Registration",
        url: "/transaction-registration",
        isClicked: false,
      },
    ],
  },
  {
    name: "Who is it for?",
    url: "/user-types",
    isClicked: false,
    subItems: [
      { name: "Agents", url: "/for-agents", isClicked: false },
      { name: "Developers", url: "/for-developers", isClicked: false },
      { name: "Landlords", url: "/for-landlords", isClicked: false },
      { name: "Clients", url: "/for-clients", isClicked: false },
    ],
  },
  {
    name: "About us",
    url: "/about_us",
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
    name: "Document Verification",
    url: "/document-verification",
    isClicked: false,
  },
  {
    name: "Who's it for",
    url: "/user-types",
    isClicked: false,
  },
  {
    name: "Client",
    url: "/for-clients",
    isClicked: false,
  },
  {
    name: "Landlord",
    url: "/for-landlords",
    isClicked: false,
  },
  {
    name: "Agent",
    url: "/for-agents",
    isClicked: false,
  },
  {
    name: "Developer",
    url: "/for-developers",
    isClicked: false,
  },
  {
    name: "About us",
    url: "/about_us",
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
    name: "Off-Plan",
    url: "/preference?type=off-plan",
    isClicked: false,
  },
];
