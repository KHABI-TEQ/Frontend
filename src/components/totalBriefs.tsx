/** @format */

import { DataProps } from '@/types/agent_data_props';
import { FC } from 'react';
import DetailsToCheck from '@/components/detailsToCheck';
import { ShowTableProps } from '@/types/show_table';
import ShowTable from '@/components/showTable';

interface TotalBriefProps extends ShowTableProps {
  detailsToCheck: DataProps;
}

const TotalBrief: FC<TotalBriefProps> = ({
  data,
  heading,
  setShowFullDetails,
  setDetailsToCheck,
  showFullDetails,
  detailsToCheck,
}) => {
  return (
    <div className='lg:w-[863px] mt-[60px] flex items-center justify-center'>
      {showFullDetails ? (
        <DetailsToCheck
          setIsFullDetailsClicked={setShowFullDetails}
          detailsToCheck={detailsToCheck}
        />
      ) : (
        <div className='hidden md:flex'>
          <ShowTable
            setDetailsToCheck={setDetailsToCheck}
            setShowFullDetails={setShowFullDetails}
            heading={heading}
            data={data}
          />
        </div>
      )}
    </div>
  );
};

export default TotalBrief;
