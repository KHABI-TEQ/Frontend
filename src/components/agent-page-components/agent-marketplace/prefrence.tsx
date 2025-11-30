/** @format */

import { PropertySelectedProps } from './types';

const Preference = ({
  setIsViewMoreClicked,
  propertySelected,
}: {
  setIsViewMoreClicked: (type: boolean) => void;
  propertySelected: PropertySelectedProps;
}) => {
  const checkIfValues = Object.entries(
    propertySelected?.location !== undefined && propertySelected?.location
  ).some((item) => item[1] !== '');
  return (
    <>
      <aside className='min-h-fit bg-white w-full p-[30px] md:p-[60px] flex flex-col gap-[20px]'>
        <h2 className='font-semibold text-black text-sm'>Requested Brief</h2>
        <div className='flex items-center flex-wrap gap-[10px]'>
          <Details heading='Property Type' value={'Residential'} />
          <Details
            heading='Property Price'
            value={`N ${Number(200000000).toLocaleString()}`}
          />
          <Details
            heading='Property Features'
            value={
              propertySelected?.propertyFeatures ?? [
                '4 Bed rooms',
                'Parking Space',
              ]
            }
          />
          <Details
            heading='Date Created'
            value={propertySelected?.dateCreated ?? '12 june, 2022'}
          />
          <Details
            heading='Location'
            value={
              checkIfValues
                ? `${propertySelected?.location.state} ${propertySelected?.location.lga}`
                : 'Lorem ipsum dolor sit amet consectetur. Quis'
            }
          />
          <Details heading='Documents' value={['Receipt', 'C of O']} />
          {/* <div className='float float-end'>a</div> */}
        </div>
      </aside>
    </>
  );
};

/**
 * Details
 */
type DetailsProps = {
  heading: string;
  value: any[] | string | number;
  isMultiple?: boolean;
};
const Details = ({ heading, value, isMultiple }: DetailsProps) => {
  return (
    <div className='min-w-fit min-h-fit p-[20px] flex flex-col gap-[6px] bg-[#FAFAFA]'>
      <h4 className="text-sm text-[#585B6C]">
        {heading}
      </h4>
      {Array.isArray(value) ? (
        <ol className='list-inside list-disc list pl-[10px]'>
          {value.map((item) => (
            <li
              className="font-medium text-sm text-[#141A16]"
              key={item}>
              {item}
            </li>
          ))}
        </ol>
      ) : (
        <h2
          className="font-medium text-sm text-[#141A16]">
          {value}
        </h2>
      )}
    </div>
  );
};

export default Preference;
