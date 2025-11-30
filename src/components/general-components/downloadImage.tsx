/** @format */

import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const DownloadImage = ({ downloadImage }: { downloadImage: () => void }) => {
  return (
    <motion.button
      onClick={() => {
        downloadImage();
        toast.success('Image downloaded successfully!');
      }}
      type='button'
      className='w-fit px-2 py-1 rounded-[5px] bg-gray-100 hover:bg-gray-300 transition duration-500 border-[2px] border-gray-200 shadow-md mt-[10px]'>
      Download
    </motion.button>
  );
};

export default DownloadImage;
