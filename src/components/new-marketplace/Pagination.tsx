/** @format */

"use client";
import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  const getVisiblePages = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, "...");
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push("...", totalPages);
    } else {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  const visiblePages = getVisiblePages();

  const changePage = (page: number) => {
    onPageChange(page);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center space-x-2">
      {/* Previous Button */}
      <button
        onClick={() => changePage(currentPage - 1)}
        disabled={currentPage === 1}
        className={`p-2 rounded-lg border transition-colors ${
          currentPage === 1
            ? "border-gray-200 text-gray-400 cursor-not-allowed"
            : "border-gray-300 text-[#5A5D63] hover:bg-gray-50"
        }`}
      >
        <ChevronLeft size={20} />
      </button>

      {/* Page Numbers */}
      {visiblePages.map((page, index) => (
        <React.Fragment key={index}>
          {page === "..." ? (
            <span className="px-3 py-2 text-[#5A5D63]">...</span>
          ) : (
            <button
              onClick={() => changePage(page as number)}
              className={`px-3 py-2 rounded-lg border transition-colors ${
                currentPage === page
                  ? "bg-[#8DDB90] text-white border-[#8DDB90]"
                  : "border-gray-300 text-[#5A5D63] hover:bg-gray-50"
              }`}
            >
              {page}
            </button>
          )}
        </React.Fragment>
      ))}

      {/* Next Button */}
      <button
        onClick={() => changePage(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`p-2 rounded-lg border transition-colors ${
          currentPage === totalPages
            ? "border-gray-200 text-gray-400 cursor-not-allowed"
            : "border-gray-300 text-[#5A5D63] hover:bg-gray-50"
        }`}
      >
        <ChevronRight size={20} />
      </button>
    </div>
  );
};

export default Pagination;
