import MarketingShell from "@/components/landing/MarketingShell";
import Link from "next/link";

export const metadata = {
  title: "How It Works | Khabiteq",
  description:
    "Khabiteq structures the real estate journey: find, match, connect, due diligence, inspect, transact, register, keep a digital trail, and report when necessary.",
};

const stages = [
  ["01", "Tell us what you need", "Submit your property preference by voice or text."],
  ["02", "Get matched", "Receive relevant property opportunities based on your requirements."],
  ["03", "Connect with the right professional", "Engage with the relevant agent, developer or other professional."],
  ["04", "Do your due diligence", "Connect directly with the appropriate lawyer, surveyor, valuer or other qualified professional. Khabiteq does not perform professional document verification itself."],
  ["05", "Inspect", "Book a physical or virtual inspection where applicable."],
  ["06", "Transact", "Proceed with the relevant parties."],
  ["07", "Register", "Register eligible transactions through Khabiteq and create a structured transaction record."],
  ["08", "Keep your digital trail", "Maintain relevant records of your transaction journey."],
  ["09", "Report & escalate", "Access the applicable reporting and escalation pathway if a serious issue arises."],
];

export default function HowItWorksPage() {
  return (
    <MarketingShell
      eyebrow="The Khabiteq journey"
      title="Your property journey, structured."
      intro="Khabiteq is digital infrastructure built around the real estate transaction journey — not a conventional listing marketplace."
    >
      <ol className="space-y-4">
        {stages.map(([n, title, text]) => (
          <li key={n} className="rounded-2xl border border-gray-100 bg-white p-5">
            <p className="text-xs font-bold tracking-[0.16em] text-[#8DDB90]">STAGE {n}</p>
            <h2 className="mt-1 text-xl font-bold text-[#09391C]">{title}</h2>
            <p className="mt-2 text-[#5A5D63]">{text}</p>
          </li>
        ))}
      </ol>
      <div className="flex flex-wrap gap-3">
        <Link href="/preference" className="inline-flex min-h-12 items-center rounded-full bg-[#09391C] px-6 font-semibold text-white">
          Submit your preference
        </Link>
        <Link href="/property-code" className="inline-flex min-h-12 items-center rounded-full border border-[#09391C]/20 px-6 font-semibold text-[#09391C]">
          I have a Property Code
        </Link>
      </div>
    </MarketingShell>
  );
}
