/** Inventory for spoken preference intent resolution. */
export const PREFERENCE_INTENT_INVENTORY = {
  buy: ["buy", "purchase", "to buy", "bye", "by", "bai"],
  rent: ["rent", "to rent", "rental", "tenant", "went", "rend"],
  shortlet: ["shortlet", "short let", "short stay", "shortlate", "short lit"],
  "joint-venture": ["joint venture", "joint-venture", "jv", "jay vee", "jayvee"],
} as const;

export type PreferenceIntentKey = keyof typeof PREFERENCE_INTENT_INVENTORY;
