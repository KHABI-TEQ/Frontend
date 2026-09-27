"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import BuyerShell from "@/components/search-insurance/BuyerShell";
import PasswordField from "@/components/common/PasswordField";
import { buyerFetch } from "@/lib/search-insurance";

export default function BuyerForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<"email" | "code" | "reset">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const requestCode = async () => {
    setBusy(true);
    setError("");
    const res = await buyerFetch("/buyer/auth/reset-password-request", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
    setBusy(false);
    if (!res.success) {
      setError(res.message || "Could not send a reset code.");
      return;
    }
    setStep("code");
  };

  const verifyCode = async () => {
    setBusy(true);
    setError("");
    const res = await buyerFetch("/buyer/auth/verify-reset-code", {
      method: "POST",
      body: JSON.stringify({ email, token: code }),
    });
    setBusy(false);
    if (!res.success) {
      setError(res.message || "That code is not valid.");
      return;
    }
    setStep("reset");
  };

  const reset = async () => {
    setBusy(true);
    setError("");
    const res = await buyerFetch("/buyer/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ email, token: code, newPassword: password }),
    });
    setBusy(false);
    if (!res.success) {
      setError(res.message || "Could not update the password.");
      return;
    }
    router.push("/buyer/login");
  };

  return (
    <BuyerShell title="Reset your password" subtitle="We’ll email a 6-digit code to the address on your client account.">
      <div className="max-w-md rounded-3xl bg-white p-6 shadow-sm">
        {step === "email" ? (
          <label className="block text-sm">
            <span className="font-semibold text-[#09391C]">Email</span>
            <input
              className="mt-1 w-full rounded-xl border border-black/10 px-3 py-2.5"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </label>
        ) : null}
        {step === "code" ? (
          <label className="block text-sm">
            <span className="font-semibold text-[#09391C]">Reset code</span>
            <input
              className="mt-1 w-full rounded-xl border border-black/10 px-3 py-2.5 tracking-[0.3em]"
              inputMode="numeric"
              value={code}
              onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
            />
          </label>
        ) : null}
        {step === "reset" ? (
          <PasswordField
            value={password}
            onChange={setPassword}
            placeholder="New password"
            autoComplete="new-password"
          />
        ) : null}
        {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
        <button
          type="button"
          disabled={busy}
          onClick={() => void (step === "email" ? requestCode() : step === "code" ? verifyCode() : reset())}
          className="mt-5 inline-flex min-h-11 w-full items-center justify-center rounded-full bg-[#09391C] text-sm font-semibold text-white disabled:opacity-60"
        >
          {busy ? "Please wait..." : step === "email" ? "Send code" : step === "code" ? "Continue" : "Save password"}
        </button>
        <p className="mt-4 text-sm text-[#5A5D63]">
          <Link className="font-semibold text-[#09391C]" href="/buyer/login">Back to sign in</Link>
        </p>
      </div>
    </BuyerShell>
  );
}
