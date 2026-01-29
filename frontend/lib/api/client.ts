/**
 * API Client for FlashTix Backend
 * Handles all API calls to backend
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://ticket.theblogreviews.com/api/v1";

interface ApiError {
  error: string;
  message: string;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const config: RequestInit = {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    };

    // Add auth token if available
    if (typeof window !== "undefined") {
      const session = await this.getAuthToken();
      if (session) {
        config.headers = {
          ...config.headers,
          Authorization: `Bearer ${session}`,
        };
      }
    }

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const error: ApiError = await response.json();
        throw new Error(error.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Network error");
    }
  }

  private async getAuthToken(): Promise<string | null> {
    try {
      // Import dynamically to avoid SSR issues
      const { fetchAuthSession } = await import("aws-amplify/auth");
      const session = await fetchAuthSession();
      return session.tokens?.idToken?.toString() || null;
    } catch (error) {
      return null;
    }
  }

  // Health check
  async health() {
    return this.request<{ status: string; timestamp: string }>("/health");
  }

  // Events
  async getEvents() {
    return this.request<Array<{
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
    }>>("/events");
  }

  async getEventById(id: string) {
    return this.request<{
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
    }>(`/events/${id}`);
  }

  async createEvent(eventData: {
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
    saleStartTime?: string;
  }) {
    return this.request<{
      success: boolean;
      event: any;
    }>("/events", {
      method: "POST",
      body: JSON.stringify(eventData),
    });
  }

  async updateEvent(id: string, eventData: Partial<{
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
    saleStartTime?: string;
  }>) {
    return this.request<{
      success: boolean;
      event: any;
    }>(`/events/${id}`, {
      method: "PUT",
      body: JSON.stringify(eventData),
    });
  }

  async deleteEvent(id: string) {
    return this.request<{
      success: boolean;
      message: string;
    }>(`/events/${id}`, {
      method: "DELETE",
    });
  }

  // Bookings
  async createBooking(eventId: string) {
    return this.request<{
      success: boolean;
      booking: {
        bookingId: string;
        bookingReference: string;
        eventId: string;
        eventName: string;
        createdAt: string;
      };
    }>("/bookings", {
      method: "POST",
      body: JSON.stringify({ eventId }),
    });
  }

  async getBookings() {
    return this.request<Array<{
      bookingId: string;
      eventId: string;
      userId: string;
      createdAt: string;
    }>>("/bookings");
  }

  // Admin
  async resetDatabase() {
    return this.request<{
      success: boolean;
      message: string;
      deletedBookings: number;
      resetEvents: number;
    }>("/admin/reset", {
      method: "POST",
    });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);

