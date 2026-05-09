/**
 * Payment Details Settings
 * Manage bank account and payment information
 */

"use client";

import React, { useState, useCallback } from "react";
import Cookies from "js-cookie";
import toast from "react-hot-toast";
import { Save, DollarSign, Lock } from "lucide-react";
import { useDealSite } from "@/context/deal-site-context";
import { PUT_REQUEST } from "@/utils/requests";
import { URLS } from "@/utils/URLS";

export default function PaymentPage() {
  const { settings, updateSettings } = useDealSite();
  const [saving, setSaving] = useState(false);
  const paymentDetailsAny = (settings.paymentDetails || {}) as Record<string, any>;

  const handleSave = useCallback(async () => {
    if (!settings.practitionerPage) {
      toast.error("Set up your practitioner page slug first before saving payment details.");
      return;
    }

    if (
      !settings.paymentDetails?.businessName ||
      !settings.paymentDetails?.accountNumber ||
      !settings.paymentDetails?.sortCode
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    setSaving(true);
    try {
      const token = Cookies.get("token");
      const payload = {
        businessName: String(settings.paymentDetails?.businessName || "").trim(),
        accountNumber: String(settings.paymentDetails?.accountNumber || "").trim(),
        sortCode: String(settings.paymentDetails?.sortCode || "").trim(),
        primaryContactName: String(settings.paymentDetails?.primaryContactName || "").trim(),
        primaryContactEmail: String(settings.paymentDetails?.primaryContactEmail || "").trim(),
        primaryContactPhone: String(settings.paymentDetails?.primaryContactPhone || "").trim(),
      };

      const res = await PUT_REQUEST(
        `${URLS.BASE}/account/dealSite/${settings.practitionerPage}/paymentDetails/update`,
        payload,
        token
      );

      if (res?.success) {
        const returned = (res.data as any)?.paymentDetails;
        if (returned) {
          updateSettings({
            paymentDetails: returned,
          });
        }
        toast.success("Payment details saved and verified successfully");
      } else {
        const msg = String(res?.message || res?.error || "Failed to save payment details");
        if (/on hold|under review/i.test(msg)) {
          toast.error("This page is currently under review. Payment details cannot be changed right now.");
        } else {
          toast.error(msg);
        }
      }
    } catch (error) {
      console.error("Failed to save payment details:", error);
      toast.error("Failed to save payment details");
    } finally {
      setSaving(false);
    }
  }, [settings.practitionerPage, settings.paymentDetails, updateSettings]);

  const inputBase =
    "w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400 text-gray-900";

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-[#09391C] flex items-center gap-3">
          <DollarSign size={32} />
          Payment Details
        </h1>
        <p className="text-gray-600 mt-2">
          Manage your bank account for commission payments
        </p>
      </div>

      {/* Security Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
        <Lock size={20} className="text-blue-600 flex-shrink-0" />
        <div>
          <h3 className="font-semibold text-blue-900">Secure & Encrypted</h3>
          <p className="text-sm text-blue-800 mt-1">
            Your payment information is encrypted and only used for commission transfers.
          </p>
        </div>
      </div>

      {/* Payment Form */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Business Name *
          </label>
          <input
            type="text"
            value={settings.paymentDetails?.businessName || ""}
            onChange={(e) =>
              updateSettings({
                paymentDetails: {
                  ...settings.paymentDetails,
                  businessName: e.target.value,
                },
              })
            }
            className={inputBase}
            placeholder="Your Business Name"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Account Number *
          </label>
          <input
            type="text"
            value={settings.paymentDetails?.accountNumber || ""}
            onChange={(e) =>
              updateSettings({
                paymentDetails: {
                  ...settings.paymentDetails,
                  accountNumber: e.target.value,
                },
              })
            }
            className={inputBase}
            placeholder="Your account number"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Bank Code / Sort Code *
          </label>
          <input
            type="text"
            value={settings.paymentDetails?.sortCode || ""}
            onChange={(e) =>
              updateSettings({
                paymentDetails: {
                  ...settings.paymentDetails,
                  sortCode: e.target.value,
                },
              })
            }
            className={inputBase}
            placeholder="Bank code / sort code"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Primary Contact Name
            </label>
            <input
              type="text"
              value={settings.paymentDetails?.primaryContactName || ""}
              onChange={(e) =>
                updateSettings({
                  paymentDetails: {
                    ...settings.paymentDetails,
                    primaryContactName: e.target.value,
                  },
                })
              }
              className={inputBase}
              placeholder="Contact person name"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Primary Contact Email
            </label>
            <input
              type="email"
              value={settings.paymentDetails?.primaryContactEmail || ""}
              onChange={(e) =>
                updateSettings({
                  paymentDetails: {
                    ...settings.paymentDetails,
                    primaryContactEmail: e.target.value,
                  },
                })
              }
              className={inputBase}
              placeholder="contact@example.com"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Primary Contact Phone
          </label>
          <input
            type="tel"
            value={settings.paymentDetails?.primaryContactPhone || ""}
            onChange={(e) =>
              updateSettings({
                paymentDetails: {
                  ...settings.paymentDetails,
                  primaryContactPhone: e.target.value,
                },
              })
            }
            className={inputBase}
            placeholder="+234 XXX XXX XXXX"
          />
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving || !settings.practitionerPage}
          className="inline-flex items-center gap-2 px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          <Save size={18} />
          {saving ? "Saving..." : "Save Payment Details"}
        </button>
      </div>

      {!!paymentDetailsAny.subAccountCode && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-6 space-y-3">
          <h3 className="text-lg font-semibold text-emerald-900">Verified payout account</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-emerald-900">
            <p><span className="font-medium">Subaccount code:</span> {String(paymentDetailsAny.subAccountCode)}</p>
            <p><span className="font-medium">Account name:</span> {String(paymentDetailsAny.accountName || "—")}</p>
            <p><span className="font-medium">Bank name:</span> {String(paymentDetailsAny.accountBankName || "—")}</p>
            <p><span className="font-medium">Charge (%):</span> {String(paymentDetailsAny.percentageCharge ?? "—")}</p>
            <p><span className="font-medium">Verified:</span> {paymentDetailsAny.isVerified ? "Yes" : "No"}</p>
            <p><span className="font-medium">Active:</span> {paymentDetailsAny.active ? "Yes" : "No"}</p>
          </div>
        </div>
      )}
    </div>
  );
}
