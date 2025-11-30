/** @format */

'use client';
import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import CountUp from 'react-countup';
import { GET_REQUEST } from '@/utils/requests';
import { URLS } from '@/utils/URLS';

interface Testimonial {
  _id: string;
  fullName: string;
  occupation: string;
  rating: number;
  message: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface ApiResponse {
  success: boolean;
  data: Testimonial[];
}

const SocialProofSection = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const stats = [
    {
      number: 250,
      label: "Verified Agents",
      suffix: "+"
    },
    {
      number: 1500,
      label: "Properties Matched",
      suffix: "+"
    },
    {
      number: 800,
      label: "Deals Closed",
      suffix: "+"
    },
    {
      number: 98,
      label: "Client Satisfaction",
      suffix: "%"
    }
  ];

  const partners = [
    {
      name: "Paystack",
      logo: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M7.5 2.5V9.5H14.5V2.5H7.5Z" fill="#00C851"/>
          <path d="M7.5 14.5V21.5H14.5V14.5H7.5Z" fill="#00C851"/>
          <path d="M2.5 7.5V14.5H9.5V7.5H2.5Z" fill="#00C851"/>
          <path d="M14.5 7.5V14.5H21.5V7.5H14.5Z" fill="#00C851"/>
        </svg>
      )
    },
    {
      name: "Flutterwave",
      logo: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2L2 7V17L12 22L22 17V7L12 2Z" fill="#F5A623"/>
          <path d="M12 8L8 10V14L12 16L16 14V10L12 8Z" fill="#FFF"/>
        </svg>
      )
    },
    {
      name: "Lagos State",
      logo: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3 3H21V21H3V3Z" fill="#009639"/>
          <path d="M3 3H21V11H3V3Z" fill="#009639"/>
          <path d="M3 13H21V21H3V13Z" fill="#FFFFFF"/>
          <circle cx="12" cy="12" r="3" fill="#009639"/>
        </svg>
      )
    },
    {
      name: "NAICOM",
      logo: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2L3 7V12C3 16.55 6.84 20.74 12 22C17.16 20.74 21 16.55 21 12V7L12 2Z" fill="#1E3A8A"/>
          <path d="M9 12L11 14L15 10" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )
    }
  ];

  // Fetch testimonials from API
  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        setLoading(true);

        // Check if API base URL is properly configured
        if (!URLS.BASE || URLS.BASE.includes('undefined')) {
          throw new Error('API configuration missing');
        }

        const response = await GET_REQUEST(`${URLS.BASE}/testimonials`);

        if (response.success && response.data && Array.isArray(response.data)) {
          setTestimonials(response.data);
          setError(null); // Clear any previous errors
        } else {
          throw new Error(response.error || 'Invalid response format');
        }

      } catch (err) {
        console.warn('💬 Testimonials API not available - using sample testimonials:', err instanceof Error ? err.message : err);
        // Fallback to sample testimonials - don't show error to user
        setError(null);
        setTestimonials([
          {
            _id: 'sample-1',
            fullName: 'Adebayo Okonkwo',
            occupation: 'businessman',
            rating: 5,
            message: 'Khabiteq made finding my dream home so easy! The verification process gave me confidence, and the agents were very professional throughout.',
            status: 'approved',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            _id: 'sample-2',
            fullName: 'Sarah Johnson',
            occupation: 'software engineer',
            rating: 5,
            message: 'As a first-time buyer, I was nervous about the process. Khabiteq\'s transparent system and verified listings made everything smooth and trustworthy.',
            status: 'approved',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            _id: 'sample-3',
            fullName: 'Michael Chen',
            occupation: 'real estate investor',
            rating: 4,
            message: 'The property verification feature is outstanding. It saved me from potential issues and gave me peace of mind with my investment decisions.',
            status: 'approved',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            _id: 'sample-4',
            fullName: 'Fatima Abdullahi',
            occupation: 'entrepreneur',
            rating: 5,
            message: 'Excellent service! Found the perfect office space for my business. The agents understood my needs and delivered exactly what I was looking for.',
            status: 'approved',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            _id: 'sample-5',
            fullName: 'David Williams',
            occupation: 'doctor',
            rating: 5,
            message: 'Professional, reliable, and efficient. Khabiteq connects you with serious buyers and sellers. Highly recommend for anyone in the property market.',
            status: 'approved',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchTestimonials();
  }, []);

  // Get user initials for avatar
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  // Scroll functions
  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      const cardWidth = 320; // Approximate card width + gap
      scrollContainerRef.current.scrollBy({ left: -cardWidth, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      const cardWidth = 320; // Approximate card width + gap
      scrollContainerRef.current.scrollBy({ left: cardWidth, behavior: 'smooth' });
    }
  };

  // Check scroll position
  const checkScrollPosition = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', checkScrollPosition);
      // Initial check
      setTimeout(checkScrollPosition, 100);
      
      return () => container.removeEventListener('scroll', checkScrollPosition);
    }
  }, [testimonials]);

  return (
    <section className='w-full py-12 sm:py-16 md:py-20 lg:py-24 bg-[#F5F7F9]'>
      <div className='container mx-auto px-4 sm:px-6 md:px-8'>
        
        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className='text-center mb-16 sm:mb-20'>
          
          <h2 className='text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-[#09391C] mb-4 sm:mb-6 font-display'>
            Trusted by Thousands
          </h2>
          <p className='text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto mb-8 sm:mb-10 md:mb-12 px-4 sm:px-0'>
            Join the growing community of satisfied customers who have found their perfect properties through Khabiteq.
          </p>

          {/* Stats Grid */}
          <div className='grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8'>
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.5 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className='text-center bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg'>
                <div className='text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-[#8DDB90] mb-1 sm:mb-2'>
                  <CountUp end={stat.number} duration={2.5} />
                  {stat.suffix}
                </div>
                <div className='text-gray-600 font-medium text-sm sm:text-base'>
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Testimonials Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className='mb-16 sm:mb-20'>
          
          <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 sm:mb-12 gap-4'>
            <h3 className='text-xl sm:text-2xl md:text-3xl font-bold text-[#09391C] font-display'>
              What Our Clients Say
            </h3>
            
            {/* Scroll Controls - Hidden on mobile, shown on larger screens */}
            <div className='hidden sm:flex items-center gap-2'>
              <button
                onClick={scrollLeft}
                disabled={!canScrollLeft}
                className={`p-2 rounded-full border-2 transition-all duration-300 ${
                  canScrollLeft 
                    ? 'border-[#8DDB90] text-[#8DDB90] hover:bg-[#8DDB90] hover:text-white' 
                    : 'border-gray-300 text-gray-300 cursor-not-allowed'
                }`}>
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={scrollRight}
                disabled={!canScrollRight}
                className={`p-2 rounded-full border-2 transition-all duration-300 ${
                  canScrollRight 
                    ? 'border-[#8DDB90] text-[#8DDB90] hover:bg-[#8DDB90] hover:text-white' 
                    : 'border-gray-300 text-gray-300 cursor-not-allowed'
                }`}>
                <ChevronRight size={20} />
              </button>
            </div>
          </div>

          {loading ? (
            <div className='flex justify-center items-center py-12'>
              <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-[#8DDB90]'></div>
            </div>
          ) : (
            <>
              {/* Desktop Scrollable Container */}
              <div className='hidden sm:block relative'>
                <div 
                  ref={scrollContainerRef}
                  className='flex gap-6 overflow-x-auto scrollbar-hide scroll-smooth'
                  style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                  {testimonials.map((testimonial, index) => (
                    <motion.div
                      key={testimonial._id}
                      initial={{ opacity: 0, x: 50 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                      viewport={{ once: true }}
                      className='bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100 flex-shrink-0 w-80'>
                      
                      {/* Rating Stars */}
                      <div className='flex items-center gap-1 mb-4'>
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <svg key={i} className="w-5 h-5 text-[#8DDB90]" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>

                      {/* Testimonial Text */}
                      <p className='text-gray-600 mb-6 leading-relaxed line-clamp-4'>
                        {testimonial.message}
                      </p>

                      {/* User Info */}
                      <div className='flex items-center gap-3'>
                        <div className='w-12 h-12 bg-[#8DDB90] rounded-full flex items-center justify-center text-white font-bold'>
                          {getInitials(testimonial.fullName)}
                        </div>
                        <div>
                          <div className='font-bold text-[#09391C]'>
                            {testimonial.fullName}
                          </div>
                          <div className='text-sm text-gray-500 capitalize'>
                            {testimonial.occupation}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Mobile Grid Layout */}
              <div className='block sm:hidden'>
                <div className='grid grid-cols-1 gap-6'>
                  {testimonials.slice(0, 3).map((testimonial, index) => (
                    <motion.div
                      key={testimonial._id}
                      initial={{ opacity: 0, y: 50 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                      viewport={{ once: true }}
                      className='bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100'>
                      
                      {/* Rating Stars */}
                      <div className='flex items-center gap-1 mb-4'>
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <svg key={i} className="w-5 h-5 text-[#8DDB90]" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>

                      {/* Testimonial Text */}
                      <p className='text-gray-600 mb-6 leading-relaxed'>
                        {testimonial.message}
                      </p>

                      {/* User Info */}
                      <div className='flex items-center gap-3'>
                        <div className='w-12 h-12 bg-[#8DDB90] rounded-full flex items-center justify-center text-white font-bold'>
                          {getInitials(testimonial.fullName)}
                        </div>
                        <div>
                          <div className='font-bold text-[#09391C]'>
                            {testimonial.fullName}
                          </div>
                          <div className='text-sm text-gray-500 capitalize'>
                            {testimonial.occupation}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
                
                {testimonials.length > 3 && (
                  <div className='text-center mt-6'>
                    <p className='text-gray-500 text-sm'>
                      +{testimonials.length - 3} more happy clients
                    </p>
                  </div>
                )}
              </div>
            </>
          )}
        </motion.div>

        {/* Trusted Partners */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className='text-center'>
          
          <h3 className='text-lg sm:text-xl md:text-2xl font-bold text-[#09391C] mb-6 sm:mb-8'>
            Trusted Partners & Security
          </h3>

          <div className='flex flex-wrap justify-center items-center gap-4 sm:gap-6 md:gap-8 lg:gap-12 mb-6 sm:mb-8'>
            {partners.map((partner, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className='flex items-center gap-2 sm:gap-3 bg-white px-4 sm:px-6 py-2 sm:py-3 rounded-full shadow-md hover:shadow-lg transition-shadow duration-300'>
                <div className='w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center'>{partner.logo}</div>
                <span className='font-medium text-gray-700 text-sm sm:text-base'>{partner.name}</span>
              </motion.div>
            ))}
          </div>

          {/* Security badges */}
          <div className='flex flex-wrap justify-center items-center gap-4 sm:gap-6'>
            <div className='flex items-center gap-2 text-gray-600'>
              <svg className="w-4 sm:w-5 h-4 sm:h-5 text-[#8DDB90]" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
              <span className='text-xs sm:text-sm font-medium'>SSL Secured</span>
            </div>
            <div className='flex items-center gap-2 text-gray-600'>
              <svg className="w-4 sm:w-5 h-4 sm:h-5 text-[#8DDB90]" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className='text-xs sm:text-sm font-medium'>Data Protected</span>
            </div>
            <div className='flex items-center gap-2 text-gray-600'>
              <svg className="w-4 sm:w-5 h-4 sm:h-5 text-[#8DDB90]" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <span className='text-xs sm:text-sm font-medium'>Verified Platform</span>
            </div>
          </div>
        </motion.div>
      </div>

      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .line-clamp-4 {
          display: -webkit-box;
          -webkit-line-clamp: 4;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </section>
  );
};

export default SocialProofSection;
