"use client";

import React, { useState, useCallback } from "react";
import Cookies from "js-cookie";
import toast from "react-hot-toast";
import { BookOpen, Save } from "lucide-react";
import { POST_REQUEST } from "@/utils/requests";
import { URLS } from "@/utils/URLS";
import { useDealSite } from "@/context/deal-site-context";
import OverlayPreloader from "@/components/general-components/OverlayPreloader";

export default function AboutPage() {
  const { settings, updateSettings } = useDealSite();
  const [preloader, setPreloader] = useState(false);
  const [formData, setFormData] = useState({
    heroTitle: settings.about?.hero?.title || "",
    heroSubtitle: settings.about?.hero?.subTitle || "",
    heroDescription: settings.about?.hero?.description || "",
    identityHeadline: settings.about?.identity?.headline || "",
    identityContent: settings.about?.identity?.content || "",
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
        about: {
          ...settings.about,
          hero: {
            ...settings.about?.hero,
            title: formData.heroTitle,
            subTitle: formData.heroSubtitle,
            description: formData.heroDescription,
          },
          identity: {
            ...settings.about?.identity,
            headline: formData.identityHeadline,
            content: formData.identityContent,
          },
        },
      };

      const res = await POST_REQUEST(
        `${URLS.BASE}${URLS.dealSiteUpdate}`,
        payload,
        token
      );

      if (res?.success) {
        updateSettings(payload as any);
        toast.success("About Us page updated");
      } else {
        toast.error(res?.message || "Failed to save settings");
      }
    } catch (error) {
      toast.error("Failed to save about page");
    } finally {
      setPreloader(false);
    }
  }, [formData, settings, updateSettings]);

  return (
    <div className="space-y-8">
      <OverlayPreloader visible={preloader} message="Saving..." />

      <div>
        <h1 className="text-3xl font-bold text-[#09391C] flex items-center gap-3">
          <BookOpen size={32} />
          About Us
        </h1>
        <p className="text-gray-600 mt-2">Tell your story to potential clients</p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-[#09391C] mb-4">Hero Section</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title
              </label>
              <input
                type="text"
                value={formData.heroTitle}
                onChange={(e) => handleInputChange("heroTitle", e.target.value)}
                placeholder="About Our Real Estate Business"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-200"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subtitle
              </label>
              <input
                type="text"
                value={formData.heroSubtitle}
                onChange={(e) => handleInputChange("heroSubtitle", e.target.value)}
                placeholder="We're dedicated to helping you find the perfect property"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-200"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.heroDescription}
                onChange={(e) => handleInputChange("heroDescription", e.target.value)}
                placeholder="Describe your business, experience, and what makes you unique..."
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-200"
              />
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-6">
          <h2 className="text-lg font-semibold text-[#09391C] mb-4">Company Identity</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Headline
              </label>
              <input
                type="text"
                value={formData.identityHeadline}
                onChange={(e) => handleInputChange("identityHeadline", e.target.value)}
                placeholder="Who We Are"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-200"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Content
              </label>
              <textarea
                value={formData.identityContent}
                onChange={(e) => handleInputChange("identityContent", e.target.value)}
                placeholder="Share your company's mission, values, and history..."
                rows={6}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-200"
              />
            </div>
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
