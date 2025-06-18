/** @format */
'use client';
import MyListing from '@/components/mylisting';
import React, { useEffect, useState } from 'react';
import { useUserContext } from '@/context/user-context';
import { URLS } from '@/utils/URLS';
import Cookies from 'js-cookie';
import { GET_REQUEST } from '@/utils/requests';
import { useRouter } from 'next/navigation';

const page = () => {
  const { user } = useUserContext();
  const [briefs, setBriefs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Only run redirect logic after user context is loaded (not undefined/null)
  useEffect(() => {
    console.log('Current user:', user);
    console.log('Auth token:', Cookies.get('token'));
    
    if (!user) {
      console.log('No user found, redirecting to landlord registration');
      // Set localStorage flag to indicate coming from landlord link
      localStorage.setItem('signupFromHeader', 'true');
      router.push('/auth');
    } else if (user.userType !== 'Landowners') {
      console.log('User is not a landlord, redirecting to /agent');
      router.push('/agent');
    } else {
      console.log('User is a landlord, fetching briefs');
      document.title = 'Landlord';

      const fetchBriefs = async () => {
        setLoading(true);
        try {
          const response = await GET_REQUEST(
            URLS.BASE + URLS.getMyProperties,
            Cookies.get('token')
          );
          console.log('Fetched briefs:', response);
          setBriefs(response || []);
        } catch (err) {
          console.error('Error fetching briefs:', err);
          setBriefs([]);
        } finally {
          setLoading(false);
        }
      };
      fetchBriefs();
    }
  }, [user]);

  // Only render if user exists
  if (!user) return null;

  return <MyListing briefs={briefs} loading={loading} />;
};

export default page;
