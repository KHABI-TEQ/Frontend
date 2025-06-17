/** @format */
'use client';
import React, { FC, useState } from 'react';
import PopUpModal from '../pop-up-modal-reusability';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClose } from '@fortawesome/free-solid-svg-icons';
import { useFormik } from 'formik';
import Input from '../general-components/Input';
import * as Yup from 'yup';
import { archivo } from '@/styles/font';
import axios from 'axios';
import { URLS } from '@/utils/URLS';
import toast from 'react-hot-toast';

type ConractInformationProps = {
  payload?: any;
  setIsContactInformationModalOpened?: (value: boolean) => void;
  type: 'buyer' | 'jv' | 'rent';
};

const ContactInformation: FC<ConractInformationProps> = ({
  setIsContactInformationModalOpened,
  type,
  payload,
}) => {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);
  const validationSchema = Yup.object({
    fullName: Yup.string().required('Name is required'),
    email: Yup.string().email('Invalid email address').notRequired(),
    phoneNumber: Yup.string()
      .required('Phone number is required')
      .matches(/\d+/, 'Phone must be digits only')
      .min(10, 'Phone number must be at least 10 digits'),
  });

  const handleSuccess = () => {
    setIsSubmitting(false);
    setShowSuccessModal(true);
    setTimeout(() => {
      setShowSuccessModal(false);
      setIsContactInformationModalOpened?.(false);
    }, 2000); // Show success modal for 2 seconds
  };

  const formik = useFormik({
    initialValues: {
      fullName: '',
      email: '',
      phoneNumber: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      setIsSubmitting(true); // Set loading state
      
      if (type === 'buyer') {
        try {
          const url = URLS.BASE + '/properties/buy/request/new';
          const payloadToPass = {
            propertyType: payload?.values?.briefType || 'Outright Sales',
            features: payload?.values?.desirerFeatures || [],
            docOnProperty: payload?.values?.docsOnProperty
              ? payload.values.docsOnProperty.map((opt: string) => ({
                  docName: opt,
                  isProvided: true,
                }))
              : [],
            propertyCondition: payload?.values?.desirerFeatures 
              ? payload.values.desirerFeatures.toString()
              : '',
            location: payload?.values?.location
              ? {
                  state: payload.values.location.split(',')[1]?.trim() || 'Lagos',
                  localGovernment: payload.values.location.split(',')[0]?.trim() || '',
                  area: 'N/A'
                }
              : {
                  state: 'Lagos',
                  localGovernment: '',
                  area: 'N/A'
                },
            price: Number(payload?.values?.prices?.maxPrice || 0),
            propertyFeatures: {
              noOfBedrooms: Number(payload?.values?.bedroom || 0),
              additionalFeatures: payload?.values?.desirerFeatures || []
            },
            owner: {
              fullName: values.fullName,
              phoneNumber: values.phoneNumber,
              email: values.email,
            },
            areYouTheOwner: true,
            landSize: payload?.values?.landSize
              ? {
                  measurementType: payload.values.landSize.type || '',
                  size: Number(payload.values.landSize.size || 0),
                }
              : {
                  measurementType: '',
                  size: 0,
                },
            briefType: 'Outright Sales',
            usageOptions: payload?.values?.usageOptions || [],
            pictures: []
          };
          
          const response = await axios.post(url, payloadToPass);
          
          if (response.data.owner) {
            toast.success('Preference submitted successfully');
            handleSuccess(); // Only call success after API succeeds
          } else {
            const errorMessage = response.data.error || 'Submission failed';
            toast.error(errorMessage);
            setIsSubmitting(false);
          }
        } catch (error: any) {
          console.error(error);
          const errorMessage = error?.response?.data?.message || error?.message || 'Failed to submit property';
          toast.error(errorMessage);
          setIsSubmitting(false);
        }
      } else if (type === 'rent') {
        try {
          const url = URLS.BASE + URLS.userSubmitPreference;
          const payloadToPass = {
            propertyType: payload?.values?.rentFilterBy
              ? payload.values.rentFilterBy.join(',')
              : '',
            features: payload?.values?.desirerFeatures
              ? payload?.values?.desiresFeatures
              : [],
            docOnProperty: [],
            propertyCondition: payload?.values?.desiresFeatures
              ? payload.values.desiresFeatures.toString()
              : '',
            location: {
              state: payload.values.location.state,
              localGovernment: payload.values.location.lga,
            },
            budgetMin: Number(payload?.values?.price?.minPrice || 0),
            budgetMax: Number(payload?.values?.price?.maxPrice || 0),
            owner: {
              fullName: values.fullName,
              phoneNumber: values.phoneNumber,
              email: values.email,
            },
            areYouTheOwner: true,
            briefType: payload.values.briefType,
            additionalFeatures: {
              noOfBedrooms: Number(payload.values.bedroom || 0),
              noOfBathrooms: Number(payload.values.bathroom || 0),
            },
            tenantCriteria: [],
          };
          
          const response = await axios.post(url, payloadToPass);
          
          if (response.data.owner) {
            toast.success('Preference submitted successfully');
            handleSuccess(); // Only call success after API succeeds
          } else {
            const errorMessage = response.data.error || 'Submission failed';
            toast.error(errorMessage);
            setIsSubmitting(false);
          }
        } catch (error: any) {
          console.error(error);
          const errorMessage = error?.response?.data?.message || error?.message || 'Failed to submit property';
          toast.error(errorMessage);
          setIsSubmitting(false);
        }
      }
    },
  });

  return (
    <PopUpModal>
      {showSuccessModal ? (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 20, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className='flex flex-col items-center justify-center p-8'>
          <h2 className='text-2xl font-bold text-green-600 mb-4'>Success!</h2>
          <p className='text-lg text-gray-700 text-center'>
            Preference submitted successfully.
          </p>
        </motion.div>
      ) : (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 20, opacity: 0 }}
          transition={{ duration: 0.2 }}
          viewport={{ once: true }}
          id='contact-information-modal'
          whileInView={{ opacity: 1, y: 0 }}
          className='lg:w-[649px] flex flex-col gap-[26px]'>
          <div className='w-full flex items-start justify-end'>
            <button
              onClick={() => setIsContactInformationModalOpened?.(false)}
              type='button'
              className='w-[51px] h-[51px] flex items-center justify-center rounded-full bg-[#FFFFFF]'>
              <FontAwesomeIcon
                icon={faClose}
                width={24}
                height={24}
                color='#181336'
                className='w-[24px] h-[24px]'
              />
              {''}
            </button>
          </div>
          <form
            onSubmit={formik.handleSubmit}
            className='md:py-[40px] py-[30px] px-[30px] md:px-[60px] rounded-[4px] bg-white shadow-md flex items-center justify-center'>
            <div className='w-full flex flex-col gap-[21px] md:gap-[42px]'>
              <div className='flex flex-col gap-[4px] items-center justify-center'>
                <h2 className='text-2xl font-bold text-gray-900 text-center'>
                  Contact Information
                </h2>
                <p className='text-lg text-[#515B6F] text-center'>
                  Please provide your contact details so we can get back to you.
                </p>
              </div>
              <div className='flex flex-col gap-[20px]'>
                <Input
                  name='fullName'
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  type='text'
                  value={formik.values.fullName}
                  id='fullName'
                  label='Full Name'
                  placeholder={`Full name of the ${type}`}
                />
                <Input
                  name='phoneNumber'
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  type='number'
                  value={formik.values.phoneNumber}
                  id='phoneNumber'
                  label='Phone Number'
                  placeholder={`Active phone number for follow-up`}
                />
                <Input
                  name='email'
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  type='email'
                  value={formik.values.email}
                  id='email'
                  label='Email'
                  placeholder={`Optional, for communication`}
                />
              </div>
              <div className='w-full flex flex-col gap-[15px]'>
                <button
                  type='submit'
                  disabled={isSubmitting}
                  className={`bg-[#8DDB90] h-[57px] rounded-[5px] text-lg ${archivo.className} font-bold text-white disabled:animate-pulse disabled:opacity-70`}>
                  {isSubmitting ? 'Submitting...' : 'Submit'}
                </button>
                <button
                  onClick={() => {
                    formik.resetForm();
                    setIsContactInformationModalOpened?.(false);
                  }}
                  type='reset'
                  disabled={isSubmitting}
                  className={`bg-transparent border-[1px] border-[#E9EBEB] h-[57px] rounded-[5px] text-lg ${archivo.className} font-bold text-gray-700 disabled:opacity-50`}>
                  Cancel
                </button>
              </div>
            </div>
          </form>
        </motion.div>
      )}
    </PopUpModal>
  );
};

export default ContactInformation;