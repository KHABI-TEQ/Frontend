/** @format */

"use client";
import React, { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import axios from "axios";
import { URLS } from "@/utils/URLS";
import { contactUsData } from "@/data";
import Image, { StaticImageData } from "next/image";
import Link from "next/link";
import toast from "react-hot-toast";
import ContactSuccessModal from "../modals/ContactSuccessModal";
import { motion } from "framer-motion";
import { MapPin, Phone, Mail, MessageCircle, Send, Loader2 } from "lucide-react";

interface ContactFormData {
  name: string;
  email: string;
  message: string;
  phoneNumber: string;
  subject: string;
}

interface ContactItem {
  value: string;
  icon: StaticImageData;
  type: string;
}

const ContactUs: React.FC = () => {
  const [status, setStatus] = useState<"idle" | "pending" | "success" | "failed">("idle");
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const validationSchema = Yup.object({
    name: Yup.string()
      .min(2, "Name must be at least 2 characters")
      .max(50, "Name must be at most 50 characters")
      .required("Name is required"),
    email: Yup.string()
      .email("Invalid email address")
      .required("Email is required"),
    message: Yup.string()
      .min(10, "Message must be at least 10 characters")
      .max(500, "Message must be at most 500 characters")
      .required("Message is required"),
    phoneNumber: Yup.string()
      .matches(/^[0-9]+$/, "Phone number must be digits only")
      .min(10, "Phone number must be at least 10 digits")
      .max(15, "Phone number must be at most 15 digits"),
    subject: Yup.string().required("Subject is required"),
  });

  const formik = useFormik<ContactFormData>({
    initialValues: {
      name: "",
      email: "",
      message: "",
      phoneNumber: "",
      subject: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      setStatus('pending');
      try {
        const payload = {
          name: values.name,
          email: values.email,
          subject: values.subject,
          message: values.message,
          ...(values.phoneNumber && { phoneNumber: values.phoneNumber }),
        };

        const response = await axios.post(`${URLS.BASE}/contact-us/submit`, payload);

        if (response.status === 200 || response.status === 201) {
          setStatus('success');
          formik.resetForm();
          setShowSuccessModal(true);
          toast.success("Message sent successfully!");
        }
      } catch (error) {
        console.error('Contact form error:', error);
        setStatus('failed');
        toast.error("Failed to send message. Please try again.");
      }
    },
  });

  const getIconForContact = (type: string) => {
    switch (type) {
      case 'mail':
        return <Mail className="w-6 h-6 text-[#8DDB90]" />;
      case 'call':
        return <Phone className="w-6 h-6 text-[#8DDB90]" />;
      case 'social_media':
        return <MessageCircle className="w-6 h-6 text-[#8DDB90]" />;
      default:
        return <MapPin className="w-6 h-6 text-[#8DDB90]" />;
    }
  };

  const formVariants = {
    hidden: { opacity: 0, x: -50 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: "easeOut" } }
  };

  const contactVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: "easeOut", delay: 0.2 } }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F6FFF7] via-white to-[#F0FDF4] py-20">
      <div className="container mx-auto px-4 lg:px-6">
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl lg:text-6xl font-display font-bold text-[#09391C] mb-6">
            Get in{" "}
            <span className="text-[#8DDB90] relative">
              Touch
              <motion.div 
                className="absolute -bottom-2 left-0 w-full h-1 bg-[#8DDB90] rounded-full"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.8, delay: 0.5 }}
              />
            </span>
          </h1>
          <p className="text-xl text-[#5A5D63] max-w-3xl mx-auto leading-relaxed">
            We're here to help you with all your real estate needs. Send us a message
            and we'll respond within 24 hours.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-16 max-w-7xl mx-auto">
          {/* Contact Form */}
          <motion.div
            variants={formVariants}
            initial="hidden"
            animate="visible"
            className="bg-white rounded-3xl p-8 lg:p-12 border border-[#E5E7EB]"
          >
            <div className="mb-8">
              <h2 className="text-3xl font-display font-bold text-[#09391C] mb-4">
                Send us a Message
              </h2>
              <p className="text-[#6B7280]">
                Fill out the form below and we'll get back to you as soon as possible.
              </p>
            </div>

            <form onSubmit={formik.handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="name" className="block text-sm font-semibold text-[#374151]">
                    Full Name *
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={formik.values.name}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="Enter your full name"
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-colors duration-200 ${
                      formik.errors.name && formik.touched.name
                        ? "border-red-300 focus:border-red-500"
                        : "border-[#D1D5DB] focus:border-[#8DDB90]"
                    } bg-[#F9FAFB] focus:bg-white`}
                  />
                  {formik.errors.name && formik.touched.name && (
                    <p className="text-red-500 text-sm mt-1">{formik.errors.name}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label htmlFor="phoneNumber" className="block text-sm font-semibold text-[#374151]">
                    Phone Number
                  </label>
                  <input
                    id="phoneNumber"
                    name="phoneNumber"
                    type="tel"
                    value={formik.values.phoneNumber}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="Enter your phone number"
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-colors duration-200 ${
                      formik.errors.phoneNumber && formik.touched.phoneNumber
                        ? "border-red-300 focus:border-red-500"
                        : "border-[#D1D5DB] focus:border-[#8DDB90]"
                    } bg-[#F9FAFB] focus:bg-white`}
                  />
                  {formik.errors.phoneNumber && formik.touched.phoneNumber && (
                    <p className="text-red-500 text-sm mt-1">{formik.errors.phoneNumber}</p>
                  )}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="email" className="block text-sm font-semibold text-[#374151]">
                    Email Address *
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formik.values.email}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="Enter your email address"
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-colors duration-200 ${
                      formik.errors.email && formik.touched.email
                        ? "border-red-300 focus:border-red-500"
                        : "border-[#D1D5DB] focus:border-[#8DDB90]"
                    } bg-[#F9FAFB] focus:bg-white`}
                  />
                  {formik.errors.email && formik.touched.email && (
                    <p className="text-red-500 text-sm mt-1">{formik.errors.email}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label htmlFor="subject" className="block text-sm font-semibold text-[#374151]">
                    Subject *
                  </label>
                  <input
                    id="subject"
                    name="subject"
                    type="text"
                    value={formik.values.subject}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="Enter message subject"
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-colors duration-200 ${
                      formik.errors.subject && formik.touched.subject
                        ? "border-red-300 focus:border-red-500"
                        : "border-[#D1D5DB] focus:border-[#8DDB90]"
                    } bg-[#F9FAFB] focus:bg-white`}
                  />
                  {formik.errors.subject && formik.touched.subject && (
                    <p className="text-red-500 text-sm mt-1">{formik.errors.subject}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="message" className="block text-sm font-semibold text-[#374151]">
                  Your Message *
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={6}
                  value={formik.values.message}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="Tell us how we can help you..."
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-colors duration-200 resize-none ${
                    formik.errors.message && formik.touched.message
                      ? "border-red-300 focus:border-red-500"
                      : "border-[#D1D5DB] focus:border-[#8DDB90]"
                  } bg-[#F9FAFB] focus:bg-white`}
                />
                {formik.errors.message && formik.touched.message && (
                  <p className="text-red-500 text-sm mt-1">{formik.errors.message}</p>
                )}
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={status === 'pending'}
                className="w-full bg-gradient-to-r from-[#8DDB90] to-[#6DB573] text-white font-bold py-4 px-8 rounded-xl hover:from-[#7BC97F] hover:to-[#5BA560] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 text-lg"
              >
                {status === 'pending' ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Send Message
                  </>
                )}
              </motion.button>
            </form>
          </motion.div>

          {/* Contact Information */}
          <motion.div
            variants={contactVariants}
            initial="hidden"
            animate="visible"
            className="space-y-8"
          >
            <div className="bg-white rounded-3xl p-8 lg:p-12 border border-[#E5E7EB]">
              <div className="mb-8">
                <h2 className="text-3xl font-display font-bold text-[#09391C] mb-4">
                  Contact Information
                </h2>
                <p className="text-[#6B7280]">
                  Reach out to us directly through any of the channels below.
                </p>
              </div>

              <div className="space-y-6">
                {contactUsData.map((item: ContactItem, idx: number) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * idx + 0.5 }}
                    className="group p-6 rounded-2xl bg-gradient-to-r from-[#F6FFF7] to-[#F0FDF4] hover:from-[#8DDB90] hover:to-[#6DB573] transition-all duration-300 cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                          {getIconForContact(item.type)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-[#6B7280] group-hover:text-white/80 transition-colors">
                            {item.type === 'mail' ? 'Email Address' : 
                             item.type === 'call' ? 'Phone Number' : 'WhatsApp'}
                          </p>
                          <p className="text-lg font-semibold text-[#09391C] group-hover:text-white transition-colors">
                            {item.value}
                          </p>
                        </div>
                      </div>
                      
                      {item.type === 'social_media' && (
                        <Link
                          href="https://wa.me/+2348132108659"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-[#8DDB90] group-hover:bg-white text-white group-hover:text-[#8DDB90] font-bold py-3 px-6 rounded-full transition-all duration-300 text-sm"
                        >
                          Chat Now
                        </Link>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Additional Information Card */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="bg-gradient-to-br from-[#09391C] to-[#0F4A2A] rounded-3xl p-8 lg:p-12 text-white"
            >
              <h3 className="text-2xl font-display font-bold mb-4">
                Why Choose Khabi-Teq?
              </h3>
              <ul className="space-y-3 text-white/90">
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-[#8DDB90] rounded-full"></div>
                  Expert real estate consultation
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-[#8DDB90] rounded-full"></div>
                  24/7 customer support
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-[#8DDB90] rounded-full"></div>
                  Verified property listings
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-[#8DDB90] rounded-full"></div>
                  Transparent transactions
                </li>
              </ul>
            </motion.div>
          </motion.div>
        </div>

        {/* Success Modal */}
        <ContactSuccessModal
          isOpen={showSuccessModal}
          onClose={() => {
            setShowSuccessModal(false);
            setStatus('idle');
          }}
        />
      </div>
    </div>
  );
};

export default ContactUs;
