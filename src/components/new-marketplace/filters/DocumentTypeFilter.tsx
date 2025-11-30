/** @format */

"use client";
import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check } from "lucide-react";
import useClickOutside from "@/hooks/clickOutside";
import { getDocumentTypes } from "@/data/filter-data";

interface DocumentTypeFilterProps {
  isOpen: boolean;
  onClose: () => void;
  tab: "buy" | "jv" | "rent" | "shortlet";
  onDocumentSelect: (documents: string[]) => void;
  currentValue?: string[];
}

const DocumentTypeFilter: React.FC<DocumentTypeFilterProps> = ({
  isOpen,
  onClose,
  tab,
  onDocumentSelect,
  currentValue = [],
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);

  useClickOutside(modalRef, onClose);

  // Get document types for the specific tab
  const documentTypes = getDocumentTypes(tab);

  // Initialize selected documents
  useEffect(() => {
    if (currentValue && currentValue.length > 0) {
      setSelectedDocuments([...currentValue]);
    }
  }, [currentValue]);

  const handleDocumentToggle = (document: string) => {
    setSelectedDocuments((prev) => {
      if (prev.includes(document)) {
        return prev.filter((doc) => doc !== document);
      } else {
        return [...prev, document];
      }
    });
  };

  const handleApply = () => {
    onDocumentSelect(selectedDocuments);
    onClose();
  };

  const handleClear = () => {
    setSelectedDocuments([]);
    onDocumentSelect([]);
  };

  const handleSelectAll = () => {
    if (selectedDocuments.length === documentTypes.length) {
      setSelectedDocuments([]);
    } else {
      setSelectedDocuments([...documentTypes]);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={modalRef}
          initial={{ opacity: 0, y: -10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          transition={{ duration: 0.15 }}
          className="absolute top-full left-0 mt-1 w-full max-w-sm sm:max-w-md bg-white border border-gray-200 rounded-lg shadow-xl z-[9999] p-4 max-h-96 overflow-y-auto"
          style={{
            minWidth: "280px",
            maxWidth: "min(90vw, 400px)",
            zIndex: 10000,
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4 sticky top-0 bg-white">
            <h3 className="text-lg font-semibold text-[#09391C]">
              Document Types
            </h3>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X size={16} className="text-gray-500" />
            </button>
          </div>

          {/* Select All/Clear All */}
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm text-gray-600">
              {selectedDocuments.length} of {documentTypes.length} selected
            </span>
            <button
              onClick={handleSelectAll}
              className="text-sm text-[#8DDB90] hover:text-[#7BC87F] font-medium"
            >
              {selectedDocuments.length === documentTypes.length
                ? "Deselect All"
                : "Select All"}
            </button>
          </div>

          {/* Document Types List */}
          <div className="space-y-2 mb-4">
            {documentTypes.map((document) => (
              <label
                key={document}
                className="flex items-center p-2 rounded hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={selectedDocuments.includes(document)}
                    onChange={() => handleDocumentToggle(document)}
                    className="sr-only"
                  />
                  <div
                    className={`w-5 h-5 border-2 rounded transition-colors ${
                      selectedDocuments.includes(document)
                        ? "bg-[#8DDB90] border-[#8DDB90]"
                        : "border-gray-300"
                    }`}
                    style={{ zIndex: 10001 }}
                  >
                    {selectedDocuments.includes(document) && (
                      <Check
                        size={12}
                        className="text-white absolute top-0.5 left-0.5"
                        style={{ zIndex: 10002 }}
                      />
                    )}
                  </div>
                </div>
                <span className="ml-3 text-sm text-gray-700 flex-1">
                  {document}
                </span>
              </label>
            ))}
          </div> 

          {/* Action Buttons */}
          <div className="flex gap-2 sticky bottom-0 bg-white pt-2">
            <button
              onClick={handleClear}
              className="flex-1 px-3 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors text-sm"
            >
              Clear
            </button>
            <button
              onClick={handleApply}
              className="flex-1 px-3 py-2 bg-[#8DDB90] text-white rounded hover:bg-[#7BC87F] transition-colors text-sm"
            >
              Apply ({selectedDocuments.length})
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default DocumentTypeFilter;
