/** @format */
'use client';
import { navData } from '@/data';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useUserContext } from '@/context/user-context';

const SideBar = ({
  isModalOpened,
  setIsModalOpened,
}: {
  isModalOpened: boolean;
  setIsModalOpened: (type: boolean) => void;
}) => {
  const pathName = usePathname();
  const router = useRouter();
  const { user, logout } = useUserContext();

  const handleItemClick = (path: string) => {
    setIsModalOpened(false);
    router.push(path);
  };

  return (
    <section
      className={`fixed top-0 right-0 z-50 p-[20px] shadow-md h-full bg-[#EEF1F1] transition-all duration-1000 ${
        isModalOpened ? 'w-[322px] visible' : 'w-0 invisible'
      } lg:hidden flex flex-col justify-between`}>
      {isModalOpened && (
        <nav className='w-[322px] h-[100%] pt-[10px] flex flex-col justify-between'>
          <div>
            <button
              className='absolute right-5'
              onClick={() => {
                setIsModalOpened(false);
              }}
              type='button'>
              {''}
              <svg
                width='37'
                height='37'
                viewBox='0 0 37 37'
                fill='none'
                xmlns='http://www.w3.org/2000/svg'>
                <g clipPath='url(#clip0_800_8600)'>
                  <path
                    d='M29.2923 9.88225L27.1186 7.7085L18.5007 16.3264L9.88273 7.7085L7.70898 9.88225L16.3269 18.5002L7.70898 27.1181L9.88273 29.2918L18.5007 20.6739L27.1186 29.2918L29.2923 27.1181L20.6744 18.5002L29.2923 9.88225Z'
                    fill='#504F54'
                  />
                </g>
                <defs>
                  <clipPath id='clip0_800_8600'>
                    <rect width='37' height='37' fill='white' />
                  </clipPath>
                </defs>
              </svg>
            </button>
            <div className='w-full mt-10 flex flex-col gap-[30px]'>
              {navData.map((item, idx: number) => (
                <Link
                  onClick={() => {
                    setIsModalOpened(false);
                  }}
                  className={`flex items-center gap-2 w-fit pb-1 transition-all hover:border-b-2 hover:border-[#09391C] hover:pb-1 duration-500 ${
                    item.url === pathName && 'border-b-2 border-[#09391C] pb-1'
                  }`}
                  href={item.url}
                  key={idx}>
                  <svg
                    width='10'
                    height='10'
                    viewBox='0 0 10 10'
                    fill='none'
                    xmlns='http://www.w3.org/2000/svg'>
                    <circle cx='5' cy='5' r='5' fill='#09391C' />
                  </svg>
                  <span className='text-[#09391C] text-[18px] leading-[21.09px] font-medium'>
                    {item.name}
                  </span>
                </Link>
              ))}
            </div>
          </div>
          {user && (
            <div className='flex flex-col gap-[5px]'>
              <button
                className='w-full text-left px-4 py-2 bg-[#FAFAFA] rounded-md'
                onClick={() => handleItemClick('/agent/briefs')}>
                Create Brief
              </button>
              <button
                className='w-full text-left px-4 py-2 bg-[#FAFAFA] rounded-md'
                onClick={() => handleItemClick('/agent/briefs')}>
                Dashboard
              </button>
              <button
                className='w-full text-left px-4 py-2 bg-[#FAFAFA] rounded-md text-[#FF3D00]'
                onClick={() => logout(() => setIsModalOpened(false))}>
                Log out
              </button>
            </div>
          )}
        </nav>
      )}
    </section>
  );
};

export default SideBar;
