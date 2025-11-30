/** @format */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import { usePageContext } from '@/context/page-context';
import useClickOutside from '@/hooks/clickOutside';
import { faClose } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { FC, useRef } from 'react';
import { motion } from 'framer-motion';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import Button from './general-components/button';
import toast from 'react-hot-toast';
import { URLS } from '@/utils/URLS';
//import { POST_REQUEST } from '@/utils/requests';
import axios from 'axios';

const ContactUs = () => {
  const ref = useRef<HTMLFormElement | null>(null);

  const {
    setRentPage,
    rentPage,
    propertyReference,
    setPropertyReference,
    propertyRefSelectedBriefs,
    setPropertyRefSelectedBriefs,
  } = usePageContext();
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);

  const validationSchema = Yup.object({
    fullName: Yup.string().required('Fullname is required'),
    phoneNumber: Yup.string().required('Phone number is required'),
    email: Yup.string()
      .email('Email is required')
      .required('Email is required'),
  });

  const formik = useFormik({
    initialValues: {
      fullName: '',
      phoneNumber: '',
      email: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      console.log(values);
      console.log(rentPage);
      if (propertyRefSelectedBriefs.length !== 0) {
        console.log(propertyRefSelectedBriefs);

        const payloads = propertyRefSelectedBriefs.map((propertyData: any) => {
          const filteredPropertyData = propertyData.docOnProperty.map(
            ({ docName }: { docName: string }) => {
              return { docName, isProvided: true };
            }
          );

          return {
            location: propertyData.location,
            propertyFeatures: propertyData.propertyFeatures,
            propertyType: propertyData.propertyType,
            areYouTheOwner: true,
            budgetRange: propertyData.price.toLocaleString(),
            price: propertyData.price,
            docOnProperty: filteredPropertyData,
            usageOptions: propertyData.usageOptions ?? ['All', 'Lease'],
            owner: {
              fullName: values.fullName,
              phoneNumber: String(values.phoneNumber),
              email: values.email,
            },
          };
          // ...propertyData,
          // owner: {
          //   fullName: values.fullName,
          //   phoneNumber: String(values.phoneNumber),
          //   email: values.email,
          // },
        });

        setIsSubmitting(true);
        try {
          // Send all requests in parallel
          const responses = await Promise.all(
            payloads.map((payload: any) =>
              axios.post(URLS.BASE + '/properties/buy/request/new', payload)
            )
          );

          // Check if all requests were successful
          if (responses.every((response: any) => response.status === 201)) {
            toast.success('All preferences submitted successfully');
            console.log(responses);
            setRentPage({
              ...rentPage,
              isSubmitForInspectionClicked: false,
              submitPreference: false,
            });
            setPropertyReference({
              type: '',
              payload: {},
            });
            setPropertyRefSelectedBriefs([]);
          } else {
            toast.error('Some requests failed. Please try again.');
          }
        } catch (error: any) {
          toast.error(error?.message);
          console.error(error);
        } finally {
          setIsSubmitting(false);
        }
      }

      if (Object.keys(propertyReference).length > 0) {
        const payload = {
          ...propertyReference.payload,
          owner: {
            fullName: values.fullName,
            phoneNumber: String(values.phoneNumber),
            email: values.email,
          },
        };

        console.log(payload);
        setIsSubmitting(true);
        if (propertyReference.type === 'rental') {
          try {
            const response = await axios.post(
              URLS.BASE + '/properties/rent/request/rent/new',
              payload
            );
            if (response.status === 201) {
              toast.success('Preference submitted');
              setRentPage({
                ...rentPage,
                isSubmitForInspectionClicked: false,
                submitPreference: false,
              });
              setIsSubmitting(false);
              console.log(response.data);
              setPropertyReference({
                type: '',
                payload: {},
              });
              setRentPage({
                ...rentPage,
                isSubmitForInspectionClicked: false,
                submitPreference: false,
              });
            } else {
              toast.error('Sorry, something went wrong');
              setIsSubmitting(false);
            }
          } catch (error: any) {
            toast.error(error?.message);
            console.error(error);
            setIsSubmitting(false);
          } finally {
            setIsSubmitting(false);
          }
        }
        if (propertyReference.type === 'buy') {
          try {
            const response = await axios.post(
              URLS.BASE + '/properties/buy/request/new',
              payload
            );
            if (response.status === 201) {
              toast.success('Preference submitted');
              setRentPage({
                ...rentPage,
                isSubmitForInspectionClicked: false,
                submitPreference: false,
              });
              setIsSubmitting(false);
              console.log(response.data);
              setPropertyReference({
                type: '',
                payload: {},
              });
              setRentPage({
                ...rentPage,
                isSubmitForInspectionClicked: false,
                submitPreference: false,
              });
            } else {
              toast.error('Sorry, something went wrong');
              setIsSubmitting(false);
            }
          } catch (error: any) {
            toast.error(error?.message);
            console.error(error);
            setIsSubmitting(false);
          } finally {
            setIsSubmitting(false);
          }
        }
      }
    },
  });

  const closeModal = () => {
    setRentPage({
      ...rentPage,
      isSubmitForInspectionClicked: false,
      submitPreference: false,
    });
  };

  useClickOutside(ref, () =>
    setRentPage({ ...rentPage, submitPreference: false })
  );

  return (
    <section className='fixed z-20 top-0 h-screen w-full justify-center items-center flex px-[20px]'>
      <motion.form
        initial={{ y: 100, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        viewport={{ once: true }}
        onSubmit={formik.handleSubmit}
        ref={ref}
        className={`md:w-[550px] w-full flex flex-col slide-from-bottom`}>
        <div className='h-[60px] bg-transparent flex justify-end'>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={closeModal}
            className='w-[51px] h-[51px] bg-white shadow-md flex justify-center items-center rounded-full'>
            <FontAwesomeIcon
              icon={faClose}
              width={24}
              height={24}
              className='w-[24px] h-[24px]'
            />
          </motion.button>
        </div>
        <div className='bg-white rounded-[4px] md:px-[40px] py-[40px] px-[24px] flex items-center justify-center gap-[25px]'>
          <div className='md:w-[511px] w-full flex flex-col gap-[32px]'>
            <div className='flex flex-col justify-center items-center gap-[4px]'>
              <h2 className='font-bold text-[24px] leading-[40px] md:text-[28px] md:leading-[40px] text-[#0B0D0C]'>
                Contact Information
              </h2>
              {/* <p className='font-normal text-base leading-[25px] md:text-[18px] md:leading-[25px] text-[#515B6F] text-center tracking-[0.15px]'>
                Lorem ipsum dolor sit amet consectetur. Aliquam scelerisque duis mollis ullamcorper ac felis. Commodo
                duis metus facilisi.
              </p> */}
            </div>
            {/* <div className='h-[310px] flex flex-col gap-[20px]'>
              {contactUsData.map(
                (
                  item: { value: string; icon: StaticImageData; type: string },
                  idx: number
                ) => (
                  <ContactUnit key={idx} {...item} />
                )
              )}
            </div> */}
            <div className='flex flex-col gap-[20px] min-h-[280px]'>
              <Input
                title='Full name'
                formikValues='fullName'
                type='text'
                placeholder='This is placeholder'
                formik={formik}
                isDisabled={isSubmitting}
              />
              <Input
                title='Phone Number'
                formikValues='phoneNumber'
                type='number'
                placeholder='This is placeholder'
                formik={formik}
                isDisabled={isSubmitting}
              />
              <Input
                title='Email'
                formikValues='email'
                type='email'
                placeholder='This is placeholder'
                formik={formik}
                isDisabled={isSubmitting}
              />
            </div>

            <div className='w-full min-h-[129px] flex flex-col gap-[15px]'>
              <Button
                value={`${isSubmitting ? 'Submitting...' : 'Submit'}`}
                isDisabled={isSubmitting}
                type='submit'
                onSubmit={formik.handleSubmit}
                green={true}
                className='min-h-[57px] rounded-[5px] py-[14px] px-[27px] w-full text-[18px] leading-[28.8px] font-bold text-[#FFFFFF]'
              />
              <Button
                value='Close'
                onClick={closeModal}
                className='min-h-[57px] rounded-[5px] py-[14px] px-[27px] w-full text-[18px] leading-[28.8px] font-bold bg-transparent text-[#414357] border-[1px] border-[#E9EBEB]'
              />
            </div>
          </div>
        </div>
      </motion.form>
    </section>
  );
};

interface InputProps {
  title: string;
  placeholder?: string;
  type: string;
  formik: any;
  formikValues: string;
  isDisabled?: boolean;
}

const Input: FC<InputProps> = ({
  title,
  placeholder,
  type,
  formik,
  formikValues,
  isDisabled,
}) => {
  return (
    <label htmlFor={title} className='min-h-[80px] flex flex-col gap-[4px]'>
      <span className='text-base font-archivo leading-[25.6px] font-medium text-[#24272C]'>
        {title}
      </span>
      <input
        value={formik.values[formikValues]}
        onBlur={formik.handleBlur}
        onChange={formik.handleChange}
        className='min-h-[50px] rounded-[5px] w-full border-[1px] py-[12px] px-[16px] outline-none bg-[#FFFFFF] border-[#E9EBEB] disabled:bg-gray-400'
        placeholder={placeholder}
        type={type}
        id={formikValues}
        name={formikValues}
        disabled={isDisabled}
      />
      {/**Error display */}
      <span></span>
    </label>
  );
};

export default ContactUs;
