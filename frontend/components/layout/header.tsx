"use client";

import Link from "next/link";
import { Music } from "lucide-react";
import { UserMenu } from "./user-menu";

export function Header() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-200 bg-white/80 backdrop-blur-sm dark:border-gray-800 dark:bg-gray-900/80">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-red-600 to-pink-600">
            <Music className="h-6 w-6 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent leading-tight">
              Taylor Swift
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400 leading-tight">
              The Eras Tour
            </span>
          </div>
        </Link>
        <nav className="flex items-center gap-6">
          <Link
            href="/"
            className="hidden text-sm font-medium text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 md:block"
          >
            Shows
          </Link>
          <Link
            href="/admin"
            className="hidden text-sm font-medium text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 md:block"
          >
            Admin
          </Link>
          <UserMenu />
        </nav>
      </div>
    </header>
  );
}

