/** @format */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { DataProps } from '@/types/agent_data_props';
import { FC, useEffect } from 'react';
import DetailsToCheck from '@/components/detailsToCheck';
import { ShowTableProps } from '@/types/show_table';
import ShowTable from '@/components/showTable';
import Briefs from './mobileBrief';
import axios from 'axios';
import { URLS } from '@/utils/URLS';
import { GET_REQUEST } from '@/utils/requests';
//import { useUserContext } from '@/context/user-context';
import Cookies from 'js-cookie';
// import { BriefType } from '@/types';
// import toast from 'react-hot-toast';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRefresh } from '@fortawesome/free-solid-svg-icons';
import { useCreateBriefContext } from '@/context/create-brief-context';
import { usePageContext } from '@/context/page-context';
import { AgentNavData } from '@/enums';
import toast from 'react-hot-toast';

interface TotalBriefProps extends ShowTableProps {
  detailsToCheck: DataProps;
  isLoading?: boolean;
}

const Brief: FC<TotalBriefProps> = ({
  data,
  heading,
  setShowFullDetails,
  setDetailsToCheck,
  showFullDetails,
  detailsToCheck,
  headerData,
  isLoading,
}) => {
  const { createBrief, setCreateBrief } = useCreateBriefContext();
  const { setSelectedNav } = usePageContext();

  useEffect(() => {
    console.log(data);
  }, []);

  const handleEditBrief = () => {
    if (heading === 'Total Brief') return;
    setCreateBrief({
      ...createBrief,
      areYouTheOwner:
        detailsToCheck.areYouTheOwner !== undefined &&
        detailsToCheck.areYouTheOwner,
      propertyType: detailsToCheck.propertyType,
      additionalFeatures: detailsToCheck.propertyFeatures?.additionalFeatures,
      noOfBedroom: detailsToCheck.propertyFeatures?.noOfBedrooms,
      selectedState: {
        value:
          detailsToCheck.location?.state !== undefined
            ? detailsToCheck.location.state
            : '',
        label:
          detailsToCheck.location?.state !== undefined
            ? detailsToCheck.location.state
            : '',
      },
      selectedLGA: {
        value:
          detailsToCheck.location?.localGovernment !== undefined
            ? detailsToCheck.location.localGovernment
            : '',
        label:
          detailsToCheck.location?.localGovernment !== undefined
            ? detailsToCheck.location.localGovernment
            : '',
      },
      selectedCity:
        detailsToCheck.location?.area !== undefined
          ? detailsToCheck.location.area
          : '',
      documents:
        detailsToCheck.docOnProperty !== undefined
          ? detailsToCheck.docOnProperty.map(({ docName }) => docName)
          : [''],
      price:
        detailsToCheck.price !== undefined
          ? detailsToCheck.price.toString()
          : '',
      fileUrl:
        detailsToCheck.pictures !== undefined
          ? detailsToCheck.pictures.map((item: string) => ({
              id: item,
              image: item,
            }))
          : [],
      usageOptions:
        detailsToCheck.usageOptions !== undefined
          ? detailsToCheck.usageOptions
          : [],
    });
    setSelectedNav(AgentNavData.CREATE_BRIEF);
  };

  /**
   * @handleDeleteBrief : delete brief
   * @param id : id of the brief | string
   */
  const handleDeleteBrief = async (id: string | undefined) => {
    const url = URLS.BASE + URLS.deleteSellBrief + id;
    const token = Cookies.get('token');
    try {
      const response = await axios.delete(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log(response);
      toast.success('Brief deleted');
      if (response.status === 200) {
        console.log(response);
      }
    } catch (error) {
      console.log(error);
      toast.error('Failed to delete brief');
    }
  };
  return (
    <div className=' w-full mt-[30px] md:mt-[60px] flex items-center justify-center'>
      {showFullDetails ? (
        <div>
          <DetailsToCheck
            heading={heading}
            setIsFullDetailsClicked={setShowFullDetails}
            detailsToCheck={detailsToCheck}
          />
          <div className='flex flex-col gap-[10px] bg-[#FFFFFF] md:hidden'>
            <button
              type='button'
              // onClick={handleEditBrief}
              className='w-[90%] ml-[5%] min-h-[50px] flex justify-center items-center border-[1px] border-blue-500 text-blue-500 rounded-[8px] font-ubuntu'>
              Edit
            </button>
            <button
              onClick={() => {
                handleDeleteBrief(detailsToCheck._id);
              }}
              type='button'
              className='w-[90%] ml-[5%] min-h-[50px] flex justify-center items-center border-[1px] border-red-500 text-red-500 rounded-[8px] font-ubuntu'>
              Delete
            </button>
          </div>
        </div>
      ) : (
        <div className='container'>
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
            <>
              <div className='hidden md:flex'>
                <ShowTable
                  headerData={headerData}
                  setDetailsToCheck={setDetailsToCheck}
                  setShowFullDetails={setShowFullDetails}
                  heading={heading}
                  data={data}
                />
              </div>
              {/**Mobile View */}
              <div className='w-full'>
                <Briefs
                  setDetailsToCheck={setDetailsToCheck}
                  setShowFullDetails={setShowFullDetails}
                  header={heading}
                  briefData={data}
                />
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default Brief;
