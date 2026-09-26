"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import BuyerShell from "@/components/search-insurance/BuyerShell";
import {
  buyerFetch,
  getBuyerProfile,
  getBuyerToken,
  setBuyerSession,
  type BuyerProfile,
} from "@/lib/search-insurance";

export default function BuyerProfilePage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [enableNotifications, setEnableNotifications] = useState(true);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!getBuyerToken()) {
      router.replace("/buyer/login?next=/buyer/profile");
      return;
    }
    buyerFetch<{ buyer: BuyerProfile }>("/buyer/auth/me").then((res) => {
      const buyer = res.data?.buyer || getBuyerProfile();
      if (!buyer) return;
      setFullName(buyer.fullName || "");
      setEmail(buyer.email || "");
      setPhoneNumber(buyer.phoneNumber || "");
      setEnableNotifications(buyer.enableNotifications !== false);
      if (res.data?.buyer) setBuyerSession(getBuyerToken() || "", res.data.buyer);
    });
  }, [router]);

  const save = async () => {
    setBusy(true);
    setError("");
    setMessage("");
    const body: Record<string, unknown> = {
      fullName,
      email,
      phoneNumber,
      enableNotifications,
    };
    if (newPassword.trim()) {
      body.currentPassword = currentPassword;
      body.newPassword = newPassword;
    }
    const res = await buyerFetch<{ buyer: BuyerProfile; token?: string }>("/buyer/auth/profile", {
      method: "PUT",
      body: JSON.stringify(body),
    });
    setBusy(false);
    if (!res.success || !res.data?.buyer) {
      setError(res.message || "Could not update profile.");
      return;
    }
    setBuyerSession(res.data.token || getBuyerToken() || "", res.data.buyer);
    setCurrentPassword("");
    setNewPassword("");
    setMessage("Profile updated.");
  };

  return (
    <BuyerShell title="My Profile" subtitle="Personal details, change password, and notification settings.">
      <div className="max-w-xl rounded-3xl bg-white p-6 shadow-sm">
        <div className="space-y-3">
          <input className="w-full rounded-xl border border-black/10 px-3 py-2.5 text-sm" placeholder="Full name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
          <input className="w-full rounded-xl border border-black/10 px-3 py-2.5 text-sm" placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input className="w-full rounded-xl border border-black/10 px-3 py-2.5 text-sm" placeholder="Phone number" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />
        </div>
        <label className="mt-5 flex items-center gap-3 text-sm text-[#09391C]">
          <input type="checkbox" checked={enableNotifications} onChange={(e) => setEnableNotifications(e.target.checked)} />
          Email and in-app notifications
        </label>
        <div className="mt-6 border-t border-black/5 pt-5">
          <p className="text-sm font-semibold text-[#09391C]">Change password</p>
          <div className="mt-3 space-y-3">
            <input className="w-full rounded-xl border border-black/10 px-3 py-2.5 text-sm" placeholder="Current password" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
            <input className="w-full rounded-xl border border-black/10 px-3 py-2.5 text-sm" placeholder="New password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
          </div>
        </div>
        {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
        {message ? <p className="mt-3 text-sm text-emerald-700">{message}</p> : null}
        <button type="button" disabled={busy} onClick={() => void save()} className="mt-5 inline-flex min-h-11 w-full items-center justify-center rounded-full bg-[#09391C] text-sm font-semibold text-white disabled:opacity-60">
          {busy ? "Saving..." : "Save changes"}
        </button>
      </div>
    </BuyerShell>
  );
}
