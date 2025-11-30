/** @format */

"use client";
import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MoreVertical, Eye, Edit, Share, Trash } from "lucide-react";
import useClickOutside from "@/hooks/clickOutside";

interface ActionDropdownProps {
  onView?: () => void;
  onEdit?: () => void;
  onShare?: () => void;
  onDelete?: () => void;
  briefId: string;
}

const ActionDropdown: React.FC<ActionDropdownProps> = ({
  onView,
  onEdit,
  onShare,
  onDelete,
  briefId,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useClickOutside(dropdownRef, () => setIsOpen(false));

  const actionItems = [
    {
      label: "View Details",
      icon: Eye,
      action: onView,
      color: "text-[#5A5D63] hover:text-[#09391C] hover:bg-gray-50",
    },
    {
      label: "Edit Brief",
      icon: Edit,
      action: onEdit,
      color: "text-[#5A5D63] hover:text-[#09391C] hover:bg-gray-50",
    },
    {
      label: "Share",
      icon: Share,
      action: onShare,
      color: "text-[#5A5D63] hover:text-[#09391C] hover:bg-gray-50",
    },
    {
      label: "Delete",
      icon: Trash,
      action: onDelete,
      color: "text-red-500 hover:text-red-700 hover:bg-red-50",
    },
  ];

  const handleActionClick = (action?: () => void) => {
    if (action) {
      action();
    }
    setIsOpen(false);
  };

  return (
    <div className="relative  z-50" ref={dropdownRef}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-[#8DDB90] focus:ring-opacity-50 bg-white shadow-md border border-gray-100"
        aria-label="More actions"
        title="More actions"
      >
        <MoreVertical size={16} className="text-[#5A5D63]" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Mobile backdrop */}
            <div
              className="fixed inset-0 bg-black bg-opacity-25 z-[100] sm:hidden"
              onClick={() => setIsOpen(false)}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 -top-40 mt-1 w-44 sm:w-40 bg-white border border-gray-200 rounded-lg shadow-2xl z-[101] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {actionItems.map((item, index) => {
                if (!item.action) return null;

                const IconComponent = item.icon;

                return (
                  <button
                    key={index}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleActionClick(item.action);
                    }}
                    className={`w-full px-3 sm:px-4 py-2.5 sm:py-2 text-sm flex items-center gap-2.5 sm:gap-2 transition-colors border-b border-gray-100 last:border-b-0 ${item.color}`}
                  >
                    <IconComponent size={16} className="flex-shrink-0" />
                    <span className="font-medium">{item.label}</span>
                  </button>
                );
              })}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ActionDropdown;
