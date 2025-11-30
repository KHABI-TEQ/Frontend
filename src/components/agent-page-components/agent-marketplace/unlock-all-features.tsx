/** @format */

'use client';
import PopUpModal from '@/components/pop-up-modal-reusability';
import React from 'react';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClose } from '@fortawesome/free-solid-svg-icons';
import { archivo } from '@/styles/font';

type UnlockAllFeaturesModalProps = {
  handleCloseModal: (type: boolean) => void;
  handleNextPage: (
    type: 'agent marketplace' | 'subscription' | 'preference' | 'make payment'
  ) => void;
};

const UnlockAllFeaturesModal = ({
  handleCloseModal,
  handleNextPage,
}: UnlockAllFeaturesModalProps) => {
  const handleSubscribe = () => {
    handleNextPage('subscription');
  };
  return (
    <PopUpModal>
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        exit={{ y: 20, opacity: 0 }}
        transition={{ delay: 0.2 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={{ once: true }}
        className='lg:w-[645px] w-full flex flex-col gap-[10px]'>
        <div className='flex items-end justify-end'>
          <FontAwesomeIcon
            icon={faClose}
            onClick={() => handleCloseModal(false)}
            size='sm'
            width={24}
            height={24}
            color='#181336'
            className='w-[24px] h-[24px] cursor-pointer'
            title='exit'
          />
        </div>
        <div className='w-full min-h-[255px] bg-white flex flex-col gap-[24px] p-[20px] items-center justify-center'>
          <h3 className='text-xl font-bold text-black text-center'>
            Unlock all features on Khabi-Teq by subscribing today
          </h3>
          <p className='text-lg text-[#5A5D63] text-center'>
            The marketplace is a valuable tool that helps you be strategic with
            your listings by providing first-hand insight into what people are
            actively searching for. To explore the marketplace,
          </p>
          <button
            onClick={handleSubscribe}
            className={`h-[57px] w-full bg-[#8DDB90] text-white text-lg font-bold ${archivo.className}`}
            type='button'>
            Subscribe
          </button>
        </div>
      </motion.div>
    </PopUpModal>
  );
};

export default UnlockAllFeaturesModal;
