"use client";

import { useEffect, useState } from "react";
import { Ticket } from "lucide-react";
import { cn } from "@/lib/utils";

interface LiveStockCounterProps {
  availableTickets: number;
  totalTickets: number;
  className?: string;
}

export function LiveStockCounter({
  availableTickets,
  totalTickets,
  className,
}: LiveStockCounterProps) {
  const [displayCount, setDisplayCount] = useState(availableTickets);
  const percentage = (availableTickets / totalTickets) * 100;

  useEffect(() => {
    // Simulate live updates (trong thực tế sẽ nhận từ WebSocket hoặc polling)
    setDisplayCount(availableTickets);
  }, [availableTickets]);

  const getStockStatus = () => {
    if (percentage > 50) return "text-green-600";
    if (percentage > 20) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-red-100 to-pink-100 dark:from-red-900/20 dark:to-pink-900/20">
        <Ticket className="h-6 w-6 text-red-600 dark:text-red-400" />
      </div>
      <div>
        <p className="text-sm text-gray-600 dark:text-gray-400">Vé còn lại</p>
        <p className={cn("text-2xl font-bold", getStockStatus())}>
          {displayCount.toLocaleString("vi-VN")} vé
        </p>
      </div>
      <div className="ml-auto">
        <div className="h-2 w-24 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
          <div
            className={cn(
              "h-full transition-all duration-500",
              percentage > 50
                ? "bg-green-500"
                : percentage > 20
                ? "bg-yellow-500"
                : "bg-red-500"
            )}
            style={{ width: `${percentage}%` }}
          />
        </div>
        <p className="mt-1 text-xs text-gray-500">
          {percentage.toFixed(1)}% còn lại
        </p>
      </div>
    </div>
  );
}

