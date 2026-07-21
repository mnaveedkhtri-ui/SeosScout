import type { Metadata } from "next";
import { LoginClient } from "./login-client";

export const metadata: Metadata = {
  title: "Log In or Sign Up",
  description: "Log in to your SiteScout account to view your audit history and dashboard.",
  robots: { index: false, follow: true },
};

export default function LoginPage() {
  return <LoginClient />;
}
