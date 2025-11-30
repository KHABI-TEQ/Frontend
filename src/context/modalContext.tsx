"use client";

import React, { createContext, useCallback, useContext, useState } from "react";

type ModalSize = "sm" | "md" | "lg" | "xl" | "fullscreen";

interface ModalOptions {
  title?: string;
  content: React.ReactNode;
  size?: ModalSize;
  showCloseBtn?: boolean;
  disableOutsideClick?: boolean;
  onClose?: () => void;
}

interface ModalContextType {
  showModal: (options: ModalOptions) => void;
  closeModal: () => void;
}

interface ModalRendererProps extends ModalOptions {
  onRequestClose: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

const ModalRenderer: React.FC<ModalRendererProps> = ({
  title,
  content,
  size = "md",
  showCloseBtn = true,
  disableOutsideClick = false,
  onRequestClose,
}) => {
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !disableOutsideClick) {
      onRequestClose();
    }
  };

  const sizeClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    fullscreen: "max-w-full h-full",
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
      onClick={handleBackdropClick}
    >
      <div
        className={`bg-white rounded-lg shadow-xl ${sizeClasses[size]} w-full max-h-[90vh] overflow-y-auto`}
      >
        {(title || showCloseBtn) && (
          <div className="flex items-center justify-between p-4 border-b">
            {title && <h2 className="text-xl font-semibold">{title}</h2>}
            {showCloseBtn && (
              <button
                onClick={onRequestClose}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            )}
          </div>
        )}
        <div className="p-4">{content}</div>
      </div>
    </div>
  );
};

export const ModalProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [modalOptions, setModalOptions] = useState<ModalOptions | null>(null);

  const showModal = useCallback((options: ModalOptions) => {
    setModalOptions(options);
  }, []);

  const closeModal = useCallback(() => {
    if (modalOptions?.onClose) modalOptions.onClose();
    setModalOptions(null);
  }, [modalOptions]);

  return (
    <ModalContext.Provider value={{ showModal, closeModal }}>
      {children}
      {modalOptions && (
        <ModalRenderer {...modalOptions} onRequestClose={closeModal} />
      )}
    </ModalContext.Provider>
  );
};

export const useModal = (): ModalContextType => {
  const context = useContext(ModalContext);
  if (!context) throw new Error("useModal must be used within a ModalProvider");
  return context;
};
