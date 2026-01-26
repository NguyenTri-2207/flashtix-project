"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { EventCard } from "@/components/features/event-card";
import { artistInfo } from "@/lib/mockData";
import { Sparkles, Zap, Music, Star } from "lucide-react";
import Link from "next/link";
import { apiClient } from "@/lib/api/client";
import { mapBackendEventsToEvents } from "@/lib/api/eventMapper";
import { Event } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast-provider";

export default function HomePage() {
  const { showToast } = useToast();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadEvents = async () => {
      try {
        setLoading(true);
        setError(null);
        const backendEvents = await apiClient.getEvents();
        const mappedEvents = mapBackendEventsToEvents(backendEvents);
        setEvents(mappedEvents);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Không thể tải danh sách sự kiện";
        setError(errorMessage);
        showToast(errorMessage, "error");
        console.error("Error loading events:", err);
      } finally {
        setLoading(false);
      }
    };

    loadEvents();
  }, [showToast]);

  const onSaleEvents = events.filter((event) => event.status === "on_sale");
  const upcomingEvents = events.filter((event) => event.status === "upcoming");

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-gray-200 bg-gradient-to-br from-red-600 via-pink-600 to-purple-600 dark:border-gray-800">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
        <div className="container relative mx-auto px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 backdrop-blur-sm">
              <Sparkles className="h-4 w-4 text-white" />
              <span className="text-sm font-semibold text-white">
                The Eras Tour - Flash Sale
              </span>
            </div>
            <h1 className="mb-4 text-5xl font-bold tracking-tight text-white sm:text-6xl lg:text-7xl">
              Taylor Swift
            </h1>
            <h2 className="mb-6 text-3xl font-semibold text-white/90 sm:text-4xl">
              The Eras Tour
            </h2>
            <p className="mb-8 text-xl text-white/90 sm:text-2xl">
              Trải nghiệm tất cả các era âm nhạc trong một đêm không thể quên
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="#events"
                className="inline-flex items-center gap-2 rounded-lg bg-white px-8 py-4 text-lg font-semibold text-red-600 shadow-lg transition-all hover:scale-105 hover:shadow-xl"
              >
                <Zap className="h-5 w-5" />
                Săn vé ngay
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Artist Info Section */}
      <section className="border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-5xl">
            <div className="grid gap-8 md:grid-cols-2 md:items-center">
              <div className="relative h-96 overflow-hidden rounded-2xl">
                <Image
                  src={artistInfo.image}
                  alt={artistInfo.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Music className="h-6 w-6 text-red-600" />
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                    Về {artistInfo.name}
                  </h2>
                </div>
                <p className="text-lg leading-relaxed text-gray-600 dark:text-gray-400">
                  {artistInfo.bio}
                </p>
                <div className="flex items-center gap-2 pt-4">
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Hơn 200 triệu album đã bán ra trên toàn thế giới
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Events Section */}
      <section id="events" className="container mx-auto px-4 py-16 sm:px-6 lg:px-8">
        {loading && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="h-48 w-full" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            ))}
          </div>
        )}

        {error && !loading && (
          <div className="text-center">
            <p className="mb-4 text-lg text-red-600 dark:text-red-400">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="rounded-lg bg-red-600 px-6 py-3 text-white hover:bg-red-700"
            >
              Thử lại
            </button>
          </div>
        )}

        {!loading && !error && (
          <>
            {/* On Sale Events */}
            {onSaleEvents.length > 0 && (
          <div className="mb-16">
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                  Đang mở bán
                </h2>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  Nhanh tay săn vé The Eras Tour trước khi hết!
                </p>
              </div>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {onSaleEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </div>
        )}

        {/* Upcoming Events */}
        {upcomingEvents.length > 0 && (
          <div>
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                  Sắp mở bán
                </h2>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  Các show sắp mở bán vé - Đừng bỏ lỡ!
                </p>
              </div>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {upcomingEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </div>
            )}

            {!loading && !error && onSaleEvents.length === 0 && upcomingEvents.length === 0 && (
              <div className="text-center py-16">
                <p className="text-lg text-gray-600 dark:text-gray-400">
                  Chưa có sự kiện nào. Vui lòng quay lại sau.
                </p>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}
