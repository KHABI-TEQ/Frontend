'use client';

import React, { useState } from 'react';
import { FormikProps } from 'formik';
import Image from 'next/image';

interface Step3Props {
  formik: FormikProps<any>;
  areInputsDisabled: boolean;
}

const Step3UploadPictures: React.FC<Step3Props> = ({
  formik,
  areInputsDisabled,
}) => {
  const [dragActive, setDragActive] = useState(false);

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    
    const newFiles = Array.from(files).filter(file => 
      file.type.startsWith('image/')
    );
    
    const currentFiles = formik.values.propertyImages || [];
    const updatedFiles = [...currentFiles, ...newFiles];
    
    // Limit to 10 images
    if (updatedFiles.length > 10) {
      alert('Maximum 10 images allowed');
      return;
    }
    
    formik.setFieldValue('propertyImages', updatedFiles);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    handleFiles(e.dataTransfer.files);
  };

  const removeImage = (index: number) => {
    const currentFiles = formik.values.propertyImages || [];
    const updatedFiles = currentFiles.filter((_: any, i: number) => i !== index);
    formik.setFieldValue('propertyImages', updatedFiles);
  };

  const propertyImages = formik.values.propertyImages || [];

  return (
    <div className='min-h-[629px] py-[10px] lg:px-[80px] border-[#8D909680] w-full'>
      <h2 className='text-[#0B0D0C] lg:text-[24px] lg:leading-[40.4px] font-bold font-display text-center text-[18px] leading-[40.4px] mt-7'>
        Upload Property Pictures
      </h2>
      <div className='w-full min-h-[629px] flex flex-col gap-[30px]'>
        
        {/* Upload Instructions */}
        <div className='text-center'>
          <p className='text-[16px] text-[#8D9090] mb-2'>
            Upload clear, high-quality images of your property
          </p>
          <p className='text-[14px] text-[#8D9090]'>
            Maximum 10 images • JPG, PNG formats only • Max 5MB per image
          </p>
        </div>

        {/* Upload Area */}
        <div
          className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors
            ${dragActive 
              ? 'border-[#8DDB90] bg-[#8DDB90]/10' 
              : 'border-[#8D909680] hover:border-[#8DDB90]'
            }
            ${areInputsDisabled ? 'opacity-50 pointer-events-none' : 'cursor-pointer'}
          `}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => !areInputsDisabled && document.getElementById('file-upload')?.click()}
        >
          <input
            id='file-upload'
            type='file'
            multiple
            accept='image/*'
            className='hidden'
            onChange={(e) => handleFiles(e.target.files)}
            disabled={areInputsDisabled}
          />
          
          <div className='flex flex-col items-center justify-center gap-4'>
            <div className='w-16 h-16 bg-[#8DDB90]/20 rounded-full flex items-center justify-center'>
              <svg 
                className='w-8 h-8 text-[#8DDB90]' 
                fill='none' 
                stroke='currentColor' 
                viewBox='0 0 24 24'
              >
                <path 
                  strokeLinecap='round' 
                  strokeLinejoin='round' 
                  strokeWidth={2} 
                  d='M12 6v6m0 0v6m0-6h6m-6 0H6' 
                />
              </svg>
            </div>
            <div>
              <p className='text-[18px] font-medium text-[#1E1E1E] mb-1'>
                Click to upload or drag and drop
              </p>
              <p className='text-[14px] text-[#8D9090]'>
                PNG, JPG up to 5MB each
              </p>
            </div>
          </div>
        </div>

        {/* Image Preview Grid */}
        {propertyImages.length > 0 && (
          <div className='min-h-[200px] gap-[15px] flex flex-col w-full'>
            <h3 className='text-[18px] font-medium text-[#1E1E1E]'>
              Uploaded Images ({propertyImages.length}/10)
            </h3>
            <div className='grid grid-cols-2 lg:grid-cols-4 gap-4'>
              {propertyImages.map((file: File, index: number) => (
                <div key={index} className='relative group'>
                  <div className='aspect-square relative overflow-hidden rounded-lg border border-[#8D909680]'>
                    <Image
                      src={URL.createObjectURL(file)}
                      alt={`Property image ${index + 1}`}
                      fill
                      className='object-cover'
                    />
                    {!areInputsDisabled && (
                      <button
                        type='button'
                        onClick={() => removeImage(index)}
                        className='absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600'
                        title='Remove image'
                      >
                        <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
                        </svg>
                      </button>
                    )}
                  </div>
                  <p className='text-xs text-[#8D9090] mt-1 truncate'>
                    {file.name}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upload Tips */}
        <div className='bg-[#F8F9FA] rounded-lg p-6'>
          <h4 className='text-[16px] font-medium text-[#1E1E1E] mb-3'>
            Tips for better property photos:
          </h4>
          <ul className='text-[14px] text-[#8D9090] space-y-2'>
            <li>• Take photos during daytime with good natural lighting</li>
            <li>• Include exterior shots, living areas, bedrooms, kitchen, and bathrooms</li>
            <li>• Clean and declutter rooms before taking photos</li>
            <li>• Use landscape orientation for better viewing</li>
            <li>• Show unique features and selling points of the property</li>
          </ul>
        </div>

        {formik.touched.propertyImages && formik.errors.propertyImages && (
          <span className='text-red-600 text-sm'>
            {String(formik.errors.propertyImages)}
          </span>
        )}
      </div>
    </div>
  );
};

export default Step3UploadPictures;
