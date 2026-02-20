/** @format */
import { ShowTableProps } from '@/types/show_table';
import { faEllipsis } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import '@/styles/tables.css';

const ShowTable: React.FC<ShowTableProps> = ({
  data,
  heading,
  headerData,
  setShowFullDetails,
  setDetailsToCheck,
}) => {
  return (
    <div className='w-full border-[1px] border-[#E4DFDF] min-h-fit rounded-[4px] py-[32px] px-[30px] flex flex-col gap-[30px] bg-[#FFFFFF]'>
      <h1 className='text-[18px] leading-[18px] text-[#000000] font-semibold font-archivo'>
        {heading}
      </h1>
      <table className='w-full flex flex-col gap-[15px]'>
        <thead className='min-h-[54px] p-[16px] bg-[#FAFAFA]'>
          {''}
          <tr className='w-full flex'>
            {headerData?.map((item: string, idx: number) => (
              <td
                key={idx}
                className='text-[14px] leading-[22.4px] font-normal font-archivo text-[#7C8493]'>
                {item}
              </td>
            ))}
          </tr>
        </thead>
        <tbody className='space-y-6 flex flex-col justify-start overflow-y-scroll hide-scrollbar px-[8px]'>
          {data.map((item, idx: number) => (
            <tr className='w-full flex' key={idx}>
              <td className='text-[14px] leading-[22.4px] font-normal font-archivo text-[#181336]'>
                {item.date.split('T')[0]}
              </td>
              <td className='text-[14px] leading-[22.4px] font-normal font-archivo text-[#181336]'>
                {item.propertyType}
              </td>
              <td className='text-[14px] text-left leading-[22.4px] font-normal font-archivo text-[#181336]'>
                {item.actualLocation?.state},
                {item.actualLocation?.localGovernment}
              </td>
              <td className='text-[14px] leading-[22.4px] font-normal font-archivo text-[#181336]'>
                N {Number(item.propertyPrice).toLocaleString()}
              </td>
              {item.document?.length !== 0 ? (
                // <td className='text-[14px] leading-[22.4px] font-normal font-archivo text-[#181336]'>
                //   {item.document.split('').splice(0, 14).join('') + '...'}
                // </td>
                <td className='text-[14px] leading-[22.4px] font-normal font-archivo text-[#181336]'>
                  {item?.docOnProperty !== undefined &&
                    item.docOnProperty[0].docName
                      .split('')
                      .splice(0, 14)
                      .join('')}
                  {'...'}
                </td>
              ) : null}
              {/* {item.amountSold ? (
                <td className='text-[14px] text-[#14B01A] leading-[22.4px] font-normal font-archivo'>
                  N {Number(item.amountSold).toLocaleString()}
                </td>
              ) : null} */}
              <td className='text-[14px] leading-[22.4px] font-normal font-archivo text-[#181336]'>
                <FontAwesomeIcon
                  onClick={() => {
                    console.log(idx);
                    setShowFullDetails(true);
                    setDetailsToCheck(item);
                  }}
                  icon={faEllipsis}
                  width={24}
                  height={24}
                  title={'See full details'}
                  className='w-[24px] h-[24px] cursor-pointer'
                  color={'#181336'}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ShowTable;
