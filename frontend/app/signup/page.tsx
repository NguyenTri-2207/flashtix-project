"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Music, Mail, Lock, ArrowLeft, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { signUp, confirmSignUp } from "aws-amplify/auth";
import { useToast } from "@/components/ui/toast-provider";

// Form fields configuration
const formFields = {
  signUp: {
    name: {
      label: "Full Name",
      placeholder: "Nhập họ và tên của bạn",
      required: true,
      order: 1,
    },
    email: {
      label: "Email",
      placeholder: "your@email.com",
      required: true,
      order: 2,
    },
    password: {
      label: "Mật khẩu",
      placeholder: "Tối thiểu 8 ký tự",
      required: true,
      order: 3,
    },
  },
};

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [confirmationCode, setConfirmationCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [needsConfirmation, setNeedsConfirmation] = useState(false);
  const router = useRouter();
  const { showToast } = useToast();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (password !== confirmPassword) {
      showToast("Mật khẩu không khớp", "error");
      setIsSubmitting(false);
      return;
    }

    if (password.length < 8) {
      showToast("Mật khẩu phải có ít nhất 8 ký tự", "error");
      setIsSubmitting(false);
      return;
    }

    if (!name.trim()) {
      showToast("Vui lòng nhập họ và tên", "error");
      setIsSubmitting(false);
      return;
    }

    try {
      const { isSignUpComplete, userId, nextStep } = await signUp({
        username: email,
        password,
        options: {
          userAttributes: {
            email,
            name: name.trim(), // Full Name attribute
          },
        },
      });

      if (isSignUpComplete) {
        showToast("Đăng ký thành công! Đang chuyển đến trang đăng nhập...", "success");
        setTimeout(() => router.push("/login"), 2000);
      } else if (nextStep.signUpStep === "CONFIRM_SIGN_UP") {
        setNeedsConfirmation(true);
        showToast("Vui lòng kiểm tra email để lấy mã xác nhận", "info");
      }
    } catch (error: any) {
      showToast(
        error.message || "Đăng ký thất bại. Vui lòng thử lại.",
        "error"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { isSignUpComplete } = await confirmSignUp({
        username: email,
        confirmationCode,
      });

      if (isSignUpComplete) {
        showToast("Xác nhận thành công! Đang chuyển đến trang đăng nhập...", "success");
        setTimeout(() => router.push("/login"), 2000);
      }
    } catch (error: any) {
      showToast(
        error.message || "Xác nhận thất bại. Vui lòng thử lại.",
        "error"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (needsConfirmation) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-red-50 to-pink-50 dark:from-gray-900 dark:to-gray-950">
        <div className="container mx-auto px-4 py-16">
          <div className="mx-auto max-w-md">
            <Link
              href="/login"
              className="mb-6 inline-flex items-center gap-2 text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
            >
              <ArrowLeft className="h-4 w-4" />
              Quay lại đăng nhập
            </Link>

            <Card className="border-2 border-gray-200 shadow-xl dark:border-gray-800">
              <CardHeader className="space-y-4 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-red-600 to-pink-600">
                  <Mail className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                  Xác nhận email
                </CardTitle>
                <p className="text-gray-600 dark:text-gray-400">
                  Nhập mã xác nhận đã gửi đến {email}
                </p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleConfirm} className="space-y-4">
                  <div>
                    <label
                      htmlFor="code"
                      className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      Mã xác nhận
                    </label>
                    <input
                      id="code"
                      type="text"
                      value={confirmationCode}
                      onChange={(e) => setConfirmationCode(e.target.value)}
                      required
                      className="w-full rounded-lg border border-gray-300 bg-white py-3 px-4 text-gray-900 placeholder-gray-500 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                      placeholder="123456"
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    isLoading={isSubmitting}
                    disabled={isSubmitting}
                  >
                    Xác nhận
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-red-50 to-pink-50 dark:from-gray-900 dark:to-gray-950">
      <div className="container mx-auto px-4 py-16">
        <div className="mx-auto max-w-md">
          <Link
            href="/login"
            className="mb-6 inline-flex items-center gap-2 text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
          >
            <ArrowLeft className="h-4 w-4" />
            Quay lại đăng nhập
          </Link>

          <Card className="border-2 border-gray-200 shadow-xl dark:border-gray-800">
            <CardHeader className="space-y-4 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-red-600 to-pink-600">
                <Music className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                Đăng ký
              </CardTitle>
              <p className="text-gray-600 dark:text-gray-400">
                Tạo tài khoản để săn vé The Eras Tour
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSignup} className="space-y-4">
                {/* Full Name Field - Order 1 */}
                <div>
                  <label
                    htmlFor="name"
                    className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    {formFields.signUp.name.label}
                    {formFields.signUp.name.required && (
                      <span className="ml-1 text-red-500">*</span>
                    )}
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                    <input
                      id="name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required={formFields.signUp.name.required}
                      className="w-full rounded-lg border border-gray-300 bg-white py-3 pl-10 pr-4 text-gray-900 placeholder-gray-500 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                      placeholder={formFields.signUp.name.placeholder}
                    />
                  </div>
                </div>

                {/* Email Field - Order 2 */}
                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    {formFields.signUp.email.label}
                    {formFields.signUp.email.required && (
                      <span className="ml-1 text-red-500">*</span>
                    )}
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required={formFields.signUp.email.required}
                      className="w-full rounded-lg border border-gray-300 bg-white py-3 pl-10 pr-4 text-gray-900 placeholder-gray-500 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                      placeholder={formFields.signUp.email.placeholder}
                    />
                  </div>
                </div>

                {/* Password Field - Order 3 */}
                <div>
                  <label
                    htmlFor="password"
                    className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    {formFields.signUp.password.label}
                    {formFields.signUp.password.required && (
                      <span className="ml-1 text-red-500">*</span>
                    )}
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                    <input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required={formFields.signUp.password.required}
                      minLength={8}
                      className="w-full rounded-lg border border-gray-300 bg-white py-3 pl-10 pr-4 text-gray-900 placeholder-gray-500 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                      placeholder={formFields.signUp.password.placeholder}
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Xác nhận mật khẩu
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                    <input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      minLength={8}
                      className="w-full rounded-lg border border-gray-300 bg-white py-3 pl-10 pr-4 text-gray-900 placeholder-gray-500 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                      placeholder="Nhập lại mật khẩu"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  isLoading={isSubmitting}
                  disabled={isSubmitting}
                >
                  Đăng ký
                </Button>
              </form>

              <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
                <p>
                  Đã có tài khoản?{" "}
                  <Link
                    href="/login"
                    className="font-semibold text-red-600 hover:text-red-700 dark:text-red-400"
                  >
                    Đăng nhập ngay
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

