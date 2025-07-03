/** @format */

'use client';
import { usePageContext } from '@/context/page-context';
import { basic_styling_architecture } from '@/utils/tool';
import React, { useEffect, useState } from 'react';
import SearchModal from './search-modal';
import { IsMobile } from '@/hooks/isMobile';
import { useRouter } from 'next/navigation';
import Card from './add-for-inspection/card';
import AddForInspection from './add-for-inspection';
  
const MarketPlace = () => {
  const router = useRouter();
  const {
    selectedType,
    setSelectedType,
    isAddForInspectionModalOpened,
    setIsAddForInspectionModalOpened,
    isComingFromPriceNeg,
    setIsComingFromPriceNeg,
    propertySelectedForInspection,
    setPropertySelectedForInspection,
  } = usePageContext();
  // const [isAddForInspectionModalOpened, setIsAddForInspectionModalOpened] =
  //   React.useState<boolean>(false);
  const [propertiesSelected, setPropertiesSelected] = React.useState<any[]>([]);
  const [isLetterOfIntentionModalOpened, setIsLetterOfIntentionModalOpened] = useState(false);
  const [addForInspectionPayload, setAddInspectionPayload] = React.useState<{
    twoDifferentInspectionAreas: boolean;
    initialAmount: number;
    toBeIncreaseBy: number;
  }>({
    twoDifferentInspectionAreas: false,
    initialAmount: 10000,
    toBeIncreaseBy: 0,
  }); 
  // const [isComingFromPriceNeg, setIsComingFromPriceNeg] =
  //   React.useState<boolean>(false);
  const [inspectionType, setInspectionType] = useState<
    'Buy' | 'JV' | 'Rent/Lease'
  >('Buy');
  const [isComingFromSubmitLol, setIsComingFromSubmitLol] =
    React.useState<boolean>(false);

  useEffect(() => {
    if (propertySelectedForInspection) {
    setPropertiesSelected([
      {
        ...propertySelectedForInspection,
        _id: propertySelectedForInspection.propertyId,
        price: propertySelectedForInspection.price,
        propertyType: propertySelectedForInspection.propertyType,
        noOfBedrooms: propertySelectedForInspection.bedRoom,
        location: propertySelectedForInspection.location,
        docOnProperty: Array.isArray(propertySelectedForInspection.docOnProperty)
          ? (propertySelectedForInspection.docOnProperty as Array<string | { docName: string }>).map(doc =>
              typeof doc === 'string' ? doc : doc.docName
            )
          : [],
      },
    ]);
    }
  }, [propertySelectedForInspection]);

  return (
    <section className='flex flex-col justify-center items-center w-full h-auto'>
      {isAddForInspectionModalOpened ? (
        <AddForInspection
          payload={addForInspectionPayload}
          setIsAddForInspectionModalOpened={setIsAddForInspectionModalOpened}
          setPropertiesSelected={setPropertiesSelected}
          propertiesSelected={propertiesSelected}
          isComingFromPriceNeg={isComingFromPriceNeg}
          comingFromPriceNegotiation={setIsComingFromPriceNeg}
          inspectionType={inspectionType}
          setInspectionType={setInspectionType}
          isComingFromSubmitLol={isComingFromSubmitLol}
          setIsComingFromSubmitLol={setIsComingFromSubmitLol}
          isAddForInspectionModalOpened={isAddForInspectionModalOpened}
        />
      ) : (
        <div className='container lg:py-[30px] flex flex-col gap-[20px] px-[0px] md:px-[20px]'>
          {/**
           * Heading and the type of market place user wants to select
           */}
          <div className='flex z-30 flex-col items-center justify-center gap-[20px] px-[15px]'>
            <h2 className='font-display text-[28px] md:text-4xl font-semibold text-[#09391C] text-center'>
              Welcome to{' '}
              <span className='text-[#8DDB90] text-[28px] font-display md:text-4xl font-semibold'>
                Khabiteq Realty
              </span>{' '}
              marketplace
            </h2>
            <p className='text-base md:text-xl text-[#5A5D63] text-center'>
              Whether you're buying, selling, renting, or investing (JV), how
              can we assist you?.
            </p>
            {/**type of market to select */}
            <div className={`md:flex gap-[15px] hidden`}>
              {[
                'Buy a property',
                'Find property for joint venture',
                'Rent/Lease a property',
              ].map((item: string, idx: number) => (
                <ButtonBoxModal
                  selectedType={selectedType}
                  onSelect={() => {
                    setSelectedType(item);
                  }}
                  isSelected
                  key={idx}
                  text={item}
                />
              ))}
            </div>
            <div className='flex gap-[5px] md:gap-[14px] md:flex-row flex-col md:min-w-[517px] min-h-[34px] items-center'>
              {/**Paragraph */}
              <p className='text-lg text-[#5A5D63] md:max-w-[657px] text-center mt-2'>
                Didn't find a match for your search?
              </p>
              {/**button ~ Share your preference*/}
              <button
                className='h-[34px] bg-transparent border-[1px] border-[#09391C] w-[221px] text-sm text-[#09391C]'
                type='button'
                onClick={() => router.push('preference')}>
                Share your preference
              </button>
            </div>
          </div>

          {/**Search Modal */}
          <div className='w-full mt-2 '>
            <SearchModal
              propertiesSelected={propertiesSelected}
              setPropertiesSelected={setPropertiesSelected}
              isAddForInspectionModalOpened={isAddForInspectionModalOpened}
              setIsAddInspectionModalOpened={setIsAddForInspectionModalOpened}
              addForInspectionPayload={addForInspectionPayload}
              setAddForInspectionPayload={setAddInspectionPayload}
              isComingFromPriceNeg={isComingFromPriceNeg}
              comingFromPriceNegotiation={setIsComingFromPriceNeg}
              inspectionType={inspectionType}
              setInspectionType={setInspectionType}
              isComingFromSubmitLol={isComingFromSubmitLol}
              setIsComingFromSubmitLol={setIsComingFromSubmitLol}
              isLetterOfIntentionModalOpened={isLetterOfIntentionModalOpened}
              setIsLetterOfIntentionModalOpened={setIsLetterOfIntentionModalOpened}
            />
          </div>

          
        </div>
      )}
    </section>
  );
};

const ButtonBoxModal = ({
  text,
  onSelect,
  selectedType,
}: {
  text: string;
  selectedType: string;
  isSelected: boolean;
  onSelect: () => void;
}) => {
  return (
    <button
      onClick={onSelect}
      type='button'
      className={`min-w-fit h-[51px] px-[15px] flex items-center justify-center gap-[10px] ${
        selectedType === text
          ? 'bg-[#8DDB90] text-[#FFFFFF]'
          : 'bg-transparent text-[#5A5D63]'
      } border-[1px] border-[#C7CAD0] font-medium text-lg`}>
      {text}
    </button>
  );
};
export default MarketPlace;
