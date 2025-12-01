"use client";

import React, { useState, useCallback } from "react";
import Cookies from "js-cookie";
import toast from "react-hot-toast";
import { Home, Save } from "lucide-react";
import { POST_REQUEST } from "@/utils/requests";
import { URLS } from "@/utils/URLS";
import { useDealSite } from "@/context/deal-site-context";
import OverlayPreloader from "@/components/general-components/OverlayPreloader";

export default function HomeSettingsPage() {
  const { settings, updateSettings } = useDealSite();
  const [preloader, setPreloader] = useState(false);
  const [formData, setFormData] = useState({
    heroTitle: settings.publicPageDesign?.heroTitle || "",
    heroSubtitle: settings.publicPageDesign?.heroSubtitle || "",
    ctaText: settings.publicPageDesign?.ctaText || "",
    ctaLink: settings.publicPageDesign?.ctaLink || "",
  });

  const handleInputChange = useCallback((field: string, value: string) => {
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
        publicPageDesign: {
          ...settings.publicPageDesign,
          ...formData,
        },
      };

      const res = await POST_REQUEST(
        `${URLS.BASE}/account/dealSite/update`,
        payload,
        token
      );

      if (res?.success) {
        updateSettings(payload as any);
        toast.success("Home settings saved successfully");
      } else {
        toast.error(res?.message || "Failed to save settings");
      }
    } catch (error) {
      toast.error("Failed to save home settings");
    } finally {
      setPreloader(false);
    }
  }, [formData, settings, updateSettings]);

  return (
    <div className="space-y-8">
      <OverlayPreloader visible={preloader} message="Saving..." />

      <div>
        <h1 className="text-3xl font-bold text-[#09391C] flex items-center gap-3">
          <Home size={32} />
          Home Settings
        </h1>
        <p className="text-gray-600 mt-2">Customize your homepage appearance</p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Hero Title
          </label>
          <input
            type="text"
            value={formData.heroTitle}
            onChange={(e) => handleInputChange("heroTitle", e.target.value)}
            placeholder="Welcome to my real estate business"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-200"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Hero Subtitle
          </label>
          <textarea
            value={formData.heroSubtitle}
            onChange={(e) => handleInputChange("heroSubtitle", e.target.value)}
            placeholder="Describe your main value proposition..."
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-200"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              CTA Button Text
            </label>
            <input
              type="text"
              value={formData.ctaText}
              onChange={(e) => handleInputChange("ctaText", e.target.value)}
              placeholder="Browse Listings"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-200"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              CTA Link
            </label>
            <input
              type="text"
              value={formData.ctaLink}
              onChange={(e) => handleInputChange("ctaLink", e.target.value)}
              placeholder="/marketplace"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-200"
            />
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
