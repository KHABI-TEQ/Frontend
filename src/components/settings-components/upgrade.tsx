/** @format */

'use client';
import React, { useEffect } from 'react';
import UpgradeNotification from './upgrade-notification';
import { motion } from 'framer-motion';
import Input from '../general-components/Input';
import { usePageContext } from '@/context/page-context';
import Image from 'next/image';
import sampleImage from '@/assets/noImageAvailable.png';

interface SelectOption {
  value: string;
  label: string;
}
const Upgrade = () => {
  const { settings, userDetails } = usePageContext();

  useEffect(
    () => console.log(userDetails?.agentData?.meansOfId),
    [userDetails]
  );

  return (
    <section className='flex flex-col gap-[20px] lg:w-[662px] min-h-[400px]'>
      <UpgradeNotification
        isYetToUpgrade={settings.upgradeStatus.isYetToUpgrade}
        isAwaitingUpgrade={settings.upgradeStatus.isAwatingUpgrade}
        isUpgraded={settings.upgradeStatus.isUpgraded}
      />
      <motion.form
        initial={{ y: 80, opacity: 0 }}
        viewport={{ once: true }}
        whileInView={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className='w-full lg:h-[407px] flex flex-col gap-[20px] p-[30px] bg-[#FFFFFF] border-[1px] border-[#C7CAD0]'>
        <h2 className='text-[20px] font-semibold text-[#09391C] leading-[160%]'>
          Agent Type
        </h2>
        <div className='flex flex-col gap-[20px]'>
          <Input
            value={userDetails?.agentData?.agentType}
            name='Are you an Individual agent or Corporate Agent'
            isDisabled
            label='Agent Type'
            type='text'
          />
          <Input
            name='IDNumber'
            label='ID Number'
            placeholder={userDetails.id ?? '3i458568686787'}
            type='number'
            isDisabled={true}
          />
          <div className='w-full h-[89px] flex justify-between items-center'>
            <h2 className='text-[#202430] text-base font-semibold'>
              Uploaded document
            </h2>
            <div className='flex gap-6'>
              {userDetails?.agentData?.meansOfId?.map(
                (
                  item: { docImg: string[]; _id: string; name: string },
                  index: number
                ) => (
                  <div key={item._id || index} className='mb-4'>
                    <p className='font-medium mb-2 capitalize'>{item.name}</p>
                    <div className='flex gap-2 flex-wrap'>
                      {item?.docImg?.map((image: string, imgIndex) => (
                        <Image
                          key={`${item._id}-${imgIndex}`}
                          src={image}
                          alt={item.name}
                          width={150}
                          height={50}
                          className='bg-[#D9D9D9] lg:w-[131px] h-full object-cover'
                        />
                      ))}
                    </div>
                  </div>
                )
              )}
            </div>
            {/* <Image
              src={
                userDetails?.agentData?.meansOfId[0]?.docImage?.[0] ||
                'https://res.cloudinary.com/dkqjneask/image/upload/v1748449285/property-images/1748449284433-property-image.png'
              }
              alt=''
              width={150}
              height={50}
              className='bg-[#D9D9D9] lg:w-[131px] h-full object-cover'
            /> */}
          </div>
        </div>
      </motion.form>
    </section>
  );
};

export default Upgrade;
