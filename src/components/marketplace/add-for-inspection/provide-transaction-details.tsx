/** @format */

'use client';
import { archivo } from '@/styles/font';
import { FormikProps, useFormik } from 'formik';
import React, { Fragment, use, useEffect, useState } from 'react';
import * as Yup from 'yup';
import banks from '@/data/nigeria-banks.json';
import { Option } from '../types/option';
import AttachFile from '@/components/general-components/attach_file';
import { URLS } from '@/utils/URLS';
import { motion } from 'framer-motion';
import SubmitPopUp from '@/components/submit';
import { SubmitInspectionPayloadProp } from '../types/payload';
import toast from 'react-hot-toast';
import { POST_REQUEST } from '@/utils/requests';
import { set } from 'date-fns';
import ImageContainer from '@/components/general-components/image-container';
import { usePageContext } from '@/context/page-context';

type ProvideTransactionDetailsProps = {
  amountToPay: number;
  submitInspectionPayload: SubmitInspectionPayloadProp;
  setSubmitInspectionPayload: React.Dispatch<
    React.SetStateAction<SubmitInspectionPayloadProp>
  >;
};

const ProvideTransactionDetails: React.FC<ProvideTransactionDetailsProps> = ({
  amountToPay,
  submitInspectionPayload,
  setSubmitInspectionPayload,
}) => {
  const [isSuccessfullySubmitted, setIsSuccessfullySubmitted] =
    useState<boolean>(false);

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  //to see selected image
  const { setImageData, setViewImage } = usePageContext();

  useEffect(() => {}, [submitInspectionPayload]);
  const [fileURL, setFileURL] = useState<string | null>(null);
  const [formStatus, setFormStatus] = useState<
    'success' | 'pending' | 'failed' | 'idle'
  >('idle');

  const validationSchema = Yup.object({
    fullName: Yup.string().required('Full Name is a required field'),
  });
  const formik = useFormik({
    initialValues: {
      fullName: '',
    },
    validationSchema,
    onSubmit: async (values: TransactionDetailsProps) => {
      setFormStatus('pending');
      setIsSubmitting(true);

      setSubmitInspectionPayload?.({
        ...submitInspectionPayload,
        transaction: {
          ...submitInspectionPayload.transaction,
          fullName: formik.values.fullName,
          transactionReceipt: fileURL as string,
        },
        status: 'pending',
        isNegotiating: false,
      });
      try {
        const response = await toast.promise(
          POST_REQUEST(URLS.BASE + URLS.requestInspection, {
            propertyId: submitInspectionPayload.propertyId,
            inspectionDate: submitInspectionPayload.inspectionDate,
            inspectionTime: submitInspectionPayload.inspectionTime,
            status: 'pending',
            requestedBy: submitInspectionPayload.requestedBy,
            transaction: {
              fullName: formik.values.fullName,
              transactionReceipt: fileURL as string,
            },
            letterOfIntention: submitInspectionPayload.letterOfIntention || '',
          }),
          {
            loading: 'Submitting...',
            success: (data) => {
              // If API returns error in body, show error instead
              if (data?.error) {
                throw new Error(data.error);
              }
              return 'Request submitted successfully!';
            },
            error: (err) => err?.message || 'Failed to submit request.',
          }
        ); // Only set success if no error in response
        if (!response?.error) {
          setIsSuccessfullySubmitted(true);
          setFormStatus('success');
        } else {
          setIsSuccessfullySubmitted(false);
          setFormStatus('failed');
          setIsSubmitting(false);
        }
      } catch (err) {
        console.log(err);
        setIsSuccessfullySubmitted(false);
        setFormStatus('failed');
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  return (
    <Fragment>
      <aside className='w-full flex justify-center items-center py-6 sm:py-8 md:py-10'>
        <div className='w-full flex flex-col lg:flex-row gap-6 md:gap-8 lg:gap-[35px] max-w-6xl px-2 sm:px-4 md:px-8'>
          {/* First div */}
          <div className='w-full lg:w-[420px] flex flex-col gap-4'>
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              exit={{ y: 20, opacity: 0 }}
              viewport={{ once: true }}
              className='w-full bg-white py-6 px-4 sm:px-6 flex flex-col gap-3'>
              {/* Make payment to */}
              <div className='flex flex-col'>
                <h3
                  className={`${archivo.className} text-lg font-bold text-black`}>
                  Make payment to
                </h3>
                <h2
                  className={`${archivo.className} text-3xl font-bold text-black`}>
                  N{Number(amountToPay).toLocaleString()}
                </h2>
              </div>
              {/* Account details */}
              <div className='flex flex-col gap-2'>
                <h4
                  className={`${archivo.className} text-lg font-bold text-black`}>
                  Account details
                </h4>
                <p
                  className={`text-[#5A5D63] ${archivo.className} text-lg font-medium`}>
                  Bank{' '}
                  <span
                    className={`${archivo.className} text-lg font-medium text-black`}>
                    GTB
                  </span>
                </p>
                <p
                  className={`text-[#5A5D63] ${archivo.className} text-lg font-medium`}>
                  Account Number{' '}
                  <span
                    className={`${archivo.className} text-lg font-medium text-black`}>
                    2004766765
                  </span>
                </p>
                <p
                  className={`text-[#5A5D63] ${archivo.className} text-lg font-medium`}>
                  Account Name{' '}
                  <span
                    className={`${archivo.className} text-lg font-medium text-black`}>
                    Khabi-Teq Reality
                  </span>
                </p>
              </div>
            </motion.div>
            {/* PS */}
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              exit={{ y: 20, opacity: 0 }}
              viewport={{ once: true }}
              className='text-[#1976D2] font-medium text-base sm:text-lg'>
              Note that this process is subject to Approval by khabiteq realty
            </motion.p>
          </div>
          {/* Second div - form section */}
          <motion.form
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            exit={{ y: 20, opacity: 0 }}
            viewport={{ once: true }}
            onSubmit={formik.handleSubmit}
            className='w-full lg:w-[602px] flex flex-col gap-5'>
            <h2 className='text-xl text-[#09391C] font-semibold'>
              Provide Transaction Details
            </h2>

            {/* Enter Account Name */}
            <Input
              formikType={formik}
              id='fullName'
              type='text'
              name='fullName'
              placeholder='Enter Full Name'
              heading='Enter Full Name'
              className='col-span-1 sm:col-span-2'
            />
            {/* Attach Receipt */}
            <div className='h-[58px] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2'>
              <AttachFile
                heading='Upload your transaction receipt.'
                style={{
                  width: '283px',
                }}
                id='transaction_receipt'
                setFileUrl={setFileURL}
              />
            </div>
            <div className='flex items-center justify-end'>
              {fileURL && (
                <ImageContainer
                  image={fileURL}
                  setViewImage={setViewImage}
                  setImageData={setImageData}
                  alt='Image'
                  heading='Image1'
                  removeImage={() => {
                    setFileURL(null);
                  }}
                  id=''
                />
              )}
            </div>
            {/* button to submit */}
            <button
              type='submit'
              className={`h-[50px] sm:h-[65px] w-full bg-[#8DDB90] text-base font-bold text-[#FAFAFA] rounded ${
                !formik.isValid || !formik.dirty || isSubmitting || !fileURL
                  ? 'opacity-50 cursor-not-allowed'
                  : ''
              }`}
              disabled={
                !formik.isValid || !formik.dirty || isSubmitting || !fileURL
              }>
              {formStatus === 'pending' ? (
                <span className='flex items-center justify-center gap-2'>
                  <span>Submitting </span>
                  <div className='w-8 h-8 rounded-full border-r-2 border-white border-t-transparent animate-spin'></div>
                </span>
              ) : (
                <span>{isSubmitting ? 'Submitting...' : 'Submit'}</span>
              )}
            </button>
          </motion.form>
        </div>
        {isSuccessfullySubmitted && <SubmitPopUp />}
      </aside>
    </Fragment>
  );
};

interface TransactionDetailsProps {
  fullName: string;
}

type InputProps = {
  id: 'fullName';
  placeholder?: string;
  type: 'number' | 'text';
  name: string;
  heading: string;
  // value?: string | number;
  // onChange?: (type: React.ChangeEvent<HTMLInputElement>) => void;
  isDisabled?: boolean;
  formikType: FormikProps<TransactionDetailsProps>;
  className?: string;
};

const Input: React.FC<InputProps> = ({
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
        className={`px-[12px] h-[50px] bg-[#FFFFFF] border-[1px] border-[#E9EBEB] w-full text-base placeholder:text-[#A7A9AD] text-black ${archivo.className} rounded-[5px] outline-none`}
      />
      {(formikType.errors[id] || formikType.touched[id]) && (
        <span className={`${archivo.className} text-xs text-red-500`}>
          {formikType.errors[id]}
        </span>
      )}
    </label>
  );
};

export default ProvideTransactionDetails;
