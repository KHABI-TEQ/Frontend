"use client";

import React, { useState, useCallback } from "react";
import Cookies from "js-cookie";
import toast from "react-hot-toast";
import { Lock, Save, AlertCircle } from "lucide-react";
import { POST_REQUEST } from "@/utils/requests";
import { URLS } from "@/utils/URLS";
import { useDealSite } from "@/context/deal-site-context";
import OverlayPreloader from "@/components/general-components/OverlayPreloader";

export default function SecurityPage() {
  const { settings, updateSettings } = useDealSite();
  const [preloader, setPreloader] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [formData, setFormData] = useState({
    enablePasswordProtection:
      settings.securitySettings?.enablePasswordProtection ?? false,
    pagePassword: settings.securitySettings?.pagePassword || "",
    enableRateLimiting: settings.securitySettings?.enableRateLimiting ?? true,
    enableSpamFilter: settings.securitySettings?.enableSpamFilter ?? true,
    requireEmailVerification:
      settings.securitySettings?.requireEmailVerification ?? false,
  });

  const handleInputChange = useCallback((field: string, value: string | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  const handleSave = useCallback(async () => {
    if (formData.enablePasswordProtection && !formData.pagePassword) {
      toast.error("Please set a password when password protection is enabled");
      return;
    }

    setPreloader(true);
    try {
      const token = Cookies.get("token");
      const payload = {
        securitySettings: formData,
      };

      const res = await POST_REQUEST(
        `${URLS.BASE}/account/dealSite/update`,
        payload,
        token
      );

      if (res?.success) {
        updateSettings(payload as any);
        toast.success("Security settings saved");
      } else {
        toast.error(res?.message || "Failed to save settings");
      }
    } catch (error) {
      toast.error("Failed to save security settings");
    } finally {
      setPreloader(false);
    }
  }, [formData, updateSettings]);

  const handleResetPage = useCallback(async () => {
    setPreloader(true);
    try {
      const token = Cookies.get("token");
      const res = await POST_REQUEST(
        `${URLS.BASE}/account/dealSite/resetSecurity`,
        {},
        token
      );

      if (res?.success) {
        toast.success("Security settings reset to defaults");
        setFormData({
          enablePasswordProtection: false,
          pagePassword: "",
          enableRateLimiting: true,
          enableSpamFilter: true,
          requireEmailVerification: false,
        });
      } else {
        toast.error(res?.message || "Failed to reset settings");
      }
    } catch (error) {
      toast.error("Failed to reset security settings");
    } finally {
      setPreloader(false);
      setShowResetConfirm(false);
    }
  }, []);

  return (
    <div className="space-y-8">
      <OverlayPreloader visible={preloader} message="Processing..." />

      <div>
        <h1 className="text-3xl font-bold text-[#09391C] flex items-center gap-3">
          <Lock size={32} />
          Security
        </h1>
        <p className="text-gray-600 mt-2">Manage security settings for your public page</p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="enable-password"
              checked={formData.enablePasswordProtection}
              onChange={(e) =>
                handleInputChange("enablePasswordProtection", e.target.checked)
              }
              className="w-4 h-4 text-emerald-600 rounded mt-1"
            />
            <div className="flex-1">
              <label htmlFor="enable-password" className="text-sm font-medium text-gray-700">
                Password Protect Page
              </label>
              <p className="text-xs text-gray-500 mt-1">
                Require visitors to enter a password to access your page
              </p>
            </div>
          </div>

          {formData.enablePasswordProtection && (
            <div className="ml-7">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Page Password
              </label>
              <input
                type="password"
                value={formData.pagePassword}
                onChange={(e) => handleInputChange("pagePassword", e.target.value)}
                placeholder="Enter a strong password"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-200"
              />
            </div>
          )}
        </div>

        <div className="border-t border-gray-200 pt-6 space-y-3">
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="rate-limiting"
              checked={formData.enableRateLimiting}
              onChange={(e) =>
                handleInputChange("enableRateLimiting", e.target.checked)
              }
              className="w-4 h-4 text-emerald-600 rounded mt-1"
            />
            <div className="flex-1">
              <label htmlFor="rate-limiting" className="text-sm font-medium text-gray-700">
                Rate Limiting
              </label>
              <p className="text-xs text-gray-500 mt-1">
                Prevent abuse by limiting requests from single IP addresses
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="spam-filter"
              checked={formData.enableSpamFilter}
              onChange={(e) =>
                handleInputChange("enableSpamFilter", e.target.checked)
              }
              className="w-4 h-4 text-emerald-600 rounded mt-1"
            />
            <div className="flex-1">
              <label htmlFor="spam-filter" className="text-sm font-medium text-gray-700">
                Spam Filter
              </label>
              <p className="text-xs text-gray-500 mt-1">
                Automatically filter spam submissions in contact forms
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="require-verification"
              checked={formData.requireEmailVerification}
              onChange={(e) =>
                handleInputChange("requireEmailVerification", e.target.checked)
              }
              className="w-4 h-4 text-emerald-600 rounded mt-1"
            />
            <div className="flex-1">
              <label htmlFor="require-verification" className="text-sm font-medium text-gray-700">
                Require Email Verification
              </label>
              <p className="text-xs text-gray-500 mt-1">
                Verify email addresses in contact form submissions
              </p>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex gap-2">
            <AlertCircle size={18} className="text-blue-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-blue-800">
              <strong>Recommended:</strong> Enable rate limiting and spam filter to protect against abuse.
            </p>
          </div>
        </div>

        <div className="flex justify-between gap-3 pt-4 border-t border-gray-200">
          <button
            onClick={() => setShowResetConfirm(true)}
            className="px-4 py-2 border border-red-300 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 transition-all"
          >
            Reset to Defaults
          </button>

          <button
            onClick={handleSave}
            className="inline-flex items-center gap-2 px-6 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-all"
          >
            <Save size={18} />
            Save Changes
          </button>
        </div>
      </div>

      {showResetConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-sm w-full p-6 space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Reset Security Settings?</h3>
            <p className="text-sm text-gray-600">
              This will reset all security settings to their default values. This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleResetPage}
                className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-all"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
