/**
 * eslint-disable @next/next/no-img-element
 *
 * @format
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react';
import { FaTimes } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { POST_REQUEST } from '@/utils/requests';
import { URLS } from '@/utils/URLS';
import Loading from '@/components/loading-component/loading';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload } from '@fortawesome/free-solid-svg-icons';
import { downloadImage } from '@/utils/downloadImage';
import EditBrief from './editBrief';
import { useEditBriefContext } from '@/context/admin-context/brief-management/edit-brief';
import Cookies from 'js-cookie';

export default function BriefDetailsBar({
  user,
  onClose,
  hideButtons = false, // Optional prop to hide buttons
  hideDetails = false, // New prop to hide details
}: {
  user: any;
  onClose: () => void;
  hideButtons?: boolean;
  hideDetails?: boolean;
}) {
  const [selectedImage, setSelectedImage] = useState<{
    image: string;
    name: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const closeModal = () => {
    setSelectedImage(null);
    setIsLoading(false);
  };

  useEffect(() => {
    // console.log('User details' + user);
  }, [user]);

  const [isEditBriefClicked, setIsEditBriefClicked] = useState<boolean>(false);
  const { setEditBrief, editBrief } = useEditBriefContext();

  const onSubmit = async (
    status?: boolean,
    propertyId?: string,
    briefType?: string
  ) => {
    try {
      const isBrief = !!user?.legalName; // Determine if it's a brief based on legalName
      const url = isBrief
        ? URLS.BASE + URLS.approveBrief // Use approveBrief URL for briefs
        : URLS.BASE + URLS.agentApproval; // Use agentApproval URL for agents

      const payload = isBrief
        ? {
            propertyId: propertyId || user?.propertyId || '',
            propertyType: briefType || user?.briefType || '',
            status,
          }
        : {
            agentId: user?.id || '',
            approved: true,
          };

      const adminToken = Cookies.get('adminToken');

      await toast.promise(
        POST_REQUEST(url, payload, adminToken).then((response) => {
          if ((response as any).success) {
            toast.success(
              isBrief
                ? status
                  ? 'Brief approved successfully'
                  : 'Brief rejected successfully'
                : 'Agent approved successfully'
            );
            window.location.href = '/admin/brief_management';
            return isBrief
              ? status
                ? 'Brief approved successfully'
                : 'Brief rejected successfully'
              : 'Agent approved successfully';
          } else {
            const errorMessage = (response as any).error || 'Approval failed';
            toast.error(errorMessage);
            throw new Error(errorMessage);
          }
        }),
        {
          loading: isBrief
            ? status
              ? 'Approving brief...'
              : 'Rejecting brief...'
            : 'Submitting approval...',
        }
      );
    } catch (error) {
      toast.error('An error occurred, please try again');
    }
  };

  const handleImageClick = (docImg: string, docName: string) => {
    setIsLoading(true);
    setSelectedImage({
      image: docImg,
      name: docName,
    });
  };

  return (
    <React.Fragment>
      <div className='fixed top-0 right-0 h-full w-[35%] bg-white shadow-lg z-50'>
        {isLoading && <Loading />}
        {selectedImage && (
          <div className='fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center'>
            <div className='relative bg-white p-4 rounded-lg w-[60%] h-[50%] overflow-auto my-auto hide-scrollbar'>
              <button
                type='button'
                onClick={closeModal}
                className='absolute top-2 right-2 text-black hover:bg-gray-300 p-2 rounded-full'>
                <FaTimes size={20} />
                {''}
              </button>
              <img
                src={selectedImage.image}
                alt='Document'
                className='max-w-[80%] h-[90%] max-h-screen mx-auto my-auto'
                onLoad={() => setIsLoading(false)}
                onError={() => {
                  setIsLoading(false);
                  toast.error('Failed to load image');
                }}
              />
              <div className='flex items-center mb-[20px]'>
                <button
                  title='Download'
                  type='button'
                  onClick={() => {
                    downloadImage(selectedImage.image, selectedImage.name);
                  }}
                  className='flex items-center gap-2 rounded-[5px] bg-gray-100 hover:bg-gray-200 px-2 py-[2px] border-[1px] border-gray-200'>
                  <span>Download</span>
                  <FontAwesomeIcon icon={faDownload} size='sm' />
                </button>
              </div>
            </div>
          </div>
        )}

        <div className='h-full flex flex-col'>
          <button
            type='button'
            onClick={onClose}
            className='absolute top-4 left-4 text-black hover:bg-gray-300 p-2 rounded-full'>
            <FaTimes size={25} />
            {''}
          </button>

          <div className='h-full overflow-y-auto py-14 px-10'>
            <div className='bg-[#FAFAFA] p-6 flex flex-col items-center justify-center gap-4'>
              <div className='w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center text-xl font-bold text-white'>
                {user?.profile_picture ? (
                  <img
                    src={user.profile_picture}
                    alt='Profile'
                    className='w-full h-full rounded-full object-cover'
                  />
                ) : user?.legalName ? (
                  user.legalName
                    .split(' ')
                    .map((name: string) => name[0])
                    .join('')
                    .toUpperCase()
                ) : user?.firstName && user?.lastName ? (
                  `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
                ) : user?.fullName ? (
                  user.fullName
                    .split(' ')
                    .map((name: string) => name[0])
                    .join('')
                    .toUpperCase()
                ) : (
                  '-'
                )}
              </div>

              <div className='text-center'>
                <p className='text-2xl md:text-xl sm:text-lg font-semibold'>
                  {user?.legalName
                    ? user.legalName
                    : user?.firstName && user?.lastName
                    ? `${user.firstName} ${user.lastName}`
                    : user?.fullName && !(user?.firstName && user?.lastName)
                    ? user.fullName
                    : '-'}
                </p>
                {!hideDetails && (
                  <>
                    <p
                      className={`text-lg md:text-base sm:text-sm font-semibold ${
                        user?.agentType === 'individual'
                          ? 'text-red-500'
                          : 'text-green-500'
                      }`}>
                      {user?.agentType || '--'}
                    </p>
                    <p className='text-sm md:text-xs sm:text-[10px] text-gray-600'>
                      {user?.email || 'N/A'}
                    </p>
                  </>
                )}
              </div>
            </div>

            <div className='h-4'></div>

            <div className='bg-[#FAFAFA] p-5'>
              <div className='space-y-4'>
                {user?.createdAt && (
                  <div className='flex justify-between text-base md:text-sm sm:text-xs'>
                    <span className='font-normal'>Date</span>
                    <span>{new Date(user.createdAt).toLocaleDateString()}</span>
                  </div>
                )}
                {user?.email && user.email !== '--' && (
                  <div className='flex justify-between text-base md:text-sm sm:text-xs'>
                    <span className='font-normal'>Email</span>
                    <span>{user.email}</span>
                  </div>
                )}
                {user?.address?.street &&
                  user?.address?.localGovtArea &&
                  user?.address?.state && (
                    <div className='flex justify-between text-base md:text-sm sm:text-xs'>
                      <span className='font-normal'>Address</span>
                      <span>{`${user.address.street}, ${user.address.localGovtArea}, ${user.address.state}`}</span>
                    </div>
                  )}
                {user?.regionOfOperation?.length > 0 && (
                  <div className='flex justify-between text-base md:text-sm sm:text-xs'>
                    <span className='font-normal'>Areas of Operation</span>
                    <span>{user.regionOfOperation.join(', ')}</span>
                  </div>
                )}
                {user?.referral && user.referral !== '--' && (
                  <div className='flex justify-between text-base md:text-sm sm:text-xs'>
                    <span className='font-normal'>Referral</span>
                    <span>{user.referral}</span>
                  </div>
                )}
                {user?.agentType && user.agentType !== '--' && (
                  <div className='flex justify-between text-base md:text-sm sm:text-xs'>
                    <span className='font-normal'>Type of Agent</span>
                    <span>{user.agentType}</span>
                  </div>
                )}
                {user?.agentType?.toLowerCase() === 'incorporated' && (
                  <>
                    {user?.companyName && user.companyName !== '--' && (
                      <div className='flex justify-between text-base md:text-sm sm:text-xs'>
                        <span className='font-normal'>Company Name</span>
                        <span>{user.companyName}</span>
                      </div>
                    )}
                    {user?.registrationNumber &&
                      user.registrationNumber !== '--' && (
                        <div className='flex justify-between text-base md:text-sm sm:text-xs'>
                          <span className='font-normal'>
                            Registration Number
                          </span>
                          <span>{user.registrationNumber}</span>
                        </div>
                      )}
                  </>
                )}
                {user?.meansOfId?.length > 0 && (
                  <div className='flex justify-between text-base md:text-sm sm:text-xs'>
                    <span className='font-normal'>Documents</span>
                    <span className='space-x-2'>
                      {user.meansOfId.map((doc: any, index: number) => (
                        <a
                          key={index}
                          href='#'
                          onClick={(e) => {
                            e.preventDefault();
                            handleImageClick(
                              doc?.docImg?.[0] || '',
                              doc?.name || ''
                            );
                          }}
                          className='text-blue-500 underline'>
                          {doc?.name || 'N/A'}
                        </a>
                      ))}
                    </span>
                  </div>
                )}
                {user?.location && user.location !== '--' && (
                  <div className='flex justify-between text-base md:text-sm sm:text-xs'>
                    <span className='font-normal'>Location</span>
                    <span>{user.location}</span>
                  </div>
                )}
                {user?.propertyType && user.propertyType !== '--' && (
                  <div className='flex justify-between text-base md:text-sm sm:text-xs'>
                    <span className='font-normal'>Property Type</span>
                    <span>{user.propertyType}</span>
                  </div>
                )}
                {user?.propertyCondition && user.propertyCondition !== '--' && (
                  <div className='flex justify-between text-base md:text-sm sm:text-xs'>
                    <span className='font-normal'>Property Condition</span>
                    <span>{user.propertyCondition}</span>
                  </div>
                )}
                {user?.price && user.price !== '--' && (
                  <div className='flex justify-between text-base md:text-sm sm:text-xs'>
                    <span className='font-normal'>Price</span>
                    <span>{user.price}</span>
                  </div>
                )}
                {user?.usageOptions?.trim() && user.usageOptions !== '--' && (
                  <div className='flex justify-between text-base md:text-sm sm:text-xs'>
                    <span className='font-normal'>Usage Options</span>
                    <span>{user.usageOptions}</span>
                  </div>
                )}
                {user?.noOfBedrooms && user.noOfBedrooms !== '--' && (
                  <div className='flex justify-between text-base md:text-sm sm:text-xs'>
                    <span className='font-normal'>Number of Bedrooms</span>
                    <span>{user.noOfBedrooms}</span>
                  </div>
                )}
                {user?.features && user.features !== '--' && (
                  <div className='flex justify-between text-base md:text-sm sm:text-xs'>
                    <span className='font-normal'>Desired Features</span>
                    <span>{user.features}</span>
                  </div>
                )}
                {user?.tenantCriteria && user.tenantCriteria !== '--' && (
                  <div className='flex justify-between text-base md:text-sm sm:text-xs'>
                    <span className='font-normal'>Tenant Criteria</span>
                    <span>{user.tenantCriteria}</span>
                  </div>
                )}
                {user?.documents && user.documents !== '--' && (
                  <div className='flex justify-between text-base md:text-sm sm:text-xs'>
                    <span className='font-normal'>Documents</span>
                    <span>{user.documents}</span>
                  </div>
                )}
                {user?.pictures?.length > 0 && (
                  <div className='flex justify-between text-base md:text-sm sm:text-xs'>
                    <span className='font-normal'>Pictures</span>
                    <span>
                      {user.pictures.map((pic: string, index: number) => (
                        <a
                          key={index}
                          href='#'
                          onClick={(e) => {
                            e.preventDefault();
                            handleImageClick(pic, `Picture ${index + 1}`);
                          }}
                          className='text-blue-500 underline'>
                          Picture {index + 1}
                        </a>
                      ))}
                    </span>
                  </div>
                )}
              </div>
              <hr className='my-4' />

              {!hideDetails && user?.legalName && (
                <div className='flex justify-between text-base md:text-sm sm:text-xs'>
                  <span className='font-normal'>Awaiting Confirmation</span>
                  <span
                    className={`flex items-center gap-2 font-semibold ${
                      user?.isApproved ? 'text-green-500' : 'text-red-500'
                    }`}>
                    {user?.isApproved ? 'Approved' : 'Pending'}
                    <span
                      className={`w-2 h-2 rounded-full ${
                        user?.isApproved ? 'bg-green-500' : 'bg-red-500'
                      }`}></span>
                  </span>
                </div>
              )}

              <div className='mt-14'>
                {!hideButtons &&
                  !hideDetails &&
                  (user?.legalName ? (
                    <>
                      <button
                        onClick={() =>
                          onSubmit(true, user?.propertyId, user?.briefType)
                        }
                        disabled={user?.isApproved}
                        className={`w-full py-4 text-base md:text-sm sm:text-xs transition duration-300 mb-2 ${
                          user?.isApproved
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-[#8DDB90] text-white hover:bg-green-900'
                        }`}>
                        Approve Brief
                      </button>
                      <div className='flex gap-4'>
                        <button
                          onClick={() => onSubmit(false)}
                          disabled={user?.isRejected}
                          className={`w-full py-4 text-base md:text-sm sm:text-xs transition duration-300 border-2 ${
                            user?.isRejected
                              ? 'border-red-300 text-red-300 cursor-not-allowed'
                              : 'border-red-500 text-red-500 hover:bg-red-500 hover:text-white'
                          }`}>
                          Reject Brief
                        </button>
                        <button
                          type='button'
                          onClick={() => {
                            setIsEditBriefClicked(true);
                            setEditBrief({
                              ...editBrief,
                              ...user,
                              price: user?.price || user?.amount,
                              amount: user?.price || user?.amount,
                              documents: user?.documents || user?.document,
                              fileUrl: user?.pictures?.map((pic: string) => ({
                                id: pic,
                                image: pic,
                              })),
                            });
                          }}
                          disabled={user?.isApproved}
                          className={`w-full py-4 text-base md:text-sm sm:text-xs transition duration-300 border-2 border-[#1976D2] text-[#1976D2] hover:bg-blue-900 hover:text-white`}>
                          Edit Brief
                        </button>
                      </div>
                    </>
                  ) : (
                    <button
                      onClick={
                        !user?.accountApproved ? () => onSubmit() : undefined
                      }
                      disabled={false}
                      className={`w-full py-4 text-base md:text-sm sm:text-xs bg-white border ${
                        user?.accountApproved
                          ? 'border-gray-500 text-gray-500'
                          : 'border-green-500 text-green-500'
                      } rounded-md ${
                        user?.accountApproved
                          ? 'cursor-not-allowed'
                          : 'hover:bg-green-500 hover:text-white'
                      } transition duration-300`}>
                      {user?.accountApproved
                        ? 'Agent Approved'
                        : 'Approve Agent'}
                    </button>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      {isEditBriefClicked && <EditBrief closeModal={setIsEditBriefClicked} />}
    </React.Fragment>
  );
}
