/** @format */
/* eslint-disable @typescript-eslint/no-explicit-any */

'use client';
import React, { useEffect, useState } from 'react';
import { usePageContext } from '@/context/page-context';
import AgentNav from '@/components/agent_navbar';
import { AgentNavData } from '@/enums';
import { DataProps } from '@/types/agent_data_props';
import PropertyType from '@/components/propertyType';
import Overview from '@/components/overview';
import { completeTransactionData } from '@/data/sampleDataForAgent';
import Brief from '@/components/brief';
import { URLS } from '@/utils/URLS';
import { GET_REQUEST } from '@/utils/requests';
import toast from 'react-hot-toast';
// import { GET_REQUEST } from '@/utils/requests';
// import { URLS } from '@/utils/URLS';
// import { useUserContext } from '@/context/user-context';
import Cookies from 'js-cookie';
import { briefData } from '@/data/sampleDataForAgent';

type BriefDataProps = {
  docOnProperty: { _id: string; isProvided: boolean; docName: string }[];
  pictures: any[];
  propertyType: string;
  price: number;
  location: { state: string; localGovernment: string; area: string };
  propertyFeatures: { additionalFeatures: string[]; noOfBedrooms: number };
  createdAt: string;
};

type AgentBriefsResponse = {
  sellProperties?: BriefDataProps[];
  rentProperties?: BriefDataProps[];
};

const Form2 = () => {
  const { isContactUsClicked, isModalOpened } = usePageContext();
  const { selectedNav } = usePageContext();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  // const [briefsData, setBriefsData] = useState<any[]>([]);
  // const [isLoading, setIsLoading] = useState<boolean>(true);
  // const [errMessage, setErrMessage] = useState<string>('');
  // const { user } = useUserContext();

  /**TotalBrief */
  const [totalBriefData, setTotalBriefData] = useState<any[]>([]);
  const [showFullDetails, setShowFullDetails] = useState<boolean>(false);
  const [detailsToCheck, setDetailsToCheck] = useState<DataProps>(
    totalBriefData[0]
  );

  /**Draft Brief */
  const [showDraftBriefFullDetails, setShowDraftBriefFullDetails] =
    useState<boolean>(false);
  const [detailsToCheckForDraftBrief, setDetailsToCheckForDraftBrief] =
    useState<DataProps>(briefData[0]);

  /**Transaction History */
  const [showTransactionHistory, setShowTransactionHistory] =
    useState<boolean>(false);
  const [
    detailsToCheckForTransactionHistory,
    setDetailsToCheckForTransactionHistory,
  ] = useState<DataProps>(briefData[0]);

  // useEffect(() => {
  //   const loadData = async () => {
  //     const result = await fetch(URLS.BASE + URLS.agentfetchTotalBriefs);
  //     if (result.success) {
  //       const combinedData = [...result.data.sellProperties, ...result.data.rentProperties];
  //       const formattedData = combinedData.map((property) => ({
  //         date: new Date(property.createdAt).toLocaleDateString(),
  //         propertyType: property.propertyType,
  //         location: `${property.location.state}, ${property.location.localGovernment}`,
  //         propertyPrice: property.price || property.rentalPrice,
  //         document: property.docOnProperty ? property.docOnProperty.map(doc => doc.docName).join(', ') : 'N/A',
  //       }));
  //       setBriefData(formattedData);
  //     } else {
  //       setErrMessage(result.message);
  //     }
  //     setIsLoading(false);
  //   };

  //   loadData();
  // }, []);

  // if (isLoading) return <p>Loading...</p>;
  // if (errMessage) return <p>{errMessage}</p>;

  useEffect(() => {
    const getTotalBriefs = async () => {
      setIsLoading(true);
      try {
        const response = await GET_REQUEST(
          URLS.BASE + URLS.agentfetchTotalBriefs,
          Cookies.get('token')
        );

        if (response?.success === false) {
          toast.error('Failed to get data');
          return setIsLoading(false);
        }
        const data = (response.data ?? {}) as AgentBriefsResponse;
        console.log(data);
        const combinedProperties = [
          ...(data.sellProperties ?? []),
          ...(data.rentProperties ?? []),
        ].map(
          ({
            docOnProperty,
            pictures,
            propertyType,
            price,
            location,
            propertyFeatures,
            createdAt,
          }: BriefDataProps) => ({
            date: createdAt,
            propertyType,
            actualLocation: location,
            propertyPrice: price,
            docOnProperty,
            amountSold: price,
            pictures,
            propertyFeatures,
          })
        );

        setTotalBriefData(combinedProperties);
        setIsLoading(false);
      } catch (error) {
        console.log(error);
        setIsLoading(false);
      } finally {
        setIsLoading(false);
      }
    };

    getTotalBriefs();
  }, []);

  return (
    <section
      className={`flex w-full items-center filter justify-center transition duration-500 bg-[#EEF1F1] min-h-[800px] py-[40px]  ${
        (isContactUsClicked || isModalOpened) && 'brightness-[30%]'
      }`}>
      <div className='container flex flex-col min-h-[700px] items-center p-[20px]'>
        <AgentNav />
        {selectedNav === AgentNavData.OVERVIEW && <Overview />}
        {selectedNav === AgentNavData.CREATE_BRIEF && <PropertyType />}
        {selectedNav === AgentNavData.TOTAL_BRIEF && (
          <Brief
            headerData={headerData}
            detailsToCheck={detailsToCheck}
            setShowFullDetails={setShowFullDetails}
            setDetailsToCheck={setDetailsToCheck}
            showFullDetails={showFullDetails}
            heading='Total Brief'
            isLoading={isLoading}
            data={totalBriefData}
          />
        )}
        {selectedNav === AgentNavData.DRAFT_BRIEF && (
          <Brief
            headerData={headerData}
            detailsToCheck={detailsToCheckForDraftBrief}
            setShowFullDetails={setShowDraftBriefFullDetails}
            setDetailsToCheck={setDetailsToCheckForDraftBrief}
            showFullDetails={showDraftBriefFullDetails}
            heading='Draft Brief'
            isLoading={isLoading}
            data={briefData}
          />
        )}
        {selectedNav === AgentNavData.TRANSACTION_HISTORY && (
          <Brief
            headerData={transactionHeaderData}
            detailsToCheck={detailsToCheckForTransactionHistory}
            setShowFullDetails={setShowTransactionHistory}
            setDetailsToCheck={setDetailsToCheckForTransactionHistory}
            showFullDetails={showTransactionHistory}
            heading='Complete Transaction'
            isLoading={isLoading}
            data={completeTransactionData}
          />
        )}
      </div>
    </section>
  );
};

const headerData: string[] = [
  'Date',
  'Property Type',
  'Location',
  'Property price',
  'Document',
  'Full details',
];

const transactionHeaderData: string[] = [
  'Date',
  'Property Type',
  'Location',
  'Property price',
  'Amount sold',
  'Full details',
];

export default Form2;
