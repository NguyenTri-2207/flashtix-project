"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Edit, Trash2, Plus, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { apiClient } from "@/lib/api/client";
import { mapBackendEventsToEvents } from "@/lib/api/eventMapper";
import { Event } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast-provider";
import { useRouter } from "next/navigation";

const statusLabels: Record<Event["status"], string> = {
  upcoming: "Sắp diễn ra",
  on_sale: "Đang mở bán",
  sold_out: "Hết vé",
};

export default function EventsListPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const backendEvents = await apiClient.getEvents();
      const mappedEvents = mapBackendEventsToEvents(backendEvents);
      setEvents(mappedEvents);
    } catch (error) {
      showToast("Không thể tải danh sách events", "error");
      console.error("Error loading events:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (eventId: string, eventName: string) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa event "${eventName}"?`)) {
      return;
    }

    try {
      setDeletingId(eventId);
      await apiClient.deleteEvent(eventId);
      showToast("Xóa event thành công!", "success");
      loadEvents();
    } catch (error) {
      showToast("Không thể xóa event", "error");
      console.error("Error deleting event:", error);
    } finally {
      setDeletingId(null);
    }
  };

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
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Danh sách Events
        </h1>
        <Link href="/dashboard/events/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Tạo Event Mới
          </Button>
        </Link>
      </div>

      {events.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="mb-4 text-gray-600 dark:text-gray-400">
              Chưa có event nào
            </p>
            <Link href="/dashboard/events/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Tạo Event Đầu Tiên
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {events.map((event) => (
            <Card key={event.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="mb-2 flex items-center gap-3">
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                        {event.name}
                      </h3>
                      <Badge variant={event.status}>
                        {statusLabels[event.status]}
                      </Badge>
                    </div>
                    <div className="mb-4 space-y-1 text-sm text-gray-600 dark:text-gray-400">
                      <p>
                        <span className="font-medium">Ngày:</span>{" "}
                        {new Date(event.date).toLocaleDateString("vi-VN")} - {event.time}
                      </p>
                      <p>
                        <span className="font-medium">Địa điểm:</span> {event.location}
                      </p>
                      <p>
                        <span className="font-medium">Vé còn lại:</span>{" "}
                        {event.availableTickets.toLocaleString("vi-VN")} /{" "}
                        {event.totalTickets.toLocaleString("vi-VN")}
                      </p>
                      <p>
                        <span className="font-medium">Giá:</span>{" "}
                        {event.price.toLocaleString("vi-VN")} đ
                      </p>
                    </div>
                  </div>
                  <div className="ml-4 flex gap-2">
                    <Link href={`/events/${event.id}`} target="_blank">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Link href={`/dashboard/events/${event.id}/edit`}>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(event.id, event.name)}
                      disabled={deletingId === event.id}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

