import { Event } from "@/types";

// Artist information
export const artistInfo = {
  name: "Taylor Swift",
  bio: "Taylor Swift là một ca sĩ, nhạc sĩ và nhà sản xuất âm nhạc người Mỹ. Với hơn 200 triệu album đã bán ra, cô là một trong những nghệ sĩ bán chạy nhất mọi thời đại. The Eras Tour là tour diễn lớn nhất trong sự nghiệp của cô, tái hiện lại tất cả các 'era' âm nhạc từ sự nghiệp của Taylor.",
  image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1200&h=800&fit=crop",
  accentColor: "from-red-600 via-pink-600 to-purple-600",
};

// Mock data - Chỉ các sự kiện của Taylor Swift
export const mockEvents: Event[] = [
  {
    id: "1",
    name: "Taylor Swift - The Eras Tour",
    thumbnail: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&h=600&fit=crop",
    date: "2024-12-25",
    time: "19:00",
    location: "Sân vận động Quốc gia Mỹ Đình, Hà Nội",
    description: "Buổi biểu diễn đặc biệt của Taylor Swift với các hit từ tất cả các era: Fearless, Red, 1989, Reputation, Lover, Folklore, Evermore, Midnights và nhiều hơn nữa. Trải nghiệm một đêm không thể quên với màn trình diễn kéo dài hơn 3 giờ đồng hồ.",
    status: "on_sale",
    totalTickets: 50000,
    availableTickets: 1250,
    price: 1500000,
    saleStartTime: new Date(Date.now() - 3600000).toISOString(), // Đã mở bán
  },
  {
    id: "2",
    name: "Taylor Swift - The Eras Tour",
    thumbnail: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=600&fit=crop",
    date: "2024-12-26",
    time: "19:00",
    location: "Sân vận động Quốc gia Mỹ Đình, Hà Nội",
    description: "Đêm thứ hai của The Eras Tour tại Hà Nội. Cơ hội thứ hai để trải nghiệm tất cả các era âm nhạc của Taylor Swift trong một buổi biểu diễn hoành tráng.",
    status: "on_sale",
    totalTickets: 50000,
    availableTickets: 3200,
    price: 1500000,
    saleStartTime: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: "3",
    name: "Taylor Swift - The Eras Tour",
    thumbnail: "https://images.unsplash.com/photo-1501612780327-45045538702b?w=800&h=600&fit=crop",
    date: "2025-01-10",
    time: "19:30",
    location: "Sân vận động Thống Nhất, TP.HCM",
    description: "The Eras Tour đến với TP.HCM! Trải nghiệm tất cả các era từ Taylor Swift trong một buổi biểu diễn đầy cảm xúc và mãn nhãn.",
    status: "upcoming",
    totalTickets: 45000,
    availableTickets: 45000,
    price: 1800000,
    saleStartTime: new Date(Date.now() + 3600000).toISOString(), // Mở bán sau 1 giờ
  },
  {
    id: "4",
    name: "Taylor Swift - The Eras Tour",
    thumbnail: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&h=600&fit=crop",
    date: "2025-01-11",
    time: "19:30",
    location: "Sân vận động Thống Nhất, TP.HCM",
    description: "Đêm thứ hai tại TP.HCM. Đừng bỏ lỡ cơ hội được sống trong từng khoảnh khắc của các era âm nhạc đáng nhớ nhất.",
    status: "upcoming",
    totalTickets: 45000,
    availableTickets: 45000,
    price: 1800000,
    saleStartTime: new Date(Date.now() + 7200000).toISOString(), // Mở bán sau 2 giờ
  },
  {
    id: "5",
    name: "Taylor Swift - The Eras Tour",
    thumbnail: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=600&fit=crop",
    date: "2025-02-14",
    time: "20:00",
    location: "Sân vận động Quốc gia Mỹ Đình, Hà Nội",
    description: "Đêm Valentine đặc biệt với Taylor Swift! Trải nghiệm The Eras Tour trong một đêm lãng mạn và đầy cảm xúc.",
    status: "sold_out",
    totalTickets: 50000,
    availableTickets: 0,
    price: 2000000,
    saleStartTime: new Date(Date.now() - 86400000).toISOString(),
  },
];

export function getEventById(id: string): Event | undefined {
  return mockEvents.find((event) => event.id === id);
}

