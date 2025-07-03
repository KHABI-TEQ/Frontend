/** @format */

'use client';
import useClickOutside from '@/hooks/clickOutside';
import React, { ChangeEvent, ChangeEventHandler, FC, useRef } from 'react';
import RadioCheck from '../general-components/radioCheck';
import { featuresData } from '@/data/landlord';
import { motion } from 'framer-motion';

type FilterProps = {
  bathroom: number | undefined | string;
  landSize: {
    type: string;
    size: undefined | number;
  };
  desirer_features: string[];
};
interface MoreFilterProps {
  closeModal: (type: boolean) => void;
  filters: FilterProps;
  setFilters: (type: FilterProps) => void;
  style?: React.CSSProperties;
}

const MoreFilter: FC<MoreFilterProps> = ({
  closeModal,
  filters,
  setFilters,
  style,
}) => {
  const divRef = useRef<HTMLDivElement | null>(null);
  const [selectedLandType, setSelectedLandType] =
    React.useState<string>('plot');

  useClickOutside(divRef, () => closeModal(false));

  const handleClearFilters = () => {
    if (
      filters.bathroom ||
      filters.desirer_features.length > 0 ||
      filters.landSize.size
    ) {
      setFilters({
        bathroom: undefined,
        landSize: { type: 'plot', size: undefined },
        desirer_features: [],
      });
    }
  };


  return (
    <motion.div
      initial={{ y: 50, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.3 }}
      viewport={{ once: true }}
      ref={divRef}
      style={style}
      className='md:w-[655px] w-full min-h-[599px] bg-white border-[1px] border-black flex flex-col gap-[25px] p-[19px] shadow-md absolute right-1 mt-[20px]'>
      <div className="flex items-center justify-between">
        <h2 className="text-base text-[#000000] font-medium">More Filter</h2>
        <button
          onClick={handleClearFilters}
          type='button'
          className="text-sm text-[#ff0000] px-5 py-2 border rounded-md font-medium hover:bg-[#d56c6c] hover:border-[#d56c6c] hover:text-white transition ease-in-out duration-300"
        >
          Clear
        </button>
      </div>

      {/**Bathroom */}
      <div className='min-h-[90px] w-full flex flex-col gap-[10px]'>
        <h2 className='font-medium text-sm text-[#5A5D63]'>Bathroom</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {Array.from({ length: 10 }).map((__, idx: number) => {
            if (idx === 9) {
              return (
                <RadioCheck
                  type='radio'
                  value={'more'}
                  key={idx + 1}
                  name='bathroom'
                  isChecked={filters.bathroom === 'more'}
                  handleChange={() =>
                    setFilters({
                      ...filters,
                      bathroom: 'more',
                    })
                  }
                />
              );
            }
            return (
              <RadioCheck
                type='radio'
                value={Number(idx + 1).toLocaleString()}
                key={idx + 1}
                name='bathroom'
                isChecked={filters.bathroom === idx + 1}
                handleChange={() =>
                  setFilters({
                    ...filters,
                    bathroom: idx + 1,
                  })
                }
              />
            );
          })}
        </div>
      </div>
      {/**Land Size */}
      <div className='h-[135px] w-full flex flex-col gap-[15px]'>
        <h2 className='text-sm text-[#5A5D63] font-medium'>Land Size</h2>
        <div className='flex gap-[15px]'>
          {['plot', 'Acres', 'Sqr Meter'].map((item: string, idx: number) => (
            <button
              type='button'
              key={idx}
              onClick={() => setSelectedLandType(item)}
              className={`w-1/3 px-[15px] text-xs h-[36px] ${
                selectedLandType === item
                  ? 'bg-[#8DDB90] font-medium text-white'
                  : 'bg-transparent text-[#5A5D63]'
              } border-[1px] border-[#C7CAD0]`}>
              {item}
            </button>
          ))}
        </div>
        <div className='h-[47px] border-[1px] border-[#D6DDEB] w-full flex justify-between items-center px-[12px] py-[16px]'>
          <span>min</span>
          <label htmlFor='landSize'>
            <input
              type='number'
              name='landSize'
              onChange={(event: ChangeEvent<HTMLInputElement>) => {
                setFilters({
                  ...filters,
                  landSize: {
                    type: selectedLandType,
                    size: Number(event.target.value),
                  },
                });
              }}
              id='landSize'
              value={filters.landSize.size}
              title='Land size'
              className='outline-none h-full w-full text-center'
            />
          </label>
          <span className='text-sm text-black'>{selectedLandType}</span>
        </div>
      </div>
      {/**Desirer Features */}
      <div className='flex flex-col gap-[15px]'>
        <h2 className='text-[#5A5D63] text-sm font-medium'>Desirer Features</h2>
       <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {featuresData.map((item: string, idx: number) => (
            <RadioCheck
              key={idx}
              value={item}
              type='checkbox'
              name='features'
              isChecked={filters.desirer_features.some(
                (text: string) => text === item
              )}
              handleChange={() => {
                const uniqueFeatures: Set<string> = new Set([
                  ...filters.desirer_features,
                ]);
                if (uniqueFeatures.has(item)) {
                  uniqueFeatures.delete(item);
                }
                uniqueFeatures.add(item);
                setFilters({
                  ...filters,
                  desirer_features: Array.from(uniqueFeatures),
                });
              }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default MoreFilter;
