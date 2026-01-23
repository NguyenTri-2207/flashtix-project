"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Calendar, Clock, MapPin, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { apiClient } from "@/lib/api/client";
import { useToast } from "@/components/ui/toast-provider";
import { EventStatus } from "@/types";

export default function AdminPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Generate next event ID (số tiếp theo sau event cuối cùng)
  const getNextEventId = () => {
    // Có thể lấy từ API hoặc hardcode
    return "6"; // Event ID tiếp theo
  };

  // Format datetime-local từ ISO string
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

  // Default values với dữ liệu mẫu
  const [formData, setFormData] = useState({
    eventId: getNextEventId(),
    name: "Taylor Swift - The Eras Tour",
    thumbnail: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&h=600&fit=crop",
    date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // 7 ngày sau
    time: "20:00",
    location: "Sân vận động Quốc gia Mỹ Đình, Hà Nội",
    description: "Buổi biểu diễn đặc biệt của Taylor Swift với các hit từ tất cả các era: Fearless, Red, 1989, Reputation, Lover, Folklore, Evermore, Midnights và nhiều hơn nữa. Trải nghiệm một đêm không thể quên với màn trình diễn kéo dài hơn 3 giờ đồng hồ.",
    status: "upcoming" as EventStatus,
    totalTickets: "50000",
    availableTickets: "",
    price: "2000000",
    saleStartTime: formatDateTimeLocal(new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()), // 1 ngày sau
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validation
      if (!formData.eventId || !formData.name || !formData.date || !formData.time) {
        showToast("Vui lòng điền đầy đủ các trường bắt buộc", "error");
        setIsSubmitting(false);
        return;
      }

      const eventData = {
        eventId: formData.eventId,
        name: formData.name,
        thumbnail: formData.thumbnail || "",
        date: formData.date,
        time: formData.time,
        location: formData.location,
        description: formData.description,
        status: formData.status,
        totalTickets: parseInt(formData.totalTickets) || 0,
        availableTickets: parseInt(formData.availableTickets) || parseInt(formData.totalTickets) || 0,
        price: parseInt(formData.price) || 0,
        saleStartTime: formData.saleStartTime || undefined,
      };

      await apiClient.createEvent(eventData);
      showToast("Tạo event thành công!", "success");
      
      // Reset form
      setFormData({
        eventId: "",
        name: "",
        thumbnail: "",
        date: "",
        time: "",
        location: "",
        description: "",
        status: "upcoming",
        totalTickets: "",
        availableTickets: "",
        price: "",
        saleStartTime: "",
      });

      // Redirect to events list after 1 second
      setTimeout(() => {
        router.push("/");
      }, 1000);
    } catch (error: any) {
      showToast(
        error.message || "Tạo event thất bại. Vui lòng thử lại.",
        "error"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-2 text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
        >
          <ArrowLeft className="h-4 w-4" />
          Quay lại trang chủ
        </Link>

        <div className="mx-auto max-w-3xl">
          <Card className="border-2 border-gray-200 shadow-xl dark:border-gray-800">
            <CardHeader>
              <CardTitle className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                Tạo Event Mới
              </CardTitle>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Điền thông tin để tạo event mới
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Event ID */}
                <div>
                  <label
                    htmlFor="eventId"
                    className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Event ID <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="eventId"
                    name="eventId"
                    type="text"
                    value={formData.eventId}
                    onChange={handleChange}
                    required
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-500 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                    placeholder="6"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    ID duy nhất cho event (không được trùng)
                  </p>
                </div>

                {/* Name */}
                <div>
                  <label
                    htmlFor="name"
                    className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Tên Event <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-500 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                    placeholder="Taylor Swift - The Eras Tour"
                  />
                </div>

                {/* Thumbnail */}
                <div>
                  <label
                    htmlFor="thumbnail"
                    className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    <ImageIcon className="mr-2 inline h-4 w-4" />
                    URL Hình ảnh
                  </label>
                  <input
                    id="thumbnail"
                    name="thumbnail"
                    type="url"
                    value={formData.thumbnail}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-500 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                    placeholder="https://images.unsplash.com/..."
                  />
                </div>

                {/* Date & Time */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="date"
                      className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      <Calendar className="mr-2 inline h-4 w-4" />
                      Ngày <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="date"
                      name="date"
                      type="date"
                      value={formData.date}
                      onChange={handleChange}
                      required
                      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="time"
                      className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      <Clock className="mr-2 inline h-4 w-4" />
                      Giờ <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="time"
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
                  <label
                    htmlFor="location"
                    className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    <MapPin className="mr-2 inline h-4 w-4" />
                    Địa điểm <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="location"
                    name="location"
                    type="text"
                    value={formData.location}
                    onChange={handleChange}
                    required
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-500 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                    placeholder="Sân vận động Quốc gia Mỹ Đình, Hà Nội"
                  />
                </div>

                {/* Description */}
                <div>
                  <label
                    htmlFor="description"
                    className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Mô tả
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={4}
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-500 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                    placeholder="Mô tả chi tiết về event..."
                  />
                </div>

                {/* Status */}
                <div>
                  <label
                    htmlFor="status"
                    className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Trạng thái
                  </label>
                  <select
                    id="status"
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
                    <label
                      htmlFor="totalTickets"
                      className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      Tổng số vé <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="totalTickets"
                      name="totalTickets"
                      type="number"
                      min="1"
                      value={formData.totalTickets}
                      onChange={handleChange}
                      required
                      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                      placeholder="50000"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="availableTickets"
                      className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      Vé còn lại
                    </label>
                    <input
                      id="availableTickets"
                      name="availableTickets"
                      type="number"
                      min="0"
                      value={formData.availableTickets}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                      placeholder="50000"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Để trống = Tổng số vé
                    </p>
                  </div>
                  <div>
                    <label
                      htmlFor="price"
                      className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      Giá vé (VND) <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="price"
                      name="price"
                      type="number"
                      min="0"
                      value={formData.price}
                      onChange={handleChange}
                      required
                      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                      placeholder="1500000"
                    />
                  </div>
                </div>

                {/* Sale Start Time */}
                <div>
                  <label
                    htmlFor="saleStartTime"
                    className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Thời gian mở bán (ISO)
                  </label>
                  <input
                    id="saleStartTime"
                    name="saleStartTime"
                    type="datetime-local"
                    value={formData.saleStartTime}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Để trống nếu không có countdown
                  </p>
                </div>

                {/* Submit Button */}
                <div className="flex gap-4 pt-4">
                  <Button
                    type="submit"
                    size="lg"
                    className="flex-1"
                    isLoading={isSubmitting}
                    disabled={isSubmitting}
                  >
                    <Save className="h-5 w-5" />
                    Tạo Event
                  </Button>
                  <Link href="/">
                    <Button type="button" variant="outline" size="lg">
                      Hủy
                    </Button>
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

