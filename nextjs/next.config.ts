import type { NextConfig } from "next";
import path from "path";
import { loadEnvConfig } from "@next/env";

// Use Next's official env loader so .env.local is loaded the same way Next does.
// Pass directory of this config file (nextjs folder) so it works regardless of cwd.
const projectDir = path.resolve(__dirname);
loadEnvConfig(projectDir);

const nextConfig: NextConfig = {
  // Explicitly pass Firebase env vars so they are inlined into the client bundle.
  // Best practice: ensures NEXT_PUBLIC_* are available on the client even if load order varies.
  env: {
    NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? "",
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? "",
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "",
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? "",
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? "",
    NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? "",
  },
};

export default nextConfig;
