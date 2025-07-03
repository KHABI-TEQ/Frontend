'use client';
import useClickOutside from '@/hooks/clickOutside';
import React, { useRef } from 'react';
import RadioCheck from '../general-components/radioCheck';
import { motion } from 'framer-motion';

interface DocumentTypeComponentProps {
  closeModal: (type: boolean) => void;
  setDocsSelected: (type: string[]) => void;
  docsSelected: string[];
  style?: React.CSSProperties;
}

const DocumentTypeComponent: React.FC<DocumentTypeComponentProps> = ({
  closeModal,
  setDocsSelected,
  docsSelected,
  style,
}) => {
  const divRef = useRef<HTMLDivElement | null>(null);
  useClickOutside(divRef, () => closeModal(false));

  const handleCheckboxChange = (doc: string) => {
    const selected = new Set(docsSelected);
    if (selected.has(doc)) {
      selected.delete(doc);
    } else {
      selected.add(doc);
    }
    setDocsSelected(Array.from(selected));
  };

  return (
    <motion.div
      initial={{ y: 50, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.3 }}
      viewport={{ once: true }}
      ref={divRef}
      style={style}
      className='absolute mt-[20px] bg-white w-[286px] h-[327px] p-[19px] shadow-md flex flex-col gap-[13px] border-[1px] border-black'
    >
      <h2 className='text-base font-medium text-[#000000]'>Document type</h2>
      <div className='flex flex-col gap-[10px] mt-4'>
        {[
          'C of O',
          'Government Consent',
          'Deed of Assignment',
          'Receipt',
          'Land certificate',
          'Registered deed of conveyance',
        ].map((text, idx) => (
          <RadioCheck
            key={idx}
            type='checkbox'
            isChecked={docsSelected.includes(text)}
            handleChange={() => handleCheckboxChange(text)}
            name='doc'
            value={text}
          />
        ))}
      </div>
    </motion.div>
  );
};

export default DocumentTypeComponent;
