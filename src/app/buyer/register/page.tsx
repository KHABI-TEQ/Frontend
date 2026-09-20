"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import BuyerShell from "@/components/search-insurance/BuyerShell";
import { buyerFetch, setBuyerSession } from "@/lib/search-insurance";

export default function BuyerRegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (path: "/buyer/auth/register" | "/buyer/auth/claim-account") => {
    setBusy(true);
    setError("");
    const res = await buyerFetch<{ token: string; buyer: any }>(path, {
      method: "POST",
      body: JSON.stringify({ fullName, email, phoneNumber, password }),
    });
    setBusy(false);
    if (!res.success || !res.data?.token) {
      setError(res.message || "Could not create account");
      return;
    }
    setBuyerSession(res.data.token, res.data.buyer);
    router.push("/buyer/searches");
  };

  return (
    <BuyerShell title="Create a buyer account">
      <div className="rounded-3xl bg-white p-6 shadow-sm">
        <p className="text-sm text-[#5A5D63]">
          Required to insure a search and file a claim of up to ₦2,000,000 with evidence.
        </p>
        <div className="mt-4 space-y-3">
          <input className="w-full rounded-xl border border-black/10 px-3 py-2.5 text-sm" placeholder="Full name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
          <input className="w-full rounded-xl border border-black/10 px-3 py-2.5 text-sm" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input className="w-full rounded-xl border border-black/10 px-3 py-2.5 text-sm" placeholder="Phone number" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />
          <input className="w-full rounded-xl border border-black/10 px-3 py-2.5 text-sm" placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
        <button type="button" disabled={busy} onClick={() => void submit("/buyer/auth/register")} className="mt-5 inline-flex min-h-11 w-full items-center justify-center rounded-full bg-[#09391C] text-sm font-semibold text-white">
          {busy ? "Creating..." : "Create account"}
        </button>
        <button type="button" disabled={busy} onClick={() => void submit("/buyer/auth/claim-account")} className="mt-2 inline-flex min-h-11 w-full items-center justify-center rounded-full border border-black/10 text-sm font-semibold text-[#09391C]">
          I already submitted a guest search
        </button>
        <p className="mt-4 text-sm text-[#5A5D63]">
          Already registered? <Link className="font-semibold text-[#09391C]" href="/buyer/login">Sign in</Link>
        </p>
      </div>
    </BuyerShell>
  );
}
