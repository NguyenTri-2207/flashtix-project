"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Save, Calendar, Clock, MapPin, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { apiClient } from "@/lib/api/client";
import { mapBackendEventToEvent } from "@/lib/api/eventMapper";
import { useToast } from "@/components/ui/toast-provider";
import { EventStatus } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";

export default function EditEventPage() {
  const router = useRouter();
  const params = useParams();
  const { showToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const eventId = params.id as string;

  const formatDateTimeLocal = (isoString?: string) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const [formData, setFormData] = useState({
    name: "",
    thumbnail: "",
    date: "",
    time: "",
    location: "",
    description: "",
    status: "upcoming" as EventStatus,
    totalTickets: "",
    availableTickets: "",
    price: "",
    saleStartTime: "",
  });

  useEffect(() => {
    const loadEvent = async () => {
      try {
        setLoading(true);
        const backendEvent = await apiClient.getEventById(eventId);
        const event = mapBackendEventToEvent(backendEvent);
        
        setFormData({
          name: event.name,
          thumbnail: event.thumbnail,
          date: event.date,
          time: event.time,
          location: event.location,
          description: event.description,
          status: event.status,
          totalTickets: String(event.totalTickets),
          availableTickets: String(event.availableTickets),
          price: String(event.price),
          saleStartTime: formatDateTimeLocal(event.saleStartTime),
        });
      } catch (error: any) {
        showToast("Không thể tải thông tin event", "error");
        router.push("/dashboard/events");
      } finally {
        setLoading(false);
      }
    };

    if (eventId) {
      loadEvent();
    }
  }, [eventId, router, showToast]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const eventData: any = {
        name: formData.name,
        thumbnail: formData.thumbnail || "",
        date: formData.date,
        time: formData.time,
        location: formData.location,
        description: formData.description,
        status: formData.status,
        totalTickets: parseInt(formData.totalTickets) || 0,
        availableTickets: parseInt(formData.availableTickets) || 0,
        price: parseInt(formData.price) || 0,
      };

      if (formData.saleStartTime) {
        eventData.saleStartTime = new Date(formData.saleStartTime).toISOString();
      }

      await apiClient.updateEvent(eventId, eventData);
      showToast("Cập nhật event thành công!", "success");
      router.push("/dashboard/events");
    } catch (error: any) {
      showToast(error.message || "Không thể cập nhật event", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-8 text-3xl font-bold text-gray-900 dark:text-gray-100">
        Chỉnh sửa Event
      </h1>

      <Card className="border-2 border-gray-200 shadow-xl dark:border-gray-800">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Thông tin Event</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Tên Event <span className="text-red-500">*</span>
              </label>
              <input
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
              />
            </div>

            {/* Thumbnail */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                <ImageIcon className="mr-2 inline h-4 w-4" />
                URL Hình ảnh
              </label>
              <input
                name="thumbnail"
                type="url"
                value={formData.thumbnail}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
              />
            </div>

            {/* Date & Time */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  <Calendar className="mr-2 inline h-4 w-4" />
                  Ngày <span className="text-red-500">*</span>
                </label>
                <input
                  name="date"
                  type="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  <Clock className="mr-2 inline h-4 w-4" />
                  Giờ <span className="text-red-500">*</span>
                </label>
                <input
                  name="time"
                  type="time"
                  value={formData.time}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                />
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                <MapPin className="mr-2 inline h-4 w-4" />
                Địa điểm <span className="text-red-500">*</span>
              </label>
              <input
                name="location"
                type="text"
                value={formData.location}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
              />
            </div>

            {/* Description */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Mô tả
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
              />
            </div>

            {/* Status */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Trạng thái
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
              >
                <option value="upcoming">Sắp diễn ra</option>
                <option value="on_sale">Đang mở bán</option>
                <option value="sold_out">Hết vé</option>
              </select>
            </div>

            {/* Tickets & Price */}
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Tổng số vé <span className="text-red-500">*</span>
                </label>
                <input
                  name="totalTickets"
                  type="number"
                  value={formData.totalTickets}
                  onChange={handleChange}
                  required
                  min="1"
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Vé còn lại <span className="text-red-500">*</span>
                </label>
                <input
                  name="availableTickets"
                  type="number"
                  value={formData.availableTickets}
                  onChange={handleChange}
                  required
                  min="0"
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Giá vé (VNĐ) <span className="text-red-500">*</span>
                </label>
                <input
                  name="price"
                  type="number"
                  value={formData.price}
                  onChange={handleChange}
                  required
                  min="0"
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                />
              </div>
            </div>

            {/* Sale Start Time */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Thời gian mở bán
              </label>
              <input
                name="saleStartTime"
                type="datetime-local"
                value={formData.saleStartTime}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
              />
            </div>

            {/* Submit */}
            <div className="flex gap-4">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-red-600 hover:bg-red-700"
              >
                <Save className="mr-2 h-4 w-4" />
                {isSubmitting ? "Đang lưu..." : "Lưu thay đổi"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/admin/events")}
              >
                Hủy
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

