import { Amplify } from "aws-amplify";

// Get environment variables
const userPoolId = process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID;
const userPoolClientId = process.env.NEXT_PUBLIC_COGNITO_USER_POOL_CLIENT_ID;
const region = process.env.NEXT_PUBLIC_AWS_REGION || "ap-southeast-1";

// Validate required environment variables
if (!userPoolId || !userPoolClientId) {
  console.warn(
    "⚠️ AWS Cognito configuration missing. Please set NEXT_PUBLIC_COGNITO_USER_POOL_ID and NEXT_PUBLIC_COGNITO_USER_POOL_CLIENT_ID in your .env.local file"
  );
}

// Cognito configuration
// Lấy từ environment variables để dễ deploy lên ECS
const amplifyConfig = {
  Auth: {
    Cognito: {
      userPoolId: userPoolId || "",
      userPoolClientId: userPoolClientId || "",
      region: region,
      loginWith: {
        email: true,
        username: false,
        phone: false,
      },
    },
  },
};

// Initialize Amplify only if config is valid
export function configureAmplify() {
  if (typeof window === "undefined") {
    return; // Server-side, skip
  }

  if (!userPoolId || !userPoolClientId) {
    console.error(
      "❌ Cannot configure Amplify: Missing Cognito configuration. Please check your environment variables."
    );
    return;
  }

  try {
    Amplify.configure(amplifyConfig);
    console.log("✅ Amplify configured successfully");
  } catch (error) {
    console.error("❌ Error configuring Amplify:", error);
  }
}

// Auto-configure on import (client-side only)
if (typeof window !== "undefined") {
  configureAmplify();
}

export { amplifyConfig };

