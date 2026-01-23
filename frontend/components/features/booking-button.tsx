"use client";

import { Button } from "@/components/ui/button";
import { ButtonState } from "@/types";
import { CountdownTimer } from "./countdown-timer";
import { Loader2, ShoppingCart } from "lucide-react";

interface BookingButtonProps {
  state: ButtonState;
  saleStartTime?: string;
  onClick: () => void;
  className?: string;
}

export function BookingButton({
  state,
  saleStartTime,
  onClick,
  className,
}: BookingButtonProps) {
  const renderContent = () => {
    switch (state) {
      case "wait":
        return (
          <>
            {saleStartTime && (
              <CountdownTimer
                targetTime={saleStartTime}
                className="text-white"
              />
            )}
            <span>Mở bán trong</span>
          </>
        );
      case "active":
        return (
          <>
            <ShoppingCart className="h-5 w-5" />
            <span>MUA VÉ NGAY</span>
          </>
        );
      case "processing":
        return (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Đang xử lý...</span>
          </>
        );
      case "sold_out":
        return <span>HẾT VÉ</span>;
    }
  };

  return (
    <Button
      variant={state === "sold_out" ? "outline" : "default"}
      size="lg"
      disabled={state === "wait" || state === "processing" || state === "sold_out"}
      onClick={onClick}
      isLoading={state === "processing"}
      className={className}
    >
      {renderContent()}
    </Button>
  );
}

