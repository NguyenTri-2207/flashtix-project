"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface CountdownTimerProps {
  targetTime: string; // ISO string
  onComplete?: () => void;
  className?: string;
}

export function CountdownTimer({
  targetTime,
  onComplete,
  className,
}: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<{
    hours: number;
    minutes: number;
    seconds: number;
  } | null>(null);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const target = new Date(targetTime).getTime();
      const difference = target - now;

      if (difference <= 0) {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
        onComplete?.();
        return;
      }

      const hours = Math.floor(difference / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({ hours, minutes, seconds });
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(interval);
  }, [targetTime, onComplete]);

  if (!timeLeft) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <Clock className="h-5 w-5 animate-pulse" />
        <span>Đang tính toán...</span>
      </div>
    );
  }

  const formatTime = (value: number) => String(value).padStart(2, "0");

  return (
    <div className={cn("flex items-center gap-2 font-mono", className)}>
      <Clock className="h-5 w-5" />
      <span className="text-lg font-bold">
        {formatTime(timeLeft.hours)}:{formatTime(timeLeft.minutes)}:
        {formatTime(timeLeft.seconds)}
      </span>
    </div>
  );
}

