/** @format */

export interface NavigationItem {
  name: string;
  url: string;
  isClicked: boolean;
  subItems?: NavigationItem[];
}

export const mainNavigationData: NavigationItem[] = [
  { name: "Home", url: "/", isClicked: true },
  { name: "How It Works", url: "/how-it-works", isClicked: false },
  { name: "Find Property", url: "/preference", isClicked: false },
  { name: "Professionals", url: "/for-professionals", isClicked: false },
  { name: "Trust & Safety", url: "/trust-and-safety", isClicked: false },
  { name: "Pricing", url: "/pricing", isClicked: false },
  { name: "About", url: "/about_us", isClicked: false },
];

export const agentNavigationData: NavigationItem[] = mainNavigationData;

export const marketplaceDropdownData: NavigationItem[] = [
  { name: "Buy", url: "/preference?type=buy", isClicked: false },
  { name: "Rent", url: "/preference?type=rent", isClicked: false },
  { name: "Shortlet", url: "/preference?type=shortlet", isClicked: false },
  { name: "Joint Venture", url: "/preference?type=joint-venture", isClicked: false },
  { name: "Off-Plan", url: "/preference?type=off-plan", isClicked: false },
];
