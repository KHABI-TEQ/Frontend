"use client";

import Link from "next/link";

export type JourneyStep = {
  key: string;
  title: string;
  state: "done" | "current" | "upcoming";
  detail: string;
  action?: { label: string; href: string } | null;
};

export function JourneyTrail({
  steps,
  hideActionFor,
}: {
  steps: JourneyStep[];
  hideActionFor?: string;
}) {
  return (
    <ol className="space-y-0">
      {steps.map((step, index) => {
        const current = step.state === "current";
        const done = step.state === "done";
        const showAction = current && step.action && step.key !== hideActionFor;
        return (
          <li key={step.key} className="flex gap-3">
            <div className="flex flex-col items-center">
              <span
                className={`mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                  done
                    ? "bg-[#09391C] text-white"
                    : current
                      ? "bg-[#8DDB90] text-[#09391C]"
                      : "bg-[#EEF1F1] text-[#5A5D63]"
                }`}
              >
                {done ? "✓" : index + 1}
              </span>
              {index < steps.length - 1 ? <span className="w-px flex-1 bg-black/10" /> : null}
            </div>
            <div className={`min-w-0 flex-1 pb-5 ${current ? "" : ""}`}>
              <p className={`text-sm font-semibold ${current ? "text-[#09391C]" : "text-[#5A5D63]"}`}>
                {step.title}
              </p>
              <p className="mt-1 text-sm text-[#5A5D63]">{step.detail}</p>
              {showAction ? (
                <Link
                  href={step.action!.href}
                  className="mt-3 inline-flex rounded-full bg-[#09391C] px-4 py-2 text-sm font-semibold text-white"
                >
                  {step.action!.label}
                </Link>
              ) : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
