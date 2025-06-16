/* eslint-disable @typescript-eslint/no-unused-vars */
/** @format */

'use client';
// import { faBars } from '@fortawesome/free-solid-svg-icons';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import ActivitiesScroll from '@/components/admincomponents/activities_scroll';
import { useState, useEffect } from 'react';
import IncomingInspections from '@/components/admincomponents/incoming_inspections';
import { DataProps } from '@/types/agent_data_props';
import OverdueBriefs from '@/components/admincomponents/incoming_briefs';
import PreferenceAttention from '@/components/admincomponents/preference_requiring_attention';
import { motion } from 'framer-motion';
import Brief from '@/components/brief';
import { URLS } from '@/utils/URLS';
import { POST_REQUEST } from '@/utils/requests';
import toast from 'react-hot-toast';
import Cookies from 'js-cookie';
import filterIcon from '@/svgs/filterIcon.svg';
import Image from 'next/image';
import { manrope } from '@/styles/font';
import { formatDate } from '@/utils/helpers';

type BriefDataProps = {
  id: string;
  docOnProperty: { _id: string; isProvided: boolean; docName: string }[];
  pictures: any[];
  propertyType: string;
  price: number;
  location: { state: string; localGovernment: string; area: string };
  propertyFeatures: { additionalFeatures: string[]; noOfBedrooms: number };
  createdAt: string;
};

export default function AttentionOverview() {
  const [active, setActive] = useState('Incoming Inspections');
  const [pendingCount, setPendingCount] = useState(0);
  const [awaitingApprovalCount, SetAwaitingApprovalCount] = useState(0);
  const [requiringAttentionCount, SetRequiringAttentionCount] = useState(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [totalBriefData, setTotalBriefData] = useState<any[]>([]);
  const [incomingBriefsData, setIncomingBriefsData] = useState<any[]>([]);
  const [showFullDetails, setShowFullDetails] = useState<boolean>(false);
  const [detailsToCheck, setDetailsToCheck] = useState<DataProps>(
    totalBriefData[0]
  );
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const getTotalBriefs = async () => {
      setIsLoading(true);
      const adminToken = Cookies.get('adminToken');
      try {
        const response = await POST_REQUEST(
          URLS.BASE + URLS.adminGetAllBriefs,
          {
            propertyType: 'all',
            ownerType: 'BuyerOrRenter',
            page: currentPage,
            limit: 10,
          },
          adminToken
        );

        if (response?.success === false) {
          toast.error('Failed to get data');
          return setIsLoading(false);
        }

        const rents = response?.properties?.data?.rents || [];
        const sells = response?.properties?.data?.sells || [];

        const mappedRents = rents
          .filter((item: any) => !item.isApproved)
          .map((item: any) => ({
            id: item._id?.slice(0, 8) || '--',
            legalName: item.owner
              ? item.owner.fullName || `${item.owner.firstName || ''} ${item.owner.lastName || ''}`.trim() || '--'
              : '--',
            email: item.owner?.email || '--',
            phoneNumber: item.owner?.phoneNumber || '--',
            agentType: item.ownerModel === 'PropertyOwner' ? 'Property Owner' : item.ownerModel || '--',
            location: item.location
              ? `${item.location.state || '--'}, ${item.location.localGovernment || '--'}`
              : '--',
            landSize: item.landSize
              ? `${item.landSize.size || '--'} ${item.landSize.measurementType || '--'}`
              : 'N/A',
            amount: item.rentalPrice ? `₦${item.rentalPrice.toLocaleString()}` : '--',
            document: '--',
            createdAt: item.createdAt ? formatDate(item.createdAt) : '--',
            propertyId: item._id || '--',
            briefType: 'rent',
            isApproved: item.isApproved || false,
            propertyType: item.propertyType || '--',
          }));

        const mappedSells = sells
          .filter((item: any) => !item.isApproved)
          .map((item: any) => ({
            id: item._id?.slice(0, 8) || '--',
            legalName: item.owner
              ? item.owner.fullName || `${item.owner.firstName || ''} ${item.owner.lastName || ''}`.trim() || '--'
              : '--',
            email: item.owner?.email || '--',
            phoneNumber: item.owner?.phoneNumber || '--',
            agentType: item.owner.agentType === 'Company' ? 'Incoporated Agent' : item.owner.agentType || '--',
            location: item.location
              ? `${item.location.state || '--'}, ${item.location.localGovernment || '--'}, ${item.location.area || '--'}`
              : '--',
            landSize: item.landSize
              ? `${item.landSize.size || '--'} ${item.landSize.measurementType || '--'}`
              : '--',
            amount: item.price ? `₦${item.price.toLocaleString()}` : '--',
            document: item.docOnProperty?.length
              ? item.docOnProperty
                  .filter((doc: any) => doc?.isProvided)
                  .map((doc: any) => doc?.docName)
                  .join(', ') || '--'
              : '--',
            createdAt: item.createdAt ? formatDate(item.createdAt) : '--',
            propertyId: item._id || '--',
            briefType: 'sell',
            propertyType: item.propertyType || '--',
          }));

        setTotalBriefData(
          [...mappedRents, ...mappedSells].sort(
            (a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )
        );
        SetRequiringAttentionCount(mappedRents.length + mappedSells.length);

        setIsLoading(false);
      } catch (error) {
        // console.log(error);
        setIsLoading(false);
      } finally {
        setIsLoading(false);
      }
    };
    getTotalBriefs();
  }, [currentPage]);

  useEffect(() => {
    const getIncomingBriefs = async () => {
      setIsLoading(true);
      const adminToken = Cookies.get('adminToken');
      try {
        const response = await POST_REQUEST(
          URLS.BASE + URLS.adminGetAllBriefs,
          {
            propertyType: 'all',
            ownerType: 'PropertyOwner',
            page: currentPage,
            limit: 10,
          },
          adminToken
        );

        if (response?.success === false) {
          toast.error('Failed to get data');
          return setIsLoading(false);
        }

        const rents = response?.properties?.data?.rents || [];
        const sells = response?.properties?.data?.sells || [];

        const mappedRents = rents
          .filter((item: any) => !item.isApproved)
          .map((item: any) => ({
            id: item._id?.slice(0, 8) || '--',
            legalName: item.owner
              ? item.owner.fullName || `${item.owner.firstName || ''} ${item.owner.lastName || ''}`.trim() || '--'
              : '--',
            email: item.owner?.email || '--',
            phoneNumber: item.owner?.phoneNumber || '--',
            agentType: item.ownerModel === 'PropertyOwner' ? 'Property Owner' : item.ownerModel || '--',
            location: item.location
              ? `${item.location.state || '--'}, ${item.location.localGovernment || '--'}`
              : '--',
            landSize: item.landSize
              ? `${item.landSize.size || '--'} ${item.landSize.measurementType || '--'}`
              : 'N/A',
            amount: item.rentalPrice ? `₦${item.rentalPrice.toLocaleString()}` : '--',
            document: '--',
            createdAt: item.createdAt || '--',
            propertyId: item._id || '--',
            briefType: 'rent',
            isApproved: item.isApproved || false,
          }));

        const mappedSells = sells
          .filter((item: any) => !item.isApproved)
          .map((item: any) => ({
            id: item._id?.slice(0, 8) || '--',
            legalName: item.owner
              ? item.owner.fullName || `${item.owner.firstName || ''} ${item.owner.lastName || ''}`.trim() || '--'
              : '--',
            email: item.owner?.email || '--',
            phoneNumber: item.owner?.phoneNumber || '--',
            agentType: item.owner
            ? item.owner.agentType === 'Company'
              ? 'Incorporated Agent'
              : item.owner.agentType || '--'
            : '--',
            location: item.location
              ? `${item.location.state || '--'}, ${item.location.localGovernment || '--'}, ${item.location.area || '--'}`
              : '--',
            landSize: item.landSize
              ? `${item.landSize.size || '--'} ${item.landSize.measurementType || '--'}`
              : '--',
            amount: item.price ? `₦${item.price.toLocaleString()}` : '--',
            document: item.docOnProperty?.length
              ? item.docOnProperty
                  .filter((doc: any) => doc?.isProvided)
                  .map((doc: any) => doc?.docName)
                  .join(', ') || '--'
              : '--',
            createdAt: item.createdAt || '--',
            propertyId: item._id || '--',
            briefType: 'sell',
          }));

        setIncomingBriefsData(
          [...mappedRents, ...mappedSells].sort(
            (a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )
        );
        if (SetAwaitingApprovalCount) {
          SetAwaitingApprovalCount(mappedRents.length + mappedSells.length);
        }

        setIsLoading(false);
      } catch (error) {
        // console.log(error);
        setIsLoading(false);
      }
    };

    getIncomingBriefs();
  }, [currentPage]);

  const renderDynamicComponent = () => {
    switch (active) {
      case 'Incoming Inspections':
        return <IncomingInspections onPendingCount={setPendingCount} />;
      case 'Incoming Briefs':
        return <OverdueBriefs awaitingApprovalCount={SetAwaitingApprovalCount} data={incomingBriefsData} />;
      case 'Preference Requiring Attention':
        return <PreferenceAttention totalBriefData={totalBriefData} />;
      default:
        return <IncomingInspections onPendingCount={setPendingCount} />;
    }
  };

  return (
    <motion.div
      className='w-full overflow-hidden'
      initial={{ y: 90, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.3 }}
      viewport={{ once: true }}>
              {/* <div className='bg-white w-full lg:max-w-[1128px] flex flex-col border rounded-md mt-6 mr-3'>
        <div className='border-b flex md:flex-row flex-col gap-2 justify-between items-start md:items-center px-4 md:px-6 py-2'>
          <h3
            className={`text-[#25324B] text-xl font-semibold lg:text-[20px] ${manrope.className}`}>
            Admins Activities
          </h3>
          <div className='flex gap-4'>
            <div className='flex items-center gap-2 border p-2 rounded-md'>
              <Image
                src={filterIcon}
                alt='filter icon'
                width={24}
                height={24}
                className='w-[24px] h-[24px]'
              />
              <span className='text-[#25324B]'>Filter</span>
            </div>
            <div className='flex lg:w-[205px] items-center justify-center gap-2 border p-2 rounded-md'>
              <p className='text-[#0B423D] md:text-base text-sm'>
                View admin activities
              </p>
            </div>
          </div>
        </div>
        <ActivitiesScroll />
      </div> */}
      <div className='flex flex-col w-full'>
        <div className='flex text-lg w-fit gap-4 md:gap-8 mt-6'>
          {texts.map((item, index) => (
            <TextNotification
              key={index}
              text={item.text}
              onClick={() => setActive(item.text)}
              active={active}
              count={
                item.text === 'Incoming Inspections'
                  ? pendingCount
                  : item.text === 'Incoming Briefs'
                  ? awaitingApprovalCount
                  : item.text === 'Preference Requiring Attention'
                  ? requiringAttentionCount
                  : item.count
              } // Update count dynamically
            />  
          ))}
        </div>
        <div className='w-full'>{active && renderDynamicComponent()}</div>
      </div>
    </motion.div>
  );
}

const TextNotification = ({
  text,
  onClick,
  active,
  count,
}: {
  text: string;
  onClick: () => void;
  active: string;
  count: number;
}) => {
  return (
    <div className='flex'>
      <button
        type='button'
        onClick={onClick}
        className={`relative rounded-sm  ${
          active === text
            ? 'border-b-4 border-[#8DDB90]  text-[#181336] font-semibold'
            : 'text-[#515B6F]'
        }`}>
        {text}
      </button>
      <span className=' text-center w-[26px] h-[26px] z-10 -mt-[10px] bg-[#e51313] text-white rounded-full text-base flex justify-center items-center'>
        {count}
      </span>
    </div>
  );
};

const texts = [
  {
    text: 'Incoming Inspections',
    count: 5,
  },
  {
    text: 'Incoming Briefs',
    count: 25,
  },
  {
    text: 'Preference Requiring Attention',
    count: 2,
  },
];

const headerData: string[] = [
  'ID',
  'Property Type',
  'Location',
  'Property price',
  'Document',
  'Full details',
];
