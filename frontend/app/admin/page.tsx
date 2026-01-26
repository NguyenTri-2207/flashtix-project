"use client";

import { useEffect, useState } from "react";
import { Calendar, Ticket, TrendingUp, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { apiClient } from "@/lib/api/client";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalEvents: 0,
    totalBookings: 0,
    onSaleEvents: 0,
    upcomingEvents: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const [events, bookings] = await Promise.all([
          apiClient.getEvents(),
          apiClient.getBookings(),
        ]);

        const onSaleEvents = events.filter((e) => e.status === "on_sale").length;
        const upcomingEvents = events.filter((e) => e.status === "upcoming").length;

        setStats({
          totalEvents: events.length,
          totalBookings: bookings.length,
          onSaleEvents,
          upcomingEvents,
        });
      } catch (error) {
        console.error("Error loading stats:", error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <Skeleton className="h-8 w-24 mb-2" />
              <Skeleton className="h-4 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-8 text-3xl font-bold text-gray-900 dark:text-gray-100">
        Dashboard
      </h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng số Events</CardTitle>
            <Calendar className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalEvents}</div>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Tất cả sự kiện
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng số Bookings</CardTitle>
            <Ticket className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalBookings}</div>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Tổng đặt vé
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đang mở bán</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.onSaleEvents}</div>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Events đang bán
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sắp mở bán</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.upcomingEvents}</div>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Events sắp tới
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
