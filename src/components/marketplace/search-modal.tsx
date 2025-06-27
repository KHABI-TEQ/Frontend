/** @format */

'use client';
import { usePageContext } from '@/context/page-context';
import React, { Fragment, useEffect, useState } from 'react';
import Card from '../general-components/card';
import { epilogue } from '@/styles/font';
import sampleImage from '@/assets/Agentpic.png';
import toast from 'react-hot-toast';
import Loading from '../loading-component/loading';
import { IsMobile } from '@/hooks/isMobile';
import RentSearchModal from './rent-search-modal';
import BuyAPropertySearchModal from './buy-a-property-modal';
import JointVentureModal from './joint-venture-modal';
import JointVentureModalCard from './joint-venture-card';
import SelectStateLGA from './select-state-lga';
import { useFormik } from 'formik';
import Mobile from './for-mobile';
import { URLS } from '@/utils/URLS';
import { shuffleArray } from '@/utils/shuffleArray';
import { useRouter } from 'next/navigation';
import { POST_REQUEST } from '@/utils/requests';
import { useSelectedBriefs } from '@/context/selected-briefs-context';

type PayloadProps = {
  twoDifferentInspectionAreas: boolean;
  initialAmount: number;
  toBeIncreaseBy: number;
};
 
const SearchModal = ({
  isAddForInspectionModalOpened,
  setIsAddInspectionModalOpened,
  setPropertiesSelected,
  propertiesSelected,
  addForInspectionPayload,
  setAddForInspectionPayload,
  isComingFromPriceNeg,
  comingFromPriceNegotiation,
  inspectionType,
  setInspectionType,
  isComingFromSubmitLol,
  setIsComingFromSubmitLol,
  isLetterOfIntentionModalOpened,
  setIsLetterOfIntentionModalOpened,
}: {
  isAddForInspectionModalOpened: boolean;
  setIsAddInspectionModalOpened: (type: boolean) => void;
  propertiesSelected: any[];
  setPropertiesSelected: (type: any[]) => void;
  addForInspectionPayload: PayloadProps;
  setAddForInspectionPayload: (type: PayloadProps) => void;
  isLetterOfIntentionModalOpened: boolean;
  setIsLetterOfIntentionModalOpened: (type: boolean) => void;
  /**
   * coming from the price negotiation button
   */
  isComingFromPriceNeg?: boolean;
  comingFromPriceNegotiation?: (type: boolean) => void;
  //inspection type
  inspectionType: 'Buy' | 'JV' | 'Rent/Lease';
  setInspectionType: (type: 'Buy' | 'JV' | 'Rent/Lease') => void;
  /**
   * coming from submit Lol button
   */
  isComingFromSubmitLol: boolean;
  setIsComingFromSubmitLol: (type: boolean) => void;
}) => {
  const [selectedType, setSelectedType] = useState<string>('Land');
  const { selectedType: userSelectedMarketPlace } = usePageContext();
  const { selectedBriefs, setSelectedBriefs } = useSelectedBriefs();
  const [uniqueProperties, setUniqueProperties] = useState<Set<any>>(
    new Set(propertiesSelected)
  );
  const [formikStatus, setFormikStatus] = useState<
    'idle' | 'pending' | 'success' | 'failed'
  >('success');
  const [errMessage, setErrMessage] = useState<string>('');
  const [properties, setProperties] = useState<any[]>([]);
  const [usageOptions, setUsageOptions] = useState<string[]>([]);
  const [rentFilterBy, setRentFilterBy] = useState<string[]>([]);
  const [jvFilterBy, setJvFilterBy] = useState<string[]>(['All']);
  const [homeCondition, setHomeCondition] = useState<string>('');
  const [briefToFetch, setBriefToFetch] = useState<string>(
    URLS.buyersFetchBriefs
  );

  const [searchStatus, setSearchStatus] = useState<{
    status: 'pending' | 'success' | 'failed' | 'idle';
    couldNotFindAProperty: boolean;
  }>({
    status: 'idle',
    couldNotFindAProperty: false,
  });

  const router = useRouter();

  const handleRemoveAllBriefs = () => {
    setUniqueProperties(new Set());
    setPropertiesSelected([]);
  };

  // Sync local selection to context
  useEffect(() => {
    setSelectedBriefs(Array.from(uniqueProperties));
  }, [uniqueProperties, setSelectedBriefs]);

  const handleSearch = async (searchPayload: any) => {
    setFormikStatus('pending');
    setSearchStatus({
      status: 'pending',
      couldNotFindAProperty: false,
    });
    // console.log("searchPayload", searchPayload);
    try {
      await toast.promise(
        POST_REQUEST(URLS.BASE + URLS.searchBrief, {
          ...searchPayload,
        }).then((response) => {
          const data = Array.isArray(response) ? response : response?.data;
          if (!data) {
            setErrMessage('Failed to fetch data');
            setFormikStatus('failed');
            setSearchStatus({
              status: 'failed',
              couldNotFindAProperty: true,
            });
            throw new Error('Failed to fetch data');
          }
          setFormikStatus('success');
          const shuffledData = shuffleArray(data);
          setProperties(shuffledData);
          setSearchStatus({
            status: 'success',
            couldNotFindAProperty: properties['length'] === 0,
          });
          console.log(`Properties: ${properties.length}`);
          // setUsageOptions(['All'])
        }),
        {
          loading: 'Searching...',
          success: 'Properties loaded!',
          error: 'Failed to load properties',
        }
      );
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.error(err);
        setErrMessage(err.message || 'An error occurred');
        setFormikStatus('failed');
        setSearchStatus({
          status: 'failed',
          couldNotFindAProperty: true,
        });
      }
    }
  };

  useEffect(() => {
    let briefType = '';
    switch (userSelectedMarketPlace) {
      case 'Buy a property':
        briefType = 'Outright Sales';
        break;
      case 'Find property for joint venture':
        briefType = 'Joint Venture';
        break;
      case 'Rent/Lease a property':
        briefType = 'Rent';
        break;
      default:
        briefType = 'Outright Sales';
    }
    // You can set default page and limit as needed
    setBriefToFetch(
      `${URLS.fetchBriefs}?page=1&limit=1000&briefType=${encodeURIComponent(
        briefType
      )}`
    );
  }, [userSelectedMarketPlace]);

  const renderDynamicComponent = () => {
    switch (userSelectedMarketPlace) {
      case 'Buy a property':
        return (
          <div className='relative w-full flex flex-col'>
            <BuyAPropertySearchModal
              usageOptions={usageOptions}
              addForInspectionPayload={addForInspectionPayload}
              setUsageOptions={setUsageOptions}
              // selectedBriefs={uniqueProperties.size}
              selectedBriefs={selectedBriefs.length}
              // setSelectedBriefs={setSelectedBriefs}
              setSelectedBriefs={setUniqueProperties}
              setAddInspectionModal={setIsAddInspectionModalOpened}
              inspectionType={inspectionType}
              setInspectionType={setInspectionType}
              onSearch={handleSearch}
              searchStatus={searchStatus}
            />
            <section className='w-full flex-1 overflow-y-auto flex justify-center items-start md:mt-[20px]'>
              {(formikStatus || usageOptions) &&
                renderBriefs('Buy a property', usageOptions)}
            </section>
          </div>
        );
      case 'Rent/Lease a property':
        return (
          <div className='relative w-full flex flex-col'>
            <RentSearchModal
              homeCondition={homeCondition}
              setHomeCondition={setHomeCondition}
              rentFilterBy={rentFilterBy}
              setRentFilterBy={setRentFilterBy}
              selectedBriefs={uniqueProperties.size}
              setSelectedBriefs={setUniqueProperties}
              setAddInspectionModal={setIsAddInspectionModalOpened}
              addForInspectionPayload={addForInspectionPayload}
              setUsageOptions={setUsageOptions}
              inspectionType={inspectionType}
              setInspectionType={setInspectionType}
              onSearch={handleSearch}
              searchStatus={searchStatus}
            />
            <section className='flex-1 overflow-y-auto flex justify-center items-start md:mt-[20px]'>
              {formikStatus &&
                renderBriefs(
                  userSelectedMarketPlace,
                  rentFilterBy,
                  homeCondition
                )}
            </section>
          </div>
        );
      case 'Find property for joint venture':
        return (
          <div className='relative w-full flex flex-col'>
            <JointVentureModal
              onSearch={handleSearch}
              selectedBriefs={uniqueProperties.size}
              addForInspectionPayload={addForInspectionPayload}
              // setUsageOptions={setUsageOptions}
              setSelectedBriefs={setUniqueProperties}
              setAddInspectionModal={setIsAddInspectionModalOpened}
              inspectionType={inspectionType}
              usageOptions={jvFilterBy}
              setUsageOptions={setJvFilterBy}
              setInspectionType={setInspectionType}
            />
            <section className='flex-1 overflow-y-auto flex justify-center items-start md:mt-[20px]'>
              {formikStatus &&
                renderBriefs(userSelectedMarketPlace, jvFilterBy)}
            </section>
          </div>
        );
      default:
        return <></>;
    }
  };

  const renderBriefs = (
    type: string,
    filterBy: string[],
    condition?: string
  ) => { 
    const briefsToDisplay = () => {
      switch (type) {
        /**Buy a property Briefs */
        case 'Buy a property':
          return properties?.map((property, idx: number) => {
            /**Check users filtering options and display based on the filter */
            if (
              (filterBy?.includes('Land') &&
                property.propertyType === 'Land') ||
              (filterBy?.includes('Residential') &&
                property.propertyType === 'Residential') ||
              (filterBy?.includes('Commercial') &&
                property.propertyType === 'Commercial')
            ) {
              return (
                <Card
                  style={is_mobile ? { width: '100%' } : { width: '281px' }}
                  images={property?.pictures || [sampleImage]}
                  isAddForInspectionModalOpened={isAddForInspectionModalOpened}
                  setIsAddInspectionModalOpened={setIsAddInspectionModalOpened}
                  setPropertySelected={setPropertiesSelected}
                  isComingFromPriceNeg={isComingFromPriceNeg}
                  setIsComingFromPriceNeg={comingFromPriceNegotiation}
                  isPremium={property?.isPremium}
                  property={property}
                  onCardPageClick={() => {
                    const selectedBriefsParam = encodeURIComponent(
                      JSON.stringify(Array.from(uniqueProperties))
                    );
                    router.push(
                      `/property/${'Buy'}/${
                        property._id
                      }?selectedBriefs=${selectedBriefsParam}`
                    );
                  }}
                  onClick={() => {
                    handlePropertiesSelection(property);
                  }}
                  cardData={[
                    {
                      header: 'Property Type',
                      value: property.propertyType,
                    },
                    {
                      header: 'Price',
                      value: `₦${Number(property.price).toLocaleString()}`,
                    },
                    {
                      header: 'Bedrooms',
                      value: property.additionalFeatures?.noOfBedrooms || 'N/A',
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
                  ]}
                  key={idx}
                  isDisabled={uniqueProperties.has(property)}
                />
              );
            } else if (
              /**If filters include all or none is selected, display all */
              filterBy?.includes('All') ||
              filterBy?.length === 0
              // filterBy?.['length'] === 0
            ) {
              return (
                <Card
                  style={is_mobile ? { width: '100%' } : { width: '281px' }}
                  images={property?.pictures}
                  isAddForInspectionModalOpened={isAddForInspectionModalOpened}
                  setIsAddInspectionModalOpened={setIsAddInspectionModalOpened}
                  setPropertySelected={setPropertiesSelected}
                  isComingFromPriceNeg={isComingFromPriceNeg}
                  setIsComingFromPriceNeg={comingFromPriceNegotiation}
                  property={property}
                  isPremium={property?.isPremium}
                  onCardPageClick={() => {
                    router.push(`/property/${type}/${property._id}`);
                  }}
                  onClick={() => {
                    handlePropertiesSelection(property);
                  }}
                  cardData={[
                    {
                      header: 'Property Type',
                      value: property.propertyType,
                    },
                    {
                      header: 'Price',
                      value: `₦${Number(property.price).toLocaleString()}`,
                    },
                    {
                      header: 'Bedrooms',
                      value: property.additionalFeatures?.noOfBedrooms || 'N/A',
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
                  ]}
                  key={idx}
                  isDisabled={uniqueProperties.has(property)}
                />
              );
            }
          });
        case 'Find property for joint venture':
          return properties?.map((property, idx: number) => {
            if (
              (filterBy?.includes('Land') &&
                property.propertyType === 'Land') ||
              (filterBy?.includes('Residential') &&
                property.propertyType === 'Residential') ||
              (filterBy?.includes('Commercial') &&
                property.propertyType === 'Commercial')
            ) {
              return (
                <JointVentureModalCard
                  key={idx}
                  onClick={() => handlePropertiesSelection(property)}
                  isDisabled={uniqueProperties.has(property)}
                  onCardPageClick={() => router.push(`/property/JV/${property._id}`)}
                  isComingFromSubmitLol={isComingFromSubmitLol}
                  setIsComingFromSubmitLol={setIsComingFromSubmitLol}
                  cardData={[]}
                  images={[]}
                  property={property}
                  isPremium={property?.isPremium}
                  properties={properties}
                  isAddInspectionalModalOpened={isAddForInspectionModalOpened}
                  setPropertySelected={setPropertiesSelected}
                  setIsAddInspectionModalOpened={setIsAddInspectionModalOpened}
                  onSubmitLoi={() => setIsLetterOfIntentionModalOpened(true)}
                />
              );
            } else if (
              /**If filters include all or none is selected, display all */
              filterBy?.includes('All') ||
              filterBy?.length === 0
              // filterBy?.['length'] === 0
            ) {
              return (
                <JointVentureModalCard
                  key={idx}
                  onClick={() => handlePropertiesSelection(property)}
                  isDisabled={uniqueProperties.has(property)}
                  onCardPageClick={() => router.push(`/property/JV/${property._id}`)}
                  isComingFromSubmitLol={isComingFromSubmitLol}
                  setIsComingFromSubmitLol={setIsComingFromSubmitLol}
                  cardData={[]}
                  images={[]}
                  property={property}
                  properties={properties}
                  isAddInspectionalModalOpened={isAddForInspectionModalOpened}
                  setPropertySelected={setPropertiesSelected}
                  setIsAddInspectionModalOpened={setIsAddInspectionModalOpened}
                  onSubmitLoi={() => setIsLetterOfIntentionModalOpened(true)}
                />
              );
            }
          });

        case 'Rent/Lease a property':
          return properties?.map((property, idx: number) => {
            /**Check users filtering options and display based on the filter */
            if (
              (filterBy?.includes('Land') &&
                property.propertyType === 'Land') ||
              (filterBy?.includes('Residential') &&
                property.propertyType === 'Residential') ||
              (filterBy?.includes('Commercial') &&
                property.propertyType === 'Commercial') ||
              (filterBy?.includes('Duplex') &&
                property.propertyType === 'Duplex') ||
              condition?.includes('Brand new') ||
              condition?.includes('Good condition') ||
              condition?.includes('Fairly used') ||
              condition?.includes('Need Renovation') ||
              condition?.includes('New Building')
            ) {
              return (
                <Card
                  style={is_mobile ? { width: '100%' } : { width: '281px' }}
                  images={property?.pictures}
                  setIsAddInspectionModalOpened={setIsAddInspectionModalOpened}
                  isAddForInspectionModalOpened={isAddForInspectionModalOpened}
                  setPropertySelected={setPropertiesSelected}
                  isComingFromPriceNeg={isComingFromPriceNeg}
                  setIsComingFromPriceNeg={comingFromPriceNegotiation}
                  property={property}
                  isPremium={property?.isPremium}
                  onCardPageClick={() => {
                    router.push(`/property/Rent/${property._id}`);
                  }}
                  onClick={() => {
                    handlePropertiesSelection(property);
                  }}
                  cardData={[
                    {
                      header: 'Property Type',
                      value: property.propertyType,
                    },
                    {
                      header: 'Price',
                      value: property.price
                        ? `₦${Number(property.price).toLocaleString()}`
                        : 'N/A',
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
                  ]}
                  key={idx}
                  isDisabled={uniqueProperties.has(property)}
                />
              );
            } else if (
              /**If filters include all or none is selected, display all */
              filterBy?.includes('All') ||
              filterBy?.['length'] === 0 ||
              condition?.includes('All')
            ) {
              return (
                <Card
                  style={is_mobile ? { width: '100%' } : { width: '281px' }}
                  images={property?.pictures}
                  property={property}
                  isPremium={property?.isPremium}
                  setIsAddInspectionModalOpened={setIsAddInspectionModalOpened}
                  isAddForInspectionModalOpened={isAddForInspectionModalOpened}
                  setPropertySelected={setPropertiesSelected}
                  isComingFromPriceNeg={isComingFromPriceNeg}
                  setIsComingFromPriceNeg={comingFromPriceNegotiation}
                  onCardPageClick={() => {
                    router.push(`/property/Rent/${property._id}`);
                  }}
                  onClick={() => {
                    handlePropertiesSelection(property);
                  }}
                  cardData={[
                    {
                      header: 'Property Type',
                      value: property.propertyType,
                    },
                    {
                      header: 'Price',
                      value: property.price
                        ? `₦${Number(property.price).toLocaleString()}`
                        : 'N/A',
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
                  ]}
                  key={idx}
                  isDisabled={uniqueProperties.has(property)}
                />
              );
            }
          });
      }
    };
    switch (formikStatus) {
      case 'success':
        return (
          <div className='flex flex-col gap-[21px] w-full lg:w-[1154px]'>
            <h2
              className={`text-[#09391C] font-semibold ${epilogue.className} md:inline hidden text-lg`}>
              Select the property brief you wish to inspect
            </h2>
            <div className='grid md:grid-cols-4 gap-[20px] md:gap-[37px]'>
              {type && briefsToDisplay()}
            </div>
          </div>
        );
      case 'pending':
        return <Loading />;
      case 'idle':
        return <p>Failed to Load</p>;
      default:
        return <p>Failed to Load</p>;
    }
  };

  const handlePropertiesSelection = (property: any) => {
    const maximumSelection: number = 2;
    if (uniqueProperties.size === maximumSelection) {
      return toast.error(`Maximum of ${maximumSelection} reached`);
    }
    // Create a new Set to trigger state update
    const newSet = new Set(uniqueProperties);
    newSet.add(property);
    setUniqueProperties(newSet);
    setPropertiesSelected(Array.from(newSet));
    toast.success('Property selected');
  };

  useEffect(() => {
    // Only consider up to 2 selected briefs
    const selected = propertiesSelected.slice(0, 2);

    if (selected.length === 1) {
      setAddForInspectionPayload({
        initialAmount: 10000,
        toBeIncreaseBy: 0,
        twoDifferentInspectionAreas: false,
      });
    } else if (selected.length === 2) {
      const [a, b] = selected.map((item) => item.location.localGovernment);
      const uniqueLGAs = new Set([a, b]);
      if (uniqueLGAs.size === 1) {
        // Both briefs are from the same localGovernment
        setAddForInspectionPayload({
          initialAmount: 10000,
          toBeIncreaseBy: 0,
          twoDifferentInspectionAreas: false,
        });
      } else {
        // Briefs are from different localGovernments
        setAddForInspectionPayload({
          initialAmount: 10000,
          toBeIncreaseBy: 5000,
          twoDifferentInspectionAreas: true,
        });
      }
    } else {
      // No briefs selected
      setAddForInspectionPayload({
        initialAmount: 0,
        toBeIncreaseBy: 0,
        twoDifferentInspectionAreas: false,
      });
    }
  }, [propertiesSelected]);

  const is_mobile = IsMobile();

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    const fetchAllData = async () => {
      setFormikStatus('pending');
      try {
        const response = await fetch(URLS.BASE + briefToFetch, {
          signal,
        });

        if (!response.ok) {
          setErrMessage('Failed to fetch data');
          setFormikStatus('failed');
          throw new Error('Failed to fetch data');
        }

        const data = await response.json();
        setFormikStatus('success');
        const approvedData = Array.isArray(data.data)
          ? data.data.filter((item: any) => item.isApproved === true)
          : [];
        const shuffledData = shuffleArray(approvedData);
        setProperties(shuffledData);
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.error(err);
          setErrMessage(err.message || 'An error occurred');
          setFormikStatus('failed');
        }
      }
    };

    fetchAllData();

    return () => {
      controller.abort();
    };
  }, [briefToFetch]);

  return (
    <Fragment>
      {is_mobile ? (
        <Mobile
          searchStatus={searchStatus}
          selectedMarketPlace={userSelectedMarketPlace}
          renderBrief={renderDynamicComponent}
          selectedBriefs={uniqueProperties.size}
          onSelectBrief={handlePropertiesSelection}
          selectedBriefsList={uniqueProperties} // pass the array
          onSubmitForInspection={(selectedBriefsList: Set<any>) => {
            setPropertiesSelected(Array.from(selectedBriefsList));
            setIsAddInspectionModalOpened(true);
          }}
          setPropertiesSelected={setPropertiesSelected}
          handleSearch={handleSearch}
          onRemoveAllBriefs={handleRemoveAllBriefs}
        />
      ) : (
        <>{userSelectedMarketPlace && renderDynamicComponent()}</>
      )}
    </Fragment>
  );
};

export default SearchModal;
