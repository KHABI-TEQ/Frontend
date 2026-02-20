/** @format */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import Loading from '@/components/loading';
import { useLoading } from '@/hooks/useLoading';
import { propertyReferenceDataWithoutUsageOption } from '@/data/buy_page_data';
import { usePageContext } from '@/context/page-context';
import { Fragment, useEffect, useState } from 'react';
import RentalReference from '@/components/rentalReference';
import HouseFrame from '@/components/house-frame';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { URLS } from '@/utils/URLS';

type HouseFrameProps = {
  propertyType: string;
  pictures: string[];
  features: { featureName: string; id: string }[];
  location: {
    state: string;
    area: string;
    localGovernment: string;
  };
  noOfBedrooms: number;
  _id: string;
};
export default function Rent() {
  const isLoading = useLoading();
  const { rentPage } = usePageContext();
  const router = useRouter();
  const [isDataLoading, setDataLoading] = useState<boolean>(false);
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    const getAllRentProperties = async () => {
      setDataLoading(true);
      try {
        const resposne = await axios.get(URLS.BASE + '/properties/rents/all');
        console.log(resposne);
        if (resposne.status === 200) {
          setData(resposne.data.slice(0, 8));
          setDataLoading(false);
        }
      } catch (error) {
        console.log(error);
        setDataLoading(false);
      } finally {
        setDataLoading(false);
      }
    };

    getAllRentProperties();
  }, []);

  if (isLoading) return <Loading />;
  return (
    <Fragment>
      <section
        className={`w-full bg-[#EEF1F1] flex justify-center items-center ${
          rentPage.isSubmitForInspectionClicked && 'filter brightness-[30%] transition-all duration-500'
        }`}
      >
        <div className='container min-h-[800px] py-[48px] px-[20px] lg:px-[0px] flex flex-col items-center gap-[40px]'>
          <h2 className='lg:text-[40px] lg:leading-[64px] text-[30px] leading-[41px] text-center text-[#09391C]  font-semibold font-display'>
            Submit Your <span className='text-[#8DDB90] font-display'>Rental Reference</span>
          </h2>
          <RentalReference rentalReferenceData={propertyReferenceDataWithoutUsageOption} />
          <div className='w-full px-[20px] flex flex-col lg:w-[1153px]'>
            <div className='flex flex-col justify-center items-center md:grid md:grid-cols-2 lg:grid-cols-3 gap-[20px]'>
              {isDataLoading ? (
                <p>Failed to fetch data</p>
              ) : (
                data?.map((item: HouseFrameProps, idx: number) => (
                  <HouseFrame
                    key={idx}
                    title={item.propertyType}
                    images={item?.pictures}
                    features={item.features}
                    location={`${item.location.state}, ${item.location.area}, ${item.location.localGovernment}`}
                    bedroom={item.noOfBedrooms}
                    onClick={() => {
                      router.push(`/buy_page/details/${item._id}`);
                    }}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </section>
      {/* {rentPage.isSubmitForInspectionClicked && (
        <Buyer_Contact propertyId={Array.from(selectedBriefs)[0].id} propertyType='PropertyRent' />
      )} */}
    </Fragment>
  );
}
