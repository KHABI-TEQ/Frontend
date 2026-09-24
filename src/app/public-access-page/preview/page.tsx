"use client";

import { useRouter } from "next/navigation";
import { useDealSite } from "@/context/deal-site-context";
import { nextPractitionerSetupPath } from "@/lib/practitioner-setup-flow";

export default function PublicPagePreviewPage() {
  const router = useRouter();
  const { settings, previewUrl } = useDealSite();
  const fields = [
    { label: "Company description", value: settings.description, where: "Homepage intro" },
    { label: "Hero title", value: settings.practitionerPage?.heroTitle, where: "Homepage hero" },
    { label: "Hero subtitle", value: settings.practitionerPage?.heroSubtitle, where: "Homepage hero" },
    { label: "Footer description", value: settings.footer?.shortDescription, where: "Footer" },
    { label: "About — who we are", value: settings.about?.whoWeAre?.description, where: "/about" },
    { label: "Services — what we do", value: settings.about?.whatWeDo?.items?.map((i) => i.title).filter(Boolean).join(", "), where: "/services and /about" },
    { label: "Contact title", value: settings.contactUs?.title, where: "/contact" },
    { label: "Contact description", value: settings.contactUs?.description || settings.contactUs?.hero?.description, where: "/contact" },
    { label: "Office address", value: settings.contactUs?.location?.address || settings.about?.whereWeOperate?.locations?.[0]?.address, where: "Contact + About" },
    { label: "Social links", value: Object.values(settings.socialLinks || {}).filter(Boolean).join(" · "), where: "Footer" },
    { label: "FAQs", value: settings.faqs?.items?.filter((i) => i.question).map((i) => i.question).join(" · "), where: "/faq" },
    { label: "Custom pages", value: settings.customPages?.filter((p) => p.enabled !== false && p.title).map((p) => p.title).join(" · "), where: "/p/{slug}" },
  ];

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#09391C]">Preview published page</h1>
        <p className="mt-1 text-sm text-gray-600">
          This checklist mirrors the live public site. Empty fields are not shown to visitors.
        </p>
      </div>
      {previewUrl ? (
        <a
          href={`${previewUrl}?preview=1`}
          target="_blank"
          rel="noreferrer"
          className="inline-flex rounded-lg bg-[#8DDB90] px-4 py-2.5 text-sm font-semibold text-[#09391C]"
        >
          Open live preview
        </a>
      ) : (
        <p className="text-sm text-gray-600">Save branding first so we can generate your public URL.</p>
      )}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        {fields.map((field) => {
          const filled = Boolean(String(field.value || "").trim());
          return (
            <div key={field.label} className="grid gap-2 border-b border-gray-100 px-4 py-3 last:border-b-0 sm:grid-cols-[1fr_2fr_auto]">
              <p className="font-medium text-[#09391C]">{field.label}</p>
              <p className="text-sm text-gray-600 line-clamp-2">{filled ? String(field.value) : "—"}</p>
              <span className={`h-fit rounded-full px-2 py-0.5 text-xs font-semibold ${filled ? "bg-emerald-100 text-emerald-800" : "bg-gray-100 text-gray-600"}`}>
                {filled ? `Live · ${field.where}` : "Not published"}
              </span>
            </div>
          );
        })}
      </div>
      {settings.description ? (
        <section className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-800">Homepage preview</p>
          <h2 className="mt-2 text-xl font-bold text-[#09391C]">{settings.title || "Your public page"}</h2>
          <p className="mt-2 text-gray-700">{settings.description}</p>
        </section>
      ) : null}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => router.push(nextPractitionerSetupPath("/public-access-page/preview"))}
          className="inline-flex items-center justify-center rounded-lg bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
        >
          Skip
        </button>
      </div>
    </div>
  );
}
