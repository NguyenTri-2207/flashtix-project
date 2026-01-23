"use client";

import { useEffect } from "react";
import { configureAmplify } from "@/lib/auth/config";

/**
 * Client-side component to ensure Amplify is configured
 * This runs only on the client side after hydration
 */
export function AmplifyProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Ensure Amplify is configured on client-side
    configureAmplify();
  }, []);

  return <>{children}</>;
}

