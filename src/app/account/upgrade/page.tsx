"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import CombinedAuthGuard from "@/logic/combinedAuthGuard";
import { POST_REQUEST } from "@/utils/requests";
import { URLS } from "@/utils/URLS";
import Cookies from "js-cookie";
import toast from "react-hot-toast";

const ROLES = [
  { id: "Agent", label: "Agent", hint: "Licensed real estate agent" },
  { id: "Developer", label: "Developer", hint: "Property developer" },
  { id: "Lawyer", label: "Lawyer", hint: "Property lawyer" },
  { id: "Surveyor", label: "Surveyor", hint: "Land surveyor" },
  { id: "Valuer", label: "Valuer", hint: "Property valuer" },
] as const;

export default function UpgradeAccountPage() {
  const router = useRouter();
  const [selected, setSelected] = useState<string>("");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!selected) {
      toast.error("Select a professional role");
      return;
    }
    setBusy(true);
    try {
      const res = await POST_REQUEST(
        `${URLS.BASE}${URLS.professionalUpgrade}`,
        { professionalType: selected },
        Cookies.get("token"),
      );
      if (!res?.success) {
        toast.error((res as { error?: string })?.error || "Upgrade could not start");
        return;
      }
      const kycPath = (res.data as { kycPath?: string })?.kycPath || "/dashboard";
      toast.success("Upgrade started. Complete professional verification.");
      router.push(kycPath);
    } finally {
      setBusy(false);
    }
  };

  return (
    <CombinedAuthGuard requireAuth allowedUserTypes={["PropertyScout"]}>
      <div className="min-h-screen bg-[#EEF1F1] px-4 py-10">
        <div className="mx-auto max-w-2xl rounded-2xl bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-bold text-[#09391C]">Upgrade Your Account</h1>
          <p className="mt-2 text-sm text-[#5A5D63]">
            Become a Verified Professional. You keep this same account. After KYC and credential verification you can publish eligible listings directly.
          </p>
          <div className="mt-6 grid gap-3">
            {ROLES.map((role) => (
              <label
                key={role.id}
                className={`flex cursor-pointer items-center justify-between rounded-xl border-2 px-4 py-3 ${
                  selected === role.id ? "border-[#8DDB90] bg-[#8DDB90]/10" : "border-gray-100"
                }`}
              >
                <span>
                  <span className="block font-semibold text-[#09391C]">{role.label}</span>
                  <span className="text-xs text-[#5A5D63]">{role.hint}</span>
                </span>
                <input
                  type="radio"
                  name="professionalType"
                  value={role.id}
                  checked={selected === role.id}
                  onChange={() => setSelected(role.id)}
                />
              </label>
            ))}
          </div>
          <button
            type="button"
            disabled={busy}
            onClick={() => void submit()}
            className="mt-6 w-full rounded-xl bg-[#09391C] py-3 text-sm font-semibold text-white disabled:opacity-60"
          >
            Continue
          </button>
        </div>
      </div>
    </CombinedAuthGuard>
  );
}
