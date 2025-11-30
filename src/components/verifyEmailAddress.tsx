/** @format */

'use client';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import emailIcon from '@/svgs/emaiIcon.svg';
import { ArrowLeft, Circle } from 'lucide-react';
import Input from './general-components/Input';
import api from '@/utils/axiosConfig';
import { URLS } from '@/utils/URLS';
import toast from 'react-hot-toast';

const VerifyEmail = () => {
  const [userEmail, setUserEmail] = useState<string>('yourmail@gmail.com');
  const [isEditEmailModalOpened, setIsEditEmailOpened] =
    useState<boolean>(false);

  useEffect(() => {
    const email = localStorage.getItem('email');
    if (!email) return;
    setUserEmail(email);
  }, []);


  return (
    <div className='w-full flex justify-center items-center'>
      <div className='container min-h-[600px] flex flex-col justify-start items-center gap-[20px]'>
        {isEditEmailModalOpened ? (
          <EditEmail email={userEmail} closeModal={setIsEditEmailOpened} />
        ) : (
          <div className='lg:w-[654px] flex flex-col justify-center items-center gap-[20px] w-full px-[20px] pt-[60px]'>
            <div className='w-[81px] h-[81px] rounded-full bg-[#8DDB90] flex items-center justify-center'>
              <Image
                src={emailIcon}
                width={40}
                height={40}
                alt=''
                className='w-[40px] h-[40px]'
              />
            </div>
            <div className='flex flex-col justify-center items-center gap-[4px]'>
              <h2 className='font-display text-center text-xl md:text-2xl text-[#09391C]'>
                Verify your email address
              </h2>
              <p className='text-base md:text-xl text-center text-[#5A5D63] tracking-[5%]'>
                Verify your email to continue
                <br /> We&apos;ve sent a link to{' '}
                <span className='text-base md:text-xl text-[#1976D2]'>
                  {userEmail}
                </span>{' '}
                Click it to complete your signup.
                <br /> Didn&apos;t get it? Check your email or{' '}
                <span
                  onClick={() => setIsEditEmailOpened(!isEditEmailModalOpened)}
                  className='text-base md:text-xl text-[#09391C] font-bold underline cursor-pointer'>
                  Edit Email
                </span>
                .
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const EditEmail = ({
  closeModal,
  email,
}: {
  closeModal: (type: boolean) => void;
  email: string;
}) => {
  const [userEmail, setUserEmail] = useState<string>(email);
  const [reqStatus, setReqStatus] = useState<
    'idle' | 'pending' | 'success' | 'failed'
  >('idle');

  const dynamicButtonText = () => {
    switch (reqStatus) {
      case 'idle':
        return 'Submit';
      case 'pending':
        return 'Submitting...';
      case 'failed':
        return 'Submit';
      case 'success':
        return 'Submit';
      default:
        return 'Submit';
    }
  };

const submitEmail = async () => {
  try {
    setReqStatus('pending');
    // Get the token from localStorage (or however you store it after signup)
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('No token found. Please sign up again.');
      setReqStatus('failed');
      return;
    }
    const response = await api.post(
      '/user/change-email',
      {
        email: userEmail,
        token: token,
      }
    );
    if (response.status === 200) {
      setReqStatus('success');
      toast.success('Email updated successfully!');
      // Optionally update localStorage
      localStorage.setItem('email', userEmail);
      closeModal(false);
    }
  } catch (error: any) {
    console.log(error);
    setReqStatus('failed');
    toast.error(error?.response?.data?.message || error?.message || 'Failed to update email');
  }
};
  return (
    <div className='w-full h-[400px] flex flex-col px-[20px] mt-[30px]'>
      <div className='flex items-center gap-[10px]'>
        <button type='button'>
          <ArrowLeft
            size={16}
            className='w-[16px] h-[16px] cursor-pointer'
            onClick={() => closeModal(false)}
          />
          {''}
        </button>
        <span className='text-[#25324B] text-xl'>Verify</span>
        <Circle
          size={4}
          className='w-[4px] h-[4px]'
        />
        <span
          className="text-xl text-[#25324B] font-semibold">
          Back
        </span>
      </div>
      <form
        method='post'
        className='w-full flex justify-center items-center'
        onSubmit={(event) => {
          event.preventDefault();
          submitEmail();
        }}>
        <div className=' w-[411px] mt-[70px] flex flex-col gap-[25px]'>
          <h2
            className={`font-display text-[#09391C] font-semibold text-2xl text-center`}>
            Edit Email
          </h2>
          <Input
            type='email'
            name='email'
            value={userEmail}
            isDisabled={reqStatus === 'pending'}
            onChange={(event: { target: { value: string } }) => {
              setUserEmail(event.target.value);
            }}
            label='Email'
          />
          <button
            className='h-[50px] bg-[#8DDB90] text-white text-lg font-bold'
            type='submit'>
            {reqStatus && dynamicButtonText()}
          </button>
        </div>
      </form>
    </div>
  );
};

export default VerifyEmail;
