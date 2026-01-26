"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Calendar, Plus, List, Ticket, Home } from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Danh sách Events", href: "/dashboard/events", icon: List },
  { name: "Tạo Event", href: "/dashboard/events/new", icon: Plus },
  { name: "Danh sách Bookings", href: "/dashboard/bookings", icon: Ticket },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <div className="flex h-full flex-col">
          {/* Logo/Header */}
          <div className="flex h-16 items-center border-b border-gray-200 px-6 dark:border-gray-800">
            <Link href="/dashboard" className="flex items-center gap-2">
              <Calendar className="h-6 w-6 text-red-600" />
              <span className="text-xl font-bold text-gray-900 dark:text-gray-100">
                Dashboard
              </span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-3 py-4">
            {navigation.map((item) => {
              const isActive = pathname === item.href || 
                (item.href !== "/dashboard" && pathname?.startsWith(item.href));
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400"
                      : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="border-t border-gray-200 p-4 dark:border-gray-800">
            <Link
              href="/"
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
            >
              <Home className="h-4 w-4" />
              Về trang chủ
            </Link>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="pl-64">
        <main className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}

