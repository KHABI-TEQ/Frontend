"use client";

import { useCallback, useState } from "react";
import { Copy, Check } from "lucide-react";
import toast from "react-hot-toast";

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

export function extractCreatedPropertyCode(response: unknown): string {
  const r = response as { data?: { propertyCode?: unknown } | null } | null;
  const code = r?.data && typeof r.data === "object" ? r.data.propertyCode : undefined;
  return String(code ?? "").trim();
}

type Props = {
  code?: string | null;
  className?: string;
  variant?: "overlay" | "inline";
};

export default function CopyPropertyCodeButton({
  code,
  className = "",
  variant = "inline",
}: Props) {
  const propertyCode = String(code ?? "").trim();
  const [copied, setCopied] = useState(false);

  const onCopy = useCallback(
    async (e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      if (!propertyCode) {
        toast.error("Property code is not available yet.");
        return;
      }
      const ok = await copyText(propertyCode);
      if (!ok) {
        toast.error("Could not copy. Please try again.");
        return;
      }
      setCopied(true);
      toast.success("Property code copied.");
      window.setTimeout(() => setCopied(false), 2000);
    },
    [propertyCode],
  );

  if (!propertyCode) return null;

  const base =
    variant === "overlay"
      ? "inline-flex items-center gap-1 rounded bg-white/15 px-1.5 py-0.5 text-[11px] font-semibold text-white hover:bg-white/25 transition-colors"
      : "inline-flex items-center gap-1 rounded-md border border-[#E0E0E0] bg-white px-2 py-1 text-[11px] font-semibold text-[#09391C] hover:bg-[#F0FDF4] transition-colors";

  return (
    <button
      type="button"
      onClick={onCopy}
      className={`${base} ${className}`}
      title="Copy property code"
      aria-label="Copy property code"
    >
      {copied ? <Check size={14} aria-hidden /> : <Copy size={14} aria-hidden />}
      <span>{copied ? "Copied" : "Copy"}</span>
    </button>
  );
}
