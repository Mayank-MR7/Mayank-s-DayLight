import type { Metadata } from "next";
import { AuthProvider } from "@/features/auth/auth-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Daylight — Your personal planner",
  description: "A calmer way to plan your days, goals, and music lessons.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body><AuthProvider>{children}</AuthProvider></body></html>;
}
