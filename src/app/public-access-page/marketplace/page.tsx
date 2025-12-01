"use client";

import React, { useState, useCallback } from "react";
import Cookies from "js-cookie";
import toast from "react-hot-toast";
import { ShoppingCart, Save } from "lucide-react";
import { POST_REQUEST } from "@/utils/requests";
import { URLS } from "@/utils/URLS";
import { useDealSite } from "@/context/deal-site-context";
import OverlayPreloader from "@/components/general-components/OverlayPreloader";

export default function MarketplacePage() {
  const { settings, updateSettings } = useDealSite();
  const [preloader, setPreloader] = useState(false);
  const [formData, setFormData] = useState({
    defaultTab: settings.marketplaceDefaults?.defaultTab || "buy",
    defaultSort: settings.marketplaceDefaults?.defaultSort || "newest",
    showVerifiedOnly: settings.marketplaceDefaults?.showVerifiedOnly || false,
    enablePriceNegotiationButton:
      settings.marketplaceDefaults?.enablePriceNegotiationButton || false,
    listingsLimit: settings.listingsLimit || 12,
  });

  const handleInputChange = useCallback((field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  const handleSave = useCallback(async () => {
    setPreloader(true);
    try {
      const token = Cookies.get("token");
      const payload = {
        marketplaceDefaults: {
          defaultTab: formData.defaultTab,
          defaultSort: formData.defaultSort,
          showVerifiedOnly: formData.showVerifiedOnly,
          enablePriceNegotiationButton: formData.enablePriceNegotiationButton,
        },
        listingsLimit: formData.listingsLimit,
      };

      const res = await POST_REQUEST(
        `${URLS.BASE}${URLS.dealSiteUpdate}`,
        payload,
        token
      );

      if (res?.success) {
        updateSettings(payload as any);
        toast.success("Marketplace settings saved");
      } else {
        toast.error(res?.message || "Failed to save settings");
      }
    } catch (error) {
      toast.error("Failed to save marketplace settings");
    } finally {
      setPreloader(false);
    }
  }, [formData, updateSettings]);

  return (
    <div className="space-y-8">
      <OverlayPreloader visible={preloader} message="Saving..." />

      <div>
        <h1 className="text-3xl font-bold text-[#09391C] flex items-center gap-3">
          <ShoppingCart size={32} />
          Marketplace Settings
        </h1>
        <p className="text-gray-600 mt-2">Configure how listings are displayed to visitors</p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Default Category
            </label>
            <select
              value={formData.defaultTab}
              onChange={(e) => handleInputChange("defaultTab", e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-200"
            >
              <option value="buy">Buy</option>
              <option value="rent">Rent</option>
              <option value="shortlet">Shortlet</option>
              <option value="jv">Joint Venture</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Default Sort Order
            </label>
            <select
              value={formData.defaultSort}
              onChange={(e) => handleInputChange("defaultSort", e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-200"
            >
              <option value="newest">Newest First</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Featured Listings Limit
          </label>
          <input
            type="number"
            value={formData.listingsLimit}
            onChange={(e) => handleInputChange("listingsLimit", parseInt(e.target.value))}
            min="1"
            max="50"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-200"
          />
          <p className="text-xs text-gray-500 mt-1">Maximum number of featured listings to display</p>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="verified-only"
              checked={formData.showVerifiedOnly}
              onChange={(e) => handleInputChange("showVerifiedOnly", e.target.checked)}
              className="w-4 h-4 text-emerald-600 rounded"
            />
            <label htmlFor="verified-only" className="text-sm font-medium text-gray-700">
              Show verified listings only
            </label>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="enable-negotiation"
              checked={formData.enablePriceNegotiationButton}
              onChange={(e) => handleInputChange("enablePriceNegotiationButton", e.target.checked)}
              className="w-4 h-4 text-emerald-600 rounded"
            />
            <label htmlFor="enable-negotiation" className="text-sm font-medium text-gray-700">
              Enable price negotiation button
            </label>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <button
            onClick={handleSave}
            className="inline-flex items-center gap-2 px-6 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-all"
          >
            <Save size={18} />
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
