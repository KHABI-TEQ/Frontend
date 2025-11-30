/** @format */

"use client";
import React, { useState, useRef, useEffect } from "react";
import { useNewMarketplace } from "@/context/new-marketplace-context";
import { ChevronDown } from "lucide-react";

const MarketplaceTabs = () => {
  const { activeTab, setActiveTab } = useNewMarketplace();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const tabs = [
    {
      id: "buy" as const,
      label: "Buy a property",
      briefType: "buy",
    },
    {
      id: "jv" as const,
      label: "Find property for joint venture",
      briefType: "jv",
    },
    {
      id: "rent" as const,
      label: "Rent/Lease a property",
      briefType: "rent",
    },
    {
      id: "shortlet" as const,
      label: "Find shortlet property",
      briefType: "shortlet",
    },
  ];

  const activeTabData = tabs.find((tab) => tab.id === activeTab);

  const handleTabSelect = (tabId: typeof activeTab) => {
    setActiveTab(tabId);
    setIsDropdownOpen(false);
  }; 
 
  return (
    <>
      {/* Desktop Tabs */}
      <div className="hidden md:flex justify-center items-center gap-4 lg:gap-6 mb-6 md:mb-8 px-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            type="button"
            className={`min-w-fit h-12 px-6 flex items-center justify-center rounded-lg font-medium text-base transition-all duration-300 ${
              activeTab === tab.id
                ? "bg-[#8DDB90] text-white shadow-md"
                : "bg-white text-[#5A5D63] border-2 border-gray-200 hover:border-[#8DDB90] hover:text-[#8DDB90]"
            }`}
          >
            <span className="text-center leading-tight">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Mobile Dropdown */}
      <div className="md:hidden mb-6 px-4">
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="w-full bg-white border-2 border-gray-200 rounded-lg px-4 py-3 flex items-center justify-between text-[#5A5D63] font-medium text-sm hover:border-[#8DDB90] transition-colors shadow-sm"
          >
            <span className="truncate">
              {activeTabData?.label || "Select property type"}
            </span>
            <ChevronDown
              className={`w-4 h-4 ml-2 transition-transform duration-200 flex-shrink-0 ${
                isDropdownOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleTabSelect(tab.id)}
                  className={`w-full px-4 py-3 text-left text-sm font-medium transition-colors border-b border-gray-100 last:border-b-0 ${
                    activeTab === tab.id
                      ? "bg-[#8DDB90] text-white"
                      : "text-[#5A5D63] hover:bg-gray-50 hover:text-[#8DDB90]"
                  }`}
                >
                  <span className="block">{tab.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default MarketplaceTabs;
