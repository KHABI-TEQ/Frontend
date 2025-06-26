/** @format */ 

import React, { Fragment, useEffect, useState, useCallback, useMemo } from 'react';
import Card from './card';
import { IsMobile } from '@/hooks/isMobile';
import { useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faClose, } from '@fortawesome/free-solid-svg-icons';
import { epilogue } from '@/styles/font';
import { NegiotiatePrice, NegiotiatePriceWithSellerModal, } from './negotiate-price-modal';
import SelectPreferableInspectionDate from './select-preferable-inspection-date';
import { AnimatePresence } from 'framer-motion';
import ProvideTransactionDetails from './provide-transaction-details';
import { motion } from 'framer-motion';
import JointVentureModalCard from '../joint-venture-card';
import LetterOfIntention from './letter-of-intention';
import UploadLolDocumentModal from './upload-your-lol-document';
import { usePageContext } from '@/context/page-context';
import { SubmitInspectionPayloadProp } from '../types/payload';

// Types
type PayloadProps = {
  twoDifferentInspectionAreas: boolean;
  initialAmount: number;
  toBeIncreaseBy: number;
};

type NegotiationModalProps = {
  id: string | null;
  isOpened: boolean;
  askingPrice: number | string | undefined;
  yourPrice: number | string | undefined;
};

type InspectionType = 'Buy' | 'JV' | 'Rent/Lease';

type ActionTrackerItem = {
  lastPage: 'SelectPreferableInspectionDate' | '';
};

interface AddForInspectionProps {
  propertiesSelected: any[];
  setPropertiesSelected: (type: any[]) => void;
  isAddForInspectionModalOpened: boolean;
  setIsAddForInspectionModalOpened: (type: boolean) => void;
  payload: PayloadProps;
  isComingFromPriceNeg?: boolean;
  comingFromPriceNegotiation?: (type: boolean) => void;
  inspectionType: InspectionType;
  setInspectionType: (type: InspectionType) => void;
  isComingFromSubmitLol: boolean;
  setIsComingFromSubmitLol: (type: boolean) => void;
}

// Constants
const INSPECTION_FEES = {
  SINGLE_PROPERTY: 10000,
  MULTIPLE_AREAS: 15000,
} as const;

const LOI_ADDRESS = {
  company: 'Khabi-Teq Limited',
  address: [
    'Goldrim Plaza',
    'Mokuolu Street, Ifako Agege',
    'Lagos 101232, Nigeria',
  ],
} as const;

// Custom Hooks
const useInspectionFee = (propertiesSelected: any[]) => {
  return useMemo(() => {
    const selected = propertiesSelected.slice(0, 2);

    if (selected.length === 1) {
      return INSPECTION_FEES.SINGLE_PROPERTY;
    } 
    
    if (selected.length === 2) {
      const [propertyA, propertyB] = selected;
      const lgaA = propertyA?.location?.localGovernment;
      const lgaB = propertyB?.location?.localGovernment;
      const uniqueLGAs = new Set([lgaA, lgaB]);
      
      return uniqueLGAs.size === 1 
        ? INSPECTION_FEES.SINGLE_PROPERTY 
        : INSPECTION_FEES.MULTIPLE_AREAS;
    }
    
    return 0;
  }, [propertiesSelected]);
};

const useModalStates = () => {
  const [negotiationModal, setNegotiationModal] = useState<NegotiationModalProps>({
    id: null,
    isOpened: false,
    askingPrice: undefined,
    yourPrice: undefined,
  });

  const [allNegotiations, setAllNegotiations] = useState<NegotiationModalProps[]>([]);
  const [isSelectPreferableInspectionDateModalOpened, setSelectPreferableInspectionDateModalOpened] = useState(false);
  const [isProvideTransactionDetails, setIsProvideTransactionDetails] = useState(false);
  const [actionTracker, setActionTracker] = useState<ActionTrackerItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLolGuidelineModalOpened, setIsLolGuidelineModalOpened] = useState(true);
  const [isLetterOfIntentionModalOpened, setIsLetterOfIntentionModalOpened] = useState(false);
  const [submitPayload, setSubmitPayload] = useState<SubmitInspectionPayloadProp>({} as SubmitInspectionPayloadProp);

  return {
    negotiationModal,
    setNegotiationModal,
    allNegotiations,
    setAllNegotiations,
    isSelectPreferableInspectionDateModalOpened,
    setSelectPreferableInspectionDateModalOpened,
    isProvideTransactionDetails,
    setIsProvideTransactionDetails,
    actionTracker,
    setActionTracker,
    currentIndex,
    setCurrentIndex,
    isLolGuidelineModalOpened,
    setIsLolGuidelineModalOpened,
    isLetterOfIntentionModalOpened,
    setIsLetterOfIntentionModalOpened,
    submitPayload,
    setSubmitPayload,
  };
};

// Utility Functions
const createPropertyCardData = (property: any, inspectionType: InspectionType) => [
  {
    header: 'Property Type',
    value: property.propertyType,
  },
  {
    header: 'Price',
    value: `₦${Number(
      property?.price ?? property?.rentalPrice
    ).toLocaleString()}`,
  },
  {
    header: 'Bedrooms',
    value: property.noOfBedrooms || 'N/A',
  },
  {
    header: 'Location',
    value: `${property.location.state}, ${property.location.localGovernment}`,
  },
  {
    header: 'Documents',
    value: `<ol class='' style='list-style: 'dics';'>${property?.docOnProperty?.map(
      (item: { _id: string; docName: string }) =>
        `<li key={${item._id}>${item.docName}</li>`
    )}<ol>`,
  },
];

const createNegotiationArray = (propertiesSelected: any[]) => 
  propertiesSelected?.map((property) => ({
    isOpened: false,
    id: property?._id,
    askingPrice: property?.price ?? property?.rentalPrice,
    yourPrice: undefined,
  })) || [];

// Components
const LOIGuideline: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className='w-full flex justify-center items-center'>
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.2 }}
        viewport={{ once: true }}
        exit={{ y: 20, opacity: 0 }}
        className='border-[1px] bg-[#E8F3FE] border-[#A8ADB7] lg:w-[667px] h-[217px] p-[20px] flex flex-col gap-[24px] relative'>
        <h2 className='text-black font-bold text-xl'>
          How to submit LOI guideline
        </h2>
        <FontAwesomeIcon
          icon={faClose}
          size='sm'
          width={24}
          height={24}
          color='#181336'
          title='close modal'
          className='w-[24px] h-[24px] absolute right-[20px] top-[20px] cursor-pointer'
          onClick={onClose}
        />
        <div className='flex flex-col gap-[2px]'>
          <span className='text-base text-[#5A5D63]'>
            Please address your letter to{' '}
            <span className='font-bold text-base text-black'>
              {LOI_ADDRESS.company}
            </span>{' '}
            and include our office address:
          </span>
          {LOI_ADDRESS.address.map((line, index) => (
            <span key={index} className='text-base text-[#5A5D63]'>
              {line}
            </span>
          ))}
          <span className='text-base text-[#1976D2]'>
            Kindly note that all documents will be reviewed prior to approval.
          </span>
        </div>
      </motion.div>
    </div>
  );
};

const PropertyCard: React.FC<{
  property: any;
  index: number;
  propertiesSelected: any[];
  inspectionType: InspectionType;
  isAddForInspectionModalOpened: boolean;
  onRemoveProperty: (propertyId: string) => void;
  onPriceNegotiation: (property: any, index: number) => void;
  setPropertiesSelected: (properties: any[]) => void;
  comingFromPriceNegotiation?: (type: boolean) => void;
}> = ({
  property,
  index,
  propertiesSelected,
  inspectionType,
  isAddForInspectionModalOpened,
  onRemoveProperty,
  onPriceNegotiation,
  setPropertiesSelected,
  comingFromPriceNegotiation,
}) => {
  const is_mobile = IsMobile();
  const router = useRouter();

  const handleCardClick = useCallback(() => {
    router.push(`/property/Rent/${property._id}`);
  }, [router, property._id]);

  const handleRemoveClick = useCallback(() => {
    onRemoveProperty(property._id);
  }, [onRemoveProperty, property._id]);

  const handlePriceNegotiation = useCallback(() => {
    onPriceNegotiation(property, index);
  }, [onPriceNegotiation, property, index]);

  if (inspectionType === 'Buy' || inspectionType === 'Rent/Lease') {
    return (
      <Card
        style={is_mobile ? { width: '100%' } : { width: '281px' }}
        images={property?.pictures}
        isAddInspectionModalOpened={isAddForInspectionModalOpened}
        setPropertySelected={setPropertiesSelected}
        setIsComingFromPriceNeg={comingFromPriceNegotiation}
        property={property}
        allProperties={propertiesSelected}
        onCardPageClick={handleCardClick}
        onClick={handleRemoveClick}
        onPriceNegotiation={handlePriceNegotiation}
        cardData={createPropertyCardData(property, inspectionType)}
        key={index}
      />
    );
  }

  return null;
};

const JointVentureCard: React.FC<{
  property: any;
  index: number;
  propertiesSelected: any[];
  isAddForInspectionModalOpened: boolean;
  isComingFromSubmitLol: boolean;
  setIsComingFromSubmitLol: (type: boolean) => void;
  setPropertiesSelected: (properties: any[]) => void;
  setIsAddForInspectionModalOpened: (type: boolean) => void;
  onSubmitLoi: () => void;
}> = ({
  property,
  index,
  propertiesSelected,
  isAddForInspectionModalOpened,
  isComingFromSubmitLol,
  setIsComingFromSubmitLol,
  setPropertiesSelected,
  setIsAddForInspectionModalOpened,
  onSubmitLoi,
}) => (
  <JointVentureModalCard
    key={index}
    onClick={() => {}}
    cardData={[]}
    isComingFromSubmitLol={isComingFromSubmitLol}
    setIsComingFromSubmitLol={setIsComingFromSubmitLol}
    images={[]}
    property={property}
    properties={propertiesSelected}
    isAddInspectionalModalOpened={isAddForInspectionModalOpened}
    setPropertySelected={setPropertiesSelected}
    setIsAddInspectionModalOpened={setIsAddForInspectionModalOpened}
    onSubmitLoi={onSubmitLoi}
  />
);

const EmptySlot: React.FC<{
  propertiesSelected: any[];
  inspectionType: InspectionType;
  onAddMore: () => void;
}> = ({ propertiesSelected, inspectionType, onAddMore }) => (
  <div
    className={`w-[261px] ${inspectionType === 'JV' ? 'h-[300px]' : 'h-[400px]'} border-[1px] border-dashed border-[#5A5D63] flex items-center justify-center`}>
    <span
      title='Click to add for inspection'
      onClick={onAddMore}
      className='text-lg text-black cursor-pointer font-semibold'>
      Empty slot
    </span>
  </div>
);

const PropertyGrid: React.FC<{
  propertiesSelected: any[];
  inspectionType: InspectionType;
  isAddForInspectionModalOpened: boolean;
  isComingFromSubmitLol: boolean;
  setIsComingFromSubmitLol: (type: boolean) => void;
  setPropertiesSelected: (properties: any[]) => void;
  setIsAddForInspectionModalOpened: (type: boolean) => void;
  onRemoveProperty: (propertyId: string) => void;
  onPriceNegotiation: (property: any, index: number) => void;
  onSubmitLoi: () => void;
  comingFromPriceNegotiation?: (type: boolean) => void;
}> = ({
  propertiesSelected,
  inspectionType,
  isAddForInspectionModalOpened,
  isComingFromSubmitLol,
  setIsComingFromSubmitLol,
  setPropertiesSelected,
  setIsAddForInspectionModalOpened,
  onRemoveProperty,
  onPriceNegotiation,
  onSubmitLoi,
  comingFromPriceNegotiation,
}) => {
  const handleAddMore = useCallback(() => {
    setIsAddForInspectionModalOpened(false);
    setPropertiesSelected(propertiesSelected);
  }, [setIsAddForInspectionModalOpened, setPropertiesSelected, propertiesSelected]);

  const renderProperty = useCallback((property: any, index: number) => {
    if (inspectionType === 'JV') {
      return (
        <JointVentureCard
          key={index}
          property={property}
          index={index}
          propertiesSelected={propertiesSelected}
          isAddForInspectionModalOpened={isAddForInspectionModalOpened}
          isComingFromSubmitLol={isComingFromSubmitLol}
          setIsComingFromSubmitLol={setIsComingFromSubmitLol}
          setPropertiesSelected={setPropertiesSelected}
          setIsAddForInspectionModalOpened={setIsAddForInspectionModalOpened}
          onSubmitLoi={onSubmitLoi}
        />
      );
    }

    return (
      <PropertyCard
        key={index}
        property={property}
        index={index}
        propertiesSelected={propertiesSelected}
        inspectionType={inspectionType}
        isAddForInspectionModalOpened={isAddForInspectionModalOpened}
        onRemoveProperty={onRemoveProperty}
        onPriceNegotiation={onPriceNegotiation}
        setPropertiesSelected={setPropertiesSelected}
        comingFromPriceNegotiation={comingFromPriceNegotiation}
      />
    );
  }, [
    inspectionType,
    propertiesSelected,
    isAddForInspectionModalOpened,
    isComingFromSubmitLol,
    setIsComingFromSubmitLol,
    setPropertiesSelected,
    setIsAddForInspectionModalOpened,
    onRemoveProperty,
    onPriceNegotiation,
    onSubmitLoi,
    comingFromPriceNegotiation,
  ]);

  return (
    <div className='flex flex-wrap justify-center items-center gap-4 sm:gap-6 md:gap-8 mt-4 w-full'>
      {propertiesSelected.map(renderProperty)}
      {propertiesSelected.length === 1 && (
        <EmptySlot
          propertiesSelected={propertiesSelected}
          inspectionType={inspectionType}
          onAddMore={handleAddMore}
        />
      )}
    </div>
  );
};

const Header: React.FC<{
  onBack: () => void;
}> = ({ onBack }) => (
  <div className='flex items-center gap-[24px]'>
    <FontAwesomeIcon
      icon={faArrowLeft}
      width={24}
      height={24}
      onClick={onBack}
      className='w-[24px] h-[24px] cursor-pointer'
      title='Back'
    />
    <div className='flex gap-[10px] items-center'>
      <span className='text-xl text-[#25324B]'>Market place</span>
      <span>.</span>
      <span className={`text-xl text-[#25324B] ${epilogue.className} font-semibold`}>
        Back
      </span>
    </div>
  </div>
);

const InspectionSummary: React.FC<{
  inspectionType: InspectionType;
  totalAmount: number;
  payload: PayloadProps;
  onProceed: () => void;
  isLolGuidelineModalOpened: boolean;
  setIsLolGuidelineModalOpened: (open: boolean) => void;
  children?: React.ReactNode;
}> = ({
  inspectionType,
  totalAmount,
  payload,
  onProceed,
  isLolGuidelineModalOpened,
  setIsLolGuidelineModalOpened,
  children,
}) => (
  <Fragment>
    <div className='flex w-full items-center justify-center flex-col gap-[10px]'>
      <h2 className='text-2xl font-display font-semibold text-[#09391C] text-center'>
        Add for Inspection
      </h2>
      <p className='text-center text-base md:text-xl text-[#5A5D63]'>
        Here are the briefs you selected for inspection.{' '}
        <span className='text-base md:text-xl text-black'>
          {inspectionType === 'Buy' && 'You can negotiate the price for each property'}
          {inspectionType === 'JV' && 'You can Submit LOI for each property'}
        </span>
        &nbsp;
        {inspectionType === 'JV' && !isLolGuidelineModalOpened && (
          <span
            onClick={() => setIsLolGuidelineModalOpened(true)}
            className='text-sm cursor-pointer font-medium text-[#1976D2] underline'>
            LOI guideline instruction
          </span>
        )}
      </p>
    </div>

    <AnimatePresence>
      {inspectionType === 'JV' && (
        <LOIGuideline
          isOpen={isLolGuidelineModalOpened}
          onClose={() => setIsLolGuidelineModalOpened(false)}
        />
      )}
    </AnimatePresence>

    {/* Injected content between summary and footer */}
    {children}

    {/* Reuse extracted footer */}
    <InspectionSummaryFooter
      totalAmount={totalAmount}
      payload={payload}
      onProceed={onProceed}
    />
  </Fragment>
);


const InspectionSummaryFooter: React.FC<{
  totalAmount: number;
  payload: PayloadProps;
  onProceed: () => void;
}> = ({ totalAmount, payload, onProceed }) => (
  <div className='flex flex-col gap-[10px] justify-center items-center'>
    <h2 className='text-lg text-black text-center items-center'>
      To confirm your inspection, please pay the inspection fee to proceed
    </h2>
    {payload.toBeIncreaseBy > 0 && (
      <span className='text-base text-[#1976D2] text-center'>
        Your inspection fee increased because you selected two different inspection areas.
      </span>
    )}
    <h2 className='text-center font-display font-semibold text-black text-3xl'>
      N {Number(totalAmount).toLocaleString()}
    </h2>
    <button
      onClick={onProceed}
      className='h-[65px] w-[292px] bg-[#8DDB90] text-lg font-bold text-[#FAFAFA]'
      type='button'>
      Proceed
    </button>
  </div>
);



// Main Component
const AddForInspection: React.FC<AddForInspectionProps> = ({
  propertiesSelected,
  setPropertiesSelected,
  isAddForInspectionModalOpened,
  setIsAddForInspectionModalOpened,
  payload,
  isComingFromPriceNeg,
  comingFromPriceNegotiation,
  inspectionType,
  isComingFromSubmitLol,
  setIsComingFromSubmitLol,
}) => {
  const { propertySelectedForInspection } = usePageContext();
  const totalAmount = useInspectionFee(propertiesSelected);
  
  const {
    negotiationModal,
    setNegotiationModal,
    allNegotiations,
    setAllNegotiations,
    isSelectPreferableInspectionDateModalOpened,
    setSelectPreferableInspectionDateModalOpened,
    isProvideTransactionDetails,
    setIsProvideTransactionDetails,
    actionTracker,
    setActionTracker,
    currentIndex,
    setCurrentIndex,
    isLolGuidelineModalOpened,
    setIsLolGuidelineModalOpened,
    isLetterOfIntentionModalOpened,
    setIsLetterOfIntentionModalOpened,
    submitPayload,
    setSubmitPayload,
  } = useModalStates();

  // Effects
  useEffect(() => {
    setSubmitPayload((prev) => {
      // Create a map from existing negotiation payload if any
      const negotiationMap = new Map(
        (prev.properties || []).map((p) => [p.propertyId, p.negotiationPrice])
      );
  
      // Map the selected properties and merge negotiationPrice if already present
      const mappedProperties = propertiesSelected.map((property) => ({
        propertyId: property._id,
        negotiationPrice: negotiationMap.get(property._id) ?? undefined,
      }));
  
      const isNegotiating = mappedProperties.some(
        (prop) =>
          typeof prop.negotiationPrice === 'number' && !isNaN(prop.negotiationPrice)
      );
  
      return {
        ...prev,
        properties: mappedProperties,
        isNegotiating,
      };
    });

  }, [propertiesSelected]);
  

  useEffect(() => {
    if (totalAmount === 0) {
      setIsAddForInspectionModalOpened(false);
    }
  }, [totalAmount, setIsAddForInspectionModalOpened]);

  // Event Handlers
  const handleBack = useCallback(() => {
    const getLastAction = actionTracker[actionTracker.length - 1];
    if (getLastAction === undefined) {
      return setIsAddForInspectionModalOpened(false);
    }
    
    const { lastPage } = getLastAction;
    if (lastPage === 'SelectPreferableInspectionDate') {
      setIsAddForInspectionModalOpened(true);
      setIsProvideTransactionDetails(false);
      setActionTracker([]);
      return;
    }
    setIsAddForInspectionModalOpened(false);
  }, [actionTracker, setIsAddForInspectionModalOpened, setIsProvideTransactionDetails, setActionTracker]);

  const handleRemoveProperty = useCallback((propertyId: string) => {
    const filteredArray = propertiesSelected.filter(
      (item) => item._id !== propertyId
    );

    setPropertiesSelected(filteredArray);
  }, [propertiesSelected, setPropertiesSelected]);

  const handlePriceNegotiation = useCallback((property: any, index: number) => {
    const arrayOfPropertiesSelected = createNegotiationArray(propertiesSelected);
    setAllNegotiations(arrayOfPropertiesSelected);
    setCurrentIndex(index);
    setNegotiationModal({
      isOpened: true,
      id: property._id,
      askingPrice: property.price,
      yourPrice: undefined,
    });
  }, [propertiesSelected, setAllNegotiations, setCurrentIndex, setNegotiationModal]);

  const handleProceed = useCallback(() => {
    setSubmitPayload((prev) => {
      // Create a map from existing negotiation payload if any
      const negotiationMap = new Map(
        (prev.properties || []).map((p) => [p.propertyId, p.negotiationPrice])
      );
  
      // Map the selected properties and merge negotiationPrice if already present
      const mappedProperties = propertiesSelected.map((property) => ({
        propertyId: property._id,
        negotiationPrice: negotiationMap.get(property._id) ?? undefined,
      }));
  
      const isNegotiating = mappedProperties.some(
        (prop) => typeof prop.negotiationPrice === 'number' && !isNaN(prop.negotiationPrice)
      );
  
      return {
        ...prev,
        properties: mappedProperties,
        isNegotiating,
      };
    });
  
    setSelectPreferableInspectionDateModalOpened(true);
  }, [propertiesSelected, setSubmitPayload, setSelectPreferableInspectionDateModalOpened]);  
  

  const handleSubmitLoi = useCallback(() => {
    setIsLetterOfIntentionModalOpened(true);
  }, [setIsLetterOfIntentionModalOpened]);

  // Computed values
  const selectedPropertyIds = useMemo(() => 
    (propertiesSelected ?? [])
      .map(property => property?._id)
      .filter(Boolean) as string[],
    [propertiesSelected]
  );

  return (
    <Fragment>
      <div className='w-full flex justify-center items-center py-[30px] px-[30px]'>
        <div className='container flex flex-col gap-[10px]'>
          <Header onBack={handleBack} />

          <AnimatePresence>
            {isProvideTransactionDetails ? (
              <ProvideTransactionDetails
                amountToPay={payload.initialAmount + payload.toBeIncreaseBy}
                setSubmitInspectionPayload={setSubmitPayload}
                submitInspectionPayload={submitPayload}
              />
            ) : (
              <Fragment>
              
                <InspectionSummary
                  inspectionType={inspectionType}
                  totalAmount={totalAmount}
                  payload={payload}
                  onProceed={handleProceed}
                  isLolGuidelineModalOpened={isLolGuidelineModalOpened}
                  setIsLolGuidelineModalOpened={setIsLolGuidelineModalOpened}
                > 
              
                  <PropertyGrid
                    propertiesSelected={propertiesSelected}
                    inspectionType={inspectionType}
                    isAddForInspectionModalOpened={isAddForInspectionModalOpened}
                    isComingFromSubmitLol={isComingFromSubmitLol}
                    setIsComingFromSubmitLol={setIsComingFromSubmitLol}
                    setPropertiesSelected={setPropertiesSelected}
                    setIsAddForInspectionModalOpened={setIsAddForInspectionModalOpened}
                    onRemoveProperty={handleRemoveProperty}
                    onPriceNegotiation={handlePriceNegotiation}
                    onSubmitLoi={handleSubmitLoi}
                    comingFromPriceNegotiation={comingFromPriceNegotiation}
                  />
                
                </InspectionSummary>
              </Fragment>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {currentIndex < allNegotiations.length && (
          <NegiotiatePrice
            currentIndex={currentIndex}
            setCurrentIndex={setCurrentIndex}
            key={allNegotiations[currentIndex].id}
            getID={allNegotiations[currentIndex].id}
            allNegotiation={allNegotiations}
            setAllNegotiation={setAllNegotiations}
            setSelectPreferableInspectionDateModalOpened={setSelectPreferableInspectionDateModalOpened}
            setSubmitInspectionPayload={setSubmitPayload}
            submitInspectionPayload={submitPayload}
          />
        )}

        {isSelectPreferableInspectionDateModalOpened && (
          <SelectPreferableInspectionDate
            actionTracker={actionTracker}
            setActionTracker={setActionTracker}
            setIsProvideTransactionDetails={setIsProvideTransactionDetails}
            closeModal={setSelectPreferableInspectionDateModalOpened}
            setSubmitInspectionPayload={setSubmitPayload}
            submitInspectionPayload={submitPayload}
          />
        )}

        {isComingFromPriceNeg && (
          <NegiotiatePriceWithSellerModal
            getID={propertiesSelected[0].id ?? propertySelectedForInspection?._id}
            allNegotiation={propertiesSelected ?? [propertySelectedForInspection]}
            setSubmitInspectionPayload={setSubmitPayload}
            submitInspectionPayload={submitPayload}
            closeModal={comingFromPriceNegotiation}
            actionTracker={actionTracker}
            setActionTracker={setActionTracker}
            setIsProvideTransactionDetails={setIsProvideTransactionDetails}
            closeSelectPreferableModal={setSelectPreferableInspectionDateModalOpened}
          />
        )}

        {isLetterOfIntentionModalOpened && (
          <LetterOfIntention
            setIsModalClosed={setIsLetterOfIntentionModalOpened}
            closeSelectPreferableModal={setSelectPreferableInspectionDateModalOpened}
            propertyId={propertiesSelected[0]?._id}
            submitInspectionPayload={submitPayload}
            setSubmitInspectionPayload={setSubmitPayload}
          />
        )}

        {isComingFromSubmitLol && (
          <UploadLolDocumentModal
            getID={propertiesSelected[0].id}
            propertyId={propertiesSelected[0]?._id}
            allNegotiation={propertiesSelected}
            closeModal={setIsComingFromSubmitLol}
            actionTracker={actionTracker}
            setActionTracker={setActionTracker}
            setIsProvideTransactionDetails={setIsProvideTransactionDetails}
            closeSelectPreferableModal={setSelectPreferableInspectionDateModalOpened}
            setSubmitInspectionPayload={setSubmitPayload}
            submitInspectionPayload={submitPayload}
          />
        )}

      </AnimatePresence>
    </Fragment>
  );
};

export default AddForInspection;