"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Music, Mail, Lock, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/lib/auth/auth-context";
import { Skeleton } from "@/components/ui/skeleton";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get("returnUrl");

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      if (returnUrl) {
        router.push(decodeURIComponent(returnUrl));
      } else {
        router.push("/");
      }
    }
  }, [isAuthenticated, isLoading, returnUrl, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await login(email, password);
      // After successful login, redirect will be handled by auth context
      // But we can also handle returnUrl here if needed
      if (returnUrl) {
        setTimeout(() => {
          router.push(decodeURIComponent(returnUrl));
        }, 100);
      }
    } catch (error) {
      // Error đã được xử lý trong auth context
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-red-50 to-pink-50 dark:from-gray-900 dark:to-gray-950">
        <Card className="w-full max-w-md">
          <CardContent className="p-8">
            <Skeleton className="mb-4 h-12 w-full" />
            <Skeleton className="mb-4 h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-red-50 to-pink-50 dark:from-gray-900 dark:to-gray-950">
      <div className="container mx-auto px-4 py-16">
        <div className="mx-auto max-w-md">
          {/* Back to home */}
          <Link
            href="/"
            className="mb-6 inline-flex items-center gap-2 text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
          >
            <ArrowLeft className="h-4 w-4" />
            Quay lại trang chủ
          </Link>

          <Card className="border-2 border-gray-200 shadow-xl dark:border-gray-800">
            <CardHeader className="space-y-4 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-red-600 to-pink-600">
                <Music className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                Đăng nhập
              </CardTitle>
              <p className="text-gray-600 dark:text-gray-400">
                Đăng nhập để săn vé The Eras Tour
              </p>
              {returnUrl && (
                <p className="text-sm text-blue-600 dark:text-blue-400">
                  Sau khi đăng nhập, bạn sẽ được chuyển về trang trước đó
                </p>
              )}
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full rounded-lg border border-gray-300 bg-white py-3 pl-10 pr-4 text-gray-900 placeholder-gray-500 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                      placeholder="your@email.com"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Mật khẩu
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                    <input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full rounded-lg border border-gray-300 bg-white py-3 pl-10 pr-4 text-gray-900 placeholder-gray-500 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  isLoading={isSubmitting}
                  disabled={isSubmitting}
                >
                  Đăng nhập
                </Button>
              </form>

              <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
                <p>
                  Chưa có tài khoản?{" "}
                  <Link
                    href="/signup"
                    className="font-semibold text-red-600 hover:text-red-700 dark:text-red-400"
                  >
                    Đăng ký ngay
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

