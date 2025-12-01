"use client";

import React, { useState, useCallback } from "react";
import Cookies from "js-cookie";
import toast from "react-hot-toast";
import { Mail, Save } from "lucide-react";
import { POST_REQUEST } from "@/utils/requests";
import { URLS } from "@/utils/URLS";
import { useDealSite } from "@/context/deal-site-context";
import OverlayPreloader from "@/components/general-components/OverlayPreloader";

export default function ContactUsPage() {
  const { settings, updateSettings } = useDealSite();
  const [preloader, setPreloader] = useState(false);
  const [formData, setFormData] = useState({
    contactUsTitle: settings.contactUsPage?.title || "Get in Touch",
    contactUsDescription: settings.contactUsPage?.description || "Have a question? We'd love to hear from you.",
    enableContactForm: settings.contactVisibility?.enableContactForm ?? true,
    responseMessage: settings.contactUsPage?.responseMessage || "Thank you for reaching out. We'll get back to you soon.",
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
        contactUsPage: {
          title: formData.contactUsTitle,
          description: formData.contactUsDescription,
          responseMessage: formData.responseMessage,
        },
        contactVisibility: {
          ...settings.contactVisibility,
          enableContactForm: formData.enableContactForm,
        },
      };

      const res = await POST_REQUEST(
        `${URLS.BASE}/account/dealSite/update`,
        payload,
        token
      );

      if (res?.success) {
        updateSettings(payload as any);
        toast.success("Contact Us page updated");
      } else {
        toast.error(res?.message || "Failed to save settings");
      }
    } catch (error) {
      toast.error("Failed to save contact us page");
    } finally {
      setPreloader(false);
    }
  }, [formData, settings, updateSettings]);

  return (
    <div className="space-y-8">
      <OverlayPreloader visible={preloader} message="Saving..." />

      <div>
        <h1 className="text-3xl font-bold text-[#09391C] flex items-center gap-3">
          <Mail size={32} />
          Contact Us Page
        </h1>
        <p className="text-gray-600 mt-2">Customize your contact page appearance and settings</p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Page Title
          </label>
          <input
            type="text"
            value={formData.contactUsTitle}
            onChange={(e) => handleInputChange("contactUsTitle", e.target.value)}
            placeholder="Get in Touch"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-200"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Page Description
          </label>
          <textarea
            value={formData.contactUsDescription}
            onChange={(e) => handleInputChange("contactUsDescription", e.target.value)}
            placeholder="Have a question? We'd love to hear from you."
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-200"
          />
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
            Enable contact form
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Response Message
          </label>
          <textarea
            value={formData.responseMessage}
            onChange={(e) => handleInputChange("responseMessage", e.target.value)}
            placeholder="Thank you for reaching out. We'll get back to you soon."
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-200"
          />
          <p className="text-xs text-gray-500 mt-1">This message is shown after form submission</p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> Contact form submissions are sent to your email and available in your dashboard.
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
