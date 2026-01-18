/**
 * Branding & SEO Settings
 * Manage page title, description, keywords, and logo
 */

"use client";

import React, { useState, useCallback, useMemo } from "react";
import Cookies from "js-cookie";
import toast from "react-hot-toast";
import { Save, Trash2, ImageIcon, Settings } from "lucide-react";
import { useDealSite, FooterDetails } from "@/context/deal-site-context";
import { POST_REQUEST_FILE_UPLOAD } from "@/utils/requests";
import { URLS } from "@/utils/URLS";
import OverlayPreloader from "@/components/general-components/OverlayPreloader";

export default function BrandingPage() {
  const { settings, updateSettings } = useDealSite();
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [preloader, setPreloader] = useState({ visible: false, message: "" });

  const showPreloader = (message: string) => setPreloader({ visible: true, message });
  const hidePreloader = () => setPreloader({ visible: false, message: "" });

  const handleUploadLogo = useCallback(async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("for", "public-logo");
    const token = Cookies.get("token");

    setUploading(true);
    showPreloader("Uploading logo...");
    try {
      const res = await POST_REQUEST_FILE_UPLOAD<{ url: string }>(
        `${URLS.BASE}${URLS.uploadSingleImg}`,
        formData,
        token
      );
      hidePreloader();
      if (res?.success && res.data?.url) {
        updateSettings({ logoUrl: res.data.url });
        toast.success("Logo uploaded successfully");
      } else {
        toast.error(res?.message || "Upload failed");
      }
    } catch (error) {
      hidePreloader();
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  }, [updateSettings]);

  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      // Save logic will be implemented in the context
      toast.success("Settings saved successfully");
    } catch (error) {
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  }, []);

  const inputBase =
    "w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400 text-gray-900";

  return (
    <div className="space-y-8">
      <OverlayPreloader visible={preloader.visible} message={preloader.message} />

      <div>
        <h1 className="text-3xl font-bold text-[#09391C] flex items-center gap-3">
          <Settings size={32} />
          Branding & SEO
        </h1>
        <p className="text-gray-600 mt-2">
          Customize your page branding for SEO and visitor experience
        </p>
      </div>

      {/* Page Title */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Page Title
          </label>
          <p className="text-sm text-gray-600 mb-3">
            This appears in search results and browser tabs
          </p>
          <input
            type="text"
            value={settings.title}
            onChange={(e) => updateSettings({ title: e.target.value })}
            className={inputBase}
            placeholder="My Real Estate Business"
          />
        </div>

        {/* Keywords */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Keywords (comma separated)
          </label>
          <p className="text-sm text-gray-600 mb-3">
            Help search engines understand your page content
          </p>
          <input
            type="text"
            value={settings.keywords.join(", ")}
            onChange={(e) =>
              updateSettings({
                keywords: e.target.value
                  .split(",")
                  .map((k) => k.trim())
                  .filter(Boolean),
              })
            }
            className={inputBase}
            placeholder="real estate, agent, properties, listings"
          />
        </div>

        {/* Description */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Page Description
          </label>
          <p className="text-sm text-gray-600 mb-3">
            This appears in search results below your title
          </p>
          <textarea
            value={settings.description}
            onChange={(e) => updateSettings({ description: e.target.value })}
            rows={4}
            className={`${inputBase} resize-none`}
            placeholder="Tell visitors about your business, services, and why they should choose you..."
          />
          <p className="text-xs text-gray-500 mt-2">
            {settings.description.length}/160 characters (recommended)
          </p>
        </div>
      </div>

      {/* Logo */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <label className="block text-sm font-semibold text-gray-900 mb-4">
          Logo
        </label>

        {settings.logoUrl ? (
          <div className="flex items-center gap-4">
            <img
              src={settings.logoUrl}
              alt="Logo"
              className="h-20 w-20 rounded-lg border border-gray-200 object-contain bg-white p-2"
            />
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => updateSettings({ logoUrl: "" })}
                className="inline-flex items-center gap-2 px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-all"
              >
                <Trash2 size={16} />
                Remove
              </button>
              <label className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 cursor-pointer transition-all">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) =>
                    e.target.files && handleUploadLogo(e.target.files[0])
                  }
                  disabled={uploading}
                />
                Change
              </label>
            </div>
          </div>
        ) : (
          <label className="flex items-center justify-center gap-3 px-6 py-12 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 cursor-pointer hover:bg-gray-50 transition-all">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) =>
                e.target.files && handleUploadLogo(e.target.files[0])
              }
              disabled={uploading}
            />
            <ImageIcon size={20} />
            <span className="text-center">
              <p className="font-medium">Drag & drop or click to upload</p>
              <p className="text-xs text-gray-500 mt-1">PNG, JPG, SVG up to 5MB</p>
            </span>
          </label>
        )}
      </div>

      {/* Footer Details */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-[#09391C] mb-6 flex items-center gap-2">
          Footer Details
        </h2>

        <div className="space-y-6">
          {/* Short Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Short Description
            </label>
            <p className="text-sm text-gray-600 mb-3">
              A brief description that appears in the footer
            </p>
            <textarea
              value={settings.footer?.shortDescription || ""}
              onChange={(e) =>
                updateSettings({
                  footer: {
                    ...settings.footer,
                    shortDescription: e.target.value,
                  },
                })
              }
              rows={3}
              className={`${inputBase} resize-none`}
              placeholder="Share a brief overview of your business or mission..."
            />
          </div>

          {/* Copyright Text */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Copyright Text
            </label>
            <p className="text-sm text-gray-600 mb-3">
              Display in the footer (e.g., "© 2024 My Real Estate Business. All rights reserved.")
            </p>
            <input
              type="text"
              value={settings.footer?.copyrightText || ""}
              onChange={(e) =>
                updateSettings({
                  footer: {
                    ...settings.footer,
                    copyrightText: e.target.value,
                  },
                })
              }
              className={inputBase}
              placeholder="© 2024 Your Company Name. All rights reserved."
            />
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          <Save size={18} />
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
}
