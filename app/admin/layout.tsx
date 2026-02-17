import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Panel - LastRunX",
  description: "LastRunX Admin Dashboard - Manage tournaments, users, and platform settings",
};

export default function AdminRootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
