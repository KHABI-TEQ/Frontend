/** @format */

'use client';
import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCaretDown,
  faCaretUp,
  faClose,
} from '@fortawesome/free-solid-svg-icons';
import { archivo } from '@/styles/font';
import Input from '@/components/general-components/Input';
import { FormikProps, useFormik } from 'formik';
import * as Yup from 'yup';
import { SubmitInspectionPayloadProp } from '../types/payload';
import { faChevronDown } from '@fortawesome/free-solid-svg-icons';
import { format } from 'date-fns';

type NegotiationModalProps = {
  id: string | null;
  isOpened: boolean;
  askingPrice: number | string | undefined;
  yourPrice: number | string | undefined;
};
 
const NegiotiatePrice = ({
  allNegotiation,
  setAllNegotiation,
  getID,
  currentIndex,
  setCurrentIndex,
  setSelectPreferableInspectionDateModalOpened,
  submitInspectionPayload,
  setSubmitInspectionPayload,
}: {
  getID: string | null;
  allNegotiation: NegotiationModalProps[];
  setAllNegotiation: (type: NegotiationModalProps[]) => void;
  currentIndex: number;
  setCurrentIndex: React.Dispatch<React.SetStateAction<number>>;
  setSelectPreferableInspectionDateModalOpened: (type: boolean) => void;
  submitInspectionPayload: SubmitInspectionPayloadProp;
  setSubmitInspectionPayload: React.Dispatch<
    React.SetStateAction<SubmitInspectionPayloadProp>
  >;
}): React.JSX.Element => {
  //const [inputValue, setInputValue] = useState<string>('');
  const [selectedProperty, setSelectedProperty] =
    useState<NegotiationModalProps>({
      id: null,
      yourPrice: undefined,
      askingPrice: undefined,
      isOpened: false,
    });
  const [yourPrice, setYourPrice] = useState<string>('');

  const handleSubmit = () => {
    if (!getID) return;
  
    const findSelectedCard = allNegotiation.find((item) => item.id === getID);
    if (!findSelectedCard) {
      throw new Error('Property does not exist');
    }
  
    findSelectedCard.yourPrice = selectedProperty.yourPrice;
  
    // Update the payload
    setSubmitInspectionPayload((prev) => {
      const updatedProperties = prev.properties?.map((prop) =>
        prop.propertyId === getID
          ? {
              ...prop,
              negotiationPrice: Number(selectedProperty.yourPrice),
            }
          : prop
      ) || [];
  
      // Check if any property has a negotiation price set
      const isAnyNegotiated = updatedProperties.some(
        (p) => typeof p.negotiationPrice === 'number' && !isNaN(p.negotiationPrice)
      );
  
      return {
        ...prev,
        properties: updatedProperties,
        isNegotiating: isAnyNegotiated,
      };
    });
  
    // Move to the next index
    setCurrentIndex((prev) => prev + 1);
  };  
  

  const formatNumber = (val: string) => {
    const containsLetters = /[A-Za-z]/.test(val);
    if (containsLetters) {
      // setFormattedValue('');
      return;
    }
    const numericValue = val.replace(/,/g, ''); //to remove commas;

    return numericValue ? Number(numericValue).toLocaleString() : '';
  };

  useEffect(() => {
    const findSelectedCard = allNegotiation.find((item) => item.id === getID);

    if (!findSelectedCard) return;

    setSelectedProperty({
      id: findSelectedCard.id,
      askingPrice: findSelectedCard.askingPrice,
      yourPrice: findSelectedCard.yourPrice,
      isOpened: findSelectedCard.isOpened,
    });
  }, []);

  useEffect(() => console.log(selectedProperty), [selectedProperty]);

  return (
    <div className='w-full h-full border-black border-[1px] z-50 fixed top-0 left-0 transition-all duration-500 flex items-center justify-center bg-[#000000]/[30%]'>
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ delay: 0.1 }}
        viewport={{ once: true }}
        className='lg:w-[615px] w-full h-[637px] flex flex-col gap-[26px]'>
        <div className='flex items-center justify-end'>
          <motion.button
            whileHover={{ scale: 1.1 }}
            type='button'
            className='w-[51px] h-[51px] rounded-full bg-white flex items-center justify-center'>
            <FontAwesomeIcon
              icon={faClose}
              width={24}
              height={24}
              onClick={() => {
                setCurrentIndex(allNegotiation.length + 1);
              }}
              className='w-[24px] h-[24px]'
              color='#181336'
            />
          </motion.button>
        </div>
        <form
          onSubmit={(event: React.FormEvent) => {
            event.preventDefault();
          }}
          className='w-[95%] md:w-full mx-auto rounded-[4px] bg-[#FFFFFF] shadow-md py-[40px] px-[20px] md:px-[80px]'>
          <div className='w-full flex flex-col gap-[20px]'>
            <div className='flex flex-col gap-[4px]'>
              <h2
                className={`${archivo.className} font-bold text-2xl text-black text-center`}>
                Negotiate price with the seller
              </h2>
              <p
                className={`${archivo.className} text-[#515B6F] text-lg text-center`}>
                You&apos;re welcome to negotiate the price directly with the
                seller even before arranging an inspection. Please enter your
                proposed offer below
              </p>
            </div>
            {/**Asking Price */}
            <Input
              label='Asking Price'
              name='asking_price'
              type='text'
              isDisabled
              value={Number(selectedProperty.askingPrice).toLocaleString()}
              onChange={() => {
                setSelectedProperty({
                  ...selectedProperty,
                });
              }}
            />
            {/**Enter your price */}
            <Input
              label="Enter your price"
              name="enter_your_price"
              type="text"
              placeholder="Enter amount"
              value={yourPrice}
              onChange={(event) => {
                const rawValue = (
                  event.target as HTMLInputElement | HTMLTextAreaElement
                ).value;

                const numericValue = Number(rawValue.replace(/,/g, ''));

                // Format UI value with commas
                setYourPrice(formatNumber?.(rawValue) ?? '');

                // Update the selected property's local state
                setSelectedProperty((prev) => ({
                  ...prev,
                  yourPrice: numericValue.toString(),
                }));

                // Update the main payload
                setSubmitInspectionPayload((prev) => {
                  const updatedProperties = prev.properties.map((item) => {
                    if (item.propertyId === selectedProperty.id) {
                      return {
                        ...item,
                        negotiationPrice: numericValue,
                      };
                    }
                    return item;
                  });

                  const anyNegotiation = updatedProperties.some(
                    (item) => Number(item.negotiationPrice) > 0
                  );

                  return {
                    ...prev,
                    properties: updatedProperties,
                    isNegotiating: anyNegotiation,
                  };
                });
              }}
            />

            {/** Submit and Cancel buttons */}
            <div className='w-full flex gap-[15px]'>
              <button
                onClick={handleSubmit}
                className={`h-[57px] bg-[#8DDB90] w-[260px] text-lg text-[#FFFFFF] font-bold ${archivo.className}`}
                type='submit'>
                Submit
              </button>
              <button
                onClick={() => setCurrentIndex(allNegotiation.length + 1)}
                className={`h-[57px] bg-white border-[1px] border-[#5A5D63] w-[260px] text-lg text-[#5A5D63] font-bold ${archivo.className}`}
                type='button'>
                Cancel
              </button>
            </div>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

/**
 * second negiotiate price with seller
 */

type NegotiateWithSellerProps = {
  closeModal?: (type: boolean) => void;
  allNegotiation: any[];
  getID: string | null;
  closeSelectPreferableModal: (type: boolean) => void;
  setIsProvideTransactionDetails: (type: boolean) => void;
  actionTracker: { lastPage: 'SelectPreferableInspectionDate' | '' }[];
  setActionTracker: React.Dispatch<
    React.SetStateAction<{ lastPage: 'SelectPreferableInspectionDate' | '' }[]>
  >;
  submitInspectionPayload: SubmitInspectionPayloadProp;
  setSubmitInspectionPayload: React.Dispatch<
    React.SetStateAction<SubmitInspectionPayloadProp>
  >;
};

type DetailsProps = {
  selectedDate: string;
  selectedTime: string;
};

type ContactProps = {
  fullName: string;
  phoneNumber: string;
  email: string;
};

const NegiotiatePriceWithSellerModal: React.FC<NegotiateWithSellerProps> = ({
  closeModal,
  allNegotiation,
  getID,
  setIsProvideTransactionDetails,
  setActionTracker,
  actionTracker,
  closeSelectPreferableModal,
  submitInspectionPayload,
  setSubmitInspectionPayload,
}): React.JSX.Element => {
  const [selectedProperty, setSelectedProperty] =
    useState<NegotiationModalProps>({
      id: null,
      yourPrice: undefined,
      askingPrice: undefined,
      isOpened: false,
    });

const getAvailableDates = () => {
  const dates: string[] = [];
  const date = new Date();
  date.setDate(date.getDate() + 3); // start from 3 days from now

  // Get the last day of the next month
  const nextMonth = new Date(date.getFullYear(), date.getMonth() + 1, 1);
  const lastDayOfNextMonth = new Date(nextMonth.getFullYear(), nextMonth.getMonth() + 1, 0);

  while (date <= lastDayOfNextMonth) {
    // Exclude Sundays if needed
    if (date.getDay() !== 0) {
      dates.push(format(date, 'MMM d, yyyy'));
    }
    date.setDate(date.getDate() + 1);
  }
  return dates;
};

  const availableDates = getAvailableDates();

  const [details, setDetails] = useState<DetailsProps>({
    selectedDate: availableDates[0],
    selectedTime: '9:00 AM',
  });

  useEffect(() => {
    setSubmitInspectionPayload({
      ...submitInspectionPayload,
      inspectionDate: availableDates[0],
      inspectionTime: '9:00 AM',
    });
  }, []);

  const formatNumber = (val: string) => {
    const containsLetters = /[A-Za-z]/.test(val);
    if (containsLetters) {
      return '';
    }
    const numericValue = val.replace(/,/g, ''); // Remove commas
    return numericValue ? Number(numericValue).toLocaleString() : '';
  };

  // const [details, setDetails] = useState<DetailsProps>({
  //   selectedDate: 'Jan 1, 2025',
  //   selectedTime: '9:00 AM',
  // });
  const validationSchema = Yup.object({
    fullName: Yup.string().required('Full Name is required'),
    phoneNumber: Yup.string().required('Phone number is required'),
  });
  const formik = useFormik({
    initialValues: {
      fullName: '',
      phoneNumber: '',
      email: '',
    },
    validationSchema,
    onSubmit: (values: ContactProps) => {
      setActionTracker([
        ...actionTracker,
        { lastPage: 'SelectPreferableInspectionDate' },
      ]);
      setSubmitInspectionPayload(prev => ({
        ...prev,
        requestedBy: {
          fullName: formik.values.fullName,
          email: formik.values.email,
          phoneNumber: formik.values.phoneNumber,
        },
        inspectionDate: details.selectedDate,
        inspectionTime: details.selectedTime,
        isNegotiating: prev.properties.some(p => p.negotiationPrice !== undefined),
      }));
      
      setIsProvideTransactionDetails(true);
      closeSelectPreferableModal(false);
      closeModal?.(false);
    },
  });
  const [isModalOpened, setIsModalOpened] = useState<boolean>(false);
  
  // Add this state for the formatted input value
  const [formattedYourPrice, setFormattedYourPrice] = useState<string>('');

  const allFilled = Object.values(formik.values).every((value) => value !== '');

  useEffect(() => {
    const findSelectedCard = allNegotiation.find((item) => item.id === getID);
    if (!findSelectedCard) return;

    // Add or update the property in the payload
    setSubmitInspectionPayload((prev) => {
      const existingProps = [...(prev.properties || [])];
      const exists = existingProps.find(p => p.propertyId === findSelectedCard._id);

      if (!exists) {
        existingProps.push({
          propertyId: findSelectedCard._id,
          negotiationPrice: undefined,
        });
      }

      return {
        ...prev,
        properties: existingProps,
      };
    });

    // Update UI state
    setSelectedProperty({
      id: findSelectedCard._id,
      askingPrice: findSelectedCard?.price ?? findSelectedCard?.rentalPrice,
      yourPrice: '',
      isOpened: false,
    });
    
    // Reset formatted value
    setFormattedYourPrice('');
  }, []);
  

  return (
    <div className='w-full z-50 h-full border-black border-[1px] fixed top-0 left-0 transition-all duration-500 flex items-center justify-center bg-[#000000]/[30%]'>
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ delay: 0.1 }}
        viewport={{ once: true }}
        className='relative lg:w-[615px] w-full flex flex-col gap-[26px]'>
        <div className='flex items-center justify-end'>
          <motion.button
            whileHover={{ scale: 1.1 }}
            type='button'
            className='w-[51px] h-[51px] rounded-full bg-white flex items-center justify-center'>
            <FontAwesomeIcon
              icon={faClose}
              width={24}
              height={24}
              onClick={() => {
                closeModal?.(false);
                //setCurrentIndex(allNegotiation.length + 1); //just to close the modal
              }}
              className='w-[24px] h-[24px]'
              color='#181336'
            />
          </motion.button>
        </div>
        <form
          onSubmit={formik.handleSubmit}
          className='w-[95%] md:w-full mx-auto rounded-[4px] h-[600px] overflow-y-auto hide-scrollbar bg-[#FFFFFF] shadow-md py-[40px] px-[20] md:px-[50px]'>
          <div className='w-full flex flex-col gap-[20px]'>
            <div className='flex flex-col gap-[10px]'>
              <h2
                className={`${archivo.className} font-bold text-2xl text-black text-center`}>
                Negotiate price with the seller
              </h2>
              <p
                className={`${archivo.className} text-[#515B6F] text-lg text-center`}>
                You&apos;re welcome to negotiate the price directly with the
                seller even before arranging an inspection. Please enter your
                proposed offer below
              </p>
            </div>
            {/**Asking Price */}
            <Input
              label='Asking Price'
              name='asking_price'
              type='text'
              isDisabled
              value={Number(selectedProperty.askingPrice).toLocaleString()}
              onChange={() => {
                setSelectedProperty({
                  ...selectedProperty,
                });
              }}
            />
            {/**Enter your price */}
            <Input
              label='Enter your price'
              name='enter_your_price'
              type='text' // Changed from 'number' to 'text'
              placeholder='Enter amount'
              value={formattedYourPrice} // Use formatted value for display
              onChange={(event: any) => {
                const rawValue = event.target.value;
                const numericValue = Number(rawValue.replace(/,/g, ''));
                const askingPrice = Number(selectedProperty.askingPrice);
                
                // Prevent entering price higher than asking price
                if (numericValue > askingPrice) {
                  return; // Don't update if price exceeds asking price
                }
                
                // Format the display value
                const formatted = formatNumber(rawValue);
                setFormattedYourPrice(formatted);
                
                // Update selected property state with numeric value
                setSelectedProperty({
                  ...selectedProperty,
                  yourPrice: numericValue,
                });
                
                // Check if property is already in payload
                const updatedProperties = [...submitInspectionPayload.properties];
                const existing = updatedProperties.find(p => p.propertyId === selectedProperty.id);
                
                if (existing) {
                  existing.negotiationPrice = numericValue;
                } else {
                  updatedProperties.push({
                    propertyId: selectedProperty.id ?? '',
                    negotiationPrice: numericValue,
                  });
                }
                
                // Update the payload
                setSubmitInspectionPayload({
                  ...submitInspectionPayload,
                  properties: updatedProperties,
                  isNegotiating: updatedProperties.some(p => p.negotiationPrice !== undefined && p.negotiationPrice > 0),
                });
                
                setIsModalOpened(true);
              }}
            />

            {formattedYourPrice && Number(formattedYourPrice.replace(/,/g, '')) > Number(selectedProperty.askingPrice) && (
              <p className='text-red-500 text-sm mt-1'>
                Your price cannot exceed the asking price of ₦{Number(selectedProperty.askingPrice).toLocaleString()}
              </p>
            )}
            
            <p className='text-[#1976D2] font-medium text-lg'>
              A fee of ₦10,000 will be charged for inspection and negotiation
              before your request is sent to the seller.
            </p>

            <div className='flex flex-col gap-[20px]'>
              {/**First div */}
              <div className='flex justify-between items-center gap-[18px] border-b-[1px] pb-[10px] border-black'>
                <h2
                  className={`font-bold text-black ${archivo.className} text-xl`}>
                  Select preferable inspection Date
                </h2>
                <FontAwesomeIcon
                  icon={isModalOpened ? faCaretUp : faCaretDown}
                  onClick={() => setIsModalOpened(!isModalOpened)}
                  size='sm'
                  width={24}
                  height={24}
                  className='w-[24px] h-[24px] transition-all duration-300'
                />
              </div>
              <AnimatePresence>
                {isModalOpened && (
                  <motion.section
                    initial={{ y: 20, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.2 }}
                    exit={{ y: 20, opacity: 0 }}
                    className='flex flex-col gap-[20px]'>
                    {/**Second div */}
                    <div className=' overflow-x-auto w-full flex gap-[21px] hide-scrollbar border-b-[1px] border-[#C7CAD0]'>
                      {availableDates.map((date: string, idx: number) => (
                        <button
                          type='button'
                          onClick={() => {
                            setDetails({
                              ...details,
                              selectedDate: date,
                            });
                            setSubmitInspectionPayload({
                              ...submitInspectionPayload,
                              inspectionDate: date,
                            });
                          }}
                          className={`h-[42px] ${
                            details.selectedDate === date &&
                            'bg-[#8DDB90] text-white'
                          } min-w-fit px-[10px] ${
                            archivo.className
                          } text-sm font-medium text-[#5A5D63]`}
                          key={idx}>
                          {date}
                        </button>
                      ))}
                    </div>
                    <h3
                      className={`text-xl font-medium ${archivo.className} text-black`}>
                      Select preferable inspection time
                    </h3>
                    <h4
                      className={`text-lg font-medium ${archivo.className} text-black`}>
                      {details.selectedDate}
                    </h4>
                    {/**third div */}
                    <div className='grid grid-cols-3 gap-[14px]'>
                      {[
                        '9:00 AM',
                        '11:00 AM',
                        '1:00 PM',
                        '3:00 PM',
                        '5:00 PM',
                        '7:00 PM',
                        '9:00 PM',
                        '11:00 PM',
                        '1:00 AM',
                      ].map((time, idx: number) => (
                        <button
                          onClick={() => {
                            setDetails({
                              ...details,
                              selectedTime: time,
                            });
                            setSubmitInspectionPayload({
                              ...submitInspectionPayload,
                              inspectionTime: time,
                            });
                          }}
                          className={`border-[1px] border-[#A8ADB7] h-[57px] ${
                            details.selectedTime === time && 'bg-[#8DDB90]'
                          } text-lg font-medium ${
                            archivo.className
                          } text-black`}
                          type='button'
                          key={idx}>
                          {time}
                        </button>
                      ))}
                    </div>
                    {/**fourth div */}
                    <div className='h-[103px] py-[28px] w-full bg-[#8DDB90]/[20%] flex justify-center flex-col gap-[5px] px-[28px]'>
                      <h3
                        className={`text-lg font-medium ${archivo.className} text-black font-semibold`}>
                        Booking details
                      </h3>
                      <p
                        className={`text-lg font-medium ${archivo.className} text-black`}>
                        Date:{' '}
                        <time
                          className={`text-lg font-medium ${archivo.className} text-black`}>
                          {details.selectedDate}
                        </time>{' '}
                        Time:{' '}
                        <time
                          className={`text-lg font-medium ${archivo.className} text-black`}>
                          {details.selectedTime}
                        </time>
                      </p>
                    </div>
                  </motion.section>
                )}
              </AnimatePresence>
              {/**fifth div */}
              <div className='p-[20px] bg-[#EEF1F1] flex flex-col gap-[25px]'>
                <div className='flex flex-col gap-[4px]'>
                  <h3 className='text-[#0B0D0C] text-xl font-bold'>
                    Contact information
                  </h3>
                  <span className='text-base text-[#515B6F]'>
                    Provide your contact information to schedule an inspection
                    and take the next step toward your dream property
                  </span>
                </div>
                <div className='grid grid-cols-2 gap-[15px]'>
                  <Input2
                    id='fullName'
                    name='fullName'
                    placeholder='Full name of the buyer'
                    type='text'
                    heading='Full Name'
                    formikType={formik}
                  />
                  <Input2
                    id='phoneNumber'
                    name='phoneNumber'
                    placeholder='Active phone number for follow-up'
                    type='text'
                    heading='Phone Number'
                    formikType={formik}
                  />
                  <Input2
                    id='email'
                    name='email'
                    placeholder='Optional, for communication'
                    type='email'
                    heading='Email'
                    formikType={formik}
                    className='col-span-2'
                  />
                </div>
              </div>
              {/**buttons */}
              <div className=' w-full flex gap-[15px] h-[57px]'>
                <button
                  type='submit'
                  className={`w-1/2 h-[57px] ${
                    allFilled ? 'bg-[#8DDB90]' : 'bg-[#5A5D63]'
                  } text-[#FFFFFF] font-bold text-lg ${archivo.className}`}>
                  Submit
                </button>
                <button
                  //onClick={() => closeModal(false)}
                  type='button'
                  className={`w-1/2 h-[57px] bg-transparent border-[1px] border-[#5A5D63] text-[#414357] font-medium text-lg ${archivo.className}`}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </form>
        {/* Arrow down indicator */}
        <div className='absolute right-6 bottom-6 z-10'>
          <div className='w-12 h-12 rounded-full bg-[#8DDB90] flex items-center justify-center animate-bounce shadow-lg'>
            <FontAwesomeIcon
              icon={faChevronDown}
              className='text-white'
              size='lg'
            />
          </div>
        </div>
      </motion.div>
    </div>
  );
};

type InputProps = {
  id: 'fullName' | 'email' | 'phoneNumber';
  placeholder?: string;
  type: 'email' | 'number' | 'text';
  name: string;
  heading: string;
  isDisabled?: boolean;
  formikType: FormikProps<ContactProps>;
  className?: string;
};

const Input2: React.FC<InputProps> = ({
  id,
  heading,
  type,
  placeholder,
  name,
  isDisabled,
  formikType,
  className,
}) => {
  return (
    <label
      htmlFor={id}
      className={`w-full flex flex-col gap-[4px] ${className}`}>
      <span
        className={`text-base text-[#24272C] ${archivo.className} font-medium`}>
        {heading}
      </span>
      <input
        name={name}
        onChange={formikType.handleChange}
        id={id}
        type={type}
        onBlur={formikType.handleBlur}
        value={formikType.values[id]}
        disabled={isDisabled}
        placeholder={placeholder ?? 'This is a placeholder'}
        className={`px-[12px] h-[50px] bg-[#FFFFFF] border-[1px] border-[#E9EBEB] w-full text-base placeholder:text-[#A7A9AD] text-black ${archivo.className} rounded-[5px] outline-none disabled:bg-[#FAFAFA]`}
      />
      {(formikType.errors[id] || formikType.touched[id]) && (
        <span className={`${archivo.className} text-xs text-red-500`}>
          {formikType.errors[id]}
        </span>
      )}
    </label>
  );
};

export { NegiotiatePrice, NegiotiatePriceWithSellerModal };
