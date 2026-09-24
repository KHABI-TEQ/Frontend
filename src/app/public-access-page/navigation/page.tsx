"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import toast from "react-hot-toast";
import { POST_REQUEST } from "@/utils/requests";
import { URLS } from "@/utils/URLS";
import { useDealSite } from "@/context/deal-site-context";
import { goToNextPractitionerSetup } from "@/lib/practitioner-setup-flow";

const DEFAULT_ITEMS = [
  { key: "home", label: "Home", href: "/", enabled: true },
  { key: "properties", label: "Properties", href: "/market-place", enabled: true },
  { key: "about", label: "About Us", href: "/about", enabled: true },
  { key: "services", label: "Services", href: "/services", enabled: true },
  { key: "faq", label: "FAQ", href: "/faq", enabled: false },
  { key: "contact", label: "Contact Us", href: "/contact", enabled: true },
  { key: "preferences", label: "Submit Preference", href: "/preferences", enabled: true },
  { key: "transaction-registration", label: "Transaction registration", href: "/transaction-registration", enabled: true },
];

export default function NavigationSettingsPage() {
  const router = useRouter();
  const { settings, updateSettings } = useDealSite();
  const [saving, setSaving] = useState(false);
  const items = useMemo(() => {
    const current = settings.navigation?.items;
    return current && current.length ? current : DEFAULT_ITEMS;
  }, [settings.navigation?.items]);

  const setItems = (next: typeof DEFAULT_ITEMS) => updateSettings({ navigation: { items: next } });

  const save = async () => {
    setSaving(true);
    try {
      const token = Cookies.get("token");
      const res = await POST_REQUEST(`${URLS.BASE}${URLS.dealSiteUpdate}`, { navigation: { items } }, token);
      if (res?.success) {
        toast.success("Navigation saved. It will appear on the live public page.");
        goToNextPractitionerSetup(router, "/public-access-page/navigation");
        return;
      } else toast.error(res?.message || "Could not save navigation");
    } catch {
      toast.error("Could not save navigation");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#09391C]">Public page navigation</h1>
        <p className="mt-1 text-sm text-gray-600">
          Choose which tabs appear on your white-label site. Disabled items stay off the published menu.
        </p>
      </div>
      <div className="space-y-3 rounded-xl border border-gray-200 bg-white p-4">
        {items.map((item, index) => (
          <label key={`${item.key}-${index}`} className="flex items-center justify-between gap-3 rounded-lg border border-gray-100 px-3 py-2">
            <span>
              <span className="block font-medium text-[#09391C]">{item.label}</span>
              <span className="block text-xs text-gray-500">{item.href}</span>
            </span>
            <input
              type="checkbox"
              checked={item.enabled !== false}
              onChange={(e) => {
                const next = items.map((row, i) => (i === index ? { ...row, enabled: e.target.checked } : row));
                setItems(next);
              }}
            />
          </label>
        ))}
      </div>
      <button
        type="button"
        onClick={save}
        disabled={saving}
        className="rounded-lg bg-[#8DDB90] px-4 py-2.5 text-sm font-semibold text-[#09391C] disabled:opacity-60"
      >
        {saving ? "Saving…" : "Save navigation"}
      </button>
    </div>
  );
}
