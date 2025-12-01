/** @format */

'use client';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import randomImage from '@/assets/noImageAvailable.png';
import { usePageContext } from '@/context/page-context';
import { motion } from 'framer-motion';
import axios from 'axios';
import { URLS } from '@/utils/URLS';
import Cookies from 'js-cookie';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faPlusCircle } from '@fortawesome/free-solid-svg-icons';
import toast from 'react-hot-toast';
import { POST_REQUEST, POST_REQUEST_FILE_UPLOAD } from '@/utils/requests';
import { useUserContext } from '@/context/user-context';

const Sidebar = () => {
  const { setSettings, settings, userDetails, setUserDetails } =
    usePageContext();
  const [uploading, setUploading] = useState(false);
  const { logout } = useUserContext();
  const [img, setImg] = useState<any>(randomImage);

  // const uploadImage = async (event: React.ChangeEvent<HTMLInputElement>) => {
  //   const file = event.target.files?.[0];
  //   console.log(file);
  //   if (!file) return;

  //   const fromData = new FormData();
  //   fromData.append('file', file as Blob);

  //   const url = URLS.BASE + '/agent/upload-profile-pic';
  //   const payload = {
  //     file: fromData.get('file'),
  //   };

  //   await toast.promise(
  //     POST_REQUEST(url, payload).then((response) => {
  //       if (response) {
  //         // if (setFileUrl) {
  //         //   setFileUrl(
  //         //     (response as unknown as { url: string }).url as string
  //         //   );
  //         // }
  //         setUserDetails({
  //           ...userDetails,
  //           profile_picture: response.data.url,
  //         });
  //         console.log('Image uploaded successfully', response);
  //         return 'Image uploaded successfully';
  //       } else {
  //         toast.error('Image upload failed');
  //         throw new Error('Image upload failed');
  //       }
  //     }),
  //     {
  //       loading: 'Uploading...',
  //       success: 'Image  uploaded successfully',
  //       error: 'Image upload failed',
  //     }
  //   );
  // };

  const urlToFile = async (url: string, filename: string): Promise<File> => {
    const res = await fetch(url);
    const blob = await res.blob();
    const mime = blob.type;
    return new File([blob], filename, { type: mime });
  };

  const uploadImageToProfileDetails = async (file: string) => {
    const url = URLS.BASE + '/agent/upload-profile-pic';
    const newFile = await urlToFile(file, 'profile-pic.jpg');
    const formData = new FormData();
    formData.append('file', newFile);
    try {
      setUploading(true);
      await toast.promise(
        axios
          .post(url, formData, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${Cookies.get('token')}`,
            },
          })
          .then((response) => {
            if (response.status === 200) {
              setImg(response.data.url);
            }
          }),
        {
          loading: 'Uploading...',
          success: 'Image uploaded successfully!',
          error: 'Image upload failed',
        }
      );
    } catch (err) {
      toast.error('Image upload failed');
      console.error('Upload error: ', err);
    } finally {
      setUploading(false); // Reset uploading state after completion
    }
  };

  const uploadImage = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    const fromData = new FormData();
    fromData.append('file', file as Blob);

    const url = URLS.BASE + URLS.uploadImg;

    await toast.promise(
      POST_REQUEST_FILE_UPLOAD(url, fromData).then((response) => {
        if ((response as unknown as { url: string }).url) {
          uploadImageToProfileDetails(
            (response as unknown as { url: string }).url as string
          );
          return 'Image uploaded successfully';
        } else {
          toast.error('Image upload failed');
          throw new Error('Image upload failed');
        }
      }),
      {
        loading: 'Uploading...',
        success: 'Image  uploaded successfully',
        error: 'Image upload failed',
      }
    );
  };

  return (
    <motion.div
      initial={{ x: -80, opacity: 0 }}
      viewport={{ once: true }}
      whileInView={{ x: 0, opacity: 1 }}
      transition={{ delay: 0.3 }}
      className='lg:w-[361px] flex flex-col gap-[8px]'>
      {/**First div - showing image and texts */}
      <div className='w-full h-[240px] bg-[#FFFFFF] rounded-[5px] flex flex-col gap-[8px] justify-center items-center'>
        <div>
          {' '}
          <Image
            src={img}
            alt='user image'
            className='w-[120px] h-[120px] bg-[#D9D9D9] rounded-full object-cover'
            width={120}
            height={120}
          />
          <input
            title='upload image'
            type='file'
            accept='image/*'
            onChange={uploadImage}
            id='upload'
            className='hidden'
          />
          <label
            htmlFor='upload'
            className='absolute cursor-pointer -mt-[30px] ml-[80px] w-[30px] h-[30px] border-[2px] border-gray-300 flex items-center justify-center bg-white rounded-full'>
            <FontAwesomeIcon icon={faPlus} size='sm' />
          </label>
        </div>
        <div className='flex flex-col justify-center items-center lg:h-[58px]'>
          <h2
            className="text-[#000000] font-bold text-[20px]">
            {userDetails.lastName} {userDetails.firstName}
          </h2>
          <p
            className="text-[#000000] font-normal text-base">
            {userDetails.email}
          </p>
        </div>
      </div>

      {/**Options - to be selected */}
      <div className='flex flex-col gap-[8px] w-full'>
        {['Change Password', 'Upgrade', 'Address', 'Contact'].map(
          (item: string, idx: number) => (
            <button
              type='button'
              onClick={() => {
                setSettings({ ...settings, selectedNav: item });
                console.log(settings.selectedNav, item);
              }}
              key={idx}
              className={`lg:h-[70px] hover:bg-[#a3d1a5] hover:font-bold transition duration-500 gap-[10px] py-[26px] px-[22px] rounded-[5px] cursor-pointer flex items-center ${
                item === settings.selectedNav
                  ? 'bg-[#8DDB90] font-bold'
                  : 'bg-white font-normal'
              }`}>
              <div className='flex gap-[34px]'>
                <svg
                  width='24'
                  height='24'
                  viewBox='0 0 24 24'
                  fill='none'
                  xmlns='http://www.w3.org/2000/svg'>
                  <path
                    d='M16 7C16 8.06087 15.5786 9.07828 14.8284 9.82843C14.0783 10.5786 13.0609 11 12 11C10.9391 11 9.92172 10.5786 9.17157 9.82843C8.42143 9.07828 8 8.06087 8 7C8 5.93913 8.42143 4.92172 9.17157 4.17157C9.92172 3.42143 10.9391 3 12 3C13.0609 3 14.0783 3.42143 14.8284 4.17157C15.5786 4.92172 16 5.93913 16 7V7ZM12 14C10.1435 14 8.36301 14.7375 7.05025 16.0503C5.7375 17.363 5 19.1435 5 21H19C19 19.1435 18.2625 17.363 16.9497 16.0503C15.637 14.7375 13.8565 14 12 14V14Z'
                    stroke='#1E1709'
                    strokeWidth='2'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                  />
                </svg>
                <span
                  className={`${product_sans.className} text-base text-black`}>
                  {item}
                </span>
              </div>
            </button>
          )
        )}
      </div>

      {/**Sign Out */}
      <button
        type='button'
        onClick={() => {
          logout();
        }}
        className={`w-full bg-transparent h-[70px] py-[26px] px-[22px] rounded-[5px] border-[#FF3D00] text-[#FF3D00] border-[1px]`}>
        Sign out
      </button>
    </motion.div>
  );
};

export default Sidebar;
