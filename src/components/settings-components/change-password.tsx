/** @format */
/* eslint-disable @typescript-eslint/no-explicit-any */

'use client';
import { archivo } from '@/styles/font';
import React, { useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { motion } from 'framer-motion';
import { GET_REQUEST, POST_REQUEST } from '@/utils/requests';
import { URLS } from '@/utils/URLS';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';

const ChangePassword = () => {
  const validationSchema = Yup.object({
    currentPassword: Yup.string().required('Current Password is required'),
    newPassword: Yup.string().required('New Password is required'),
  });
  const [formikStatus, setFormikStatus] = React.useState<
    'idle' | 'failed' | 'success' | 'pending'
  >('idle');

  const formik = useFormik({
    initialValues: {
      currentPassword: '',
      newPassword: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      setFormikStatus('pending');
      try {
        const response = await POST_REQUEST(
          URLS.BASE + URLS.accountSettingsBaseUrl + "/changePassword",
          {
            oldPassword: formik.values.currentPassword,
            newPassword: formik.values.newPassword,
          },
          Cookies.get('token')
        );
        if (response.success) {
          toast.success('Password changed successfully');
          setFormikStatus('success');
          formik.values.currentPassword = ''; // Clear currentPassword field
          formik.values.newPassword = ''; // Clear newPassword field
        } else {
          setFormikStatus('failed');
          toast.error(response.message || "Failed to change password");
        }
      } catch (err) {
        setFormikStatus('failed');
      }
    },
  });

  return (
    <motion.form
      initial={{ y: 80, opacity: 0 }}
      viewport={{ once: true }}
      whileInView={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.3 }}
      onSubmit={formik.handleSubmit}
      className='w-full lg:h-[211px] bg-[#FFFFFF] p-[26px] border-[#D6DDEB] border-[1px] flex flex-col items-center justify-center gap-[29px]'>
      <div className='w-full min-h-[80px] flex md:flex-row flex-col justify-between gap-[28px]'>
        <InputPassword
          formik={formik}
          name='Current Password'
          id='currentPassword'
        />
        <InputPassword formik={formik} name='New Password' id='newPassword' />
      </div>
      <button
        className={`lg:w-[317px] w-full ${
          formikStatus === 'pending' && 'animate-pulse'
        } h-[50px] transition-all duration-500 gap-[10px] text-base font-bold text-[#FFFFFF] px-[12px] hover:bg-[#4d724e] bg-[#8DDB90] rounded-[5px]`}
        title='Save Password'
        type='submit'>
        {formikStatus === 'pending' ? 'Saving...' : 'SAVE PASSWORD'}
      </button>
    </motion.form>
  );
};

type InputPasswordProps = {
  id: string;
  value?: string;
  name: string;
  formik: any;
};
const InputPassword = ({ id, name, formik }: InputPasswordProps) => {
  return (
    <label htmlFor={id} className='flex flex-col h-[80px] w-full gap-[4px]'>
      <span className='font-base font-normal text-[#1E170A]'>{name}</span>
      <input
        onBlur={formik.handleBlur}
        onChange={(e: { target: { value: string } }) => {
          formik.setFieldValue(id, e.target.value);
        }}
        title={name}
        className={`w-full h-[50px] py-[16px] px-[12px] bg-[#FFFFFF] border-[#D0CEC8] border-[1px] rounded-[5px] placeholder:text-[#696866] font-normal text-base ${archivo.className} text-black outline-none`}
        type='password'
        placeholder='This is a placeholder'
        name={name}
        id={id}
      />
      {(formik.errors[id] || formik.touched[id]) && (
        <span className='text-sm text-red-600'>{formik.errors[id]}</span>
      )}
    </label>
  );
};

export default ChangePassword;
