"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import toast from "react-hot-toast";
import { Plus, Trash2 } from "lucide-react";
import { POST_REQUEST } from "@/utils/requests";
import { URLS } from "@/utils/URLS";
import { useDealSite } from "@/context/deal-site-context";
import { goToNextPractitionerSetup } from "@/lib/practitioner-setup-flow";
import { useSetupFormDirty } from "@/hooks/useSetupFormDirty";
import { OptionalFieldsHint, SetupSaveOrSkipButton } from "@/components/public-access-page/SetupSaveOrSkipButton";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 48);
}

export default function CustomPagesSettingsPage() {
  const router = useRouter();
  const { settings, updateSettings } = useDealSite();
  const dirty = useSetupFormDirty(settings.customPages);
  const [saving, setSaving] = useState(false);
  const pages = settings.customPages || [];

  const save = async () => {
    setSaving(true);
    try {
      const token = Cookies.get("token");
      const cleaned = pages
        .map((page) => ({
          slug: slugify(page.slug || page.title || ""),
          title: String(page.title || "").trim(),
          body: String(page.body || "").trim(),
          enabled: page.enabled !== false,
        }))
        .filter((page) => page.slug && page.title);
      const res = await POST_REQUEST(`${URLS.BASE}${URLS.dealSiteUpdate}`, { customPages: cleaned }, token);
      if (res?.success) {
        updateSettings({ customPages: cleaned });
        toast.success("Custom pages saved. Enabled pages appear in the live navigation.");
        goToNextPractitionerSetup(router, "/public-access-page/custom-pages");
        return;
      } else {
        toast.error(res?.message || "Could not save custom pages");
      }
    } catch {
      toast.error("Could not save custom pages");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#09391C]">Custom pages</h1>
        <p className="mt-1 text-sm text-gray-600">
          Optional branded pages such as Terms, Careers or Office directory. Enabled pages publish at /p/your-slug and appear in the public navigation.
        </p>
        <OptionalFieldsHint />
      </div>
      <div className="space-y-4">
        {pages.map((page, index) => (
          <div key={`${page.slug}-${index}`} className="space-y-2 rounded-xl border border-gray-200 bg-white p-4">
            <div className="flex items-center justify-between gap-3">
              <label className="flex items-center gap-2 text-sm font-medium text-[#09391C]">
                <input
                  type="checkbox"
                  checked={page.enabled !== false}
                  onChange={(e) => {
                    const next = pages.map((row, i) => (i === index ? { ...row, enabled: e.target.checked } : row));
                    updateSettings({ customPages: next });
                  }}
                />
                Publish in navigation
              </label>
              <button
                type="button"
                onClick={() => updateSettings({ customPages: pages.filter((_, i) => i !== index) })}
              >
                <Trash2 className="h-4 w-4 text-red-600" />
              </button>
            </div>
            <input
              className="w-full rounded-lg border border-gray-300 px-3 py-2"
              value={page.title}
              onChange={(e) => {
                const title = e.target.value;
                const next = pages.map((row, i) =>
                  i === index ? { ...row, title, slug: row.slug || slugify(title) } : row,
                );
                updateSettings({ customPages: next });
              }}
              placeholder="Page title"
            />
            <input
              className="w-full rounded-lg border border-gray-300 px-3 py-2"
              value={page.slug}
              onChange={(e) => {
                const next = pages.map((row, i) => (i === index ? { ...row, slug: slugify(e.target.value) } : row));
                updateSettings({ customPages: next });
              }}
              placeholder="page-slug"
            />
            <p className="text-xs text-gray-500">Live URL: /p/{page.slug || "your-slug"}</p>
            <textarea
              className="w-full rounded-lg border border-gray-300 px-3 py-2"
              rows={6}
              value={page.body}
              onChange={(e) => {
                const next = pages.map((row, i) => (i === index ? { ...row, body: e.target.value } : row));
                updateSettings({ customPages: next });
              }}
              placeholder="Page content"
            />
          </div>
        ))}
      </div>
      <button
        type="button"
        className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm"
        onClick={() =>
          updateSettings({
            customPages: [...pages, { slug: "", title: "", body: "", enabled: true }],
          })
        }
      >
        <Plus className="h-4 w-4" /> Add page
      </button>
      <div>
        <SetupSaveOrSkipButton
          dirty={dirty}
          saving={saving}
          onSave={() => void save()}
          onSkip={() => goToNextPractitionerSetup(router, "/public-access-page/custom-pages")}
        />
      </div>
    </div>
  );
}
