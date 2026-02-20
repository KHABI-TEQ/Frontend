/** @format */

import { DataProps } from '@/types/agent_data_props';
import { FC } from 'react';
import DetailsToCheck from '@/components/detailsToCheck';
import { ShowTableProps } from '@/types/show_table';
import ShowTable from '@/components/showTable';

interface DraftBriefProps extends ShowTableProps {
  detailsToCheck: DataProps;
}

const DraftBriefs: FC<DraftBriefProps> = ({
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
        <ShowTable
          setDetailsToCheck={setDetailsToCheck}
          setShowFullDetails={setShowFullDetails}
          heading={heading}
          data={data}
        />
      )}
    </div>
  );
};

export default DraftBriefs;
