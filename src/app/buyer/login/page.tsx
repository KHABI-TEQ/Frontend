"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import BuyerShell from "@/components/search-insurance/BuyerShell";
import { buyerFetch, setBuyerSession } from "@/lib/search-insurance";

export default function BuyerLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setBusy(true);
    setError("");
    const res = await buyerFetch<{ token: string; buyer: any }>("/buyer/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    setBusy(false);
    if (!res.success || !res.data?.token) {
      setError(res.message || "Login failed");
      return;
    }
    setBuyerSession(res.data.token, res.data.buyer);
    const next =
      typeof window !== "undefined"
        ? new URLSearchParams(window.location.search).get("next")
        : null;
    router.push(next || "/buyer/searches");
  };

  return (
    <BuyerShell title="Sign in">
      <div className="rounded-3xl bg-white p-6 shadow-sm">
        <div className="space-y-3">
          <input className="w-full rounded-xl border border-black/10 px-3 py-2.5 text-sm" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input className="w-full rounded-xl border border-black/10 px-3 py-2.5 text-sm" placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
        <button type="button" disabled={busy} onClick={() => void submit()} className="mt-5 inline-flex min-h-11 w-full items-center justify-center rounded-full bg-[#09391C] text-sm font-semibold text-white">
          {busy ? "Signing in..." : "Sign in"}
        </button>
        <p className="mt-4 text-sm text-[#5A5D63]">
          New here? <Link className="font-semibold text-[#09391C]" href="/buyer/register">Create a buyer account</Link>
        </p>
      </div>
    </BuyerShell>
  );
}
