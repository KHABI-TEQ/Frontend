/** @format */

"use client";
import React from "react";
import { motion } from "framer-motion";
import { Home, Plus, Search, FileText } from "lucide-react";
import Link from "next/link";

interface NoBriefsPlaceholderProps {
  isFiltered?: boolean;
  onClearFilters?: () => void;
}

const NoBriefsPlaceholder: React.FC<NoBriefsPlaceholderProps> = ({
  isFiltered = false,
  onClearFilters,
}) => {
  if (isFiltered) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md"
        >
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Search size={32} className="text-gray-400" />
          </div>

          <h3 className="text-xl font-semibold text-[#09391C] mb-3">
            No Briefs Match Your Filters
          </h3>

          <p className="text-[#5A5D63] mb-6">
            We couldn&apos;t find any property briefs that match your current search
            criteria. Try adjusting your filters or clearing them to see all
            your briefs.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {onClearFilters && (
              <button
                onClick={onClearFilters}
                className="px-6 py-3 bg-gray-500 text-white rounded-lg font-medium hover:bg-gray-600 transition-colors"
              >
                Clear All Filters
              </button>
            )}

                        <Link
              href="/post-property"
              className="px-6 py-3 bg-[#8DDB90] text-white rounded-lg font-medium hover:bg-[#7BC87F] transition-colors inline-flex items-center gap-2"
            >
              <Plus size={16} />
              Add New Brief
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-16 px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-md"
      >
        <div className="w-24 h-24 bg-[#8DDB90] bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-6">
          <FileText size={40} className="text-[#8DDB90]" />
        </div>

        <h3 className="text-xl font-semibold text-[#09391C] mb-3">
          No Property Briefs Yet
        </h3>

        <p className="text-[#5A5D63] mb-6 leading-relaxed">
          You haven&apos;t created any property briefs yet. Start building your
          property portfolio by creating your first brief and connect with
          potential buyers, tenants, or joint venture partners.
        </p>

        <div className="space-y-3">
                    <Link
            href="/post-property"
            className="w-full sm:w-auto px-8 py-3 bg-[#8DDB90] text-white rounded-lg font-semibold hover:bg-[#7BC87F] transition-colors inline-flex items-center gap-2 justify-center"
          >
            <Plus size={20} />
            Create Your First Brief
          </Link>

          <div className="text-sm text-[#5A5D63]">
            or{" "}
            <Link
              href="/marketplace"
              className="text-[#8DDB90] hover:text-[#7BC87F] font-medium underline"
            >
              explore the marketplace
            </Link>
          </div>
        </div>

        {/* Benefits List */}
        <div className="mt-8 text-left">
          <h4 className="font-medium text-[#09391C] mb-3">
            Benefits of creating briefs:
          </h4>
          <ul className="space-y-2 text-sm text-[#5A5D63]">
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-[#8DDB90] rounded-full"></div>
              Reach qualified buyers and investors
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-[#8DDB90] rounded-full"></div>
              Get matched with serious prospects
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-[#8DDB90] rounded-full"></div>
              Showcase your property professionally
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-[#8DDB90] rounded-full"></div>
              Track performance and engagement
            </li>
          </ul>
        </div>
      </motion.div>
    </div>
  );
};

export default NoBriefsPlaceholder;
