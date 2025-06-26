"use client"

import type React from "react"

import { motion, AnimatePresence } from "framer-motion"
import { NegotiationHeader } from "./negotiation-header"
import { CountdownTimer } from "../extrals/countdown-timer"

interface NegotiationLayoutProps {
  fullName: string
  title: string
  createdAt: string | null
  children: React.ReactNode
}

export const NegotiationLayout = ({ fullName, title, createdAt, children }: NegotiationLayoutProps) => {
  return (
    <motion.div className="w-full flex items-center justify-center flex-col gap-[20px] md:gap-[40px] md:py-[50px] px-[20px] pb-[20px]">
      <NegotiationHeader fullName={fullName} title={title} />

      <AnimatePresence>
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          exit={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.2 }}
          className="lg:w-[933px] w-full flex flex-col gap-[30px] bg-[#FFFFFF] py-[30px] md:py-[50px] md:px-[50px] px-[30px] border-[1px] border-[#C7CAD0]"
        >
          <CountdownTimer createdAt={createdAt} />
          {children}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  )
}
