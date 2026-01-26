"use client";

import React, { useState, useCallback } from "react";
import Cookies from "js-cookie";
import toast from "react-hot-toast";
import { Mail, Save } from "lucide-react";
import { POST_REQUEST } from "@/utils/requests";
import { URLS } from "@/utils/URLS";
import { useDealSite } from "@/context/deal-site-context";
import OverlayPreloader from "@/components/general-components/OverlayPreloader";
import ContactMessagesTab from "@/components/public-access-components/ContactMessagesTab";

export default function ContactUsPage() {
  const { settings, updateSettings } = useDealSite();
  const [preloader, setPreloader] = useState(false);
  const [activeTab, setActiveTab] = useState<"settings" | "messages">("settings");
  const [formData, setFormData] = useState({
    contactUsTitle: settings.contactUs?.hero?.title || "Get in Touch",
    contactUsDescription: settings.contactUs?.hero?.description || "Have a question? We'd love to hear from you.",
    enableContactForm: settings.contactVisibility?.enableContactForm ?? true,
    responseMessage: settings.contactUs?.cta?.title || "Thank you for reaching out. We'll get back to you soon.",
    showEmail: settings.contactVisibility?.showEmail ?? true,
    showPhone: settings.contactVisibility?.showPhone ?? true,
    showWhatsAppButton: settings.contactVisibility?.showWhatsAppButton ?? true,
    whatsappNumber: settings.contactVisibility?.whatsappNumber || "",
    locationName: settings.contactUs?.location?.name || "",
    locationAddress: settings.contactUs?.location?.address || "",
    locationLatitude: settings.contactUs?.location?.coordinates?.[0]?.toString() || "",
    locationLongitude: settings.contactUs?.location?.coordinates?.[1]?.toString() || "",
  });

  const handleInputChange = useCallback((field: string, value: string | boolean) => {
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
        contactUs: {
          ...settings.contactUs,
          hero: {
            ...settings.contactUs?.hero,
            title: formData.contactUsTitle,
            description: formData.contactUsDescription,
          },
          cta: {
            ...settings.contactUs?.cta,
            title: formData.responseMessage,
          },
          location: {
            name: formData.locationName,
            address: formData.locationAddress,
            coordinates: formData.locationLatitude && formData.locationLongitude
              ? [parseFloat(formData.locationLatitude), parseFloat(formData.locationLongitude)]
              : undefined,
          },
        },
        contactVisibility: {
          showEmail: formData.showEmail,
          showPhone: formData.showPhone,
          enableContactForm: formData.enableContactForm,
          showWhatsAppButton: formData.showWhatsAppButton,
          whatsappNumber: formData.whatsappNumber,
        },
      };

      const res = await POST_REQUEST(
        `${URLS.BASE}${URLS.dealSiteUpdate}`,
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
  }, [formData, settings, updateSettings]);

  return (
    <div className="space-y-8">
      <OverlayPreloader isVisible={preloader} message="Saving..." />

      <div>
        <h1 className="text-3xl font-bold text-[#09391C] flex items-center gap-3">
          <Mail size={32} />
          Contact Us Page
        </h1>
        <p className="text-gray-600 mt-2">Manage your contact page settings and view messages</p>
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
            Page Settings
          </button>
          <button
            onClick={() => setActiveTab("messages")}
            className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
              activeTab === "messages"
                ? "border-emerald-600 text-emerald-600"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            Messages
          </button>
        </div>
      </div>

      {/* Settings Tab Content */}
      {activeTab === "settings" && (
      <>
      {/* Page Content Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-[#09391C] mb-4">Page Content</h2>
        </div>

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
      </div>

      {/* Contact Form Settings Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-[#09391C] mb-4">Contact Form</h2>
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

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> Contact form submissions are sent to your email and available in your dashboard.
          </p>
        </div>
      </div>

      {/* Contact Display Options Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-[#09391C] mb-4">Display Options</h2>
          <p className="text-sm text-gray-600 mb-4">Control how visitors can contact you</p>
        </div>

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
      </div>

      {/* Location Details Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-[#09391C] mb-4">Location Details</h2>
          <p className="text-sm text-gray-600 mb-4">Add your business location information</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Location Name
          </label>
          <input
            type="text"
            value={formData.locationName}
            onChange={(e) => handleInputChange("locationName", e.target.value)}
            placeholder="e.g., Main Office, Lagos Branch"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-200"
          />
          <p className="text-xs text-gray-500 mt-1">Name of your business location</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Address
          </label>
          <textarea
            value={formData.locationAddress}
            onChange={(e) => handleInputChange("locationAddress", e.target.value)}
            placeholder="e.g., 123 Main Street, Lagos, Nigeria"
            rows={2}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-200"
          />
          <p className="text-xs text-gray-500 mt-1">Full address of your business location</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Latitude
            </label>
            <input
              type="number"
              step="0.000001"
              value={formData.locationLatitude}
              onChange={(e) => handleInputChange("locationLatitude", e.target.value)}
              placeholder="e.g., 6.5244"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-200"
            />
            <p className="text-xs text-gray-500 mt-1">Geographic latitude coordinate</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Longitude
            </label>
            <input
              type="number"
              step="0.000001"
              value={formData.locationLongitude}
              onChange={(e) => handleInputChange("locationLongitude", e.target.value)}
              placeholder="e.g., 3.3792"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-200"
            />
            <p className="text-xs text-gray-500 mt-1">Geographic longitude coordinate</p>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <strong>Tip:</strong> Use Google Maps to find your location's coordinates. Right-click on the map and select "What's here" to see the coordinates.
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
      </>
      )}

      {/* Messages Tab Content */}
      {activeTab === "messages" && settings.publicSlug && (
        <ContactMessagesTab />
      )}
    </div>
  );
}
