/**
 * Public Access Page Setup Flow
 * This page is only accessible before the initial setup is complete
 * Once setup is complete, users are redirected to the dashboard
 */

"use client";

import React, { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import toast from "react-hot-toast";
import { AlertCircle, CheckCircle, Lock, ChevronDown, Loader } from "lucide-react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { POST_REQUEST, GET_REQUEST } from "@/utils/requests";
import { URLS } from "@/utils/URLS";
import { useDealSite } from "@/context/deal-site-context";
import { DealSiteSettings } from "@/context/deal-site-context";
import Stepper from "@/components/post-property-components/Stepper";

interface Bank {
  name: string;
  code: string;
  country?: string;
  currency?: string;
  type?: string;
}

// Yup validation schemas for each step
const createValidationSchema = (step: number) => {
  if (step === 0) {
    return Yup.object({
      publicSlug: Yup.string().required("Public link is required").min(2, "Minimum 2 characters"),
    });
  }

  if (step === 1) {
    return Yup.object({
      title: Yup.string().required("Title is required"),
      description: Yup.string().required("Description is required"),
    });
  }

  if (step === 2) {
    return Yup.object({
      paymentDetails: Yup.object().shape({
        businessName: Yup.string().required("Business name is required"),
        accountNumber: Yup.string().required("Account number is required"),
        sortCode: Yup.string().required("Settlement bank is required"),
        primaryContactName: Yup.string().required("Contact name is required"),
        primaryContactEmail: Yup.string().email("Invalid email").required("Email is required"),
        primaryContactPhone: Yup.string().required("Phone is required"),
      }),
    });
  }

  return Yup.object({});
};

const Setup = () => {
  const router = useRouter();
  const { settings, updateSettings, markSetupComplete } = useDealSite();
  const [step, setStep] = useState(0);
  const [slugStatus, setSlugStatus] = useState<"idle" | "invalid" | "checking" | "available" | "taken">("idle");
  const [slugMessage, setSlugMessage] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);

  // Initialize Formik
  const formik = useFormik({
    initialValues: {
      publicSlug: settings.publicSlug || "",
      title: settings.title || "",
      description: settings.description || "",
      keywords: settings.keywords || [],
      logoUrl: settings.logoUrl || "",
      theme: settings.theme || { primaryColor: "#09391C", secondaryColor: "#8DDB90" },
      publicPage: settings.publicPage || {
        heroTitle: "Hi, I'm your trusted agent",
        heroSubtitle: "Browse my verified listings and book inspections easily.",
        ctaText: "Tell Us about property you want",
        ctaLink: "/market-place",
        ctaText2: "Browse Listings",
        ctaLink2: "/market-place",
        heroImageUrl: "",
      },
      featureSelection: settings.featureSelection || { mode: "auto", propertyIds: "", featuredListings: [] },
      socialLinks: settings.socialLinks || {},
      inspectionSettings: settings.inspectionSettings || { defaultInspectionFee: 0 },
      contactVisibility: settings.contactVisibility || {
        showEmail: true,
        showPhone: true,
        enableContactForm: true,
        showWhatsAppButton: false,
        whatsappNumber: "",
      },
      paymentDetails: settings.paymentDetails || {
        businessName: "",
        accountNumber: "",
        sortCode: "",
        primaryContactName: "",
        primaryContactEmail: "",
        primaryContactPhone: "",
      },
    },
    validationSchema: createValidationSchema(step),
    validateOnChange: true,
    validateOnBlur: true,
    onSubmit: async (values) => {
      if (step < 3) {
        if (Object.keys(formik.errors).length === 0) {
          setStep(step + 1);
        }
        return;
      }

      // Final submission
      await handleFinalSubmit(values);
    },
  });

  // Slug validation with availability check
  useEffect(() => {
    const slug = formik.values.publicSlug;

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
  }, [formik.values.publicSlug]);

  const handleFinalSubmit = async (values: any) => {
    // Validate slug availability for final submission
    if (slugStatus !== "available") {
      toast.error("Please use a valid and available subdomain");
      return;
    }

    setIsProcessing(true);
    try {
      const token = Cookies.get("token");
      const payload: DealSiteSettings = {
        ...values,
        keywords: values.keywords
          .map((k: any) => (typeof k === "string" ? k.trim() : ""))
          .filter(Boolean),
        contactVisibility: {
          ...values.contactVisibility,
          whatsappNumber: values.contactVisibility.showWhatsAppButton
            ? values.contactVisibility.whatsappNumber
            : "",
        },
      };

      const res = await POST_REQUEST(`${URLS.BASE}${URLS.dealSiteSetup}`, payload, token);

      if (res?.success) {
        updateSettings(values);
        markSetupComplete();
        toast.success("Setup complete!");
        setTimeout(() => {
          router.replace("/public-access-page");
        }, 1000);
      } else {
        toast.error(res?.message || "Setup failed");
      }
    } catch (error: any) {
      toast.error(error?.message || "Failed to complete setup");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleNextStep = () => {
    formik.submitForm();
  };

  const handlePrevStep = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  const steps = [
    { label: "Public Link", status: step > 0 ? "completed" : "active" },
    { label: "Design", status: step > 1 ? "completed" : step === 1 ? "active" : "pending" },
    { label: "Payment", status: step > 2 ? "completed" : step === 2 ? "active" : "pending" },
    { label: "Review", status: step === 3 ? "active" : "pending" },
  ] as const;

  return (
    <div className="min-h-screen bg-[#EEF1F1] py-12 px-4">
      {/* Processing Preloader */}
      {isProcessing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 flex flex-col items-center gap-4">
            <Loader size={40} className="animate-spin text-emerald-600" />
            <p className="text-lg font-semibold text-gray-800">Setting up your deal site...</p>
            <p className="text-sm text-gray-600 text-center">This may take a few moments</p>
          </div>
        </div>
      )}

      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-[#09391C] mb-2">
            Launch Your Public Access Page
          </h1>
          <p className="text-gray-600">
            Complete these 3 steps to go live. You can customize everything else later.
          </p>
        </div>

        {/* Stepper */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
          <Stepper steps={steps} />
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-lg border border-gray-200 p-8">
          {step === 0 && (
            <Step0PublicLink
              formik={formik}
              slugStatus={slugStatus}
              slugMessage={slugMessage}
            />
          )}
          {step === 1 && <Step1Design formik={formik} />}
          {step === 2 && <Step2Payment formik={formik} />}
          {step === 3 && <Step3Review formik={formik} />}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between gap-4 mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={handlePrevStep}
              disabled={step === 0}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Back
            </button>

            {step < 3 ? (
              <button
                onClick={handleNextStep}
                className="px-6 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-all"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleNextStep}
                disabled={isProcessing || slugStatus !== "available"}
                className="px-8 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <Loader size={16} className="animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Complete Setup"
                )}
              </button>
            )}
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
          <AlertCircle size={20} className="text-blue-600 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-blue-900">Quick Setup</h3>
            <p className="text-sm text-blue-800 mt-1">
              We only need the basics to get your page live. Once complete, you can customize everything else from your dashboard including branding, hero image, testimonials, featured properties, and much more.
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
        <h2 className="text-2xl font-bold text-[#09391C] mb-4">Basic Information</h2>
        <p className="text-gray-600">
          Tell visitors about your business. You can customize more details later from your dashboard.
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Page Title *</label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => onChange("title", e.target.value)}
          placeholder="My Real Estate Business"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-200"
        />
        <p className="text-xs text-gray-500 mt-1">This is how your page appears to search engines and visitors</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
        <textarea
          value={formData.description}
          onChange={(e) => onChange("description", e.target.value)}
          placeholder="Tell visitors about your business, services, and why they should choose you..."
          rows={4}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-200"
        />
        <p className="text-xs text-gray-500 mt-1">Keep it concise and engaging</p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>Later:</strong> You'll be able to add keywords, logo, custom colors, hero image, and more from your dashboard settings.
        </p>
      </div>
    </div>
  );
}

function Step2Payment({
  formData,
  onChange,
}: {
  formData: DealSiteSettings;
  onChange: (field: keyof DealSiteSettings, value: any) => void;
}) {
  const [banks, setBanks] = useState<Bank[]>([]);
  const [filteredBanks, setFilteredBanks] = useState<Bank[]>([]);
  const [bankSearch, setBankSearch] = useState("");
  const [showBankDropdown, setShowBankDropdown] = useState(false);
  const [loadingBanks, setLoadingBanks] = useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  // Load banks on mount
  useEffect(() => {
    const loadBanks = async () => {
      try {
        setLoadingBanks(true);
        const token = Cookies.get("token");
        const res = await GET_REQUEST<any>(`${URLS.BASE}/account/dealSite/bankList`, token);

        if (res?.data && Array.isArray(res.data)) {
          setBanks(res.data);
          setFilteredBanks(res.data);
        }
      } catch (error) {
        console.warn("Failed to load banks:", error);
        // Continue without banks - user can enter sort code manually
      } finally {
        setLoadingBanks(false);
      }
    };

    loadBanks();
  }, []);

  // Handle click outside dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowBankDropdown(false);
      }
    };

    if (showBankDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showBankDropdown]);

  // Handle bank search
  const handleBankSearch = (query: string) => {
    setBankSearch(query);
    if (query.trim()) {
      const filtered = banks.filter(
        (bank) =>
          bank.name.toLowerCase().includes(query.toLowerCase()) ||
          bank.code.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredBanks(filtered);
    } else {
      setFilteredBanks(banks);
    }
  };

  // Handle bank selection
  const selectBank = (bank: Bank) => {
    onChange("paymentDetails", {
      ...formData.paymentDetails,
      sortCode: bank.code,
    });
    setBankSearch(bank.name);
    setShowBankDropdown(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[#09391C] mb-4">Payment Details</h2>
        <p className="text-gray-600">
          Provide your bank details and contact information for commission payments.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Settlement Bank *</label>
        <div className="relative" ref={dropdownRef}>
          <div
            className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-200 cursor-pointer bg-white flex items-center justify-between"
            onClick={() => setShowBankDropdown(!showBankDropdown)}
          >
            <input
              type="text"
              placeholder="Search banks..."
              value={bankSearch}
              onChange={(e) => handleBankSearch(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              className="flex-1 outline-none bg-transparent"
            />
            <ChevronDown size={20} className={`text-gray-400 transition-transform ${showBankDropdown ? "rotate-180" : ""}`} />
          </div>

          {showBankDropdown && (
            <div className="absolute top-full left-0 right-0 mt-1 border border-gray-300 rounded-lg bg-white shadow-lg z-10 max-h-60 overflow-y-auto">
              {loadingBanks ? (
                <div className="p-4 text-center text-gray-500">Loading banks...</div>
              ) : filteredBanks.length > 0 ? (
                filteredBanks.map((bank) => (
                  <div
                    key={bank.code}
                    onClick={() => selectBank(bank)}
                    className="px-4 py-2 hover:bg-emerald-50 cursor-pointer border-b last:border-b-0"
                  >
                    <div className="font-medium text-gray-900">{bank.name}</div>
                    <div className="text-xs text-gray-500">{bank.code}</div>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-gray-500">No banks found</div>
              )}
            </div>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Sort Code / Bank Code *</label>
        <p className="text-xs text-gray-500 mb-2">Auto-filled when you select a bank</p>
        <input
          type="text"
          value={formData.paymentDetails?.sortCode || ""}
          onChange={(e) =>
            onChange("paymentDetails", {
              ...formData.paymentDetails,
              sortCode: e.target.value,
            })
          }
          placeholder="e.g., 058"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-200"
        />
      </div>

      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold text-[#09391C] mb-4">Primary Contact Information</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Contact Name *</label>
            <input
              type="text"
              value={formData.paymentDetails?.primaryContactName || ""}
              onChange={(e) =>
                onChange("paymentDetails", {
                  ...formData.paymentDetails,
                  primaryContactName: e.target.value,
                })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-200"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
            <input
              type="email"
              value={formData.paymentDetails?.primaryContactEmail || ""}
              onChange={(e) =>
                onChange("paymentDetails", {
                  ...formData.paymentDetails,
                  primaryContactEmail: e.target.value,
                })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-200"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Phone *</label>
          <input
            type="tel"
            value={formData.paymentDetails?.primaryContactPhone || ""}
            onChange={(e) =>
              onChange("paymentDetails", {
                ...formData.paymentDetails,
                primaryContactPhone: e.target.value,
              })
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-200"
          />
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-sm text-yellow-800">
          <strong>Security:</strong> Your payment details are encrypted and only used for commission transfers.
        </p>
      </div>
    </div>
  );
}

function Step3Review({ formData }: { formData: DealSiteSettings }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[#09391C] mb-4">Confirm and Launch</h2>
        <p className="text-gray-600">
          Review your information below, then click "Complete Setup" to go live.
        </p>
      </div>

      {/* Public Link Summary */}
      <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200">
        <h3 className="font-semibold text-emerald-900 mb-2">Your Public Page</h3>
        <p className="text-emerald-700 font-medium break-all">
          https://{formData.publicSlug}.khabiteq.com
        </p>
      </div>

      {/* Branding Summary */}
      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <h3 className="font-semibold text-gray-900 mb-3">Basic Information</h3>
        <div className="space-y-3 text-sm">
          <div>
            <p className="text-gray-600 font-medium">Title</p>
            <p className="text-gray-900">{formData.title}</p>
          </div>
          <div>
            <p className="text-gray-600 font-medium">Description</p>
            <p className="text-gray-900">{formData.description}</p>
          </div>
        </div>
      </div>

      {/* Payment Summary */}
      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <h3 className="font-semibold text-gray-900 mb-3">Payment Details</h3>
        <div className="space-y-3 text-sm">
          <div>
            <p className="text-gray-600 font-medium">Business Name</p>
            <p className="text-gray-900">{formData.paymentDetails?.businessName}</p>
          </div>
          <div>
            <p className="text-gray-600 font-medium">Account Number</p>
            <p className="text-gray-900">****{formData.paymentDetails?.accountNumber?.slice(-4)}</p>
          </div>
          <div>
            <p className="text-gray-600 font-medium">Settlement Bank</p>
            <p className="text-gray-900">{formData.paymentDetails?.sortCode || "Not specified"}</p>
          </div>
        </div>
      </div>

      {/* Contact Information Summary */}
      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <h3 className="font-semibold text-gray-900 mb-3">Primary Contact Information</h3>
        <div className="space-y-3 text-sm">
          <div>
            <p className="text-gray-600 font-medium">Contact Name</p>
            <p className="text-gray-900">{formData.paymentDetails?.primaryContactName}</p>
          </div>
          <div>
            <p className="text-gray-600 font-medium">Email</p>
            <p className="text-gray-900">{formData.paymentDetails?.primaryContactEmail}</p>
          </div>
          <div>
            <p className="text-gray-600 font-medium">Phone</p>
            <p className="text-gray-900">{formData.paymentDetails?.primaryContactPhone}</p>
          </div>
        </div>
      </div>

      <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
        <h3 className="font-semibold text-emerald-900 mb-2">You're almost there! 🎉</h3>
        <p className="text-sm text-emerald-800">
          After launching, you'll have access to your dashboard where you can add a logo, customize colors, add featured properties, testimonials, and much more.
        </p>
      </div>
    </div>
  );
}

export default Setup;
