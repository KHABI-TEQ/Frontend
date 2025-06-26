import { useCountdownTimer } from "@/hooks/negotiation/use-countdown-timer"


interface CountdownTimerProps {
  createdAt: string | null
}

export const CountdownTimer = ({ createdAt }: CountdownTimerProps) => {
  const { timeLeft, formatTime } = useCountdownTimer(createdAt)

  return (
    <time dateTime="" className="font-semibold text-black font-display text-2xl text-center">
      {formatTime(timeLeft)}
    </time>
  )
}
