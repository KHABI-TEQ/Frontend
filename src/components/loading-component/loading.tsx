/** @format */
'use client';

import { motion } from "framer-motion";

const Loading = () => {
  return (
    <section className="h-screen w-full flex items-center justify-center">
      <motion.div
        className="w-12 h-12 rounded-full border-4 border-[#09391C] border-t-transparent"
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
      />
    </section>
  );
};

export default Loading;
