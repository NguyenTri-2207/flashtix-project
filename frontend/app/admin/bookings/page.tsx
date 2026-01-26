"use client";

import { useEffect, useState } from "react";
import { Ticket, Calendar, User } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { apiClient } from "@/lib/api/client";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast-provider";

interface Booking {
  bookingId: string;
  eventId: string;
  userId: string;
  createdAt: string;
}

export default function BookingsPage() {
  const { showToast } = useToast();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [events, setEvents] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [bookingsData, eventsData] = await Promise.all([
          apiClient.getBookings(),
          apiClient.getEvents(),
        ]);

        setBookings(bookingsData);
        
        // Create event map for quick lookup
        const eventMap: Record<string, any> = {};
        eventsData.forEach((event: any) => {
          eventMap[event.eventId] = event;
        });
        setEvents(eventMap);
      } catch (error) {
        showToast("Không thể tải danh sách bookings", "error");
        console.error("Error loading bookings:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [showToast]);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-48" />
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-8 text-3xl font-bold text-gray-900 dark:text-gray-100">
        Danh sách Bookings
      </h1>

      {bookings.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Ticket className="mx-auto mb-4 h-12 w-12 text-gray-400" />
            <p className="text-gray-600 dark:text-gray-400">
              Chưa có booking nào
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => {
            const event = events[booking.eventId];
            const bookingDate = new Date(booking.createdAt);
            
            return (
              <Card key={booking.bookingId} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="mb-2 flex items-center gap-3">
                        <Ticket className="h-5 w-5 text-red-600" />
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                          Booking ID: {booking.bookingId}
                        </h3>
                      </div>
                      <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                        {event && (
                          <p>
                            <span className="font-medium">Event:</span> {event.name}
                          </p>
                        )}
                        <p>
                          <span className="font-medium">Event ID:</span> {booking.eventId}
                        </p>
                        <p>
                          <User className="mr-1 inline h-4 w-4" />
                          <span className="font-medium">User ID:</span> {booking.userId}
                        </p>
                        <p>
                          <Calendar className="mr-1 inline h-4 w-4" />
                          <span className="font-medium">Ngày đặt:</span>{" "}
                          {bookingDate.toLocaleString("vi-VN", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {bookings.length > 0 && (
        <div className="mt-6 text-sm text-gray-600 dark:text-gray-400">
          Tổng số bookings: <span className="font-semibold">{bookings.length}</span>
        </div>
      )}
    </div>
  );
}

