"use client";

import React, { useState, useCallback } from "react";
import Cookies from "js-cookie";
import toast from "react-hot-toast";
import { CheckSquare, Save } from "lucide-react";
import { POST_REQUEST } from "@/utils/requests";
import { URLS } from "@/utils/URLS";
import { useDealSite } from "@/context/deal-site-context";
import OverlayPreloader from "@/components/general-components/OverlayPreloader";

export default function InspectionPage() {
  const { settings, updateSettings } = useDealSite();
  const [preloader, setPreloader] = useState(false);
  const [formData, setFormData] = useState({
    allowPublicBooking: settings.inspectionSettings?.allowPublicBooking ?? true,
    defaultInspectionFee: settings.inspectionSettings?.defaultInspectionFee || "",
    negotiationEnabled: settings.inspectionSettings?.negotiationEnabled ?? true,
  });

  const handleInputChange = useCallback((field: string, value: any) => {
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
        inspectionSettings: formData,
      };

      const res = await POST_REQUEST(
        `${URLS.BASE}${URLS.dealSiteUpdate}`,
        payload,
        token
      );

      if (res?.success) {
        updateSettings(payload as any);
        toast.success("Inspection settings saved");
      } else {
        toast.error(res?.message || "Failed to save settings");
      }
    } catch (error) {
      toast.error("Failed to save inspection settings");
    } finally {
      setPreloader(false);
    }
  }, [formData, updateSettings]);

  return (
    <div className="space-y-8">
      <OverlayPreloader visible={preloader} message="Saving..." />

      <div>
        <h1 className="text-3xl font-bold text-[#09391C] flex items-center gap-3">
          <CheckSquare size={32} />
          Inspection Settings
        </h1>
        <p className="text-gray-600 mt-2">Manage inspection booking and fees</p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Default Inspection Fee
          </label>
          <div className="flex items-center gap-2">
            <span className="text-gray-600 font-medium">₦</span>
            <input
              type="number"
              value={formData.defaultInspectionFee}
              onChange={(e) => handleInputChange("defaultInspectionFee", e.target.value)}
              placeholder="50000"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-200"
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">Leave empty for no default fee</p>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="allow-public-booking"
              checked={formData.allowPublicBooking}
              onChange={(e) => handleInputChange("allowPublicBooking", e.target.checked)}
              className="w-4 h-4 text-emerald-600 rounded"
            />
            <label htmlFor="allow-public-booking" className="text-sm font-medium text-gray-700">
              Allow public users to book inspections
            </label>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="negotiation-enabled"
              checked={formData.negotiationEnabled}
              onChange={(e) => handleInputChange("negotiationEnabled", e.target.checked)}
              className="w-4 h-4 text-emerald-600 rounded"
            />
            <label htmlFor="negotiation-enabled" className="text-sm font-medium text-gray-700">
              Enable inspection fee negotiation
            </label>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <strong>Tip:</strong> Inspection fees help verify genuine buyers and reduce no-shows.
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
