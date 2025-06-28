/** @format */

import React from 'react';
import { useRouter } from 'next/navigation';

const ConnectBuyersSection = () => {
  const router = useRouter();
  
  const buyerFeatures = [
    {
      title: 'High-Intent Leads',
      description: 'These buyers are serious and have already committed.'
    },
    {
      title: 'Faster Closures',
      description: 'Submit matching briefs directly and reduce back-and-forth.'
    },
    {
      title: 'Verified Opportunities',
      description: 'Every preference is screened and backed by negotiation and inspection support'
    },
    {
      title: 'Boost Your Profile',
      description: 'Agents who submit relevant briefs get priority visibility'
    }
  ];

  return (
    <div className='w-full bg-[#D9E5EE] py-16'>
      <div className='container mx-auto px-4'>
        <div className='text-center mb-12'>
          <h2 className='text-[35px] text-[#09391C] font-bold mb-4'>Connect with Ready Buyers</h2>
          <p className='text-[20px] text-black max-w-3xl mx-auto'>
            When a buyer submits a preference, they're actively looking for a property that matches 
            their exact needs. This is your chance to submit a matching brief and close deals faster.
          </p>
        </div>
        
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 justify-items-center gap-[10px] max-w-[1240px] mx-auto'>
          {buyerFeatures.map((feature, index) => (
            <div 
              key={index}
              className='w-[299px] h-[185px] p-[38px_23px] border border-[#1976D2] bg-white flex flex-col justify-center items-center text-center'
            >
              <h3 className='text-[#1976D2] font-semibold mb-3'>{feature.title}</h3>
              <p className='text-sm text-gray-700'>{feature.description}</p>
            </div>
          ))}
        </div>

        <div className='text-center mt-8'>
          <button 
            onClick={() => router.push('/agent_marketplace')}
            className='bg-[#8DDB90] text-white px-8 py-3 font-medium w-full md:w-auto'
          >
            Agent Marketplace
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConnectBuyersSection; 