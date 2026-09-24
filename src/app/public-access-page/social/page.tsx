/**
 * Social Links Settings
 * Manage your social media profiles
 */

"use client";

import React, { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { Share2, Save } from "lucide-react";
import { useDealSite } from "@/context/deal-site-context";
import { PUT_REQUEST } from "@/utils/requests";
import { URLS } from "@/utils/URLS";
import toast from "react-hot-toast";
import { goToNextPractitionerSetup } from "@/lib/practitioner-setup-flow";
import { useSetupFormDirty } from "@/hooks/useSetupFormDirty";
import { OptionalFieldsHint, OptionalMark, SetupSaveOrSkipButton } from "@/components/public-access-page/SetupSaveOrSkipButton";

export default function SocialPage() {
  const router = useRouter();
  const { settings, updateSettings } = useDealSite();
  const [saving, setSaving] = useState(false);
  const dirty = useSetupFormDirty(settings.socialLinks);

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

  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      const token = Cookies.get("token");
      const payload = settings.socialLinks;

      const res = await PUT_REQUEST(
        `${URLS.BASE}/account/dealSite/${settings.publicSlug}/socialLinks/update`,
        payload,
        token
      );

      if (res?.success) {
        toast.success("Social links saved successfully");
        goToNextPractitionerSetup(router, "/public-access-page/social");
        return;
      } else {
        toast.error(res?.message || "Failed to save social links");
      }
    } catch (error) {
      console.error("Failed to save social links:", error);
      toast.error("Failed to save social links");
    } finally {
      setSaving(false);
    }
  }, [settings.socialLinks, settings.publicSlug, router]);

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
          Connect your social media profiles to your practitioner page
        </p>
        <OptionalFieldsHint />
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
        {socialLinks.map((link) => (
          <div key={link.key}>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              {link.label}
              <OptionalMark />
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

      <div className="flex justify-end">
        <SetupSaveOrSkipButton
          dirty={dirty}
          saving={saving}
          onSave={() => void handleSave()}
          onSkip={() => goToNextPractitionerSetup(router, "/public-access-page/social")}
        />
      </div>
    </div>
  );
}
