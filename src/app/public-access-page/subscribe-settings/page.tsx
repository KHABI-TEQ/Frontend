"use client";

import React, { useState, useCallback } from "react";
import Cookies from "js-cookie";
import toast from "react-hot-toast";
import { Mail, Save } from "lucide-react";
import { POST_REQUEST } from "@/utils/requests";
import { URLS } from "@/utils/URLS";
import { useDealSite } from "@/context/deal-site-context";
import OverlayPreloader from "@/components/general-components/OverlayPreloader";
import SubscribersTab from "@/components/public-access-components/SubscribersTab";

export default function SubscribeSettingsPage() {
  const { settings, updateSettings } = useDealSite();
  const [preloader, setPreloader] = useState(false);
  const [activeTab, setActiveTab] = useState<"settings" | "subscribers">("settings");
  const [formData, setFormData] = useState({
    enableEmailSubscription: settings.subscribeSettings?.enableEmailSubscription ?? true,
    subscriptionTitle: settings.subscribeSettings?.title || "Subscribe to Updates",
    subscriptionDescription:
      settings.subscribeSettings?.subTitle ||
      "Get notified about new listings and exclusive offers",
    subscriptionPlaceholder:
      settings.subscribeSettings?.subscriptionPlaceholder || "Enter your email",
    confirmationMessage:
      settings.subscribeSettings?.confirmationMessage ||
      "Thank you for subscribing! Check your email for confirmation.",
  });

  const handleInputChange = useCallback((field: string, value: string | boolean) => {
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
        subscribeSettings: {
          title: formData.subscriptionTitle,
          subTitle: formData.subscriptionDescription,
          enableEmailSubscription: formData.enableEmailSubscription,
          subscriptionPlaceholder: formData.subscriptionPlaceholder,
          confirmationMessage: formData.confirmationMessage,
        },
      };

      const res = await POST_REQUEST(
        `${URLS.BASE}${URLS.dealSiteUpdate}`,
        payload,
        token
      );

      if (res?.success) {
        updateSettings(payload as any);
        toast.success("Subscribe settings saved");
      } else {
        toast.error(res?.message || "Failed to save settings");
      }
    } catch (error) {
      toast.error("Failed to save subscribe settings");
    } finally {
      setPreloader(false);
    }
  }, [formData, updateSettings]);

  return (
    <div className="space-y-8">
      <OverlayPreloader isVisible={preloader} message="Saving..." />

      <div>
        <h1 className="text-3xl font-bold text-[#09391C] flex items-center gap-3">
          <Mail size={32} />
          Subscribe Settings
        </h1>
        <p className="text-gray-600 mt-2">
          Manage your email subscription settings and view subscribers
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab("settings")}
            className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
              activeTab === "settings"
                ? "border-emerald-600 text-emerald-600"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            Settings
          </button>
          <button
            onClick={() => setActiveTab("subscribers")}
            className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
              activeTab === "subscribers"
                ? "border-emerald-600 text-emerald-600"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            Subscribers
          </button>
        </div>
      </div>

      {/* Settings Tab Content */}
      {activeTab === "settings" && (
      <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="enable-subscription"
            checked={formData.enableEmailSubscription}
            onChange={(e) =>
              handleInputChange("enableEmailSubscription", e.target.checked)
            }
            className="w-4 h-4 text-emerald-600 rounded"
          />
          <label htmlFor="enable-subscription" className="text-sm font-medium text-gray-700">
            Enable email subscription form
          </label>
        </div>

        {formData.enableEmailSubscription && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Section Title
              </label>
              <input
                type="text"
                value={formData.subscriptionTitle}
                onChange={(e) =>
                  handleInputChange("subscriptionTitle", e.target.value)
                }
                placeholder="Subscribe to Updates"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-200"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.subscriptionDescription}
                onChange={(e) =>
                  handleInputChange("subscriptionDescription", e.target.value)
                }
                placeholder="Get notified about new listings and exclusive offers"
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-200"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Input Placeholder
              </label>
              <input
                type="text"
                value={formData.subscriptionPlaceholder}
                onChange={(e) =>
                  handleInputChange("subscriptionPlaceholder", e.target.value)
                }
                placeholder="Enter your email"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-200"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirmation Message
              </label>
              <textarea
                value={formData.confirmationMessage}
                onChange={(e) =>
                  handleInputChange("confirmationMessage", e.target.value)
                }
                placeholder="Thank you for subscribing!"
                rows={2}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-200"
              />
              <p className="text-xs text-gray-500 mt-1">
                Message shown after successful subscription
              </p>
            </div>
          </div>
        )}

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <strong>Tip:</strong> Email subscriptions help you build an audience and nurture leads.
          </p>
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
      )}

      {/* Subscribers Tab Content */}
      {activeTab === "subscribers" && settings.publicSlug && (
        <SubscribersTab />
      )}
    </div>
  );
}
