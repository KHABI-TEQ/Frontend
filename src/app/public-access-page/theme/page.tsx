/**
 * Theme Settings
 * Customize colors for the public page
 */

"use client";

import React from "react";
import { Palette } from "lucide-react";
import { useDealSite } from "@/context/deal-site-context";

export default function ThemePage() {
  const { settings, updateSettings } = useDealSite();
  const [saving, setSaving] = React.useState(false);

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
        <p className="text-gray-600 mt-2">
          Customize your page colors to match your brand
        </p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-8">
        {/* Primary Color */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-4">
            Primary Color
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

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={() => {
            setSaving(true);
            setTimeout(() => setSaving(false), 1000);
          }}
          className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-all"
        >
          {saving ? "Saving..." : "Save Theme"}
        </button>
      </div>
    </div>
  );
}
