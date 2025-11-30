"use client";

import React from "react";

export interface TabItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
}

interface TabsHeaderProps {
  tabs: TabItem[];
  active: string;
  onChange: (id: string) => void;
  disabled?: boolean;
}

const TabsHeader: React.FC<TabsHeaderProps> = ({ tabs, active, onChange, disabled = false }) => (
  <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-2">
    {tabs.map((t) => (
      <button
        key={t.id}
        onClick={() => !disabled && onChange(t.id)}
        disabled={disabled}
        className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${
          disabled
            ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
            : active === t.id
            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
            : "bg-white text-[#5A5D63] hover:bg-gray-50 border-gray-200"
        }`}
      >
        {t.icon}
        {t.label}
      </button>
    ))}
  </div>
);

export default TabsHeader;
