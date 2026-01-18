"use client";

import React, { useState, useCallback } from "react";
import Cookies from "js-cookie";
import toast from "react-hot-toast";
import { Home, Save, ImageIcon, Trash2 } from "lucide-react";
import { POST_REQUEST, POST_REQUEST_FILE_UPLOAD } from "@/utils/requests";
import { URLS } from "@/utils/URLS";
import { useDealSite } from "@/context/deal-site-context";
import OverlayPreloader from "@/components/general-components/OverlayPreloader";

export default function HomePageSettings() {
  const { settings, updateSettings } = useDealSite();
  const [preloader, setPreloader] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    heroTitle: settings.publicPage?.heroTitle || "",
    heroSubtitle: settings.publicPage?.heroSubtitle || "",
    heroImage: settings.publicPage?.heroImage || "",
    ctaText: settings.publicPage?.ctaText || "",
    ctaLink: settings.publicPage?.ctaLink || "",
  });

  const handleInputChange = useCallback((field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  const handleUploadHeroImage = useCallback(async (file: File) => {
    const formDataUpload = new FormData();
    formDataUpload.append("file", file);
    formDataUpload.append("for", "public-hero-image");
    const token = Cookies.get("token");

    setUploading(true);
    setPreloader(true);
    try {
      const res = await POST_REQUEST_FILE_UPLOAD<{ url: string }>(
        `${URLS.BASE}${URLS.uploadSingleImg}`,
        formDataUpload,
        token
      );
      if (res?.success && res.data?.url) {
        setFormData((prev) => ({
          ...prev,
          heroImage: res.data.url,
        }));
        toast.success("Hero image uploaded successfully");
      } else {
        toast.error(res?.message || "Upload failed");
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload hero image");
    } finally {
      setUploading(false);
      setPreloader(false);
    }
  }, []);

  const handleRemoveHeroImage = useCallback(() => {
    setFormData((prev) => ({
      ...prev,
      heroImage: "",
    }));
    toast.success("Hero image removed");
  }, []);

  const handleSave = useCallback(async () => {
    setPreloader(true);
    try {
      const token = Cookies.get("token");
      const payload = {
        publicPage: {
          ...settings.publicPage,
          ...formData,
        },
      };

      const res = await POST_REQUEST(
        `${URLS.BASE}${URLS.dealSiteUpdate}`,
        payload,
        token
      );

      if (res?.success) {
        updateSettings(payload as any);
        toast.success("Home page settings saved successfully");
      } else {
        toast.error(res?.message || "Failed to save settings");
      }
    } catch (error) {
      toast.error("Failed to save home page settings");
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
          Home Page
        </h1>
        <p className="text-gray-600 mt-2">Customize your homepage appearance and hero section</p>
      </div>

      {/* Hero Image Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-[#09391C] mb-4">Hero Image</h2>
          <p className="text-sm text-gray-600 mb-4">Upload an image to display in your hero section</p>

          {formData.heroImage ? (
            <div className="space-y-4">
              <div className="relative w-full">
                <img
                  src={formData.heroImage}
                  alt="Hero"
                  className="w-full h-64 object-cover rounded-lg border border-gray-200"
                />
              </div>
              <button
                type="button"
                onClick={handleRemoveHeroImage}
                disabled={uploading}
                className="flex items-center gap-2 px-4 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Trash2 size={16} />
                Remove Hero Image
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <ImageIcon size={40} className="text-gray-400 mb-2" />
                <p className="text-sm text-gray-700 font-medium">Click to upload hero image</p>
                <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    handleUploadHeroImage(file);
                  }
                }}
                disabled={uploading}
                className="hidden"
              />
            </label>
          )}
        </div>
      </div>

      {/* Hero Text Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-[#09391C] mb-4">Hero Text</h2>

          <div className="space-y-6">
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
                  placeholder="/market-place"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-200"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <button
            onClick={handleSave}
            disabled={uploading}
            className="inline-flex items-center gap-2 px-6 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <Save size={18} />
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
