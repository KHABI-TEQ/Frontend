/** @format */

// /** @format */
// /* eslint-disable @typescript-eslint/no-explicit-any */

// import React, {
//   ChangeEventHandler,
//   FC,
//   FocusEventHandler,
//   Fragment,
//   useEffect,
// } from 'react';
// import { Country, State, City } from 'country-state-city';
// import Select from 'react-select';

// interface Option {
//   value: string;
//   label: string;
// }
// interface InputProps {
//   name: string;
//   label: string;
//   placeholder?: string;
//   type: string;
//   className?: string;
//   id?: string;
//   value?: string | number | undefined;
//   onChange?: ChangeEventHandler<HTMLInputElement>;
//   onBlur?: FocusEventHandler<HTMLInputElement>;
//   forState?: boolean;
//   forCountry?: boolean;
//   forCity?: boolean;
//   selectedCountry?: Option | null;
//   setSelectedCountry?: (type: Option | null) => void;
//   selectedState?: Option | null;
//   setSelectedState?: (type: Option | null) => void;
//   selectedCity?: Option | null;
//   setSelectedCity?: (type: Option | null) => void;
//   isDisabled?: boolean;
//   setIsDisabled?: (type: boolean) => void;
//   minNumber?: number;
//   maxNumber?: number;
// }

// const defaultCountry = { value: 'NG', label: 'Nigeria' };
// const Input: FC<InputProps> = ({
//   className,
//   id,
//   name,
//   label,
//   type,
//   placeholder,
//   value,
//   onChange,
//   onBlur,
//   forState,
//   forCountry,
//   forCity,
//   selectedCity,
//   selectedCountry = defaultCountry,
//   selectedState,
//   setSelectedCity,
//   setSelectedCountry,
//   setSelectedState,
//   isDisabled,
//   minNumber,
//   maxNumber,
//   // setIsDisabled
// }) => {
//   // const [selectedCountry, setSelectedCountry] = useState<Option | null>(null);
//   // const [selectedState, setSelectedState] = useState<Option | null>(null);
//   // const [selectedCity, setSelectedCity] = useState<Option | null>(null);

//   const countryOptions = Country.getAllCountries().map((country) => ({
//     value: country.isoCode,
//     label: country.name,
//   }));

//   // Get states based on selected country
//   const stateOptions = selectedCountry
//     ? State.getStatesOfCountry(selectedCountry.value).map((state) => ({
//         value: state.isoCode,
//         label: state.name,
//       }))
//     : [];

//   // Get cities based on selected state
//   const cityOptions =
//     selectedCountry && selectedState
//       ? City.getCitiesOfState(selectedCountry.value, selectedState.value).map(
//           (city) => ({
//             value: city.name,
//             label: city.name,
//           })
//         )
//       : [];

//   useEffect(() => {
//     console.log(isDisabled);
//   }, [isDisabled]);

//   return (
//     <Fragment>
//       <label
//         htmlFor={id}
//         className={`min-h-[80px] ${className} flex flex-col gap-[4px]`}>
//         <span className='text-base leading-[25.6px] font-medium text-[#1E1E1E]'>
//           {label}
//         </span>
//         {forCountry && (
//           <>
//             {/* Country Dropdown */}
//             <Select
//               options={countryOptions}
//               value={selectedCountry}
//               onChange={setSelectedCountry}
//               placeholder='Select Country'
//               className=''
//               styles={customStyle}
//             />
//           </>
//         )}
//         {forState && (
//           <>
//             {/* State Dropdown (Disabled until a country is selected) */}
//             <Select
//               options={stateOptions}
//               value={selectedState}
//               onChange={setSelectedState}
//               placeholder='Select State'
//               styles={customStyle}
//               isDisabled={!selectedCountry}
//             />
//           </>
//         )}
//         {forCity && (
//           <>
//             {/* City Dropdown (Disabled until a state is selected) */}
//             <Select
//               options={cityOptions}
//               value={selectedCity}
//               onChange={setSelectedCity}
//               placeholder='Select City'
//               styles={customStyle}
//               isDisabled={!selectedState}
//             />
//           </>
//         )}
//         {!(forCountry || forState || forCity) && (
//           <input
//             id={id}
//             name={name}
//             type={type}
//             value={value}
//             onChange={isDisabled ? undefined : onChange}
//             onBlur={onBlur}
//             disabled={isDisabled}
//             min={type === 'number' ? minNumber : undefined}
//             max={type === 'number' ? maxNumber : undefined}
//             placeholder={placeholder ?? 'This is placeholder'}
//             className='w-full outline-none min-h-[50px] border-[1px] py-[12px] px-[16px] bg-[#FAFAFA] border-[#D6DDEB] placeholder:text-[#A8ADB7] text-black text-base leading-[25.6px]'
//           />
//         )}

//         <span></span>
//       </label>
//     </Fragment>
//   );
// };

// const customStyle = {
//   control: (base: any) => ({
//     ...base,
//     minHeight: '50px',
//     border: '1px solid #D6DDEB',
//     color: 'black',
//     fontSize: '16px',
//     lineHeight: '25.6px',
//     paddingTop: '6px',
//     paddingBottom: '6px',
//     paddingLeft: '10px',
//     paddingRight: '10px',
//     width: '100%',
//   }),
// };
// export default Input;

/** @format */
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, {
  ChangeEventHandler,
  FC,
  FocusEventHandler,
  Fragment,
  memo,
} from 'react';
//import naijaStates from 'naija-state-local-government';
import Select from 'react-select';
//import { useCallback } from 'react';

interface Option {
  value: string;
  label: string;
}

interface InputProps {
  name: string;
  label: string;
  placeholder?: string;
  type: string;
  className?: string;
  id?: string;
  value?: string | number | undefined;
  onChange?: ChangeEventHandler<HTMLInputElement>;
  onBlur?: FocusEventHandler<HTMLInputElement>;
  forState?: boolean;
  forLGA?: boolean;
  selectedState?: Option | null;
  setSelectedState?: (option: Option | null) => void;
  selectedLGA?: Option | null;
  setSelectedLGA?: (option: Option | null) => void;
  isDisabled?: boolean;
  minNumber?: number;
  maxNumber?: number;
  formik?: any;

  stateOptions?: Option[];
  lgasOptions?: Option[];
}

const Input: FC<InputProps> = memo(
  ({
    className,
    id,
    name,
    label,
    type,
    placeholder,
    value,
    onChange,
    onBlur,
    forState,
    forLGA,
    isDisabled,
    minNumber,
    maxNumber,
    stateOptions,
    lgasOptions,

    selectedLGA,
    setSelectedLGA,
    selectedState,
    setSelectedState,
  }) => {
    // useEffect(() => {
    //   console.log('Component re-rendered', formik?.values);
    // });

    // useEffect(() => {
    //   console.log({
    //     selectedState,
    //     selectedLGA,
    //     lgaOptions,
    //   });
    //   // console.log('Formik State:', formik?.values);
    // }, [selectedState, selectedLGA, lgaOptions]);

    // useEffect(() => {
    //   console.log('Component re-rendered', lgaOptions);
    // });

    return (
      <Fragment>
        <label
          htmlFor={id}
          className={`min-h-[80px] ${className} flex flex-col gap-[4px]`}>
          <span className='text-base leading-[25.6px] font-medium text-[#1E1E1E]'>
            {label}
          </span>

          {forState && (
            <Select
              options={stateOptions}
              value={selectedState}
              onChange={setSelectedState}
              placeholder='Select State'
              styles={customStyle}
              isDisabled={isDisabled}
            />
          )}

          {forLGA && (
            <Select
              options={lgasOptions}
              value={selectedLGA}
              onChange={setSelectedLGA}
              placeholder='Select LGA'
              styles={customStyle}
              isDisabled={lgasOptions?.length === 0}
            />
          )}

          {!forLGA && !forState && (
            <input
              id={id}
              name={name}
              type={type}
              value={value}
              onChange={isDisabled ? undefined : onChange}
              onBlur={onBlur}
              disabled={isDisabled}
              min={type === 'number' ? minNumber : undefined}
              max={type === 'number' ? maxNumber : undefined}
              placeholder={placeholder ?? 'This is placeholder'}
              className='w-full outline-none min-h-[50px] border-[1px] py-[12px] px-[16px] bg-[#FAFAFA] border-[#D6DDEB] placeholder:text-[#A8ADB7] text-black text-base leading-[25.6px]'
            />
          )}
        </label>
      </Fragment>
    );
  }
);

const customStyle = {
  control: (base: any) => ({
    ...base,
    minHeight: '50px',
    border: '1px solid #D6DDEB',
    color: 'black',
    fontSize: '16px',
    lineHeight: '25.6px',
    paddingTop: '6px',
    paddingBottom: '6px',
    paddingLeft: '10px',
    paddingRight: '10px',
    width: '100%',
  }),
};

Input.displayName = 'Input';

export default Input;
