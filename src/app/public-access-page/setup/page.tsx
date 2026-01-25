/**
 * Public Access Page Setup Flow
 * This page is only accessible before the initial setup is complete
 * Once setup is complete, users are redirected to the dashboard
 */

"use client";

import React, { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import toast from "react-hot-toast";
import { AlertCircle, CheckCircle, Lock } from "lucide-react";
import { POST_REQUEST } from "@/utils/requests";
import { URLS } from "@/utils/URLS";
import { useDealSite } from "@/context/deal-site-context";
import { DealSiteSettings } from "@/context/deal-site-context";
import Stepper from "@/components/post-property-components/Stepper";

const Setup = () => {
  const router = useRouter();
  const { settings, updateSettings, markSetupComplete } = useDealSite();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [slugStatus, setSlugStatus] = useState<"idle" | "invalid" | "checking" | "available" | "taken">("idle");
  const [slugMessage, setSlugMessage] = useState<string>("");

  // Form state - track changes locally during setup
  const [formData, setFormData] = useState<DealSiteSettings>({
    ...settings,
    marketplaceDefaults: settings.marketplaceDefaults || { defaultTab: "buy", showVerifiedOnly: false, enablePriceNegotiationButton: true },
    listingsLimit: settings.listingsLimit || 6,
  });

  const handleInputChange = useCallback(
    (field: keyof DealSiteSettings, value: any) => {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    },
    []
  );

  // Slug validation
  const handleSlugChange = useCallback(
    (slug: string) => {
      setFormData((prev) => ({
        ...prev,
        publicSlug: slug,
      }));

      if (!slug) {
        setSlugStatus("idle");
        setSlugMessage("");
        return;
      }

      const valid = /^[a-z0-9]([a-z0-9-]{1,61}[a-z0-9])?$/.test(slug);
      if (!valid) {
        setSlugStatus("invalid");
        setSlugMessage("Use 2-63 chars: letters, numbers, hyphens. Cannot start/end with hyphen.");
        return;
      }

      let cancelled = false;
      setSlugStatus("checking");
      setSlugMessage("Checking availability...");

      const token = Cookies.get("token");
      const checkTimeout = setTimeout(async () => {
        try {
          const resp = await POST_REQUEST<any>(
            `${URLS.BASE}${URLS.dealSiteSlugAvailability}`,
            { publicSlug: slug },
            token
          );
          const available =
            resp?.data?.available ?? resp?.available ?? resp?.data?.isAvailable ?? resp?.isAvailable ?? false;
          if (!cancelled) {
            setSlugStatus(available ? "available" : "taken");
            setSlugMessage(available ? "Subdomain is available" : "Subdomain is taken");
          }
        } catch (e) {
          if (!cancelled) {
            setSlugStatus("taken");
            setSlugMessage("Unable to verify. Try again.");
          }
        }
      }, 400);

      return () => {
        cancelled = true;
        clearTimeout(checkTimeout);
      };
    },
    []
  );

  const validateStep = useCallback((): boolean => {
    if (step === 0) {
      // Public Link validation
      if (!formData.publicSlug) {
        toast.error("Please set your public link");
        return false;
      }
      if (slugStatus !== "available") {
        toast.error("Please use a valid and available subdomain");
        return false;
      }
      return true;
    }

    if (step === 1) {
      // Design validation
      if (!formData.title) {
        toast.error("Title is required");
        return false;
      }
      if (!formData.description) {
        toast.error("Description is required");
        return false;
      }
      return true;
    }

    if (step === 2) {
      // Marketplace validation
      return true;
    }

    if (step === 3) {
      // Payment validation
      if (
        !formData.paymentDetails?.businessName ||
        !formData.paymentDetails?.accountNumber ||
        !formData.paymentDetails?.sortCode
      ) {
        toast.error("Please complete all payment details");
        return false;
      }
      return true;
    }

    return true;
  }, [step, formData, slugStatus]);

  const handleNextStep = useCallback(() => {
    if (validateStep()) {
      if (step < 4) {
        setStep(step + 1);
      }
    }
  }, [step, validateStep]);

  const handlePrevStep = useCallback(() => {
    if (step > 0) {
      setStep(step - 1);
    }
  }, [step]);

  const handleSubmit = useCallback(async () => {
    if (!validateStep()) return;

    setSaving(true);
    try {
      const token = Cookies.get("token");
      const payload: DealSiteSettings = {
        ...formData,
        keywords: formData.keywords
          .map((k) => (typeof k === "string" ? k.trim() : ""))
          .filter(Boolean),
        contactVisibility: {
          ...formData.contactVisibility,
          whatsappNumber: formData.contactVisibility.showWhatsAppButton
            ? formData.contactVisibility.whatsappNumber
            : "",
        },
      };

      toast.promise(
        POST_REQUEST(`${URLS.BASE}${URLS.dealSiteSetup}`, payload, token),
        {
          loading: "Setting up your deal site...",
          success: (res: any) => {
            if (res?.success) {
              updateSettings(formData);
              markSetupComplete();
              setTimeout(() => {
                router.replace("/public-access-page");
              }, 1000);
              return "Setup complete!";
            }
            throw new Error(res?.message || "Setup failed");
          },
          error: (err: any) => err?.message || "Failed to complete setup",
        }
      );
    } finally {
      setSaving(false);
    }
  }, [formData, validateStep, updateSettings, markSetupComplete, router]);

  const steps = [
    { label: "Public Link", status: step > 0 ? "completed" : "active" },
    { label: "Design", status: step > 1 ? "completed" : step === 1 ? "active" : "pending" },
    { label: "Marketplace", status: step > 2 ? "completed" : step === 2 ? "active" : "pending" },
    { label: "Payment", status: step > 3 ? "completed" : step === 3 ? "active" : "pending" },
    { label: "Review", status: step === 4 ? "active" : "pending" },
  ] as const;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-[#09391C] mb-2">
            Setup Your Public Access Page
          </h1>
          <p className="text-gray-600">
            Follow the steps to get your public agent page live in minutes
          </p>
        </div>

        {/* Stepper */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
          <Stepper steps={steps} />
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-lg border border-gray-200 p-8">
          {step === 0 && <Step0PublicLink formData={formData} onSlugChange={handleSlugChange} slugStatus={slugStatus} slugMessage={slugMessage} />}
          {step === 1 && <Step1Design formData={formData} onChange={handleInputChange} />}
          {step === 2 && <Step2Marketplace formData={formData} onChange={handleInputChange} />}
          {step === 3 && <Step3Payment formData={formData} onChange={handleInputChange} />}
          {step === 4 && <Step4Review formData={formData} />}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between gap-4 mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={handlePrevStep}
              disabled={step === 0}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Back
            </button>

            {step < 4 ? (
              <button
                onClick={handleNextStep}
                className="px-6 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-all"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={saving || slugStatus !== "available"}
                className="px-8 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
              >
                {saving ? "Completing..." : "Complete Setup"}
              </button>
            )}
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
          <AlertCircle size={20} className="text-blue-600 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-blue-900">Setup is one-time only</h3>
            <p className="text-sm text-blue-800 mt-1">
              Once you complete the setup, you'll be able to manage and edit your public page settings from the dashboard.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Step Components
function Step0PublicLink({
  formData,
  onSlugChange,
  slugStatus,
  slugMessage,
}: {
  formData: DealSiteSettings;
  onSlugChange: (slug: string) => void;
  slugStatus: string;
  slugMessage: string;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[#09391C] mb-4">Choose Your Public Link</h2>
        <p className="text-gray-600">
          This will be your unique subdomain. Choose something memorable and brand-safe.
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Public Subdomain</label>
        <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
          <span className="px-4 py-2 bg-gray-100 text-gray-600 font-medium">https://</span>
          <input
            type="text"
            value={formData.publicSlug}
            onChange={(e) => onSlugChange(e.target.value.toLowerCase())}
            placeholder="your-name"
            className="flex-1 px-4 py-2 outline-none text-lg"
          />
          <span className="px-4 py-2 bg-gray-100 text-gray-600 font-medium">.khabiteq.com</span>
        </div>
        {slugMessage && (
          <div
            className={`mt-2 text-sm flex items-center gap-2 ${
              slugStatus === "available"
                ? "text-emerald-600"
                : slugStatus === "invalid"
                ? "text-yellow-600"
                : "text-red-600"
            }`}
          >
            {slugStatus === "available" && <CheckCircle size={16} />}
            {slugStatus === "checking" && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />}
            {slugMessage}
          </div>
        )}
      </div>

      <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
        <h3 className="font-semibold text-emerald-900 mb-2">Preview:</h3>
        {formData.publicSlug ? (
          <a
            href={`https://${formData.publicSlug}.khabiteq.com`}
            target="_blank"
            rel="noreferrer"
            className="text-emerald-600 hover:underline break-all"
          >
            https://{formData.publicSlug}.khabiteq.com
          </a>
        ) : (
          <p className="text-emerald-600">https://your-name.khabiteq.com</p>
        )}
      </div>
    </div>
  );
}

function Step1Design({
  formData,
  onChange,
}: {
  formData: DealSiteSettings;
  onChange: (field: keyof DealSiteSettings, value: any) => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[#09391C] mb-4">Page Branding</h2>
        <p className="text-gray-600">
          Set your page title and description for SEO and visitor preview.
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Page Title</label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => onChange("title", e.target.value)}
          placeholder="My Real Estate Business"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-200"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
        <textarea
          value={formData.description}
          onChange={(e) => onChange("description", e.target.value)}
          placeholder="Tell visitors about your business, services, and why they should choose you..."
          rows={4}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-200"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Keywords (comma separated)</label>
        <input
          type="text"
          value={formData.keywords.join(", ")}
          onChange={(e) =>
            onChange(
              "keywords",
              e.target.value.split(",").map((k) => k.trim()).filter(Boolean)
            )
          }
          placeholder="real estate, agent, properties, listings"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-200"
        />
      </div>
    </div>
  );
}

function Step2Marketplace({
  formData,
  onChange,
}: {
  formData: DealSiteSettings;
  onChange: (field: keyof DealSiteSettings, value: any) => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[#09391C] mb-4">Marketplace Settings</h2>
        <p className="text-gray-600">
          Configure how your listings are displayed to visitors.
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Default Listing Category</label>
        <select
          value={formData.marketplaceDefaults.defaultTab}
          onChange={(e) =>
            onChange("marketplaceDefaults", {
              ...formData.marketplaceDefaults,
              defaultTab: e.target.value as any,
            })
          }
          className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-200"
        >
          <option value="buy">Buy</option>
          <option value="rent">Rent</option>
          <option value="shortlet">Shortlet</option>
          <option value="jv">Joint Venture</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Featured Listings Limit</label>
        <input
          type="number"
          value={formData.listingsLimit}
          onChange={(e) => onChange("listingsLimit", parseInt(e.target.value))}
          min="1"
          max="50"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-200"
        />
        <p className="text-xs text-gray-500 mt-1">Maximum number of featured listings to display</p>
      </div>

      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          id="verified-only"
          checked={formData.marketplaceDefaults.showVerifiedOnly}
          onChange={(e) =>
            onChange("marketplaceDefaults", {
              ...formData.marketplaceDefaults,
              showVerifiedOnly: e.target.checked,
            })
          }
          className="w-4 h-4 text-emerald-600 rounded"
        />
        <label htmlFor="verified-only" className="text-sm font-medium text-gray-700">
          Show verified listings only
        </label>
      </div>

      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          id="enable-negotiation"
          checked={formData.marketplaceDefaults.enablePriceNegotiationButton}
          onChange={(e) =>
            onChange("marketplaceDefaults", {
              ...formData.marketplaceDefaults,
              enablePriceNegotiationButton: e.target.checked,
            })
          }
          className="w-4 h-4 text-emerald-600 rounded"
        />
        <label htmlFor="enable-negotiation" className="text-sm font-medium text-gray-700">
          Enable price negotiation button
        </label>
      </div>
    </div>
  );
}

function Step3Payment({
  formData,
  onChange,
}: {
  formData: DealSiteSettings;
  onChange: (field: keyof DealSiteSettings, value: any) => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[#09391C] mb-4">Payment Details</h2>
        <p className="text-gray-600">
          Provide your bank details for commission payments.
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Business Name *</label>
        <input
          type="text"
          value={formData.paymentDetails?.businessName || ""}
          onChange={(e) =>
            onChange("paymentDetails", {
              ...formData.paymentDetails,
              businessName: e.target.value,
            })
          }
          className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-200"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Account Number *</label>
        <input
          type="text"
          value={formData.paymentDetails?.accountNumber || ""}
          onChange={(e) =>
            onChange("paymentDetails", {
              ...formData.paymentDetails,
              accountNumber: e.target.value,
            })
          }
          className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-200"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Bank Code / Sort Code *</label>
        <input
          type="text"
          value={formData.paymentDetails?.sortCode || ""}
          onChange={(e) =>
            onChange("paymentDetails", {
              ...formData.paymentDetails,
              sortCode: e.target.value,
            })
          }
          className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-200"
        />
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-sm text-yellow-800">
          <strong>Security:</strong> Your payment details are encrypted and only used for commission transfers.
        </p>
      </div>
    </div>
  );
}

function Step4Review({ formData }: { formData: DealSiteSettings }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[#09391C] mb-4">Review Your Setup</h2>
        <p className="text-gray-600">
          Please review the information below before completing your setup.
        </p>
      </div>

      {/* Public Link Summary */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="font-semibold text-gray-900 mb-2">Public Link</h3>
        <p className="text-emerald-600 font-medium">
          https://{formData.publicSlug}.khabiteq.com
        </p>
      </div>

      {/* Branding Summary */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="font-semibold text-gray-900 mb-2">Branding</h3>
        <div className="space-y-2 text-sm">
          <p><span className="text-gray-600">Title:</span> {formData.title}</p>
          <p><span className="text-gray-600">Description:</span> {formData.description.substring(0, 100)}...</p>
        </div>
      </div>

      {/* Marketplace Summary */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="font-semibold text-gray-900 mb-2">Marketplace</h3>
        <div className="space-y-2 text-sm">
          <p><span className="text-gray-600">Default Category:</span> {formData.marketplaceDefaults.defaultTab}</p>
          <p><span className="text-gray-600">Featured Listings:</span> {formData.listingsLimit}</p>
        </div>
      </div>

      {/* Payment Summary */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="font-semibold text-gray-900 mb-2">Payment Details</h3>
        <div className="space-y-2 text-sm">
          <p><span className="text-gray-600">Business:</span> {formData.paymentDetails?.businessName}</p>
          <p><span className="text-gray-600">Account:</span> ****{formData.paymentDetails?.accountNumber?.slice(-4)}</p>
        </div>
      </div>

      <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 flex gap-3">
        <CheckCircle size={20} className="text-emerald-600 flex-shrink-0" />
        <div>
          <h3 className="font-semibold text-emerald-900">Ready to launch!</h3>
          <p className="text-sm text-emerald-800 mt-1">
            Click "Complete Setup" to finalize and take your page live.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Setup;
