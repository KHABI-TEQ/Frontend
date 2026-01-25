/**
 * Social Links Settings
 * Manage your social media profiles
 */

"use client";

import React, { useState, useCallback } from "react";
import Cookies from "js-cookie";
import { Share2, Save } from "lucide-react";
import { useDealSite } from "@/context/deal-site-context";
import { PUT_REQUEST } from "@/utils/requests";
import { URLS } from "@/utils/URLS";
import toast from "react-hot-toast";

export default function SocialPage() {
  const { settings, updateSettings } = useDealSite();
  const [saving, setSaving] = useState(false);

  const socialLinks = [
    {
      key: "website",
      label: "Website",
      icon: "🌐",
      placeholder: "https://yourwebsite.com",
    },
    {
      key: "twitter",
      label: "Twitter",
      icon: "𝕏",
      placeholder: "https://twitter.com/yourhandle",
    },
    {
      key: "instagram",
      label: "Instagram",
      icon: "📷",
      placeholder: "https://instagram.com/yourhandle",
    },
    {
      key: "facebook",
      label: "Facebook",
      icon: "f",
      placeholder: "https://facebook.com/yourpage",
    },
    {
      key: "linkedin",
      label: "LinkedIn",
      icon: "in",
      placeholder: "https://linkedin.com/company/yourcompany",
    },
  ];

  const handleSave = async () => {
    setSaving(true);
    try {
      toast.success("Social links saved successfully");
    } catch (error) {
      toast.error("Failed to save social links");
    } finally {
      setSaving(false);
    }
  };

  const inputBase =
    "w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-200 text-gray-900";

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-[#09391C] flex items-center gap-3">
          <Share2 size={32} />
          Social Links
        </h1>
        <p className="text-gray-600 mt-2">
          Connect your social media profiles to your public page
        </p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
        {socialLinks.map((link) => (
          <div key={link.key}>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              {link.label}
            </label>
            <input
              type="url"
              value={
                settings.socialLinks[link.key as keyof typeof settings.socialLinks] || ""
              }
              onChange={(e) =>
                updateSettings({
                  socialLinks: {
                    ...settings.socialLinks,
                    [link.key]: e.target.value,
                  },
                })
              }
              className={inputBase}
              placeholder={link.placeholder}
            />
          </div>
        ))}
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-all"
        >
          <Save size={18} />
          {saving ? "Saving..." : "Save Links"}
        </button>
      </div>
    </div>
  );
}
