export type EventStatus = "upcoming" | "on_sale" | "sold_out";

export type ButtonState = "wait" | "active" | "processing" | "sold_out";

export interface Event {
  id: string;
  name: string;
  thumbnail: string;
  date: string;
  time: string;
  location: string;
  description: string;
  status: EventStatus;
  totalTickets: number;
  availableTickets: number;
  price: number;
  saleStartTime?: string; // ISO string for countdown
}

export interface Booking {
  id: string;
  eventId: string;
  eventName: string;
  bookingReference: string;
  ticketCount: number;
  totalPrice: number;
  createdAt: string;
}

