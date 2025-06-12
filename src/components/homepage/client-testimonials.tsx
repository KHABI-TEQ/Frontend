/** @format */

import React from 'react';
import { motion } from 'framer-motion';

const ClientTestimonials = () => {
  const testimonials = [
    {
      name: 'Michael .A',
      text: 'Khabi-teq made finding my dream home so easy! The process was seamless, and the team was incredibly supportive every step of the way'
    },
    {
      name: 'Tunde Ajayi',
      text: 'Khabi-Teq made finding my dream home so easy! The process was seamless, and the team was incredibly supportive every step of the way'
    }
  ];

  return (
    <div className='w-full bg-[#F5F7F9] py-16'>
      <div className='container mx-auto px-4'>
        <div className='text-center mb-12'>
          <h2 className='text-[35px] text-[#09391C] font-bold mb-4'>What our clients are saying</h2>
        </div>
        
        <div className='flex flex-col md:flex-row justify-center gap-8 max-w-[1240px] mx-auto'>
          {testimonials.map((testimonial, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2 }}
              className='bg-white p-6 rounded-lg shadow-sm flex-1 max-w-[600px]'
            >
              <div className='flex flex-col gap-4'>
                <div className='flex items-center gap-2'>
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className='text-yellow-400 text-xl'>★</span>
                  ))}
                </div>
                <p className='text-gray-700 text-lg'>{testimonial.text}</p>
                <h3 className='text-black font-semibold text-xl'>{testimonial.name}</h3>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ClientTestimonials; 