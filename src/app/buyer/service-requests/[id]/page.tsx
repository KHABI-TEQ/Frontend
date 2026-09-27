"use client";

import { Suspense, useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import BuyerShell from "@/components/search-insurance/BuyerShell";
import { buyerFetch, getBuyerProfile, getBuyerToken } from "@/lib/search-insurance";
import { POST_REQUEST } from "@/utils/requests";
import { URLS } from "@/utils/URLS";

type Offer = {
  professionalId: string;
  professionalName?: string;
  coverageNote: string;
  serviceFee: number;
};

type Brief = {
  _id: string;
  serviceName?: string;
  status?: string;
  reference?: string;
  professionalId?: string;
  serviceFee?: number;
  offers?: Offer[];
  answers?: { objective?: string };
};

function naira(n?: number) {
  return `₦${Number(n || 0).toLocaleString()}`;
}

function BriefOffers() {
  const params = useParams();
  const search = useSearchParams();
  const router = useRouter();
  const id = String(params?.id || "");
  const [brief, setBrief] = useState<Brief | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const load = () => {
    buyerFetch<Brief>(`/buyer/auth/me/professional-service-requests/${id}`).then((res) => {
      setBrief(res.data || null);
      if (!res.success) setError(res.message || "Could not load this brief.");
    });
  };

  useEffect(() => {
    if (!getBuyerToken()) {
      router.replace(`/buyer/login?next=/buyer/service-requests/${id}`);
      return;
    }
    load();
  }, [id, router]);

  const choose = async (professionalId: string) => {
    setBusy(true);
    setError("");
    const res = await buyerFetch(`/buyer/auth/me/professional-service-requests/${id}/select-offer`, {
      method: "POST",
      body: JSON.stringify({ professionalId }),
    });
    setBusy(false);
    if (!res.success) {
      setError(res.message || "Could not select this offer.");
      return;
    }
    load();
  };

  const pay = async () => {
    const email = getBuyerProfile()?.email;
    if (!email) return;
    setBusy(true);
    const res = await POST_REQUEST(
      `${URLS.BASE}/professional-service-requests/${id}/pay`,
      { email }
    );
    setBusy(false);
    const url = (res.data as { payment?: { authorization_url?: string } } | undefined)?.payment
      ?.authorization_url;
    if (!res.success || !url) {
      setError(res.message || "Could not start payment.");
      return;
    }
    window.location.href = url;
  };

  const selectedOffer = brief?.offers?.find(
    (offer) => String(offer.professionalId) === String(brief.professionalId)
  );

  return (
    <BuyerShell
      title={brief?.serviceName || "Offers"}
      subtitle="Compare what each professional will cover and the fee they set. Documents stay between you and the professional."
    >
      {search.get("submitted") === "1" ? (
        <article className="mb-6 rounded-3xl bg-[#09391C] p-6 text-white">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#8DDB90]">Brief published</p>
          <h2 className="mt-2 text-2xl font-bold">Verified professionals have been notified</h2>
          <p className="mt-2 max-w-2xl text-sm text-white/80">
            Every approved {brief?.serviceName || "professional"} who can take this work has received the brief by email and in the app. Their offers will appear here, with the service they cover and the fee they set.
          </p>
        </article>
      ) : null}

      {brief?.status === "awaiting-payment" && selectedOffer ? (
        <article className="mb-6 rounded-2xl bg-white p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#0F766E]">Selected professional</p>
          <h2 className="mt-1 text-xl font-bold text-[#09391C]">{selectedOffer.professionalName}</h2>
          <p className="mt-2 text-sm text-[#5A5D63]">{selectedOffer.coverageNote}</p>
          <p className="mt-4 text-lg font-bold text-[#09391C]">Service fee {naira(selectedOffer.serviceFee)}</p>
          <p className="mt-3 text-sm text-[#5A5D63]">
            You pay this fee. Share documents with the professional directly after payment.
          </p>
          {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
          <button
            type="button"
            disabled={busy}
            onClick={() => void pay()}
            className="mt-4 rounded-full bg-[#09391C] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
          >
            Proceed to payment
          </button>
        </article>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-[#5A5D63]">{brief?.answers?.objective}</p>
          {(brief?.offers || []).length === 0 ? (
            <p className="rounded-2xl bg-white p-6 text-sm text-[#5A5D63]">
              Offers will show here as professionals respond. You will also get a notification for each one.
            </p>
          ) : (
            brief?.offers?.map((offer) => (
              <article key={String(offer.professionalId)} className="rounded-2xl bg-white p-5 shadow-sm">
                <p className="font-bold text-[#09391C]">{offer.professionalName || "Professional"}</p>
                <p className="mt-2 text-sm text-[#5A5D63]">{offer.coverageNote}</p>
                <p className="mt-3 text-sm font-semibold text-[#09391C]">
                  Service fee {naira(offer.serviceFee)}
                </p>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void choose(String(offer.professionalId))}
                  className="mt-4 rounded-full bg-[#09391C] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
                >
                  Choose this offer
                </button>
              </article>
            ))
          )}
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
        </div>
      )}
    </BuyerShell>
  );
}

export default function ServiceBriefPage() {
  return (
    <Suspense fallback={<p className="p-8 text-sm text-[#5A5D63]">Loading offers…</p>}>
      <BriefOffers />
    </Suspense>
  );
}
