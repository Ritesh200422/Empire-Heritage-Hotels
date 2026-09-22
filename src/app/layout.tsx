import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Empire Heritage Hotels - Royal Guard AI",
  description: "Royal Guard AI is the hotel guest assistant for Empire Heritage Hotels. Ask about rooms, amenities, policies, and check availability.",
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/favicon.png",
  },
};

import Navbar from "@/components/Navbar";
import ChatWidget from "@/components/ChatWidget";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#fcfbf8]">
        <Navbar />
        <main className="flex-1">{children}</main>
        <footer className="bg-[#4a1c1c] text-white py-8 mt-auto">
          <div className="container mx-auto px-4 text-center">
            <p>&copy; {new Date().getFullYear()} {process.env.NEXT_PUBLIC_APP_NAME || 'Empire Heritage Hotels'}. All rights reserved.</p>
          </div>
        </footer>
        <ChatWidget />
      </body>
    </html>
  );
}
