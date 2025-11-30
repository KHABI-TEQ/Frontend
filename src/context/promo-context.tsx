"use client";

"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { PROMOTIONS, Promotion } from "@/data/promotions";
import { usePathname } from "next/navigation";
import { fetchActivePromotions, PromotionType } from "@/services/promotionService";

type PromoContextValue = {
  promos: Promotion[];
  getPromos: (slot: string) => Promotion[];
  setPromos: (items: Promotion[]) => void;
};

const PromoContext = createContext<PromoContextValue | null>(null);

const SLOT_TO_TYPE: Record<string, PromotionType> = {
  "top-header": "banner",
  "homepage-top": "banner",
  "marketplace-top": "banner",
  "homepage-inline": "inline",
};

export const PromoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [promos, setPromos] = useState<Promotion[]>([]);
  const pathname = usePathname();

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        // Group slots by type to minimize API calls
        const typeToSlots = Object.entries(SLOT_TO_TYPE).reduce<Record<PromotionType, string[]>>((acc, [slot, type]) => {
          (acc[type] ||= []).push(slot);
          return acc;
        }, {} as Record<PromotionType, string[]>);

        const results: Promotion[] = [];
        for (const [type, slots] of Object.entries(typeToSlots) as [PromotionType, string[]][]) {
          const apiItems = await fetchActivePromotions(type, 10);
          for (const slot of slots) {
            for (const it of apiItems) {
              results.push({
                id: it._id,
                slot,
                imageUrl: it.imageUrl,
                link: it.redirectUrl,
                active: true,
                weight: it.isFeatured ? 100 : 0,
              });
            }
          }
        }
        if (!cancelled) {
          setPromos(results.length > 0 ? results : PROMOTIONS);
        }
      } catch {
        if (!cancelled) setPromos(PROMOTIONS);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
    // re-evaluate when route changes (e.g., to support page-specific filters later)
  }, [pathname]);

  const getPromos = (slot: string) => {
    const p = promos
      .filter((pr) => pr.active !== false && pr.slot === slot)
      .sort((a, b) => (b.weight || 0) - (a.weight || 0));
    return p;
  };

  return <PromoContext.Provider value={{ promos, getPromos, setPromos }}>{children}</PromoContext.Provider>;
};

export const usePromos = () => {
  const ctx = useContext(PromoContext);
  if (!ctx) throw new Error("usePromos must be used within a PromoProvider");
  return ctx;
};
