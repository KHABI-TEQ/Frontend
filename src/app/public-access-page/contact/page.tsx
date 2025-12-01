"use client";

import React, { useState, useCallback } from "react";
import Cookies from "js-cookie";
import toast from "react-hot-toast";
import { MessageCircle, Save } from "lucide-react";
import { POST_REQUEST } from "@/utils/requests";
import { URLS } from "@/utils/URLS";
import { useDealSite } from "@/context/deal-site-context";
import OverlayPreloader from "@/components/general-components/OverlayPreloader";

export default function ContactPage() {
  const { settings, updateSettings } = useDealSite();
  const [preloader, setPreloader] = useState(false);
  const [formData, setFormData] = useState({
    showEmail: settings.contactVisibility?.showEmail ?? true,
    showPhone: settings.contactVisibility?.showPhone ?? true,
    enableContactForm: settings.contactVisibility?.enableContactForm ?? true,
    showWhatsAppButton: settings.contactVisibility?.showWhatsAppButton ?? true,
    whatsappNumber: settings.contactVisibility?.whatsappNumber || "",
  });

  const handleInputChange = useCallback((field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  const handleSave = useCallback(async () => {
    if (formData.showWhatsAppButton && !formData.whatsappNumber) {
      toast.error("WhatsApp number is required when enabled");
      return;
    }

    setPreloader(true);
    try {
      const token = Cookies.get("token");
      const payload = {
        contactVisibility: formData,
      };

      const res = await POST_REQUEST(
        `${URLS.BASE}/account/dealSite/update`,
        payload,
        token
      );

      if (res?.success) {
        updateSettings(payload as any);
        toast.success("Contact settings saved");
      } else {
        toast.error(res?.message || "Failed to save settings");
      }
    } catch (error) {
      toast.error("Failed to save contact settings");
    } finally {
      setPreloader(false);
    }
  }, [formData, updateSettings]);

  return (
    <div className="space-y-8">
      <OverlayPreloader visible={preloader} message="Saving..." />

      <div>
        <h1 className="text-3xl font-bold text-[#09391C] flex items-center gap-3">
          <MessageCircle size={32} />
          Contact Settings
        </h1>
        <p className="text-gray-600 mt-2">Control how visitors can contact you</p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="show-email"
              checked={formData.showEmail}
              onChange={(e) => handleInputChange("showEmail", e.target.checked)}
              className="w-4 h-4 text-emerald-600 rounded"
            />
            <label htmlFor="show-email" className="text-sm font-medium text-gray-700">
              Display email address on public page
            </label>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="show-phone"
              checked={formData.showPhone}
              onChange={(e) => handleInputChange("showPhone", e.target.checked)}
              className="w-4 h-4 text-emerald-600 rounded"
            />
            <label htmlFor="show-phone" className="text-sm font-medium text-gray-700">
              Display phone number on public page
            </label>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="enable-contact-form"
              checked={formData.enableContactForm}
              onChange={(e) => handleInputChange("enableContactForm", e.target.checked)}
              className="w-4 h-4 text-emerald-600 rounded"
            />
            <label htmlFor="enable-contact-form" className="text-sm font-medium text-gray-700">
              Enable contact form on public page
            </label>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="show-whatsapp"
              checked={formData.showWhatsAppButton}
              onChange={(e) => handleInputChange("showWhatsAppButton", e.target.checked)}
              className="w-4 h-4 text-emerald-600 rounded"
            />
            <label htmlFor="show-whatsapp" className="text-sm font-medium text-gray-700">
              Display WhatsApp button
            </label>
          </div>
        </div>

        {formData.showWhatsAppButton && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              WhatsApp Number
            </label>
            <div className="flex items-center gap-2">
              <span className="text-gray-600 font-medium">+234</span>
              <input
                type="text"
                value={formData.whatsappNumber}
                onChange={(e) => handleInputChange("whatsappNumber", e.target.value)}
                placeholder="8012345678"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-200"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">Enter number without country code</p>
          </div>
        )}

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <strong>Privacy:</strong> Your contact information is only displayed to site visitors.
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
    </div>
  );
}
