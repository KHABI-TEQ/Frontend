import MarketingShell from "@/components/landing/MarketingShell";
import Link from "next/link";

export const metadata = {
  title: "Become a Property Scout | Khabiteq",
  description:
    "Join Khabiteq as a Property Scout and participate in property opportunities without needing a professional real estate licence. KYC and listing approval are separate.",
};

const kycFlow = [
  "Create account",
  "KYC",
  "KYC review",
  "KYC verified",
  "Submit property opportunity",
  "Khabiteq listing review",
  "Approved",
  "Listing goes live",
];

const listingStatuses = ["Draft", "Submitted", "Under Review", "Action Required", "Approved", "Live", "Rejected"];

export default function PropertyScoutPage() {
  return (
    <MarketingShell
      eyebrow="Standalone pathway"
      title="Become a Property Scout"
      intro="Know about a property opportunity? Join Khabiteq as a Property Scout and participate in property opportunities without needing a professional real estate licence."
    >
      <p className="text-[#5A5D63] leading-relaxed">
        Property Scout is a standalone entry pathway. You do not need to register as an Agent or Developer.
      </p>
      <section className="rounded-2xl bg-[#F5F7F9] p-6">
        <h2 className="text-xl font-bold text-[#09391C]">KYC before a listing can go live</h2>
        <ol className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
          {kycFlow.map((step, index) => (
            <li key={step} className="text-sm text-[#09391C]">
              <span className="font-semibold text-[#8DDB90]">{String(index + 1).padStart(2, "0")}</span> {step}
            </li>
          ))}
        </ol>
        <p className="mt-4 text-sm text-[#5A5D63]">
          KYC verification and property listing approval are separate processes. KYC approval does not automatically make a property listing approved.
        </p>
      </section>
      <section>
        <h2 className="text-xl font-bold text-[#09391C]">Listing statuses</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {listingStatuses.map((status) => (
            <span key={status} className="rounded-full bg-white border border-gray-100 px-3 py-1.5 text-sm text-[#09391C]">
              {status}
            </span>
          ))}
        </div>
      </section>
      <Link
        href="/auth/register?intent=scout"
        className="inline-flex min-h-12 items-center rounded-full bg-[#09391C] px-6 font-semibold text-white"
      >
        Create account
      </Link>
    </MarketingShell>
  );
}
