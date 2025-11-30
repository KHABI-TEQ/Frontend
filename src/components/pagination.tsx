/** @format */

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  setCurrentPage: (type: number | any) => void;
  currentPage: number;
  totalPages: number;
  onClick?: () => void;
}
const Pagination: React.FC<PaginationProps> = ({
  setCurrentPage,
  currentPage,
  totalPages,
  onClick,
}) => {
  return (
    <div className='flex justify-end items-center mt-10 gap-1'>
      <button
        type='button'
        onClick={() => {
          onClick?.();
          setCurrentPage?.((prev: number) => Math.max(prev - 1, 1));
        }}
        className={`px-4 py-1 rounded-md ${
          currentPage === 1
            ? 'text-gray-300'
            : 'text-black-500 hover:text-[#8DDB90]'
        }`}
        disabled={currentPage === 1}>
        <ChevronLeft size={18} />
        {''}
      </button>
      {Array.from({ length: totalPages }, (_, index) => (
        <button
          type='button'
          key={index + 1}
          onClick={() => setCurrentPage?.(index + 1)}
          className={`px-3 py-1 rounded-md ${
            currentPage === index + 1
              ? 'bg-[#8DDB90] text-white'
              : ' hover:bg-gray-300'
          }`}>
          {index + 1}
        </button>
      ))}
      <button
        type='button'
        onClick={() =>
          setCurrentPage?.((prev: number) => Math.min(prev + 1, totalPages))
        }
        className={`px-4 py-1 rounded-md ${
          currentPage === totalPages
            ? 'text-gray-300'
            : 'text-black-500 hover:text-[#8DDB90]'
        }`}
        disabled={currentPage === totalPages}>
        <ChevronRight size={18} />
        {''}
      </button>
    </div>
  );
};

export default Pagination;
