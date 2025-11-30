/** @format */

'use client';
import { archivo } from '@/styles/font';
import { FormikProps, useFormik } from 'formik';
import React, { Fragment, useEffect, useState } from 'react';
import * as Yup from 'yup';
import banks from '@/data/nigeria-banks.json';
import Select, { SingleValue } from 'react-select';
import customStyles from '@/styles/inputStyle';
import AttachFile from '@/components/general-components/attach_file';
import { motion } from 'framer-motion';
import SubmitPopUp from '@/components/submit';
import { usePageContext } from '@/context/page-context';

type ProvideTransactionDetailsProps = {
  amountToPay: number;
  payload?: any;
};

interface Option {
  label: string;
  value: string;
}


const ProvideTransactionDetails: React.FC<ProvideTransactionDetailsProps> = ({
  amountToPay = 10000,
  payload = {},
}): React.JSX.Element => {
  const [allBanks, setAllBanks] = useState<Option[]>([
    {
      label: '',
      value: '',
    },
  ]);

  const [isSuccessfullySubmitted, setIsSuccessfullySubmitted] =
    useState<boolean>(false);
  const { commission } = usePageContext();

  useEffect(() => {
    console.log(commission);
  }, [commission]);

  const [fileURL, setFileURL] = useState<string | null>(null); //get uploaded receipt

  const validationSchema = Yup.object({
    bankName: Yup.string().required('Bank Name is a required field'),
    accountNumber: Yup.number().required('Account Number is a required field'),
    accountName: Yup.string().required('Account Name is a required field'),
    transactionReference: Yup.string().required(
      'Transaction Reference is a required field'
    ),
  });
  const formik = useFormik({
    initialValues: {
      bankName: '',
      accountNumber: undefined,
      accountName: '',
      transactionReference: '',
    },
    validationSchema,
    onSubmit: async (values: TransactionDetailsProps) => {
      console.log(values);

      const payload = {
        ...values,
        imageReceipt: fileURL,
      };

      // try {
      //   const response = await axios.post(URLS.BASE + '/', payload);
      //   if (response.status === 200) {
      //     //do something
      //   }
      // } catch (err) {
      //   console.log(err);
      // }
      console.log(payload);
      setIsSuccessfullySubmitted(true);
    },
  });

  useEffect(() => {
    const options = banks.map((bank) => ({
      value: bank.code,
      label: bank.name,
    }));
    if (options.length > 0) return setAllBanks(options);
  }, []);
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
            {/* Provide the Transaction Details */}
            <h2 className='text-xl text-[#09391C] font-semibold'>
              Provide Transaction Details
            </h2>
            <div className='w-full grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-3'>
              {/* Select Bank */}
              <label
                htmlFor={'bankName'}
                className='w-full flex flex-col gap-1'>
                <span
                  className={`text-base text-[#24272C] ${archivo.className} font-medium`}>
                  Enter Bank
                </span>
                <Select
                  styles={customStyles}
                  name='bankName'
                  options={allBanks}
                  id='bankName'
                  placeholder='Select Bank'
                  onBlur={formik.handleBlur}
                  onChange={(
                    event: SingleValue<{ value: string; label: string }>
                  ) => {
                    formik.setFieldValue('bankName', event?.label);
                  }}
                />
                {(formik.errors.bankName || formik.touched.bankName) && (
                  <span className={`${archivo.className} text-xs text-red-500`}>
                    {formik.errors.bankName}
                  </span>
                )}
              </label>
              {/* Enter Account Number */}
              <Input
                formikType={formik}
                id='accountNumber'
                type='number'
                name='accountNumber'
                placeholder='Enter Account Number'
                heading='Enter Account Number'
              />
              {/* Enter Account Name */}
              <Input
                formikType={formik}
                id='accountName'
                type='text'
                name='accountName'
                placeholder='Enter Account Name'
                heading='Enter Account Name'
              />
              {/* Insert Transaction Reference */}
              <Input
                formikType={formik}
                id='transactionReference'
                type='text'
                name='transactionReference'
                placeholder='Insert Transaction Reference'
                heading='Insert Transaction Reference'
              />
            </div>
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
            {/* button to submit */}
            <button
              type='submit'
              className='h-[50px] sm:h-[65px] w-full bg-[#8DDB90] text-base font-bold text-[#FAFAFA] rounded'>
              Submit
            </button>
          </motion.form>
        </div>
        {isSuccessfullySubmitted && <SubmitPopUp href='/' />}
      </aside>
    </Fragment>
  );
};

interface TransactionDetailsProps {
  bankName: string;
  accountNumber: number | undefined;
  accountName: string;
  transactionReference: string;
}

type InputProps = {
  id: 'bankName' | 'accountNumber' | 'accountName' | 'transactionReference';
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

const PaymentDetailsPage = () => {
  const [amount, setAmount] = React.useState<number>(0);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const amt = Number(params.get('amount') || '0');
      if (!Number.isNaN(amt) && amt >= 0) setAmount(amt);
    }
  }, []);

  return <ProvideTransactionDetails amountToPay={amount} />;
};

export default PaymentDetailsPage;
