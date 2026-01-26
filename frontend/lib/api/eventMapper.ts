/**
 * Helper functions to map backend event data to frontend Event type
 */

import { Event } from "@/types";

/**
 * Backend event format (from API)
 */
export interface BackendEvent {
  eventId: string;
  name: string;
  thumbnail: string;
  date: string;
  time: string;
  location: string;
  description: string;
  status: "upcoming" | "on_sale" | "sold_out";
  totalTickets: number;
  availableTickets: number;
  price: number;
  saleStartTime?: string | null;
}

/**
 * Map backend event to frontend Event type
 */
export function mapBackendEventToEvent(backendEvent: BackendEvent): Event {
  return {
    id: backendEvent.eventId,
    name: backendEvent.name,
    thumbnail: backendEvent.thumbnail,
    date: backendEvent.date,
    time: backendEvent.time,
    location: backendEvent.location,
    description: backendEvent.description,
    status: backendEvent.status,
    totalTickets: backendEvent.totalTickets,
    availableTickets: backendEvent.availableTickets,
    price: backendEvent.price,
    saleStartTime: backendEvent.saleStartTime || undefined,
  };
}

/**
 * Map array of backend events to frontend Event array
 */
export function mapBackendEventsToEvents(backendEvents: BackendEvent[]): Event[] {
  return backendEvents.map(mapBackendEventToEvent);
}

