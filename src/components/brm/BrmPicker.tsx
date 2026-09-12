"use client";

import { useEffect, useMemo, useState } from "react";
import { URLS } from "@/utils/URLS";
import { GET_REQUEST } from "@/utils/requests";

export type BrmPublic = {
  id: string;
  fullName: string;
  profilePicture?: string;
  phoneNumber?: string;
  gender?: string;
  serviceMessage?: string;
};

function jpegCloudinaryUrl(url: string) {
  if (url.includes("/image/upload/") && !/\/f_jpe?g/i.test(url)) {
    return url.replace("/image/upload/", "/image/upload/f_jpg,q_auto/");
  }
  return url;
}

function imageCandidates(brm: BrmPublic) {
  const out: string[] = [];
  if (brm.id) out.push(`${URLS.BASE}${URLS.brmPicture(brm.id)}`);
  const raw = String(brm.profilePicture || "").trim();
  if (raw) {
    const jpeg = jpegCloudinaryUrl(raw);
    if (!out.includes(jpeg)) out.push(jpeg);
  }
  return out;
}

function BrmCard({
  brm,
  selected,
  onSelect,
}: {
  brm: BrmPublic;
  selected: boolean;
  onSelect: () => void;
}) {
  const candidates = useMemo(
    () => imageCandidates(brm),
    [brm.id, brm.profilePicture],
  );
  const [attempt, setAttempt] = useState(0);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setAttempt(0);
    setFailed(false);
  }, [brm.id, brm.profilePicture]);

  const uri = !failed ? candidates[attempt] : undefined;

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`text-left rounded-2xl overflow-hidden border-2 transition-all ${
        selected
          ? "border-[#8DDB90] shadow-md bg-[#8DDB90]/5"
          : "border-gray-200 bg-white hover:border-[#8DDB90]/50"
      }`}
    >
      <div className="relative aspect-[4/3] bg-[#E8EEEA]">
        {uri ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={uri}
            alt={brm.fullName}
            className="w-full h-full object-cover"
            onError={() => {
              if (attempt + 1 < candidates.length) setAttempt((n) => n + 1);
              else setFailed(true);
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-[#09391C]">
            {(brm.fullName || "?").charAt(0).toUpperCase()}
          </div>
        )}
        {selected && (
          <span className="absolute top-3 right-3 w-8 h-8 rounded-full bg-[#8DDB90] text-white font-bold flex items-center justify-center">
            ✓
          </span>
        )}
      </div>
      <div className="p-4">
        <p className="font-semibold text-[#09391C]">{brm.fullName}</p>
        <p className="text-xs text-[#5A5D63] capitalize mt-1">
          {[brm.gender, brm.phoneNumber].filter(Boolean).join(" · ")}
        </p>
        {brm.serviceMessage && (
          <p className="text-sm text-[#5A5D63] mt-2 line-clamp-4">
            {brm.serviceMessage}
          </p>
        )}
      </div>
    </button>
  );
}

export default function BrmPicker({
  selectedId,
  onChange,
  optional = true,
  title = "Choose your Business Relation Manager",
}: {
  selectedId: string | null;
  onChange: (id: string | null) => void;
  optional?: boolean;
  title?: string;
}) {
  const [items, setItems] = useState<BrmPublic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const res = await GET_REQUEST<BrmPublic[]>(`${URLS.BASE}${URLS.publicBrms}`);
      if (cancelled) return;
      if (res.success && Array.isArray(res.data)) {
        setItems(res.data);
        setError(null);
      } else {
        setError(res.message || "Could not load Business Relation Managers.");
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="w-full space-y-3">
      <div>
        <h3 className="text-sm font-semibold text-[#09391C]">{title}</h3>
        {optional && (
          <p className="text-xs text-[#5A5D63] mt-1">
            Optional. Skip if you do not have a preferred BRM yet.
          </p>
        )}
      </div>
      {loading && <p className="text-sm text-[#5A5D63]">Loading BRMs…</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {items.map((brm) => (
          <BrmCard
            key={brm.id}
            brm={brm}
            selected={selectedId === brm.id}
            onSelect={() => onChange(selectedId === brm.id ? null : brm.id)}
          />
        ))}
      </div>
      {selectedId && (
        <button
          type="button"
          onClick={() => onChange(null)}
          className="text-sm text-[#09391C] underline"
        >
          Clear selection
        </button>
      )}
    </div>
  );
}
