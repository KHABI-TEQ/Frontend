"use client";

import { useEffect, useState } from "react";
import { buyerFetch, setBuyerSession } from "@/lib/search-insurance";

type Mode = "register" | "login" | "claim";

export default function BuyerAuthModal({
  open,
  onClose,
  onAuthed,
  defaultName,
  defaultEmail,
  defaultPhone,
  title,
  description,
}: {
  open: boolean;
  onClose: () => void;
  onAuthed: () => void;
  defaultName?: string;
  defaultEmail?: string;
  defaultPhone?: string;
  title?: string;
  description?: string;
}) {
  const [mode, setMode] = useState<Mode>("register");
  const [fullName, setFullName] = useState(defaultName || "");
  const [email, setEmail] = useState(defaultEmail || "");
  const [phoneNumber, setPhoneNumber] = useState(defaultPhone || "");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    setFullName(defaultName || "");
    setEmail(defaultEmail || "");
    setPhoneNumber(defaultPhone || "");
    setPassword("");
    setError("");
  }, [open, defaultName, defaultEmail, defaultPhone]);

  if (!open) return null;

  const submit = async () => {
    setError("");
    const name = fullName.trim();
    const mail = email.trim();
    const phone = phoneNumber.trim();
    if (mode !== "login") {
      if (!name) {
        setError("Full name is required.");
        return;
      }
      if (!phone) {
        setError("Phone number is required.");
        return;
      }
    }
    if (!mail) {
      setError("Email is required.");
      return;
    }
    if (!password.trim()) {
      setError("Password is required.");
      return;
    }
    if (mode !== "login" && password.trim().length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setBusy(true);
    try {
      const path =
        mode === "login"
          ? "/buyer/auth/login"
          : mode === "claim"
            ? "/buyer/auth/claim-account"
            : "/buyer/auth/register";
      const body =
        mode === "login"
          ? { email: mail, password }
          : { fullName: name, email: mail, phoneNumber: phone, password };
      const res = await buyerFetch<{ token: string; buyer: any }>(path, {
        method: "POST",
        body: JSON.stringify(body),
      });
      if (!res.success || !res.data?.token) {
        const msg = res.message || "Could not sign you in.";
        if (/guest search exists|set a password/i.test(msg)) setMode("claim");
        throw new Error(msg);
      }
      setBuyerSession(res.data.token, res.data.buyer);
      onAuthed();
    } catch (err: any) {
      setError(err?.message || "Authentication failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
        <h3 className="text-xl font-bold text-[#09391C]">
          {title || (mode === "login" ? "Sign in to continue" : "Create your account to continue")}
        </h3>
        <p className="mt-2 text-sm text-[#5A5D63]">
          {description ||
            "Your account will be used for all inspections, professional services and transactions."}
        </p>
        <div className="mt-4 space-y-3">
          {mode !== "login" ? (
            <>
              <input
                className="w-full rounded-xl border border-black/10 px-3 py-2.5 text-sm"
                placeholder="Full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
              <input
                className="w-full rounded-xl border border-black/10 px-3 py-2.5 text-sm"
                placeholder="Phone number"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
            </>
          ) : null}
          <input
            className="w-full rounded-xl border border-black/10 px-3 py-2.5 text-sm"
            placeholder="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            className="w-full rounded-xl border border-black/10 px-3 py-2.5 text-sm"
            placeholder="Password (min 6 characters)"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
        <button
          type="button"
          disabled={busy}
          onClick={() => void submit()}
          className="mt-5 inline-flex min-h-11 w-full items-center justify-center rounded-full bg-[#09391C] px-5 text-sm font-semibold text-white disabled:opacity-60"
        >
          {busy ? "Please wait..." : mode === "login" ? "Sign in" : "Continue"}
        </button>
        <div className="mt-3 flex flex-wrap justify-between gap-2 text-xs text-[#5A5D63]">
          <button type="button" onClick={() => setMode(mode === "login" ? "register" : "login")}>
            {mode === "login" ? "Need an account?" : "Already have an account?"}
          </button>
          <button type="button" onClick={() => setMode("claim")}>
            I already submitted a search
          </button>
          <button type="button" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
