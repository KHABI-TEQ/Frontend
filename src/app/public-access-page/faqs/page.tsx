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

export default function FaqsSettingsPage() {
  const router = useRouter();
  const { settings, updateSettings } = useDealSite();
  const dirty = useSetupFormDirty(settings.faqs);
  const [saving, setSaving] = useState(false);
  const faqs = settings.faqs || { title: "Frequently asked questions", items: [] };
  const items = faqs.items || [];

  const save = async () => {
    setSaving(true);
    try {
      const token = Cookies.get("token");
      const payload = {
        faqs,
        navigation: {
          items: (settings.navigation?.items || []).map((item) =>
            item.key === "faq" ? { ...item, enabled: items.some((row) => row.question && row.answer) } : item,
          ),
        },
      };
      const res = await POST_REQUEST(`${URLS.BASE}${URLS.dealSiteUpdate}`, payload, token);
      if (res?.success) {
        toast.success("FAQs saved. Enable the FAQ tab in Navigation if it is off.");
        goToNextPractitionerSetup(router, "/public-access-page/faqs");
        return;
      } else toast.error(res?.message || "Could not save FAQs");
    } catch {
      toast.error("Could not save FAQs");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#09391C]">FAQs</h1>
        <p className="mt-1 text-sm text-gray-600">These questions publish on the public /faq page when the FAQ nav item is enabled.</p>
        <OptionalFieldsHint />
      </div>
      <input
        className="w-full rounded-lg border border-gray-300 px-3 py-2"
        value={faqs.title || ""}
        onChange={(e) => updateSettings({ faqs: { ...faqs, title: e.target.value } })}
        placeholder="Frequently asked questions"
      />
      <div className="space-y-4">
        {items.map((item, index) => (
          <div key={index} className="rounded-xl border border-gray-200 bg-white p-4 space-y-2">
            <div className="flex justify-between">
              <p className="text-sm font-semibold text-[#09391C]">Question {index + 1}</p>
              <button
                type="button"
                onClick={() =>
                  updateSettings({ faqs: { ...faqs, items: items.filter((_, i) => i !== index) } })
                }
              >
                <Trash2 className="h-4 w-4 text-red-600" />
              </button>
            </div>
            <input
              className="w-full rounded-lg border border-gray-300 px-3 py-2"
              value={item.question}
              onChange={(e) => {
                const next = items.map((row, i) => (i === index ? { ...row, question: e.target.value } : row));
                updateSettings({ faqs: { ...faqs, items: next } });
              }}
              placeholder="Question"
            />
            <textarea
              className="w-full rounded-lg border border-gray-300 px-3 py-2"
              rows={3}
              value={item.answer}
              onChange={(e) => {
                const next = items.map((row, i) => (i === index ? { ...row, answer: e.target.value } : row));
                updateSettings({ faqs: { ...faqs, items: next } });
              }}
              placeholder="Answer"
            />
          </div>
        ))}
      </div>
      <button
        type="button"
        className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm"
        onClick={() => updateSettings({ faqs: { ...faqs, items: [...items, { question: "", answer: "" }] } })}
      >
        <Plus className="h-4 w-4" /> Add question
      </button>
      <div>
        <SetupSaveOrSkipButton
          dirty={dirty}
          saving={saving}
          onSave={() => void save()}
          onSkip={() => goToNextPractitionerSetup(router, "/public-access-page/faqs")}
        />
      </div>
    </div>
  );
}
