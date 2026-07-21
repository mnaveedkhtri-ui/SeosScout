import type { Metadata } from "next";
import { SettingsClient } from "./settings-client";

export const metadata: Metadata = {
  title: "Account Settings",
  description: "Manage your SiteScout profile, notifications, and audit history.",
  robots: { index: false, follow: false },
};

export default function SettingsPage() {
  return <SettingsClient />;
}
