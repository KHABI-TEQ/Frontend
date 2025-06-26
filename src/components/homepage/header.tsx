/** @format */

'use client';
import React, {
  Fragment,
  useEffect,
  useReducer,
  useRef,
  useState,
} from 'react';
import khabiteqIcon from '@/svgs/khabi-teq.svg';
import Button from '@/components/general-components/button';
import Image from 'next/image';
import { navData } from '@/data';
import Link from 'next/link';
import barIcon from '@/svgs/bars.svg';
import { usePageContext } from '@/context/page-context';
import { reducer } from '@/hooks/reducer';
// import { useRouter } from 'next/router';
import { usePathname, useRouter } from 'next/navigation';
import SideBar from '../general-components/sideBar';
import { FaCaretDown } from 'react-icons/fa';
import useClickOutside from '@/hooks/clickOutside';
import { motion } from 'framer-motion';
import { useUserContext } from '@/context/user-context';
import notificationBellIcon from '@/svgs/bell.svg';
import userIcon from '@/svgs/user.svg';
import UserNotifications from './user-notifications';
import UserProfile from './my-profile';

const Header = ({ isComingSoon }: { isComingSoon?: boolean }) => {
  const {
    isContactUsClicked,
    rentPage,
    isModalOpened,
    setIsModalOpened,
    viewImage,
    isSubmittedSuccessfully,
    setIsContactUsClicked,
  } = usePageContext();
  const [state, dispatch] = useReducer(reducer, navData);
  const pathName = usePathname();
  const [isMarketplaceModalOpened, setIsMarketplaceModalOpened] =
    useState<boolean>(false);
  const { user, logout } = useUserContext();
  const [isNotificationModalOpened, setIsNotificationModalOpened] =
    useState<boolean>(false);
  const [isUserProfileModalOpened, setIsUserProfileModal] =
    useState<boolean>(false);
  const [userDetails, setUserDetails] = useState<{
    firstName: string;
    lastName: string;
    phoneNumber: string;
    email: string;
    id: string;
  } | null>(null);
  const router = useRouter();

  useEffect(() => {
    // console.log(isModalOpened);
  }, [isModalOpened]);

  useEffect(() => {
    const user = sessionStorage.getItem('user');
    try {
      const parsedUser = user ? JSON.parse(user) : null;
      if (parsedUser && typeof parsedUser === 'object') {
        setUserDetails(parsedUser);
      }
    } catch (error) {
      console.error('Failed to parse user data:', error);
      setUserDetails(null);
    }
  }, []);

  useEffect(() => {
    // console.log(user);
  }, [user]);

  useEffect(() => {
    // console.log(pathName)
  }, [pathName]);
  return (
    <Fragment>
      <header
        className={`w-full flex justify-center ${
          isComingSoon && 'filter blur-sm'
        } items-center py-[20px] pl-[10px] bg-[#EEF1F1] pr-[20px] ${
          (isContactUsClicked ||
            rentPage.isSubmitForInspectionClicked ||
            isModalOpened ||
            viewImage ||
            isSubmittedSuccessfully ||
            rentPage.submitPreference) &&
          'filter brightness-[30%] transition-all duration-500 overflow-hidden'
        }`}>
        <nav className={`h-[50px] container flex justify-between items-center`}>
          <Image
            src={khabiteqIcon}
            width={1000}
            height={1000}
            className='md:w-[169px] md:h-[25px] w-[144px] h-[30px]'
            alt=''
          />
          <div className='lg:flex gap-[20px] hidden'>
            {state.map(
              (
                item: { name: string; url: string; isClicked: boolean },
                idx: number
              ) => {
                if (item.name === 'Marketplace') {
                  return (
                    <div
                      key={idx}
                      className='flex flex-col'
                      onMouseEnter={() => setIsMarketplaceModalOpened(true)}
                      // onMouseLeave={() =>
                      //   setIsMarketplaceModalOpened(false)
                      // }
                    >
                      <div className='flex items-center gap-1 cursor-pointer'>
                        <span
                          className={` transition-all duration-500 font-medium text-[18px] leading-[21px] hover:text-[#8DDB90] ${
                            item.url === pathName
                              ? 'text-[#8DDB90]'
                              : 'text-[#000000]'
                          }`}>
                          {item.name}
                        </span>
                        {/* <FaCaretDown
                          size={'sm'}
                          width={16}
                          height={16}
                          className='w-[16px] h-[16px]'
                        /> */}
                      </div>
                      {isMarketplaceModalOpened && (
                        <MarketplaceOptions
                          setModal={setIsMarketplaceModalOpened}
                        />
                      )}
                    </div>
                  );
                }
                return (
                  <Link
                    key={idx}
                    href={item.url}
                    onClick={() => {
                      // e.preventDefault();
                      dispatch({
                        type: item.name,
                        name: item.name,
                      });
                    }}
                    className={` transition-all duration-500 font-medium text-[18px] leading-[21px] hover:text-[#8DDB90] ${
                      item.url === pathName
                        ? 'text-[#8DDB90]'
                        : 'text-[#000000]'
                    }`}>
                    {item.name}
                  </Link>
                );
              }
            )}
          </div>
          {/**Buttons for laptop and bigger screens */}
          <div className='hidden lg:flex'>
            {user?._id ? (
              <div className='flex gap-[30px]'>
                <div className='flex flex-col '>
                  <button
                    type='button'
                    title='Notifications'
                    onClick={() => setIsNotificationModalOpened(true)}
                    className='w-[61px] h-[61px] rounded-full flex items-center justify-center bg-[#FAFAFA] cursor-pointer'>
                    <Image
                      src={notificationBellIcon}
                      width={1000}
                      height={1000}
                      alt=''
                      className='w-[24px] h-[24px]'
                    />
                  </button>
                  {/** <UserNotifications /> */}
                  {isNotificationModalOpened && (
                    <UserNotifications
                      closeNotificationModal={setIsNotificationModalOpened}
                    />
                  )}
                </div>
                <div className='flex flex-col'>
                  <button
                    type='button'
                    title='User'
                    onClick={() => setIsUserProfileModal(true)}
                    className='w-[61px] h-[61px] cursor-pointer rounded-full flex items-center justify-center bg-[#FAFAFA]'>
                    <Image
                      src={userIcon}
                      width={1000}
                      height={1000}
                      alt=''
                      className='w-[24px] h-[24px]'
                    />
                  </button>
                  {/**User Profile Modal */}
                  {isUserProfileModalOpened && (
                    <UserProfile
                      userDetails={user}
                      closeUserProfileModal={setIsUserProfileModal}
                    />
                  )}
                </div>
              </div>
            ) : (
              <div className='lg:w-[226px]'>
                <Button
                  value='Sign up'
                  green={true}
                  onClick={() => {
                    window.localStorage.setItem('signupFromHeader', 'true');
                    router.push('/auth');
                    //window.location.href = '/auth';
                  }}
                  className='text-base text-[#FFFFFF] leading-[25px] font-bold w-[155px] h-[50px]'
                />
                <Button
                  value='Login'
                  onClick={() => {
                    router.push('/auth/login');
                    //window.location.href = '/auth/login';
                  }}
                  className='text-base bg-transparent leading-[25px] font-bold w-[71px] h-[50px] text-black'
                />
              </div>
            )}
          </div>

          <div className='flex items-center gap-[20px] lg:hidden'>
            {user?._id ? (
              <div className='flex flex-col gap-[10px]'>
                <button
                  type='button'
                  title='User'
                  onClick={() => setIsUserProfileModal(true)}
                  className='w-[45px] h-[45px] border-[1px] border-[#A8ADB7] cursor-pointer rounded-full flex items-center justify-center bg-[#FAFAFA]'>
                  <Image
                    src={userIcon}
                    width={1000}
                    height={1000}
                    alt=''
                    className='w-[20px] h-[20px]'
                  />
                </button>
                {/**User Profile Modal */}
                {isUserProfileModalOpened && (
                  <UserProfile
                    userDetails={user}
                    closeUserProfileModal={setIsUserProfileModal}
                  />
                )}
              </div>
            ) : null}
            <Image
              src={barIcon}
              onClick={() => {
                setIsModalOpened(!isModalOpened);
              }}
              width={35}
              height={22}
              alt=''
              className='w-[35px] h-[22px] lg:hidden'
            />
          </div>
        </nav>
      </header>
      <SideBar
        isModalOpened={isModalOpened}
        setIsModalOpened={setIsModalOpened}
      />
    </Fragment>
  );
};

const marketPlaceData: { name: string; url: string; isClicked: boolean }[] = [
  {
    name: 'Buy',
    url: '/market-place',
    isClicked: false,
  },
  {
    name: 'Sell',
    url: '/my_listing',
    isClicked: false,
  },
  {
    name: 'Rent',
    url: '/market-place',
    isClicked: false,
  },
  {
    name: 'Joint Venture',
    url: '/market-place',
    isClicked: false,
  },
];

const MarketplaceOptions = ({
  setModal,
}: {
  setModal: (type: boolean) => void;
}) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const { setSelectedType } = usePageContext();

  useClickOutside(ref, () => setModal(false));
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      viewport={{ once: true }}
      ref={ref}
      className='w-[231px] mt-[30px] p-[19px] flex flex-col gap-[25px] bg-[#FFFFFF] shadow-lg absolute z-[9999]'
      onMouseLeave={() => setModal(false)}>
      {marketPlaceData.map(
        (
          item: { name: string; url: string; isClicked: boolean },
          idx: number
        ) => (
          <Link
            onClick={() => {
              if (
                item.name === 'Buy a Property' ||
                item.name === 'Sell a Property'
              ) {
                setSelectedType('Buy a property');
              } else if (item.name === 'Rent a Property') {
                setSelectedType('Rent/Lease a property');
              } else if (item.name === 'Property Joint Venture') {
                setSelectedType('Find property for joint venture');
              }
              setModal(false);
            }}
            className='text-base font-medium text-[#000000] hover:text-[#8DDB90]'
            href={item.url}
            key={idx}>
            {item.name}
          </Link>
        )
      )}
    </motion.div>
  );
};

export default Header;
