/**
 * Theme Settings
 * Customize colors for the practitioner page
 */

"use client";

import React from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import toast from "react-hot-toast";
import { Palette } from "lucide-react";
import { useDealSite } from "@/context/deal-site-context";
import { PUT_REQUEST } from "@/utils/requests";
import { URLS } from "@/utils/URLS";
import { goToNextPractitionerSetup } from "@/lib/practitioner-setup-flow";
import { useSetupFormDirty } from "@/hooks/useSetupFormDirty";
import { OptionalFieldsHint, OptionalMark, SetupSaveOrSkipButton } from "@/components/public-access-page/SetupSaveOrSkipButton";

export default function ThemePage() {
  const router = useRouter();
  const { settings, updateSettings, publicSlug } = useDealSite();
  const [saving, setSaving] = React.useState(false);
  const dirty = useSetupFormDirty(settings.theme);

  const COLOR_PALETTE = [
    "#09391C",
    "#4BA678",
    "#8DDB90",
    "#0B572B",
    "#065F46",
    "#FFFFFF",
    "#000000",
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-[#09391C] flex items-center gap-3">
          <Palette size={32} />
          Theme & Colors
        </h1>
        <OptionalFieldsHint />
        <p className="text-gray-600 mt-2">
          Customize your page colors to match your brand
        </p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-8">
        {/* Primary Color */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-4">
            Primary Color
            <OptionalMark />
          </label>
          <div className="flex items-center gap-4">
            <input
              type="color"
              value={settings.theme.primaryColor}
              onChange={(e) =>
                updateSettings({
                  theme: {
                    ...settings.theme,
                    primaryColor: e.target.value,
                  },
                })
              }
              className="h-20 w-20 border border-gray-300 rounded-lg cursor-pointer"
            />
            <div>
              <p className="text-lg font-mono text-gray-900">
                {settings.theme.primaryColor}
              </p>
              <div className="flex gap-2 mt-3 flex-wrap">
                {COLOR_PALETTE.map((color) => (
                  <button
                    key={color}
                    onClick={() =>
                      updateSettings({
                        theme: {
                          ...settings.theme,
                          primaryColor: color,
                        },
                      })
                    }
                    className="w-10 h-10 rounded-lg border-2 border-gray-300 hover:border-gray-500 transition-all"
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Secondary Color */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-4">
            Secondary Color
            <OptionalMark />
          </label>
          <div className="flex items-center gap-4">
            <input
              type="color"
              value={settings.theme.secondaryColor}
              onChange={(e) =>
                updateSettings({
                  theme: {
                    ...settings.theme,
                    secondaryColor: e.target.value,
                  },
                })
              }
              className="h-20 w-20 border border-gray-300 rounded-lg cursor-pointer"
            />
            <div>
              <p className="text-lg font-mono text-gray-900">
                {settings.theme.secondaryColor}
              </p>
              <div className="flex gap-2 mt-3 flex-wrap">
                {COLOR_PALETTE.map((color) => (
                  <button
                    key={color}
                    onClick={() =>
                      updateSettings({
                        theme: {
                          ...settings.theme,
                          secondaryColor: color,
                        },
                      })
                    }
                    className="w-10 h-10 rounded-lg border-2 border-gray-300 hover:border-gray-500 transition-all"
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Preview */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-4">
            Preview
          </label>
          <div className="space-y-3">
            <button
              className="w-full px-6 py-3 rounded-lg text-white font-medium transition-all"
              style={{ backgroundColor: settings.theme.primaryColor }}
            >
              Primary Button
            </button>
            <button
              className="w-full px-6 py-3 rounded-lg text-white font-medium transition-all"
              style={{ backgroundColor: settings.theme.secondaryColor }}
            >
              Secondary Button
            </button>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <SetupSaveOrSkipButton
          dirty={dirty}
          saving={saving}
          onSkip={() => goToNextPractitionerSetup(router, "/public-access-page/theme")}
          onSave={async () => {
            const slug = String(publicSlug || settings.publicSlug || "").trim();
            if (!slug) {
              toast.error("Set up your practitioner page slug first before saving the theme.");
              return;
            }
            setSaving(true);
            try {
              const token = Cookies.get("token");
              const payload = {
                primaryColor: settings.theme.primaryColor,
                secondaryColor: settings.theme.secondaryColor,
              };

              const res = await PUT_REQUEST(
                `${URLS.BASE}/account/dealSite/${encodeURIComponent(slug)}/theme/update`,
                payload,
                token
              );

              if (res?.success) {
                toast.success("Theme saved successfully");
                goToNextPractitionerSetup(router, "/public-access-page/theme");
                return;
              } else {
                toast.error(res?.message || "Failed to save theme");
              }
            } catch (error) {
              console.error("Failed to save theme:", error);
              toast.error("Failed to save theme");
            } finally {
              setSaving(false);
            }
          }}
        />
      </div>
    </div>
  );
}
