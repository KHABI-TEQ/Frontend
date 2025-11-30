/** @format */

import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
// import * as Yup from 'yup';
// import { useFormik } from 'formik';
import 'react-phone-number-input/style.css';
import Input from '../general-components/Input';
import { usePageContext } from '@/context/page-context';
// import axios from 'axios';
// import { URLS } from '@/utils/URLS';
// import Cookies from 'js-cookie';

const ContactDetails = () => {
  // const validationSchema = Yup.object({
  //   emailAddress: Yup.string()
  //     .required('Email is required')
  //     .email('Invalid email format'),
  //   phoneNumber: Yup.string()
  //     .matches(/^\+?[1-9]\d{7,14}$/, 'Invalid phone number')
  //     .required('Phone number is required'),
  // });
  // const formik = useFormik({
  //   initialValues: {
  //     emailAddress: '',
  //     phoneNumber: '',
  //   },
  //   validationSchema,
  //   onSubmit: (values) => {
  //     console.log(values);
  //   },
  // });
  const { userDetails } = usePageContext();

  // useEffect(() => {
  //   const getUserAccount = async () => {
  //     console.log('Processing...');
  //     try {
  //       const response = await axios.get(URLS.BASE + URLS.userAccount, {
  //         headers: {
  //           Authorization: `Bearer ${Cookies.get('token')}`,
  //         },
  //       });
  //       console.log(response);
  //       if (response.status === 200) {
  //         const userAccount = response.data;
  //         formik.setFieldValue('emailAddress', userAccount.user.email);
  //         formik.setFieldValue('phoneNumber', userAccount.user.phoneNumber);
  //         console.log(userAccount.user);
  //       }
  //     } catch (err) {
  //       console.log(err);
  //     }
  //   };
  //   getUserAccount();
  // }, []);
  return (
    <motion.form
      initial={{ y: 80, opacity: 0 }}
      viewport={{ once: true }}
      whileInView={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.3 }}
      // onSubmit={formik.handleSubmit}
      className='bg-[#FFFFFF] border-[1px] border-[#C7CAD0] lg:w-[662px] h-[383px] p-[30px] flex flex-col justify-between'>
      <div className='w-full h-[233px] flex flex-col gap-[20px]'>
        <h2 className='text-[#09391C] text-[20px] font-semibold leading-[160%]'>
          Contact Details
        </h2>
        <div className='w-full h-[181px] flex flex-col gap-[20px]'>
          <Input
            name='emailAddress'
            label='Email Address'
            className='bg-white'
            type='email'
            // onChange={formik.handleChange}
            value={userDetails.email}
            isDisabled
          />
          <Input
            name='phoneNumber'
            label='Phone number'
            className='bg-white'
            type='number'
            value={userDetails.phoneNumber}
            // onChange={formik.handleChange}
            isDisabled
          />
        </div>
      </div>
      {/**Button to save */}
      <button
        type='submit'
        disabled
        className={`bg-[#8DDB90] gap-[10px] h-[50px] w-full text-base font-bold text-[#FAFAFA]`}>
        Save
      </button>
    </motion.form>
  );
};

export default ContactDetails;
