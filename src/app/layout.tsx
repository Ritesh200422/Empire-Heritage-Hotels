import type { Metadata } from "next";
import Image from "next/image";
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
        <footer className="bg-[#351515] text-white mt-auto">
          <div className="container mx-auto px-4 py-14">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
              <div className="lg:col-span-2">
                <div className="flex items-center gap-3 mb-5">
                  <Image src="/empire-heritage-logo.png" alt="" width={48} height={48} className="h-12 w-12 object-contain" />
                  <div>
                    <p className="font-serif text-2xl font-bold text-[#f8e8c1]">Empire Heritage Hotels</p>
                    <p className="text-xs uppercase tracking-[0.18em] text-[#d8b35e]">A stay worth remembering</p>
                  </div>
                </div>
                <p className="max-w-md text-sm leading-relaxed text-slate-300">
                  Thoughtful hospitality, restful rooms, and the flavours of our heritage—crafted
                  for guests who value comfort, character, and genuine service.
                </p>
              </div>
              <div>
                <h2 className="font-semibold text-[#f8e8c1] mb-4">Explore</h2>
                <div className="flex flex-col gap-3 text-sm text-slate-300">
                  <a href="/stay" className="hover:text-white transition-colors">Rooms & Suites</a>
                  <a href="/dine" className="hover:text-white transition-colors">Our Restaurant</a>
                  <a href="/about" className="hover:text-white transition-colors">Our Story</a>
                  <a href="/contact" className="hover:text-white transition-colors">Contact Us</a>
                </div>
              </div>
              <div>
                <h2 className="font-semibold text-[#f8e8c1] mb-4">Guest services</h2>
                <div className="flex flex-col gap-3 text-sm text-slate-300">
                  <p>Check-in: 2:00 PM</p>
                  <p>Check-out: 11:00 AM</p>
                  <p>Royal Guard AI: Always available</p>
                  <p>24/7 front desk assistance</p>
                </div>
              </div>
            </div>
            <div className="mt-12 border-t border-white/15 pt-6 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-slate-400">
              <p>&copy; {new Date().getFullYear()} {process.env.NEXT_PUBLIC_APP_NAME || 'Empire Heritage Hotels'}. All rights reserved.</p>
              <p>Designed with care for memorable stays.</p>
              <p>Powered by Royal Guard AI</p>
            </div>
          </div>
        </footer>
        <ChatWidget />
      </body>
    </html>
  );
}
