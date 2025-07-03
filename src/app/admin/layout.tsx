/** @format */
'use client';
import { ReactNode, use, useEffect } from 'react';
import AdminNavbar from '@/components/admincomponents/navbar';
import { usePathname, useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { EditBriefProvider } from '@/context/admin-context/brief-management/edit-brief';
import { CreateBriefProvider } from '@/context/admin-context/brief-management/create-brief';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faMagnifyingGlass,
  faQuestion,
} from '@fortawesome/free-solid-svg-icons';

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isLoginPage = pathname === '/admin/auth/login';

  useEffect(() => {
    const adminToken = Cookies.get('adminToken');
    if (!adminToken && !isLoginPage) {
      router.push('/admin/auth/login');
    }
  }, [isLoginPage, router]);
 
  return (
    <CreateBriefProvider>
      <EditBriefProvider>
        <main className='w-full flex'>
          {!isLoginPage && <AdminNavbar />}
          <section className='md:flex-1 flex flex-col gap-[20px] w-full p-4 lg:w-1/2'>
            {/* Search & Help Button */}
            <div className='flex justify-between items-center'>
              <div className='md:w-3/5 mt-2 h-12 flex relative items-center'>
                <FontAwesomeIcon
                  icon={faMagnifyingGlass}
                  size='lg'
                  width={24}
                  height={24}
                  className='text-[#A7A9AD] absolute left-3 w-[24px] h-[24px]'
                />
                <input
                  type='text'
                  placeholder='Search for Agent, Briefs'
                  className='w-full h-full pl-12 border border-gray-300 bg-transparent rounded-md'
                />
              </div>
              <button
                type='button'
                className='bg-black w-[30px] h-[30px] flex items-center justify-center rounded-full shadow-md'>
                {''}
                <FontAwesomeIcon
                  icon={faQuestion}
                  color='#fff'
                  size='sm'
                  className='bg-[#000] rounded-full shadow-md'
                />
              </button>
            </div>
            {children}
          </section>
        </main>
      </EditBriefProvider>
    </CreateBriefProvider>
  );
}
