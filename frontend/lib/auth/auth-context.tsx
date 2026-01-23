"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { signIn, signOut, getCurrentUser, fetchAuthSession } from "aws-amplify/auth";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/toast-provider";

interface User {
  userId: string;
  email?: string;
  username?: string;
  name?: string; // Full Name from signup
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { showToast } = useToast();

  const checkAuth = async () => {
    try {
      // Check if Amplify is configured
      const userPoolId = process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID;
      if (!userPoolId) {
        console.warn("Cognito not configured, skipping auth check");
        setUser(null);
        setIsLoading(false);
        return;
      }

      const currentUser = await getCurrentUser();
      // Fetch user attributes to get email and name
      const session = await fetchAuthSession();
      const tokenPayload = session.tokens?.idToken?.payload as any;
      const email = tokenPayload?.email as string | undefined;
      const name = tokenPayload?.name as string | undefined;
      
      setUser({
        userId: currentUser.userId,
        username: currentUser.username,
        email: email || currentUser.username,
        name: name,
      });
    } catch (error: any) {
      // Silently fail if user is not authenticated or config is missing
      if (error?.name !== "UserUnauthenticatedException") {
        console.warn("Auth check failed:", error?.message || error);
      }
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      // Check if Amplify is configured
      const userPoolId = process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID;
      if (!userPoolId) {
        const errorMsg = "Cognito chưa được cấu hình. Vui lòng kiểm tra environment variables.";
        showToast(errorMsg, "error");
        throw new Error(errorMsg);
      }

      setIsLoading(true);
      const { isSignedIn } = await signIn({
        username: email,
        password,
      });

      if (isSignedIn) {
        const currentUser = await getCurrentUser();
        // Fetch session to get email and name from token
        const session = await fetchAuthSession();
        const tokenPayload = session.tokens?.idToken?.payload as any;
        const userEmail = (tokenPayload?.email as string) || email;
        const userName = tokenPayload?.name as string | undefined;
        
        setUser({
          userId: currentUser.userId,
          email: userEmail,
          username: currentUser.username,
          name: userName,
        });
        showToast("Đăng nhập thành công!", "success");
        // Redirect will be handled by login page if there's returnUrl
        // Otherwise redirect to home
        router.push("/");
      }
    } catch (error: any) {
      const errorMessage =
        error.message || "Đăng nhập thất bại. Vui lòng thử lại.";
      showToast(errorMessage, "error");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await signOut();
      setUser(null);
      showToast("Đã đăng xuất thành công", "success");
      router.push("/login");
    } catch (error: any) {
      showToast("Đăng xuất thất bại", "error");
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}

