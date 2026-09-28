"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import BuyerShell from "@/components/search-insurance/BuyerShell";
import PasswordField from "@/components/common/PasswordField";
import { buyerFetch, setBuyerSession } from "@/lib/search-insurance";

export default function BuyerLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [registerHref, setRegisterHref] = useState("/buyer/register");

  useEffect(() => {
    const next = new URLSearchParams(window.location.search).get("next");
    if (next && next.startsWith("/") && !next.startsWith("//")) {
      setRegisterHref(`/buyer/register?next=${encodeURIComponent(next)}`);
    }
  }, []);

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
    const next = new URLSearchParams(window.location.search).get("next");
    router.push(next && next.startsWith("/") && !next.startsWith("//") ? next : "/buyer");
  };

  return (
    <BuyerShell title="Sign in">
      <div className="rounded-3xl bg-white p-6 shadow-sm">
        <div className="space-y-3">
          <input className="w-full rounded-xl border border-black/10 px-3 py-2.5 text-sm" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <PasswordField value={password} onChange={setPassword} />
        </div>
        {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
        <button type="button" disabled={busy} onClick={() => void submit()} className="mt-5 inline-flex min-h-11 w-full items-center justify-center rounded-full bg-[#09391C] text-sm font-semibold text-white">
          {busy ? "Signing in..." : "Sign in"}
        </button>
        <p className="mt-4 text-sm text-[#5A5D63]">
          <Link className="font-semibold text-[#09391C]" href="/buyer/forgot-password">Forgot password?</Link>
        </p>
        <p className="mt-2 text-sm text-[#5A5D63]">
          New here? <Link className="font-semibold text-[#09391C]" href={registerHref}>Create a buyer account</Link>
        </p>
      </div>
    </BuyerShell>
  );
}
