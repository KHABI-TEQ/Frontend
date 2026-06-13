"use client";

import { useCallback, useState } from "react";
import { Copy, Check } from "lucide-react";
import toast from "react-hot-toast";

const OBJECT_ID_RE = /^[a-fA-F0-9]{24}$/;

function resolvePropertyObjectId(property: { _id?: unknown; id?: unknown }): string | null {
  for (const v of [property._id, property.id]) {
    if (v == null) continue;
    const s = String(v).trim();
    if (OBJECT_ID_RE.test(s)) return s;
  }
  return null;
}

async function copyText(value: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(value);
    return true;
  } catch {
    try {
      const ta = document.createElement("textarea");
      ta.value = value;
      ta.style.position = "fixed";
      ta.style.left = "-9999px";
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(ta);
      return ok;
    } catch {
      return false;
    }
  }
}

type Props = {
  property: { _id?: unknown; id?: unknown };
  className?: string;
  variant?: "overlay" | "inline";
};

export default function CopyPropertyIdButton({
  property,
  className = "",
  variant = "overlay",
}: Props) {
  const propertyId = resolvePropertyObjectId(property);
  const [copied, setCopied] = useState(false);

  const onCopy = useCallback(
    async (e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      if (!propertyId) {
        toast.error("Property ID is not available for this listing.");
        return;
      }
      const ok = await copyText(propertyId);
      if (!ok) {
        toast.error("Could not copy. Please try again.");
        return;
      }
      setCopied(true);
      toast.success("Property ID copied");
      window.setTimeout(() => setCopied(false), 2000);
    },
    [propertyId]
  );

  if (!propertyId) return null;

  const base =
    variant === "overlay"
      ? "absolute right-2 top-2 z-20 flex items-center gap-1 rounded-lg bg-black/55 px-2 py-1.5 text-[11px] font-semibold text-white backdrop-blur-sm hover:bg-black/70 transition-colors"
      : "inline-flex items-center gap-1 rounded-md border border-[#E0E0E0] bg-white px-2 py-1 text-[11px] font-semibold text-[#09391C] hover:bg-[#F0FDF4] transition-colors";

  return (
    <button
      type="button"
      onClick={onCopy}
      className={`${base} ${className}`}
      title="Copy property ID"
      aria-label="Copy property ID"
    >
      {copied ? <Check size={14} aria-hidden /> : <Copy size={14} aria-hidden />}
      <span>{copied ? "Copied" : "Copy property ID"}</span>
    </button>
  );
}
