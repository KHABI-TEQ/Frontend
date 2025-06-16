/** @format */

'use client';
import { archivo, epilogue } from '@/styles/font';
import {
  faArrowDown,
  faArrowLeft,
  faArrowUp,
  faEllipsis,
  faPlus,
  faRefresh,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { Fragment, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useAnimation } from 'framer-motion';
import Select, { SingleValue } from 'react-select';
import customStyles from '@/styles/inputStyle';
import Image from 'next/image';
import filterIcon from '@/svgs/filterIcon.svg';
import useClickOutside from '@/hooks/clickOutside';
import { URLS } from '@/utils/URLS';
import { POST_REQUEST } from '@/utils/requests';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';
import Pagination from '@/components/pagination';

type PreferenceManagementProps = {};

const PreferenceManagement: React.FC<PreferenceManagementProps> = ({}) => {
  const [selectedTable, setSelectedTable] = useState<string>('Buyer');
  const [pageStatus, setPageStatus] = useState<'home' | 'is edit' | 'is view'>('home');
  const [trackNav, setTrackNav] = useState<string[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [briefsData, setBriefsData] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState<number>(3);
  const [selectedBrief, setSelectedBrief] = useState<any | null>(null);

  const BRIEF_TYPES = ['Joint Venture', 'Outright Sales', 'Rent'];

  const fetchAllBriefTypes = async (ownerType: string) => {
    try {
      const allResponses = await Promise.all(
        BRIEF_TYPES.map((briefType) =>
          POST_REQUEST(
            URLS.BASE + URLS.adminGetAllBriefs,
            {
              briefType,
              ownerType,
              page: currentPage,
              limit: 10,
            },
            Cookies.get('adminToken')
          )
        )
      );

      let allBriefs: any[] = [];
      allResponses.forEach((response, idx) => {
        if (response?.success !== false) {
          const data = Array.isArray(response?.properties?.data)
            ? response.properties.data
            : [];
          allBriefs = data.map((item: any) => ({
            id: item._id?.slice(0, 8) || '--',
            legalName: item.owner
              ? item.owner.fullName ||
                `${item.owner.firstName || ''} ${item.owner.lastName || ''}`.trim() ||
                '--'
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
            landSize:
              item.landSize && item.landSize.size !== 'N/A'
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
            briefType: item.briefType || BRIEF_TYPES[idx],
            isApproved: item.isApproved || false,
            isRejected: item.isRejected || false,
            noOfBedrooms: item.additionalFeatures?.noOfBedrooms || '--',
            usageOptions:
              Array.isArray(item.usageOptions) && item.usageOptions.length > 0
                ? item.usageOptions.join(', ')
                : '--',
            features:
              Array.isArray(item.additionalFeatures?.additionalFeatures) &&
              item.additionalFeatures.additionalFeatures.length > 0
                ? item.additionalFeatures.additionalFeatures.join(', ')
                : '--',
            pictures:
              Array.isArray(item.pictures) && item.pictures.length > 0
                ? item.pictures
                : [],
            propertyType: item.propertyType || '--',
            propertyCondition: item.propertyCondition || '--',
            tenantCriteria:
              Array.isArray(item.tenantCriteria) && item.tenantCriteria.length > 0
                ? item.tenantCriteria.join(', ')
                : '--',
          }));
        }
      });

      return allBriefs.sort(
        (a: any, b: any) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } catch (error) {
      console.error('Error fetching briefs:', error);
      return [];
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const briefs = await fetchAllBriefTypes(selectedTable);
      setBriefsData(briefs);
      setIsLoading(false);
    };
    fetchData();
  }, [selectedTable, currentPage]);

  const handleActionClick = (brief: any) => {
    setSelectedBrief(brief);
    setPageStatus('is view');
  };

  const closeSidebar = () => {
    setSelectedBrief(null);
    setPageStatus('home');
  };

  const handlePageChange = (newPage: number) => {
    if (newPage !== currentPage) {
      setCurrentPage(newPage);
    }
  };

  const Home = () => {
    return (
      <aside className='w-full flex flex-col gap-[35px]'>
        <div className='min-h-[64px] w-full flex md:flex-row flex-col items-start justify-between md:items-center gap-[20px]'>
          <div className='flex flex-col gap-[4px]'>
            <h2 className={`${archivo.className} text-3xl font-semibold text-dark`}>
              Preference Management
            </h2>
            <span className={`${archivo.className} text-sm font-normal text-gray-400`}>
              Showing your Account metrics for July 19, 2021 - July 25, 2021
            </span>
          </div>
          <button
            type='button'
            className='h-[50px] w-[163px] bg-[#8DDB90] rounded-[5px] flex justify-center items-center gap-2'>
            <FontAwesomeIcon
              icon={faPlus}
              width={24}
              height={24}
              className='w-[24px] h-[24px]'
              color='white'
            />
            <span className={`text-base ${archivo.className} font-bold text-white`}>
              Send invite
            </span>
          </button>
        </div>

        <div className='flex gap-[45px] h-[37px] border-b-[1px] border-[#D6DDEB]'>
          {['Buyer', 'Tenant', 'Developer'].map((item: string) => {
            const isSelected = selectedTable === item;
            return (
              <motion.span
                key={item}
                onClick={() => setSelectedTable(item)}
                className={`relative px-2 cursor-pointer text-base ${
                  archivo.className
                } ${
                  isSelected
                    ? 'text-[#181336] font-semibold'
                    : 'text-[#515B6F] font-normal'
                }`}
                layout
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}>
                {item}
                {isSelected && (
                  <motion.div
                    layoutId='underline'
                    className='absolute left-0 right-0 -bottom-[1px] h-[2px] bg-[#8DDB90]'
                  />
                )}
              </motion.span>
            );
          })}
        </div>

        {isLoading ? (
          <div className='w-full h-full flex justify-center items-center'>
            <div className='flex items-center gap-1'>
              <span className='text-base'>Loading</span>
              <FontAwesomeIcon
                icon={faRefresh}
                spin
                width={25}
                height={25}
                className='w-[20px] h-[20px]'
              />
            </div>
          </div>
        ) : (
          <div className='w-full bg-white border-[1px] border-[#E4DFDF] rounded-[4px] flex flex-col gap-[39px] overflow-hidden items-start justify-start py-[30px] px-[32px]'>
            <div className='flex gap-[45px] h-[37px] border-b-[1px] border-[#D6DDEB]'>
              <h2 className='text-xl font-semibold text-[#181336]'>{selectedTable}</h2>
            </div>

            <div className='h-[50px] flex justify-between items-center w-full'>
              <Select
                className='w-[160px]'
                styles={customStyles}
                options={[
                  { value: 'Rent', label: 'Rent' },
                  { value: 'Sale', label: 'Sale' },
                  { value: 'Lease', label: 'Lease' },
                  { value: 'All', label: 'All' },
                ]}
                defaultValue={{ value: 'All', label: 'All' }}
              />

              <div className='flex gap-4 w-[96px] items-center justify-center rounded-[5px] border-[1px] border-gray-300 h-[50px]'>
                <Image
                  alt='filter'
                  width={24}
                  height={24}
                  src={filterIcon}
                  className='w-[24px] h-[24px]'
                />
                <h3 className={`text-base font-medium ${archivo.className}`}>filter</h3>
              </div>
            </div>

            <div className='w-full overflow-x-auto'>
              <table className='min-w-[900px] md:w-full border-collapse'>
                <thead>
                  <tr className='border-b bg-[#fafafa] text-center text-sm font-medium text-gray-600'>
                    <th className='p-3' style={{ width: '5%' }}>
                      <input title='checkbox' type='checkbox' />
                    </th>
                    <th className='p-3' style={{ width: '5%' }}>ID</th>
                    <th className='p-3' style={{ width: '10%' }}>Legal Name</th>
                    <th className='p-3' style={{ width: '10%' }}>Agent Type</th>
                    <th className='p-3' style={{ width: '15%' }}>Location</th>
                    <th className='p-3' style={{ width: '5%' }}>Land Size</th>
                    <th className='p-3' style={{ width: '10%' }}>Amount</th>
                    <th className='p-3' style={{ width: '15%' }}>Document</th>
                    <th className='p-3' style={{ width: '5%' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {briefsData.map((item, idx: number) => (
                    <tr key={item.id} className='border-b text-sm text-center text-gray-700 hover:bg-gray-50'>
                      <td className='p-3'>
                        <input title='checkbox' type='checkbox' />
                      </td>
                      <td className='p-3'>{item.id}</td>
                      <td className='p-3'>{item.legalName}</td>
                      <td className={`p-3 font-semibold ${
                        item.agentType === 'Individual'
                          ? 'text-red-500'
                          : item.agentType === 'Incorporated Agent'
                          ? 'text-green-500'
                          : 'text-blue-500'
                      }`}>
                        {item.agentType}
                      </td>
                      <td className='p-3'>{item.location}</td>
                      <td className='p-3'>{item.landSize}</td>
                      <td className='p-3 font-bold'>{item.amount}</td>
                      <td className='p-3'>{item.document}</td>
                      <td className='p-3 cursor-pointer text-2xl'>
                        <FontAwesomeIcon
                          onClick={() => handleActionClick(item)}
                          icon={faEllipsis}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination
              setCurrentPage={setCurrentPage}
              currentPage={currentPage}
              totalPages={totalPages}
            />
          </div>
        )}
      </aside>
    );
  };

  const Details = ({ brief }: { brief: any }) => {
    return (
      <div className='flex flex-col gap-[20px] w-full'>
        <nav className='flex items-center gap-[30px]'>
          <button onClick={closeSidebar} type='button'>
            <FontAwesomeIcon
              icon={faArrowLeft}
              width={24}
              height={24}
              color='#404040'
              className='w-[24px] h-[24px]'
              title='Back'
            />
          </button>
          <div className='flex gap-3'>
            <span className='text-xl text-neutral-700'>Preference Management</span>
            <span className={`text-xl text-neutral-900 ${epilogue.className}`}>
              {brief.legalName}
            </span>
          </div>
        </nav>

        <div className='h-[64px] flex justify-between items-center'>
          <div className='flex gap-[14px]'>
            <div className='w-[64px] h-[64px] rounded-full flex justify-center items-center bg-[#8DDB90]'>
              <span className='text-[#181336] font-archivo font-bold'>
                {brief.legalName?.charAt(0)}
              </span>
            </div>
            <div className='flex flex-col gap-2'>
              <h3>{brief.legalName}</h3>
              <p className='text-sm text-gray-500'>{brief.email}</p>
            </div>
          </div>
        </div>

        <div className='grid grid-cols-2 gap-4'>
          <div className='p-4 border rounded-lg'>
            <h4 className='font-semibold mb-2'>Property Details</h4>
            <p>Type: {brief.propertyType}</p>
            <p>Location: {brief.location}</p>
            <p>Land Size: {brief.landSize}</p>
            <p>Amount: {brief.amount}</p>
          </div>
          <div className='p-4 border rounded-lg'>
            <h4 className='font-semibold mb-2'>Additional Information</h4>
            <p>Bedrooms: {brief.noOfBedrooms}</p>
            <p>Features: {brief.features}</p>
            <p>Usage Options: {brief.usageOptions}</p>
            <p>Documents: {brief.document}</p>
          </div>
        </div>
      </div>
    );
  };

  const renderContentDynamically = (): React.JSX.Element => {
    switch (pageStatus) {
      case 'home':
        return <Home />;
      case 'is view':
        return <Details brief={selectedBrief} />;
      default:
        return <></>;
    }
  };

  return <Fragment>{pageStatus && renderContentDynamically()}</Fragment>;
};

export default PreferenceManagement;
