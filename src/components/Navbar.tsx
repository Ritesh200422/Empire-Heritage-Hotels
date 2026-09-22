'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import { useState, useEffect } from 'react';

const appName = process.env.NEXT_PUBLIC_APP_NAME || 'Empire Heritage Hotels';

export default function Navbar() {
  const pathname = usePathname();
  const { items } = useCartStore();
  const { email, logout } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => setMounted(true), []);

  const totalCartItems = items.reduce((sum, item) => sum + item.quantity, 0);

  const navLinks = [
    { name: 'Stay', path: '/stay' },
    { name: 'Dine', path: '/dine' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur shadow-sm text-[#4a1c1c]">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/empire-heritage-logo.png"
            alt={`${appName} logo`}
            width={42}
            height={42}
            className="h-10 w-10 object-contain"
            priority
          />
          <span className="font-serif font-bold text-xl text-[#602323]">{appName}</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6 font-medium">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              href={link.path}
              className={`hover:text-[#b8860b] transition-colors ${
                pathname === link.path ? 'text-[#b8860b] underline underline-offset-4' : ''
              }`}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <Link href="/cart" className="relative p-2 text-[#4a1c1c] hover:text-[#b8860b]">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
            {mounted && totalCartItems > 0 && (
              <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-[#b8860b] rounded-full">
                {totalCartItems}
              </span>
            )}
          </Link>
          
          <div className="hidden md:block">
            {mounted && email ? (
              <div className="flex items-center gap-3">
                <span className="text-sm">Signed in as {email}</span>
                <button onClick={logout} className="text-sm font-medium hover:underline text-[#b8860b]">Logout</button>
              </div>
            ) : (
              <Link href="/login" className="text-sm font-medium hover:underline text-[#b8860b]">
                Login
              </Link>
            )}
          </div>

          <button
            className="md:hidden p-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t p-4 flex flex-col gap-4">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              href={link.path}
              className="text-[#4a1c1c] font-medium"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {link.name}
            </Link>
          ))}
          <hr />
          {mounted && email ? (
            <div className="flex flex-col gap-2">
              <span className="text-sm">Signed in as {email}</span>
              <button onClick={() => { logout(); setIsMobileMenuOpen(false); }} className="text-left text-sm font-medium hover:underline text-[#b8860b]">Logout</button>
            </div>
          ) : (
            <Link href="/login" className="text-sm font-medium hover:underline text-[#b8860b]" onClick={() => setIsMobileMenuOpen(false)}>
              Login
            </Link>
          )}
        </div>
      )}
    </header>
  );
}
