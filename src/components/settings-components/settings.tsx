/** @format */

import React, { useEffect, useState } from 'react';
import Sidebar from './sidebar';
import Mainbar from './main-bar';
import api from '@/utils/axiosConfig';
import { URLS } from '@/utils/URLS';
import Cookies from 'js-cookie';
import { usePageContext } from '@/context/page-context';
import Loading from '../loading-component/loading';
import { UserAgentDataProps } from '@/types/agent_data_props';

const Settings = () => {
  const { userDetails, setUserDetails } = usePageContext();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [formikStatus, setFormikStatus] = useState<
    'pending' | 'success' | 'failed' | 'initial'
  >('initial');
  /**
   * fetch all necessary details for settings page
   * @getUserAccount - An asynchronous function that gets the user details from
   * the backend
   * @params - No parameters
   * @returns - void
   */
  const getUserAccount = async () => {
    setIsLoading(true);
    setFormikStatus('pending');
    //console.log(Cookies.get('token'));
    try {
      const response = await axios.get(URLS.BASE + URLS.accountSettingsBaseUrl, {
        headers: {
          Authorization: `Bearer ${Cookies.get('token')}`,
        },
      });
      //console.log('response', response);
      if (response.status === 200) {
        setIsLoading(false);
        setFormikStatus('success');
        const userAccount: UserAgentDataProps = response.data.user;
        // console.log('userAccount', userAccount);
        if (userAccount._id) {
          /**
           * fill the userDetails contextAPI with the values from the backend
           *
           */
          setUserDetails(userAccount);
        }
        //console.log(userDetails);
      } else {
        setFormikStatus('failed');
      }
    } catch (err) {
      console.log(err);
      setIsLoading(false);
      setFormikStatus('failed');
    }
  };

  useEffect(() => {
    getUserAccount();
  }, []);
  return (
    <section className='w-full flex justify-center flex-col'>
      {formikStatus === 'pending' && <Loading />}
      {formikStatus === 'success' && (
        <div className='container lg:w-[1180px] mt-[40px] flex lg:flex-row flex-col gap-[20px] justify-between overflow-hidden'>
          <Sidebar />
          <Mainbar />
        </div>
      )}
      {formikStatus === 'failed' ? (
        <div className='flex flex-col items-center justify-center h-[500px] container lg:w-[1180px]'>
          <h1 className='text-3xl font-bold text-gray-600'>Failed to load</h1>
          <p className='text-gray-500'>Check your internet connection.</p>
        </div>
      ) : null}
    </section>
  );
};

export default Settings;

/**
 * <Loading />
 *
 */
