/** @format */

import React, { useEffect, useRef } from 'react';

interface ModalProps {
  visible: boolean;
  position: { top: number; left: number } | null;
  onClose: () => void;
  onViewBrief: () => void;
  onEditBrief: () => void;
  onDeleteBrief: () => void;
}

const Modal: React.FC<ModalProps> = ({
  visible,
  position,
  onClose,
  onViewBrief,
  onEditBrief,
  onDeleteBrief,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (visible) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [visible, onClose]);

  if (!visible || !position) return null;

  const modalWidth = 150; // Width of the modal
  const modalHeight = 0; // Approximate height of the modal

  return (
    <div
      ref={modalRef}
      style={{
        position: 'absolute',
        top: position.top - modalHeight / 2,
        left: position.left - modalWidth / 2,
        backgroundColor: '#FFFFFF',
        boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
        borderRadius: '4px',
        padding: '10px',
        width: `${modalWidth}px`,
        zIndex: 1000,
      }}
      className='flex flex-col gap-2'>
      <button
        onClick={() => {
          onViewBrief();
          onClose();
        }}
        className='text-[14px] text-[#181336] font-archivo'>
        View Brief
      </button>
      <button
        onClick={() => {
          onEditBrief();
          onClose();
        }}
        className='text-[14px] text-[#181336] font-archivo'>
        Edit Brief
      </button>
      <button
        onClick={() => {
          onDeleteBrief();
          onClose();
        }}
        className='text-[14px] text-[#FF0000] font-archivo'>
        Delete Brief
      </button>
    </div>
  );
};

export default Modal;
