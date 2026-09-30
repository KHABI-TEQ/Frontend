"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import BuyerShell from "@/components/search-insurance/BuyerShell";
import { buyerFetch, getBuyerProfile, getBuyerToken } from "@/lib/search-insurance";
import { GET_REQUEST, POST_REQUEST } from "@/utils/requests";
import { URLS } from "@/utils/URLS";

type Offer = {
  professionalId: string;
  professionalName?: string;
  coverageNote: string;
  serviceFee: number;
  serviceItems?: Array<{ serviceId: string; name: string; fee: number }>;
};

type ProfessionalContact = {
  name: string;
  firmName?: string;
  email?: string;
  phone?: string;
};

type Brief = {
  _id: string;
  serviceName?: string;
  status?: string;
  reference?: string;
  professionalId?: string;
  inspectionId?: string;
  serviceFee?: number;
  quotationRevisionPending?: boolean;
  acceptedQuotation?: {
    serviceItems?: Array<{ serviceId: string; name: string; fee: number }>;
    customerPrice?: number;
  } | null;
  deliverableUrl?: string;
  deliverableNotes?: string;
  deliveredAt?: string | null;
  offers?: Offer[];
  answers?: {
    objective?: string;
    questions?: string;
    timeline?: string;
    deliverable?: string;
    requestedServices?: Array<{ serviceId: string; name: string }>;
  };
  professional?: ProfessionalContact | null;
};

function QuotationTable({
  items,
  total,
}: {
  items?: Array<{ serviceId: string; name: string; fee: number }>;
  total?: number;
}) {
  if (!items?.length) return null;
  return (
    <ul className="mt-3 space-y-2 rounded-xl bg-[#F4FBF5] p-3 text-sm">
      {items.map((item) => (
        <li key={item.serviceId} className="flex justify-between gap-3">
          <span>{item.name}</span>
          <span className="shrink-0 font-medium">{naira(item.fee)}</span>
        </li>
      ))}
      <li className="flex justify-between gap-3 border-t border-black/10 pt-2 font-bold text-[#09391C]">
        <span>Total</span>
        <span>{naira(total ?? items.reduce((sum, item) => sum + Number(item.fee || 0), 0))}</span>
      </li>
    </ul>
  );
}

const PAID_STATUSES = ["in-progress", "delivered", "completed"];

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

  const load = async () => {
    const res = await buyerFetch<Brief>(`/buyer/auth/me/professional-service-requests/${id}`);
    setBrief(res.data || null);
    if (!res.success) setError(res.message || "Could not load this brief.");
    else setError("");
    return res.data || null;
  };

  useEffect(() => {
    if (!getBuyerToken()) {
      router.replace(`/buyer/login?next=/buyer/service-requests/${id}`);
      return;
    }
    let cancelled = false;
    const run = async () => {
      const reference = search.get("reference") || search.get("trxref");
      if (reference) {
        try {
          await GET_REQUEST(
            `${URLS.BASE}${URLS.verifyPayment}?reference=${encodeURIComponent(reference)}`,
          );
        } catch {
          // The brief still loads if verification is already recorded.
        }
      }
      let current = await load();
      if (cancelled || search.get("paid") !== "1") return;
      for (let attempt = 0; attempt < 8; attempt += 1) {
        if (PAID_STATUSES.includes(String(current?.status))) return;
        await new Promise((resolve) => setTimeout(resolve, 2000));
        if (cancelled) return;
        current = await load();
      }
    };
    void run();
    return () => {
      cancelled = true;
    };
  }, [id, router, search]);

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

  const confirmDelivery = async () => {
    setBusy(true);
    const res = await buyerFetch(`/buyer/auth/me/professional-service-requests/${id}/confirm-delivery`, {
      method: "POST",
    });
    setBusy(false);
    if (!res.success) {
      setError(res.message || "Could not confirm delivery.");
      return;
    }
    load();
  };

  const selectedOffer = brief?.offers?.find(
    (offer) => String(offer.professionalId) === String(brief.professionalId)
  );
  const paid = PAID_STATUSES.includes(String(brief?.status || ""));
  const confirmingPayment = search.get("paid") === "1" && brief?.status === "awaiting-payment";

  return (
    <BuyerShell
      title={brief?.serviceName || "Offers"}
      subtitle="Compare each itemised quotation, then accept and pay. Documents stay between you and the professional."
    >
      {search.get("submitted") === "1" ? (
        <article className="mb-6 rounded-3xl bg-[#09391C] p-6 text-white">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#8DDB90]">Brief published</p>
          <h2 className="mt-2 text-2xl font-bold">Verified professionals have been notified</h2>
          <p className="mt-2 max-w-2xl text-sm text-white/80">
            They will review this brief and send an itemised quotation. You will see each service and fee before you accept and pay.
          </p>
        </article>
      ) : null}

      {brief?.quotationRevisionPending ? (
        <article className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-950">
          The professional updated the quotation. Review the new breakdown and accept it before payment.
        </article>
      ) : null}

      {brief?.answers?.requestedServices?.length ? (
        <article className="mb-6 rounded-2xl bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#0F766E]">Requested work</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-[#09391C]">
            {brief.answers.requestedServices.map((item) => (
              <li key={item.serviceId}>{item.name}</li>
            ))}
          </ul>
        </article>
      ) : null}

      {confirmingPayment ? (
        <article className="mb-6 rounded-2xl bg-white p-6 shadow-sm">
          <p className="text-sm text-[#5A5D63]">
            Confirming your payment. The professional’s contact details will appear here as soon as it is recorded.
          </p>
        </article>
      ) : null}

      {paid ? (
        <article className="mb-6 rounded-2xl bg-white p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#0F766E]">Payment received</p>
          <h2 className="mt-1 text-xl font-bold text-[#09391C]">
            {brief?.professional?.name || selectedOffer?.professionalName || "Your professional"}
          </h2>
          {brief?.professional?.firmName ? (
            <p className="mt-1 text-sm text-[#5A5D63]">{brief.professional.firmName}</p>
          ) : null}
          {selectedOffer?.coverageNote ? (
            <p className="mt-3 text-sm text-[#09391C]">{selectedOffer.coverageNote}</p>
          ) : null}
          <QuotationTable
            items={brief?.acceptedQuotation?.serviceItems || selectedOffer?.serviceItems}
            total={brief?.acceptedQuotation?.customerPrice || selectedOffer?.serviceFee || brief?.serviceFee}
          />
          <p className="mt-3 text-sm font-semibold text-[#09391C]">
            Paid {naira(selectedOffer?.serviceFee || brief?.serviceFee)}
          </p>
          <div className="mt-4 space-y-1 text-sm text-[#09391C]">
            {brief?.professional?.email ? (
              <p>
                Email:{" "}
                <a className="font-semibold text-[#0F766E]" href={`mailto:${brief.professional.email}`}>
                  {brief.professional.email}
                </a>
              </p>
            ) : null}
            {brief?.professional?.phone ? (
              <p>
                Phone:{" "}
                <a className="font-semibold text-[#0F766E]" href={`tel:${brief.professional.phone}`}>
                  {brief.professional.phone}
                </a>
              </p>
            ) : null}
          </div>
          <p className="mt-4 text-sm text-[#5A5D63]">
            Share your documents with this professional directly. They will send the full report on their company letterhead.
          </p>
          {brief?.status === "in-progress" ? (
            <p className="mt-4 text-sm text-[#09391C]">Work is in progress. Delivery will appear on this page.</p>
          ) : null}
          {brief?.deliverableNotes || brief?.deliverableUrl ? (
            <div className="mt-5 rounded-xl bg-[#F4FBF5] p-4 text-sm text-[#09391C]">
              <p className="font-semibold">Delivery</p>
              {brief.deliverableNotes ? <p className="mt-2 whitespace-pre-wrap">{brief.deliverableNotes}</p> : null}
              {brief.deliverableUrl ? (
                <a
                  href={brief.deliverableUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-flex font-semibold text-[#0F766E] underline"
                >
                  Open delivered file
                </a>
              ) : null}
            </div>
          ) : null}
          {brief?.status === "delivered" ? (
            <button
              type="button"
              disabled={busy}
              onClick={() => void confirmDelivery()}
              className="mt-5 inline-flex rounded-full bg-[#09391C] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
            >
              Confirm receipt
            </button>
          ) : null}
          {brief?.status === "completed" ? (
            <p className="mt-4 text-sm font-semibold text-[#0F766E]">You confirmed this delivery.</p>
          ) : null}
          {brief?.inspectionId ? (
            <Link
              href={`/transaction-registration?inspectionId=${encodeURIComponent(brief.inspectionId)}&tab=register`}
              className="mt-5 inline-flex rounded-full bg-[#09391C] px-5 py-2.5 text-sm font-semibold text-white"
            >
              Register this transaction
            </Link>
          ) : null}
        </article>
      ) : brief?.status === "awaiting-payment" && selectedOffer ? (
        <article className="mb-6 rounded-2xl bg-white p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#0F766E]">Selected professional</p>
          <h2 className="mt-1 text-xl font-bold text-[#09391C]">{selectedOffer.professionalName}</h2>
          <p className="mt-2 text-sm text-[#5A5D63]">{selectedOffer.coverageNote}</p>
          <QuotationTable items={selectedOffer.serviceItems} total={selectedOffer.serviceFee} />
          <p className="mt-4 text-lg font-bold text-[#09391C]">Total {naira(selectedOffer.serviceFee)}</p>
          <p className="mt-3 text-sm text-[#5A5D63]">
            This is the itemised quotation. Accepting and paying locks this scope. A later change in work or price needs a new quotation.
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
                {!offer.serviceItems?.length ? <p className="mt-2 text-sm text-[#5A5D63]">{offer.coverageNote}</p> : null}
                {offer.serviceItems?.length ? (
                  <QuotationTable items={offer.serviceItems} total={offer.serviceFee} />
                ) : null}
                <p className="mt-3 text-sm font-semibold text-[#09391C]">
                  Total {naira(offer.serviceFee)}
                </p>
                {String(brief?.status) === "awaiting-offers" ? (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => void choose(String(offer.professionalId))}
                    className="mt-4 rounded-full bg-[#09391C] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
                  >
                    Accept this quotation
                  </button>
                ) : null}
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
