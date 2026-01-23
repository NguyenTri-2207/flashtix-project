"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { Calendar, MapPin, Clock, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { getEventById } from "@/lib/mockData";
import { Event, ButtonState } from "@/types";
import { LiveStockCounter } from "@/components/features/live-stock-counter";
import { BookingButton } from "@/components/features/booking-button";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast-provider";
import { useAuth } from "@/lib/auth/auth-context";

// Simulate API call với retry logic
async function fetchEventWithRetry(
  id: string,
  retries = 3,
  delay = 3000
): Promise<Event> {
  for (let i = 0; i < retries; i++) {
    try {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Simulate random server errors (30% chance)
      if (Math.random() < 0.3 && i < retries - 1) {
        throw new Error("Server đang bận");
      }

      const event = getEventById(id);
      if (!event) {
        throw new Error("Không tìm thấy sự kiện");
      }
      return event;
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  throw new Error("Không thể tải dữ liệu");
}

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { showToast } = useToast();
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [buttonState, setButtonState] = useState<ButtonState>("wait");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadEvent = async () => {
      try {
        setLoading(true);
        setError(null);
        const eventData = await fetchEventWithRetry(params.id as string);
        setEvent(eventData);

        // Determine button state
        if (eventData.status === "sold_out") {
          setButtonState("sold_out");
        } else if (eventData.saleStartTime) {
          const saleStart = new Date(eventData.saleStartTime).getTime();
          const now = Date.now();
          if (now < saleStart) {
            setButtonState("wait");
          } else {
            setButtonState("active");
          }
        } else {
          setButtonState("active");
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Đã xảy ra lỗi";
        setError(errorMessage);
        showToast(
          "Server đang bận, hệ thống sẽ tự thử lại trong 3s...",
          "loading",
          3000
        );
        // Auto retry after 3 seconds
        setTimeout(() => {
          loadEvent();
        }, 3000);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      loadEvent();
    }
  }, [params.id, showToast]);

  const handleBooking = async () => {
    if (!event) return;

    // Check authentication first
    if (!isAuthenticated) {
      showToast("Vui lòng đăng nhập để mua vé", "error");
      // Redirect to login with return URL
      const returnUrl = encodeURIComponent(`/events/${event.id}`);
      router.push(`/login?returnUrl=${returnUrl}`);
      return;
    }

    setButtonState("processing");

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Simulate random success/failure (80% success rate)
      if (Math.random() < 0.8) {
        const bookingRef = `BK${Date.now()}`;
        router.push(`/booking-success?ref=${bookingRef}&eventId=${event.id}`);
      } else {
        throw new Error("Không thể đặt vé, vui lòng thử lại");
      }
    } catch (err) {
      setButtonState("active");
      showToast(
        err instanceof Error ? err.message : "Đã xảy ra lỗi",
        "error"
      );
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <Skeleton className="mb-6 h-12 w-32" />
          <Skeleton className="mb-6 h-96 w-full" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-8 w-1/2" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (error && !event) {
    return (
      <div className="container mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="mb-4 text-3xl font-bold text-gray-900 dark:text-gray-100">
            Không thể tải sự kiện
          </h1>
          <p className="mb-8 text-gray-600 dark:text-gray-400">{error}</p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-6 py-3 text-white hover:bg-red-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Quay về trang chủ
          </Link>
        </div>
      </div>
    );
  }

  if (!event) {
    return null;
  }

  const isSaleActive =
    event.saleStartTime &&
    new Date(event.saleStartTime).getTime() <= Date.now();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-2 text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
        >
          <ArrowLeft className="h-4 w-4" />
          Quay lại
        </Link>

        <div className="mx-auto max-w-4xl">
          <div className="grid gap-8 lg:grid-cols-2">
            {/* Image */}
            <div className="relative h-96 overflow-hidden rounded-xl lg:h-full">
              <Image
                src={event.thumbnail}
                alt={event.name}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>

            {/* Content */}
            <div className="space-y-6">
              <div>
                <h1 className="mb-4 text-4xl font-bold text-gray-900 dark:text-gray-100">
                  {event.name}
                </h1>
                <div className="space-y-3 text-gray-600 dark:text-gray-400">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5" />
                    <span>
                      {new Date(event.date).toLocaleDateString("vi-VN", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5" />
                    <span>{event.time}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5" />
                    <span>{event.location}</span>
                  </div>
                </div>
              </div>

              {/* Live Stock Counter */}
              {event.status !== "sold_out" && (
                <Card>
                  <CardContent className="p-6">
                    <LiveStockCounter
                      availableTickets={event.availableTickets}
                      totalTickets={event.totalTickets}
                    />
                  </CardContent>
                </Card>
              )}

              {/* Price & Booking */}
              <Card>
                <CardContent className="p-6">
                  <div className="mb-6">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Giá vé
                    </p>
                    <p className="text-3xl font-bold text-red-600">
                      {event.price.toLocaleString("vi-VN")} đ
                    </p>
                  </div>

                  {!isAuthLoading && !isAuthenticated && (
                    <div className="mb-4 rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-800 dark:bg-yellow-900/20">
                      <p className="text-sm text-yellow-800 dark:text-yellow-200">
                        ⚠️ Bạn cần đăng nhập để mua vé
                      </p>
                    </div>
                  )}
                  <BookingButton
                    state={buttonState}
                    saleStartTime={
                      !isSaleActive && event.saleStartTime
                        ? event.saleStartTime
                        : undefined
                    }
                    onClick={handleBooking}
                    className="w-full"
                  />
                </CardContent>
              </Card>

              {/* Description */}
              <Card>
                <CardContent className="p-6">
                  <h2 className="mb-3 text-xl font-semibold text-gray-900 dark:text-gray-100">
                    Mô tả sự kiện
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    {event.description}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

