/** @format */

"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { GET_REQUEST } from "@/utils/requests";
import { URLS } from "@/utils/URLS";

interface Testimonial {
  _id: string;
  fullName: string;
  occupation: string;
  rating: number;
  message: string;
}

const SocialProofSection = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        if (!URLS.BASE || URLS.BASE.includes("undefined")) {
          throw new Error("API configuration missing");
        }
        const response = await GET_REQUEST(`${URLS.BASE}/testimonials`);
        if (response.success && response.data && Array.isArray(response.data)) {
          setTestimonials((response.data as Testimonial[]).slice(0, 3));
        } else {
          setTestimonials([]);
        }
      } catch (err) {
        console.warn("Testimonials API not available:", err instanceof Error ? err.message : err);
        setTestimonials([]);
      } finally {
        setLoading(false);
      }
    };
    fetchTestimonials();
  }, []);

  const getInitials = (name: string) =>
    name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <section className="w-full py-16 sm:py-20 lg:py-24 bg-[#F5F7F9]">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8DDB90]" />
          </div>
        ) : testimonials.length === 0 ? (
          <div className="rounded-2xl border border-gray-100 bg-white px-6 py-12 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#09391C]">
              BUILT FOR A BETTER REAL ESTATE EXPERIENCE.
            </h2>
            <p className="mt-3 text-[#5A5D63] max-w-2xl mx-auto">
              A structured journey from preference to professional connection, inspection and transaction records.
            </p>
          </div>
        ) : (
          <>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#09391C] mb-8 text-center">
              What Our Clients Say
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={testimonial._id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.08 }}
                  viewport={{ once: true }}
                  className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
                >
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(testimonial.rating || 0)].map((_, i) => (
                      <svg key={i} className="w-5 h-5 text-[#8DDB90]" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-gray-600 mb-6 leading-relaxed">{testimonial.message}</p>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-[#8DDB90] rounded-full flex items-center justify-center text-white font-bold">
                      {getInitials(testimonial.fullName)}
                    </div>
                    <div>
                      <div className="font-bold text-[#09391C]">{testimonial.fullName}</div>
                      <div className="text-sm text-gray-500 capitalize">{testimonial.occupation}</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default SocialProofSection;
