/** @format */
'use client';
import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { usePageContext } from '@/context/page-context';
import { GET_REQUEST, POST_REQUEST } from '@/utils/requests';
import { URLS } from '@/utils/URLS';
import Cookies from 'js-cookie';
import axios from 'axios';
interface UpgradeNotificationProps {
  isYetToUpgrade?: boolean;
  isAwaitingUpgrade?: boolean;
  isUpgraded?: boolean;
}

const UpgradeNotification = ({
  isAwaitingUpgrade = false,
  isUpgraded = false,
  isYetToUpgrade = true,
}: UpgradeNotificationProps) => {
  const { setSettings, settings } = usePageContext();
  useEffect(() => {
    const getUserAccount = async () => {
      console.log('Processing...');
      try {
        const response = await axios.get(URLS.BASE + URLS.accountSettingsBaseUrl + "/upgradeAccount", {
          headers: {
            Authorization: `Bearer ${Cookies.get('token')}`,
          },
        });
        console.log(response);
        if (response.status === 200) {
          const userAccount = response.data;
          console.log(userAccount.user);
          if (userAccount.user.isInUpgrade) {
            setSettings({
              ...settings,
              upgradeStatus: {
                ...settings.upgradeStatus,
                isUpgraded: userAccount.user.isInUpgrade,
                isAwatingUpgrade: false,
                isYetToUpgrade: false,
              },
            });
            console.log('upgraded');
          }
        }
      } catch (err) {
        console.log(err);
      }
    };
    getUserAccount();
  }, []);
  return (
    <div className='w-full'>
      {isYetToUpgrade && <YetToUpgrade />}
      {isAwaitingUpgrade && <AwaitingUpgrade />} {isUpgraded && <Upgraded />}
    </div>
  );
};

const YetToUpgrade = () => {
  const { settings, setSettings } = usePageContext();

  return (
    <motion.form
      className='border-[1px] border-[#FBBC05] bg-[#FFFDF9] p-[20px] flex flex-col gap-[24px]'
      initial={{ y: 80, opacity: 0 }}
      viewport={{ once: true }}
      whileInView={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.3 }}>
      <h2 className='text-[#E5C50C] text-[20px] font-bold'>
        Why Upgrade to a Corporate Agent with Khabi-Teq?
      </h2>
      <p className='text-base font-normal text-[#5A5D63]'>
        As an individual agent, you&apos;ve already started your journey in real
        estate, but upgrading to a corporate agent status with Khabi-Teq opens
        the door to even greater opportunities and benefits. Here&apos;s why you
        should make the move:
      </p>
      <button
        onClick={() => {
          setSettings({ ...settings, isUpgradeButtonClicked: true });
        }}
        type='button'
        className='h-[45px] bg-[#E5C50C] hover:bg-[#5b5118] transition-all duration-500 lg:w-[135px] text-[#FAFAFA] text-base font-bold'>
        upgrade
      </button>
    </motion.form>
  );
};

const AwaitingUpgrade = () => {
  return (
    <motion.form
      className='border-[1px] border-[#1976D2] bg-[#EAF3FD] p-[20px] flex flex-col gap-[24px]'
      initial={{ y: 80, opacity: 0 }}
      viewport={{ once: true }}
      whileInView={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.3 }}>
      <h2 className='text-[#1976D2] text-[20px] font-bold'>
        Awaiting Approval
      </h2>
      <p className='text-base font-normal text-[#5A5D63]'>
        As an individual agent, you&apos;ve already started your journey in real
        estate, but upgrading to a corporate agent status with Khabi-Teq opens
        the door to even greater opportunities and benefits. Here&apos;s why you
        should make the move:
      </p>
    </motion.form>
  );
};

const Upgraded = () => {
  return (
    <motion.form
      className='border-[1px] border-[#8DDB90] bg-[#EAFFEB] p-[20px] flex flex-col gap-[24px]'
      initial={{ y: 80, opacity: 0 }}
      viewport={{ once: true }}
      whileInView={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.3 }}>
      <h2 className='text-[#09391C] text-[20px] font-bold'>
        Successful Upgraded
      </h2>
      <p className='text-base font-normal text-[#5A5D63]'>
        To redefine real estate transactions with technology that bridges gaps,
        fosters trust, and creates value for all stakeholders in the property
        ecosystem
      </p>
    </motion.form>
  );
};

export default UpgradeNotification;
