import * as React from "react";
import { cn } from "@/lib/utils";
import { EventStatus } from "@/types";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: EventStatus | "default";
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = "default", children, ...props }, ref) => {
    const variants = {
      default: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
      upcoming:
        "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      on_sale:
        "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-md",
      sold_out: "bg-gray-600 text-white dark:bg-gray-700",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold transition-colors",
          variants[variant],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Badge.displayName = "Badge";

export { Badge };

