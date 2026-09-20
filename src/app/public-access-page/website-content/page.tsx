"use client";

import Link from "next/link";
import { BookOpen, Mail, Share2, HelpCircle, Compass, Eye, MapPin, FileText } from "lucide-react";
import { useDealSite } from "@/context/deal-site-context";

const LINKS = [
  { href: "/public-access-page/about", label: "About Us", hint: "Who we are, mission, services, offices, team", icon: BookOpen },
  { href: "/public-access-page/contact-us", label: "Contact Us", hint: "Contact copy, office map, form and WhatsApp", icon: Mail },
  { href: "/public-access-page/social", label: "Social links", hint: "Website, Instagram, Facebook, LinkedIn, X", icon: Share2 },
  { href: "/public-access-page/faqs", label: "FAQs", hint: "Questions published on /faq", icon: HelpCircle },
  { href: "/public-access-page/custom-pages", label: "Custom pages", hint: "Optional extra pages such as Terms or Careers", icon: FileText },
  { href: "/public-access-page/navigation", label: "Navigation", hint: "Choose which tabs appear on the live site", icon: Compass },
  { href: "/public-access-page/preview", label: "Preview published page", hint: "See which fields are live and open the site", icon: Eye },
];

export default function WebsiteContentHubPage() {
  const { settings } = useDealSite();
  const aboutReady = Boolean(settings.about?.whoWeAre?.description);
  const contactReady = Boolean(settings.contactUs?.title || settings.contactUs?.description);
  const socialReady = Object.values(settings.socialLinks || {}).some(Boolean);
  const faqReady = (settings.faqs?.items || []).some((item) => item.question && item.answer);
  const customReady = (settings.customPages || []).some((page) => page.enabled !== false && page.slug && page.title);
  const descReady = Boolean(settings.description?.trim());
  const footerReady = Boolean(settings.footer?.shortDescription?.trim());
  const officeReady = Boolean(settings.about?.whereWeOperate?.locations?.length || settings.contactUs?.location?.address);

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#09391C]">Website content</h1>
        <p className="mt-1 text-sm text-gray-600">
          Add the business information that appears on your public page. Every field here is saved to the server and rendered on the live site when filled.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <StatusCard title="Company description" published={descReady} where="Homepage intro + search snippet" />
        <StatusCard title="Footer blurb" published={footerReady} where="Footer on every public page" />
        <StatusCard title="About Us" published={aboutReady} where="/about" />
        <StatusCard title="Contact Us" published={contactReady} where="/contact" />
        <StatusCard title="Office / locations" published={officeReady} where="About + Contact map" />
        <StatusCard title="Social links" published={socialReady} where="Footer icons" />
        <StatusCard title="FAQs" published={faqReady} where="/faq (enable in Navigation)" />
        <StatusCard title="Custom pages" published={customReady} where="/p/{slug}" />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {LINKS.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-start gap-3 rounded-xl border border-gray-200 bg-white p-4 hover:border-emerald-300 hover:bg-emerald-50/40"
            >
              <Icon className="mt-0.5 h-5 w-5 text-emerald-700" />
              <span>
                <span className="block font-semibold text-[#09391C]">{item.label}</span>
                <span className="block text-sm text-gray-600">{item.hint}</span>
              </span>
            </Link>
          );
        })}
        <div className="flex items-start gap-3 rounded-xl border border-dashed border-gray-200 p-4 text-sm text-gray-600">
          <MapPin className="mt-0.5 h-5 w-5 text-emerald-700" />
          <span>Office addresses are edited in About Us (Where we operate) and Contact Us (map location).</span>
        </div>
      </div>
    </div>
  );
}

function StatusCard({ title, published, where }: { title: string; published: boolean; where: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <div className="flex items-center justify-between gap-2">
        <p className="font-semibold text-[#09391C]">{title}</p>
        <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${published ? "bg-emerald-100 text-emerald-800" : "bg-gray-100 text-gray-600"}`}>
          {published ? "Published" : "Not filled"}
        </span>
      </div>
      <p className="mt-1 text-xs text-gray-500">{where}</p>
    </div>
  );
}
