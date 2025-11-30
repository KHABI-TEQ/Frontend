/** @format */
'use client';
import Select from 'react-select';
import { epilogue } from '@/styles/font';
import { useFormik, FormikProps } from 'formik';
import React, { Fragment, useEffect, useRef, useState } from 'react';
import { ArrowLeft, Circle } from 'lucide-react';
import customStyles from '@/styles/inputStyle';
import Input from '@/components/general-components/Input';
import Card from './card';
import { PropertySelectedProps } from './types';
import { AnimatePresence } from 'framer-motion';
import UnlockAllFeaturesModal from './unlock-all-features';
import Subscription from './subscription';
import Preference from './prefrence';
import ProvideTransactionDetails from './make-payment';
import { useMobile } from '@/hooks/useMobile';

const AgentMarketPlace = () => {
  const divRef = useRef<HTMLDivElement | null>(null);
  const [renderedPage, setRenederedPage] = useState<
    'agent marketplace' | 'subscription' | 'preference' | 'make payment'
  >('agent marketplace');
  const [documentsSelected, setDocumentsSelected] = useState<string[]>([]);
  const [isDocumentModalOpened, setIsDocumentModalOpened] =
    useState<boolean>(false);
  const [isMoreFilterModalOpened, setIsMoreFilterModalOpened] =
    useState<boolean>(false);
  const [filters, setFilters] = useState<{
    bathroom: number | undefined | string;
    landSize: {
      type: string;
      size: undefined | number;
    };
    desirer_features: string[];
  }>({
    bathroom: undefined,
    landSize: {
      type: 'plot',
      size: undefined,
    },
    desirer_features: [],
  });
  const formik = useFormik({
    initialValues: {
      selectedState: '',
      selectedLGA: '',
    },
    onSubmit: (values) => console.log(values),
  });
  const [isViewMoreClicked, setIsViewMoreClicked] = useState<boolean>(false);
  const [propertySelected, setPropertySelected] =
    useState<PropertySelectedProps>(undefined);

  const docsValues = documentsSelected.map((item: string) => item);
  console.log('docsValues', docsValues);

  const renderDynamically = (): {
    content: React.ReactNode;
    handleNavigation: () => void;
    heading?: string;
    subHeading?: string;
  } => {
    switch (renderedPage) {
      case 'agent marketplace':
        return {
          content: (
            <Index
              setRenderedPage={setRenederedPage}
              formik={formik}
              docsValues={docsValues}
              isDocumentModalOpened={isDocumentModalOpened}
              setIsDocumentModalOpened={setIsDocumentModalOpened}
              documentsSelected={documentsSelected}
              setDocumentsSelected={setDocumentsSelected}
              isMoreFilterModalOpened={isMoreFilterModalOpened}
              setIsMoreFilterModalOpened={setIsMoreFilterModalOpened}
              filters={filters}
              setFilters={setFilters}
              isViewMoreClicked={isViewMoreClicked}
              setIsViewMoreClicked={setIsViewMoreClicked}
              setPropertySelected={setPropertySelected}
            />
          ),
          handleNavigation: () => (window.location.href = '/'),
          heading: 'Home',
          subHeading: 'agent marketplace',
        };
      case 'preference':
        return {
          content: (
            <Preference
              propertySelected={propertySelected}
              setIsViewMoreClicked={setIsViewMoreClicked}
            />
          ),
          handleNavigation: () => {
            setIsViewMoreClicked(false);
            setRenederedPage('agent marketplace');
          },
          heading: 'Agent marketplace',
          subHeading: 'Preference',
        };
      case 'subscription':
        return {
          content: <Subscription handleNextPage={setRenederedPage} />,
          handleNavigation: () => {
            setRenederedPage('agent marketplace');
          },
          heading: 'marketplace',
          subHeading: 'subscription',
        };
      case 'make payment':
        return {
          content: <ProvideTransactionDetails amountToPay={10000} />,
          handleNavigation: () => {
            setRenederedPage('subscription');
          },
          heading: 'marketplace',
          subHeading: 'subscription . make payment',
        };
      default:
        return { content: <></>, handleNavigation: () => {} };
    }
  };

  //useEffect
  useEffect(() => {
    if (!divRef) return;

    divRef.current?.scrollBy({ behavior: 'smooth', top: 0 });
  }, [isViewMoreClicked]);
  return (
    <Fragment>
      <div className='w-full flex justify-center items-center px-[20px] md:px-[30px]'>
        <div
          ref={divRef}
          className='container flex flex-col gap-[40px] pb-[50px]'>
          {/**Navigation */}
          <nav className='flex gap-[24px] items-center'>
            <ArrowLeft
              onClick={renderedPage && renderDynamically().handleNavigation}
              size={24}
              className="w-[24px] h-[24px] cursor-pointer"
              color="#25324B"
            >
              <title>Go Home</title>
            </ArrowLeft>

            <div className='flex gap-[8px] items-center'>
              <h2 className='text-xl text-[#25324B]'>
                {renderedPage && renderDynamically().heading}
              </h2>
              <Circle
                size={'sm'}
                className='w-[4px] h-[4px]'
                color='#25324B'
              />
              <h2
                className={`text-[#25324B] text-lg ${epilogue.className} font-semibold`}>
                {renderedPage && renderDynamically().subHeading}
              </h2>
            </div>
          </nav>
          {renderedPage && renderDynamically().content}
        </div>
      </div>
    </Fragment>
  );
};

interface FormikType {
  selectedLGA: string;
  selectedState: string;
}

type IndexProps = {
  formik: FormikProps<FormikType>;
  docsValues: string[];
  isDocumentModalOpened: boolean;
  setIsDocumentModalOpened: (type: boolean) => void;
  documentsSelected: string[];
  setDocumentsSelected: (type: string[]) => void;
  isMoreFilterModalOpened: boolean;
  setIsMoreFilterModalOpened: (type: boolean) => void;
  filters: {
    bathroom: number | undefined | string;
    landSize: {
      type: string;
      size: undefined | number;
    };
    desirer_features: string[];
  };
  setFilters: (type: {
    bathroom: number | undefined | string;
    landSize: {
      type: string;
      size: undefined | number;
    };
    desirer_features: string[];
  }) => void;
  isViewMoreClicked: boolean;
  setIsViewMoreClicked: (type: boolean) => void;
  propertySelected?: PropertySelectedProps;
  setPropertySelected: (type: PropertySelectedProps) => void;
  setRenderedPage: (
    type: 'agent marketplace' | 'subscription' | 'preference' | 'make payment'
  ) => void;
};

const Index = ({
  formik,
  docsValues,
  setIsDocumentModalOpened,
  isDocumentModalOpened,
  setDocumentsSelected,
  documentsSelected,
  setIsMoreFilterModalOpened,
  isMoreFilterModalOpened,
  filters,
  setFilters,
  isViewMoreClicked,
  setIsViewMoreClicked,
  setPropertySelected,
  setRenderedPage,
}: IndexProps) => {
  const [isUnlockAllFeaturesModalOpened, setAllUnlockAllFeaturesModalOpened] =
    useState<boolean>(false);
  const [payloadFromFilter, setPayloadFromFilter] = useState<any>();
  const is_mobile = useMobile();
  return (
    <>
      {/**main contanet */}
      <aside className='flex flex-col gap-[20px] justify-center items-center'>
        <div className='flex flex-col items-center justify-center gap-[10px]'>
          <h2 className='font-display text-[#09391C] font-semibold text-3xl md:text-4xl text-center'>
            Agent Marketplace
          </h2>
          <p className='text-[#5A5D63] text-xl text-center'>
            Lorem ipsum dolor sit amet consectetur. Vitae mauris tempor
            consequat ac sit.
          </p>
        </div>
        {/**Search form */}
        <form className='w-full py-[25px] bg-[#FFFFFF] px-[15px] flex items-center justify-center'>
          <div className='w-full flex items-end gap-[15px] flex-wrap md:flex-nowrap'>
            {/* <SelectStateLGA
              placeholder='Enter state, lga, city....'
              formik={formik}
              heading=''
            /> */}
            
            <Input
              className='md:w-[220px] w-full text-sm'
              placeholder='Developer preference'
              type='text'
              label=''
              readOnly
              showDropdownIcon={true}
              name=''
              style={{ marginTop: '-40px' }}
              value={docsValues.toString()}
              onClick={() => setAllUnlockAllFeaturesModalOpened(true)}
            />
            {/**Document Type */}
            <div className='flex flex-col gap-[10px] md:w-[188px] w-full'>
              <Input
                className='w-full md:w-[188px] text-sm'
                placeholder='Document Type'
                type='text'
                label=''
                readOnly
                showDropdownIcon={true}
                name=''
                style={{ marginTop: '-40px' }}
                value={docsValues.toString()}
                onClick={() => setIsDocumentModalOpened(true)}
              />
              {isDocumentModalOpened && (
                <></>
                // <DocumentTypeComponent
                //   docsSelected={documentsSelected}
                //   setDocsSelected={setDocumentsSelected}
                //   closeModal={setIsDocumentModalOpened}
                // />
              )}
            </div>
            <Select
              styles={customStyles}
              options={[{ label: 'Nil', value: 'Nil' }]}
              className='md:w-[150px] w-full cursor-pointer'
              placeholder='Land Size'
            />
            {/**Buttons ~ More Filter and Search */}
            <div className='flex gap-[10px]'>
              <div className='flex flex-col gap-[10px] '>
                <button
                  type='button'
                  onClick={() => setIsMoreFilterModalOpened(true)}
                  className='w-[113px] h-[50px] border-[1px] border-[#09391C] text-base text-[#09391C]'>
                  More filter
                </button>
                {isMoreFilterModalOpened &&
                  (is_mobile ? (
                    <></>
                    // <Filter
                    //   payloadFromFilter={payloadFromFilter}
                    //   setPayloadFromFilter={setPayloadFromFilter}
                    //   closeModal={setIsMoreFilterModalOpened}
                    //   selectedType={''}
                    // />
                  ) : (
                    <></>
                    // <MoreFilter
                    //   style={
                    //     is_mobile
                    //       ? { marginLeft: '0px' }
                    //       : { marginLeft: '-100px' }
                    //   }
                    //   filters={filters}
                    //   setFilters={setFilters}
                    //   closeModal={setIsMoreFilterModalOpened}
                    // />
                  ))}
              </div>
              <button
                type='button'
                className='w-[102px] h-[50px] bg-[#8DDB90] text-base text-white font-bold'
                //onClick={() => onSearch(cleanedPayload)}
              >
                Search
              </button>
            </div>
          </div>
        </form>
        {/**cards */}
        <div className='grid gap-[30px] md:grid-cols-3 lg:grid-cols-4 w-full'>
          <AnimatePresence>
            {Array.from({ length: 12 }).map((__, idx: number) => (
              <Card
                setRenderedPage={setRenderedPage}
                // propertySelected={__}
                isClicked={isViewMoreClicked}
                setPropertySelected={setPropertySelected}
                setIsClicked={setIsViewMoreClicked}
                key={idx}
                object={{
                  type: 'joint venture(VJ)',
                  location: 'Lagos, Ikeja',
                  propertyPrices: 200000000,
                  landSize: '400sqm',
                  documents: ['C of O', 'Receipt'],
                }}
              />
            ))}
          </AnimatePresence>
        </div>
      </aside>
      <AnimatePresence>
        {isUnlockAllFeaturesModalOpened && (
          <UnlockAllFeaturesModal
            handleNextPage={setRenderedPage}
            handleCloseModal={setAllUnlockAllFeaturesModalOpened}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default AgentMarketPlace;
