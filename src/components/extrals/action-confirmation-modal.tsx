/** @format */

'use client';
import React from 'react';
import PopUpModal from '../pop-up-modal-reusability';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClose } from '@fortawesome/free-solid-svg-icons';
import { archivo } from '@/styles/font';

type ActionConfirmationModalProps = {
  heading?: string;
  description?: string | React.ReactNode;
  onSubmit?: () => void;
  onCancel?: () => void;
  isSubmitting?: boolean;
  confirmText?: string;
  cancelText?: string;
  confirmColorClass?: string;
  cancelColorClass?: string;
  headerTextStyling?: React.CSSProperties;
};

const ActionConfirmationModal = ({
  heading = 'Confirm Action',
  description,
  onSubmit,
  onCancel,
  isSubmitting = false,
  confirmText = 'Submit',
  cancelText = 'Cancel',
  confirmColorClass = 'bg-[#8DDB90] text-white',
  cancelColorClass = 'border-[1px] border-[#FF2539] text-[#FF2539]',
  headerTextStyling,
}: ActionConfirmationModalProps) => {
  return (
    <PopUpModal>
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        viewport={{ once: true }}
        exit={{ y: 20, opacity: 0 }}
        className='lg:w-[649px] w-full flex flex-col gap-[26px]'>
        <div className='flex justify-end items-start'>
          <motion.button
            whileHover={{ scale: 1.1 }}
            type='button'
            className='w-[51px] h-[51px] rounded-full bg-white flex items-center justify-center'
            onClick={onCancel}>
            <FontAwesomeIcon
              icon={faClose}
              width={24}
              height={24}
              className='w-[24px] h-[24px]'
              color='#181336'
            />
          </motion.button>
        </div>

        <div className='w-full bg-white py-[40px] px-[20px] md:px-[60px] rounded-[4px] shadow-md flex justify-center items-center'>
          <div className='w-full flex flex-col gap-[42px] items-center justify-center'>
            <div className='flex flex-col gap-[4px] items-center justify-center'>
              <h2
                style={headerTextStyling}
                className={`text-center text-2xl font-bold ${
                  archivo.className
                } ${confirmColorClass.includes('text-[#FF2539]') ? 'text-[#FF2539]' : 'text-[#000]'}`}>
                {heading}
              </h2>
              {typeof description !== 'string' ? (
                <div className='text-center w-full'>{description}</div>
              ) : (
                <p
                  className={`text-[#515B6F] text-lg text-center ${archivo.className}`}>
                  {description}
                </p>
              )}
            </div>

            <div className='w-full flex flex-col gap-[15px]'>
              <button
                onClick={onSubmit}
                className={`w-full h-[57px] text-lg font-bold ${archivo.className} ${confirmColorClass}`}
                type='button'
                disabled={isSubmitting}>
                {isSubmitting ? 'Submitting...' : confirmText}
              </button>
              <button
                onClick={onCancel}
                className={`w-full h-[57px] text-lg font-bold ${archivo.className} ${cancelColorClass}`}
                type='button'>
                {cancelText}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </PopUpModal>
  );
};

export default ActionConfirmationModal;
