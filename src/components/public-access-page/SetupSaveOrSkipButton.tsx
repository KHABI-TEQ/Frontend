"use client";

import { ChevronRight, Save } from "lucide-react";

export function OptionalMark() {
  return <span className="ml-1 text-xs font-normal text-gray-400">(optional)</span>;
}

export function OptionalFieldsHint() {
  return (
    <p className="mt-2 text-sm text-gray-500">
      All fields are optional. Skip to continue, or Save changes after you enter a value.
    </p>
  );
}

export function SetupSaveOrSkipButton({
  dirty,
  saving,
  onSave,
  onSkip,
  disabled,
}: {
  dirty: boolean;
  saving?: boolean;
  onSave: () => void;
  onSkip: () => void;
  disabled?: boolean;
}) {
  const busy = Boolean(disabled || saving);
  const className =
    "inline-flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto";

  if (!dirty) {
    return (
      <button type="button" onClick={onSkip} disabled={busy} className={className}>
        Skip
        <ChevronRight size={18} />
      </button>
    );
  }

  return (
    <button type="button" onClick={onSave} disabled={busy} className={className}>
      <Save size={18} />
      {saving ? "Saving..." : "Save changes"}
    </button>
  );
}
