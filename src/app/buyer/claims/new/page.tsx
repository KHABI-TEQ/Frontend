"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import BuyerShell from "@/components/search-insurance/BuyerShell";
import { URLS } from "@/utils/URLS";
import { buyerFetch, getBuyerToken } from "@/lib/search-insurance";

export default function NewSearchInsuranceClaimPage() {
  const router = useRouter();
  const [policyId, setPolicyId] = useState("");
  const [description, setDescription] = useState("");
  const [practitionerName, setPractitionerName] = useState("");
  const [evidence, setEvidence] = useState<Array<{ url: string; publicId?: string; kind?: string; name?: string }>>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("policyId") || "";
    setPolicyId(id);
    if (!getBuyerToken()) router.replace("/buyer/login?next=/buyer/claims/new");
  }, [router]);

  const uploadFile = async (file: File) => {
    const form = new FormData();
    form.append("file", file);
    form.append("for", "identity-doc");
    const res = await fetch(`${URLS.BASE}${URLS.uploadSingleFile}`, {
      method: "POST",
      body: form,
    });
    const json = await res.json();
    if (!json?.success || !json?.data?.url) {
      throw new Error(json?.message || "Upload failed");
    }
    setEvidence((cur) => [
      ...cur,
      {
        url: json.data.url,
        publicId: json.data.public_id,
        kind: file.type.startsWith("image/") ? "image" : "document",
        name: file.name,
      },
    ]);
  };

  const submit = async () => {
    setBusy(true);
    setError("");
    const res = await buyerFetch(`/buyer/auth/me/search-insurance/${policyId}/claims`, {
      method: "POST",
      body: JSON.stringify({ description, practitionerName, evidence }),
    });
    setBusy(false);
    if (!res.success || !(res.data as any)?._id) {
      setError(res.message || "Could not submit claim");
      return;
    }
    router.push(`/buyer/claims/${(res.data as any)._id}`);
  };

  return (
    <BuyerShell title="File a search insurance claim">
      <div className="rounded-3xl bg-white p-6 shadow-sm">
        <p className="text-sm text-[#5A5D63]">
          Claims are only available when this search is insured and due diligence was done with a Khabiteq professional.
          An external declaration does not qualify.
        </p>
        <textarea
          className="mt-4 min-h-36 w-full rounded-2xl border border-black/10 px-3 py-3 text-sm"
          placeholder="What happened? Include dates, the practitioner involved, and what you lost."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <input
          className="mt-3 w-full rounded-xl border border-black/10 px-3 py-2.5 text-sm"
          placeholder="Practitioner name"
          value={practitionerName}
          onChange={(e) => setPractitionerName(e.target.value)}
        />
        <label className="mt-4 block text-sm font-semibold text-[#09391C]">
          Evidence
          <input
            type="file"
            className="mt-2 block w-full text-sm"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void uploadFile(file).catch((err) => setError(err.message));
            }}
          />
        </label>
        <ul className="mt-3 space-y-1 text-sm text-[#5A5D63]">
          {evidence.map((item) => (
            <li key={item.url}>{item.name || item.url}</li>
          ))}
        </ul>
        {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
        <button
          type="button"
          disabled={busy || !policyId}
          onClick={() => void submit()}
          className="mt-5 inline-flex min-h-11 w-full items-center justify-center rounded-full bg-[#09391C] text-sm font-semibold text-white disabled:opacity-60"
        >
          {busy ? "Submitting..." : "Submit claim"}
        </button>
      </div>
    </BuyerShell>
  );
}
