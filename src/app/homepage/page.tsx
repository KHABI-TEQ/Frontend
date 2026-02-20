/** @format */

'use client';
import React, { Fragment, Suspense, useEffect } from 'react';
//import HeroSection from '@/components/hero';
import Loading from '@/components/loading';
//import Section1 from '@/components/section1';
import Section2 from '@/components/home_section2';
import SeeWhatOthers from '@/components/section2';
import Section3 from '@/components/section3';
import FAQs from '@/components/FAQs';
import Feedback from '@/components/feedback';
import HelpButton from '@/components/home_helpbutton';
import { useLoading } from '@/hooks/useLoading';
//import homeImage from '@/assets/assets.png';
import HeroSection from '@/components/homepage_hero';
import Section1 from '@/components/home_section1';
import NewSection from '@/components/new_section';
import EmailVerification from '@/components/EmailVerification';
import { useRouter, useSearchParams } from 'next/navigation';
import { URLS } from '@/utils/URLS';
import { GET_REQUEST } from '@/utils/requests';
import Cookies from 'js-cookie';
import { useUserContext, normalizeUser } from '@/context/user-context';

const Homepage = () => {
  //Simulating the loading page
  const isLoading = useLoading();
  const searchParams = useSearchParams();
  const router = useRouter();

  const { setUser } = useUserContext();

  useEffect(() => {
    if (searchParams.get('access_token')) {
      const url = URLS.BASE + URLS.agent + URLS.verifyEmail + `?access_token=${searchParams.get('access_token')}`;

      (async () => {
        await GET_REQUEST(url).then((response) => {
          // console.log('response from email verification', response);
          if ((response as unknown as { id: string; token: string }).id) {
            Cookies.set('token', (response as unknown as { token: string }).token);

            const user = response as unknown as {
              id: string;
              email: string;
              password: string;
              lastName: string;
              firstName: string;
              phoneNumber: string;
            };

            setUser(normalizeUser(user));
            router.push('/agent/onboard');
          }
        });
      })();
    }
  }, [router, searchParams, setUser]);

  if (isLoading) return <Loading />;

  return (
    <Fragment>
      <section className={`w-full`}>
        <main className='w-full bg-[#EEF1F1]'>
          <HeroSection />
          <Section1 />
          <Section2 />
          <NewSection />
          <SeeWhatOthers />
          <Section3
            isHomepage={true}
            isAgentPage={false}
            heading='Highlight of Our Real Estate Expertise'
            headingColor='#09391C'
          />
          <FAQs isHomePage={true} />
          <Feedback />
          <HelpButton />
        </main>
      </section>
      <Suspense fallback={<Loading />}>
        <EmailVerification />
      </Suspense>
      {/* {viewImage && <ViewImage />} */}
    </Fragment>
  );
};

const HomepageWrapper = () => (
  <Suspense fallback={<Loading />}>
    <Homepage />
  </Suspense>
);

export default HomepageWrapper;
