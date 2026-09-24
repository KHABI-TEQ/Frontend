"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CheckCircle2, ChevronDown, Circle } from "lucide-react";
import { useDealSite } from "@/context/deal-site-context";
import { getPractitionerSetupChecklist } from "@/lib/practitioner-setup-flow";

export default function SetupProgressPanel() {
  const { settings } = useDealSite();
  const [open, setOpen] = useState(false);
  const groups = useMemo(() => getPractitionerSetupChecklist(settings), [settings]);
  const items = groups.flatMap((group) => group.items);
  const completeCount = items.filter((item) => item.complete).length;
  const incompleteCount = items.length - completeCount;
  const incompleteGroups = groups.filter((group) => !group.complete);

  return (
    <div className="rounded-xl border border-[#09391C]/10 bg-white">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left"
        aria-expanded={open}
      >
        <div>
          <p className="text-base font-semibold text-[#09391C]">Setup progress</p>
          <p className="mt-0.5 text-sm text-[#5A5D63]">
            {incompleteCount === 0
              ? "All setup groups are complete."
              : `${incompleteGroups.length} group${incompleteGroups.length === 1 ? "" : "s"} still have incomplete information · ${completeCount} of ${items.length} pages filled`}
          </p>
        </div>
        <ChevronDown
          size={20}
          className={`shrink-0 text-[#09391C] transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open ? (
        <div className="space-y-5 border-t border-[#09391C]/10 px-5 py-4">
          {groups.map((group) => (
            <div key={group.id}>
              <div className="mb-2 flex items-center gap-2">
                {group.complete ? (
                  <CheckCircle2 size={18} className="text-emerald-600" />
                ) : (
                  <Circle size={18} className="text-amber-500" />
                )}
                <h3 className="text-sm font-semibold text-[#09391C]">{group.label}</h3>
              </div>
              <ul className="space-y-1.5 pl-1">
                {group.items.map((item) => (
                  <li key={item.id}>
                    <Link
                      href={item.href}
                      className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-[#F4FBF5]"
                    >
                      {item.complete ? (
                        <CheckCircle2 size={16} className="shrink-0 text-emerald-600" />
                      ) : (
                        <Circle size={16} className="shrink-0 text-amber-500" />
                      )}
                      <span className={item.complete ? "text-[#3A3F3D]" : "font-medium text-[#09391C]"}>
                        {item.label}
                      </span>
                      <span className="ml-auto text-xs text-[#5A5D63]">
                        {item.complete ? "Complete" : "Incomplete"}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
