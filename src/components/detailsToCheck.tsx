/** @format */
'use client';
import Image from 'next/image';
import arrowRight from '@/svgs/arrowR.svg';
import { DataProps } from '@/types/agent_data_props';
import { FC, useEffect, useRef } from 'react';
import { usePageContext } from '@/context/page-context';
import { AgentNavData } from '@/enums';

interface DetailsToCheckProps {
  setIsFullDetailsClicked: (type: boolean) => void;
  detailsToCheck: DataProps;
  heading?: string;
  submitBrief?: boolean;
}

const DetailsToCheck: FC<DetailsToCheckProps> = ({
  setIsFullDetailsClicked,
  detailsToCheck,
  heading,
  submitBrief,
}) => {
  const topRef = useRef<HTMLDivElement>(null);
  const { setSelectedNav, setPropertyDetails } = usePageContext();

  const scrollToTop = () => {
    topRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToTop();
  }, []);
  return (
    <div
      ref={topRef}
      className='container w-full min-h-[342px] mt-[5px] lg:mt-0 flex flex-col gap-[20px] lg:gap-[30px]'>
      <div className='min-h-[32px] lg:min-w-[268px] flex gap-[24px] items-center'>
        <Image
          src={arrowRight}
          width={24}
          height={24}
          alt='Go Back'
          title='Go Back'
          onClick={() => {
            setIsFullDetailsClicked(false);
          }}
          className='w-[24px] h-[24px] cursor-pointer'
        />
        <div className='flex items-center gap-[8px]'>
          <span className='text-[20px] leading-[32px] text-[#25324B] font-normal'>
            {heading}
          </span>
          <svg
            width='4'
            height='4'
            viewBox='0 0 4 4'
            fill='none'
            xmlns='http://www.w3.org/2000/svg'>
            <circle cx='2' cy='2' r='2' fill='#25324B' />
          </svg>
          <span className='text-[20px] leading-[32px] text-[#25324B] font-semibold font-epilogue'>
            Full Details
          </span>
        </div>
      </div>

      <div className='w-full min-h-[310px] border-[1px] py-[30px] flex flex-row flex-wrap items-start gap-[39px] border-[#E9EBEB] bg-[#FFFFFF] p-[20px] lg:p-[60px]'>
        <div className='w-full flex flex-wrap gap-[20px] items-start'>
          {/**Property Type and Property Price */}
          <Container
            heading='Property Type'
            title={detailsToCheck.propertyType}
          />
          <Container
            heading='Property price'
            title={`N ${Number(detailsToCheck.propertyPrice).toLocaleString()}`}
          />

          {/**Location and Property Features */}
          <Container
            heading='Location'
            title={
              detailsToCheck.actualLocation
                ? `${detailsToCheck.actualLocation.state}, ${detailsToCheck.actualLocation.localGovernment}, ${detailsToCheck.actualLocation.area}`
                : detailsToCheck.location
                  ? `${detailsToCheck.location.state}, ${detailsToCheck.location.localGovernment}, ${detailsToCheck.location.area}`
                  : ''
            }
          />
          <Container
            heading='Property Features'
            containsList={true}
            mapData={detailsToCheck.propertyFeatures?.additionalFeatures}
          />
          {/**Bedroom */}
          <Container
            heading='Bedroom'
            title={detailsToCheck.propertyFeatures?.noOfBedrooms.toLocaleString()}
          />

          {/**Date Created and Document  */}
          <Container heading='Date Created' title={detailsToCheck.date ?? detailsToCheck.createdAt ?? ''} />
          <Container
            heading='Document'
            containsList={true}
            mapData={detailsToCheck.docOnProperty?.map(
              ({ docName }) => docName
            )}
          />

          {/**Images */}
          {detailsToCheck.pictures?.length !== 0 && (
            <div className='flex flex-col gap-[10px]'>
              <h2 className='text-[#585B6C] text-[14px] leading-[22.4px] tracking-[0.1px] font-normal'>
                Upload Image
              </h2>
              <div className='flex flex-wrap gap-[10px] w-full'>
                {detailsToCheck?.pictures?.map((picture, idx: number) => (
                  <Image
                    key={idx}
                    src={picture}
                    alt=''
                    width={200}
                    height={200}
                    className='w-[131px] h-[98px] bg-[#D9D9D9]'
                  />
                ))}
              </div>
            </div>
          )}

          {/**Submit Brief */}
          {submitBrief && (
            <div className='w-[256px] min-h-[100px] flex flex-col gap-[6px]'>
              <span className='font-ubuntu text-[#000000] text-[14px] leading-[22.4px] tracking-[0.1px] font-normal'>
                If you&apos;ve found a matching brief for this preference,
                please submit it now
              </span>
              <button
                onClick={() => {
                  setSelectedNav(AgentNavData.CREATE_BRIEF);
                  setPropertyDetails({
                    price: detailsToCheck.propertyPrice,
                    propertyType: detailsToCheck.propertyType,
                    selectedState: {
                      value:
                        typeof detailsToCheck.location === 'object'
                          ? `${detailsToCheck.location.state}, ${detailsToCheck.location.localGovernment}`
                          : String(detailsToCheck.location ?? ''),
                      label: '',
                    },
                    selectedCity: { value: '', label: '' },
                    usageOptions: ['C of Document', 'Lorem ipsum'],
                    documents: ['C of Document', 'Lorem ipsum'],
                    docOnProperty: [],
                    noOfBedroom: '5',
                    additionalFeatures: '',
                  });
                }}
                type='button'
                className='min-h-[50px] w-full bg-[#8DDB90] py-[12px] px-[24px] text-base text-[#FAFAFA] text-center tracking-[0%] leading-[25.6px] font-bold'>
                Submit Brief
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

interface ContainerProps {
  heading: string;
  title?: string | undefined;
  containsList?: boolean;
  mapData?: string[];
}

const Container: FC<ContainerProps> = ({
  heading,
  title,
  containsList,
  mapData,
}) => {
  return (
    <div className='min-w-fit h-fit bg-[#FAFAFA] p-[20px] gap-[6px] flex flex-col'>
      <h3 className='text-[#585B6C] font-ubuntu text-[14px] font-normal leading-[22.4px] tracking-[0.1px]'>
        {heading}
      </h3>
      {containsList ? (
        <ol className='text-[14px] list-disc list-inside leading-[22.4px] tracking-[0.1px] font-medium text-[#141A16]'>
          {mapData?.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ol>
      ) : (
        <h2 className='text-[#141A16] font-ubuntu text-[14px] font-medium leading-[22.4px] tracking-[0.1px]'>
          {title}
        </h2>
      )}
    </div>
  );
};

export default DetailsToCheck;
