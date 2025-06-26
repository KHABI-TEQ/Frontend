"use client"

import { useState, useEffect } from "react"

export const useCountdownTimer = (createdAt: string | null) => {
  const getInitialTimeLeft = () => {
    if (!createdAt) return 48 * 60 * 60
    const created = new Date(createdAt).getTime()
    const now = Date.now()
    const diff = 48 * 60 * 60 * 1000 - (now - created)
    return Math.max(Math.floor(diff / 1000), 0)
  }

  const [timeLeft, setTimeLeft] = useState(getInitialTimeLeft())

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    setTimeLeft(getInitialTimeLeft())
  }, [createdAt])

  const formatTime = (secs: number) => {
    const hours = Math.floor(secs / 3600)
    const minutes = Math.floor((secs % 3600) / 60)
    const seconds = secs % 60
    return `${hours.toString().padStart(2, "0")} : ${minutes
      .toString()
      .padStart(2, "0")} : ${seconds.toString().padStart(2, "0")}`
  }

  return { timeLeft, formatTime }
}
