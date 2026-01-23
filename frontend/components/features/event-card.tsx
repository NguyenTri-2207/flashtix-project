import Link from "next/link";
import Image from "next/image";
import { Calendar, MapPin, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Event } from "@/types";
import { cn } from "@/lib/utils";

interface EventCardProps {
  event: Event;
}

const statusLabels: Record<Event["status"], string> = {
  upcoming: "Sắp diễn ra",
  on_sale: "Đang mở bán",
  sold_out: "Hết vé",
};

export function EventCard({ event }: EventCardProps) {
  return (
    <Link href={`/events/${event.id}`}>
      <Card className="group h-full overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-lg">
        <div className="relative h-48 w-full overflow-hidden">
          <Image
            src={event.thumbnail}
            alt={event.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-110"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <div className="absolute top-3 right-3">
            <Badge variant={event.status}>{statusLabels[event.status]}</Badge>
          </div>
        </div>
        <CardContent className="p-5">
          <h3 className="mb-3 line-clamp-2 text-lg font-bold text-gray-900 dark:text-gray-100">
            {event.name}
          </h3>
          <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>{new Date(event.date).toLocaleDateString("vi-VN")}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>{event.time}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span className="line-clamp-1">{event.location}</span>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <span className="text-lg font-bold text-red-600">
              {event.price.toLocaleString("vi-VN")} đ
            </span>
            {event.status === "on_sale" && (
              <span className="text-xs text-gray-500">
                Còn {event.availableTickets.toLocaleString("vi-VN")} vé
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

