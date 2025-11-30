/** @format */

"use client";
import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  disabled?: boolean;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  disabled = false,
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
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots.filter(
      (page, index, array) => array.indexOf(page) === index,
    );
  };

  if (totalPages <= 1) {
    return null;
  }

  const visiblePages = getVisiblePages();

  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
      {/* Page info for mobile */}
      <div className="sm:hidden text-sm text-gray-600">
        Page {currentPage} of {totalPages}
      </div>

      <div className="flex items-center space-x-2">
        {/* Previous Button */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={disabled || currentPage === 1}
          className="flex items-center px-3 py-2 text-sm font-medium text-[#5A5D63] bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-[#09391C] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-[#5A5D63] transition-colors"
        >
          <ChevronLeft size={16} className="mr-1" />
          <span className="hidden sm:inline">Previous</span>
          <span className="sm:hidden">Prev</span>
        </button>

      {/* Page Numbers */}
      <div className="flex items-center space-x-1">
        {visiblePages.map((page, index) => {
          if (page === "...") {
            return (
              <span
                key={`dots-${index}`}
                className="px-3 py-2 text-sm font-medium text-[#5A5D63]"
              >
                ...
              </span>
            );
          }

          const pageNumber = page as number;
          const isActive = pageNumber === currentPage;

          return (
            <button
              key={pageNumber}
              onClick={() => onPageChange(pageNumber)}
              disabled={disabled}
              className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors disabled:cursor-not-allowed ${
                isActive
                  ? "bg-[#8DDB90] text-white border border-[#8DDB90]"
                  : "text-[#5A5D63] bg-white border border-gray-300 hover:bg-gray-50 hover:text-[#09391C] disabled:hover:bg-white disabled:hover:text-[#5A5D63]"
              }`}
            >
              {pageNumber}
            </button>
          );
        })}
      </div>

        {/* Next Button */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={disabled || currentPage === totalPages}
          className="flex items-center px-3 py-2 text-sm font-medium text-[#5A5D63] bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-[#09391C] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-[#5A5D63] transition-colors"
        >
          <span className="hidden sm:inline">Next</span>
          <span className="sm:hidden">Next</span>
          <ChevronRight size={16} className="ml-1" />
        </button>
      </div>

      {/* Quick navigation for desktop */}
      {totalPages > 5 && (
        <div className="hidden sm:flex items-center space-x-2 text-sm text-gray-600">
          <span>Go to:</span>
          <select
            value={currentPage}
            onChange={(e) => onPageChange(Number(e.target.value))}
            disabled={disabled}
            className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-[#8DDB90] focus:border-transparent"
          >
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <option key={page} value={page}>
                Page {page}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
};

export default Pagination;
