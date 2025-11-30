/** @format */

'use client';
import { faTrashCan } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { StaticImport } from 'next/dist/shared/lib/get-img-props';
import { FC } from 'react';
import { motion } from 'framer-motion';

type ImageContainerProps = {
  image: string;
  alt: string;
  heading: string;
  removeImage: () => void;
  id: string;
  setViewImage?: (type: boolean) => void;
  setImageData?: (type: StaticImport[] | string[]) => void;
};

const ImageContainer: FC<ImageContainerProps> = ({
  image,
  removeImage,
  id,
  setViewImage,
  setImageData,
}) => {
  return (
    <div
      title={image}
      id={id}
      className='w-[64px] h-[84px] flex flex-col shrink-0 gap-[4px] justify-end items-end'>
      <FontAwesomeIcon
        icon={faTrashCan}
        size='sm'
        color='#FF2539'
        className='cursor-pointer'
        title='delete'
        onClick={removeImage}
      />
      <motion.img
        onClick={() => {
          setViewImage?.(true);
          setImageData?.([image]);
        }}
        src={image}
        alt=''
        width={100}
        height={70}
        className='w-full h-[62px] filter brightness-75 hover:brightness-100 transition duration-500 border-[1px] rounded-[4px] bg-gray-100 object-cover'
      />
    </div>
  );
};

export default ImageContainer;
