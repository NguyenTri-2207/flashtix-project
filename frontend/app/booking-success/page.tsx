"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { CheckCircle2, Home, Ticket } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getEventById } from "@/lib/mockData";
import { useAuth } from "@/lib/auth/auth-context";
import { Skeleton } from "@/components/ui/skeleton";

export default function BookingSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const bookingRef = searchParams.get("ref");
  const eventId = searchParams.get("eventId");
  const [eventName, setEventName] = useState<string>("");

  // Protect route - redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      const returnUrl = encodeURIComponent("/booking-success" + (bookingRef ? `?ref=${bookingRef}&eventId=${eventId || ""}` : ""));
      router.push(`/login?returnUrl=${returnUrl}`);
    }
  }, [isAuthenticated, isAuthLoading, router, bookingRef, eventId]);

  useEffect(() => {
    if (eventId) {
      const event = getEventById(eventId);
      if (event) {
        setEventName(event.name);
      }
    }
  }, [eventId]);

  // Show loading while checking auth
  if (isAuthLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="w-full max-w-md">
          <Skeleton className="mb-4 h-12 w-full" />
          <Skeleton className="mb-4 h-32 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    );
  }

  // Don't render if not authenticated (will redirect)
  if (!isAuthenticated) {
    return null;
  }

  if (!bookingRef) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="mb-4 text-2xl font-bold">Không tìm thấy thông tin đặt vé</h1>
          <Link href="/">
            <Button>Quay về trang chủ</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50 dark:from-gray-900 dark:to-gray-950">
      <div className="container mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl">
          <Card className="border-2 border-green-200 shadow-xl dark:border-green-800">
            <CardContent className="p-8 text-center sm:p-12">
              {/* Success Icon */}
              <div className="mb-6 flex justify-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-emerald-500">
                  <CheckCircle2 className="h-12 w-12 text-white" />
                </div>
              </div>

              {/* Success Message */}
              <h1 className="mb-4 text-3xl font-bold text-gray-900 dark:text-gray-100 sm:text-4xl">
                Chúc mừng!
              </h1>
              <p className="mb-8 text-lg text-gray-600 dark:text-gray-400">
                Bạn đã săn vé thành công
              </p>

              {/* Booking Reference */}
              <div className="mb-8 rounded-lg bg-gray-50 p-6 dark:bg-gray-800">
                <div className="mb-2 flex items-center justify-center gap-2">
                  <Ticket className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Mã đặt chỗ
                  </span>
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {bookingRef}
                </p>
                {eventName && (
                  <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                    {eventName}
                  </p>
                )}
              </div>

              {/* Instructions */}
              <div className="mb-8 rounded-lg border border-gray-200 bg-white p-4 text-left dark:border-gray-700 dark:bg-gray-800">
                <p className="mb-2 text-sm font-semibold text-gray-900 dark:text-gray-100">
                  Lưu ý:
                </p>
                <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                  <li>• Vui lòng lưu lại mã đặt chỗ để tra cứu sau</li>
                  <li>• Vé sẽ được gửi qua email trong vòng 24 giờ</li>
                  <li>• Liên hệ hotline nếu cần hỗ trợ</li>
                </ul>
              </div>

              {/* Action Button */}
              <Link href="/">
                <Button size="lg" className="w-full sm:w-auto">
                  <Home className="h-5 w-5" />
                  Quay về trang chủ
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

