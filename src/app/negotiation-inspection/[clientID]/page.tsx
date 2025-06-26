'use client';
import Index from '@/components/negotiation-inspection/index';
import { useParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';

const Page = () => {
  const [ID, setID] = useState<string>('');
  const params = useParams();

  useEffect(() => {
    const clientID = params?.clientID as string;
    if (typeof clientID === 'string') {
        setID(clientID);
    }
  }, [params]);
  
  return <Index potentialClientID={ID} />;
};

export default Page;