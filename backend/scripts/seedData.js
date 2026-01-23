/**
 * Script to seed initial data into DynamoDB
 * Run: node scripts/seedData.js
 */

import { docClient, TABLES } from "../src/config/dynamodb.js";
import * as DynamoDBLib from "@aws-sdk/lib-dynamodb";
import dotenv from "dotenv";

const { PutCommand } = DynamoDBLib;

dotenv.config();

const events = [
  {
    eventId: "1",
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
    saleStartTime: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    eventId: "2",
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
    eventId: "3",
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
    saleStartTime: new Date(Date.now() + 3600000).toISOString(),
  },
  {
    eventId: "4",
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
    saleStartTime: new Date(Date.now() + 7200000).toISOString(),
  },
  {
    eventId: "5",
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

async function seedEvents() {
  console.log("🌱 Seeding events...");

  for (const event of events) {
    try {
      const command = new PutCommand({
        TableName: TABLES.EVENTS,
        Item: event,
      });

      await docClient.send(command);
      console.log(`✅ Seeded event: ${event.name} (${event.eventId})`);
    } catch (error) {
      console.error(`❌ Error seeding event ${event.eventId}:`, error.message);
    }
  }

  console.log(`\n✨ Seeded ${events.length} events successfully!`);
}

// Run seed
seedEvents().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});

