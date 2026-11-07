'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Menu,
  X,
  User,
  Settings,
  LogOut,
  Bell,
  ChevronDown,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { BRAND_NAME } from '@/lib/brand';

interface NavItem {
  label: string;
  href: string;
  badge?: number;
}

export default function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
    setDropdownOpen(false);
  }, [pathname]);

  const studentLinks: NavItem[] = [
    { label: 'Bosh sahifa', href: '/' },
    { label: 'Mening profilim', href: '/profile' },
    { label: 'CV yaratish', href: '/cv' },
    { label: 'CVni tekshirish', href: '/cv-review' },
    { label: 'Menga mos kasblar', href: '/career' },
    { label: 'Loyihalar', href: '/projects' },
  ];

  const adminLinks: NavItem[] = [
    { label: 'Bosh sahifa', href: '/' },
    { label: 'Boshqaruv', href: '/admin' },
  ];

  const guestLinks: NavItem[] = [{ label: 'Bosh sahifa', href: '/' }];

  let navItems: NavItem[];
  if (!user) {
    navItems = guestLinks;
  } else if (user.role === 'ADMIN') {
    navItems = adminLinks;
  } else {
    navItems = studentLinks;
  }

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  const handleLogout = async () => {
    setDropdownOpen(false);
    await logout();
    router.push('/');
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
      <nav
        className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
        aria-label="Asosiy navigatsiya"
      >
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-baseline gap-2 shrink-0">
            <span className="text-xl font-bold text-burgundy-800 tracking-tight">
              {BRAND_NAME}
            </span>
            <span className="hidden sm:inline text-xs text-slate-500 font-medium">
              Career Center
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive(item.href)
                    ? 'text-burgundy-700 bg-burgundy-50'
                    : 'text-slate-600 hover:text-burgundy-700 hover:bg-slate-50'
                }`}
              >
                {item.label}
              </Link>
            ))}

            {/* Notifications bell for student */}
            {user && user.role === 'STUDENT' && (
              <Link
                href="/notifications"
                className={`relative px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/notifications')
                    ? 'text-burgundy-700 bg-burgundy-50'
                    : 'text-slate-600 hover:text-burgundy-700 hover:bg-slate-50'
                }`}
                aria-label="Bildirishnomalar"
              >
                <Bell className="h-5 w-5" />
                {user.unreadNotifications && user.unreadNotifications > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                    {user.unreadNotifications > 99
                      ? '99+'
                      : user.unreadNotifications}
                  </span>
                )}
              </Link>
            )}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {user ? (
              /* User dropdown */
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                  aria-expanded={dropdownOpen}
                  aria-haspopup="true"
                  aria-label="Foydalanuvchi menyusi"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-burgundy-100 text-burgundy-700 font-semibold text-sm">
                    {user.name?.[0]?.toUpperCase() ?? 'U'}
                  </div>
                  <span className="hidden sm:inline max-w-[120px] truncate">
                    {user.name}
                  </span>
                  <ChevronDown
                    className={`h-4 w-4 text-slate-400 transition-transform ${
                      dropdownOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {dropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-56 rounded-lg bg-white shadow-lg ring-1 ring-slate-200 py-1 z-50"
                    role="menu"
                    aria-orientation="vertical"
                  >
                    <div className="px-4 py-3 border-b border-slate-100">
                      <p className="text-sm font-medium text-slate-900 truncate">
                        {user.name}
                      </p>
                      <p className="text-xs text-slate-500 truncate">
                        {user.email}
                      </p>
                    </div>
                    <Link
                      href="/profile"
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                      role="menuitem"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <User className="h-4 w-4 text-slate-400" />
                      Profilim
                    </Link>
                    <Link
                      href="/settings"
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                      role="menuitem"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <Settings className="h-4 w-4 text-slate-400" />
                      Sozlamalar
                    </Link>
                    <div className="border-t border-slate-100 mt-1">
                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        role="menuitem"
                      >
                        <LogOut className="h-4 w-4" />
                        Chiqish
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Guest buttons */
              <div className="hidden md:flex items-center gap-2">
                <Link
                  href="/login"
                  className="rounded-lg px-4 py-2 text-sm font-medium text-burgundy-700 hover:bg-burgundy-50 transition-colors"
                >
                  Kirish
                </Link>
                <Link
                  href="/register"
                  className="rounded-lg bg-burgundy-700 px-4 py-2 text-sm font-medium text-white hover:bg-burgundy-800 transition-colors"
                >
                  Ro&apos;yxatdan o&apos;tish
                </Link>
              </div>
            )}

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden rounded-lg p-2 text-slate-600 hover:bg-slate-50 transition-colors"
              aria-expanded={mobileOpen}
              aria-label={mobileOpen ? 'Menyuni yopish' : 'Menyuni ochish'}
            >
              {mobileOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile slide-out */}
      {mobileOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/20 md:hidden"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
          {/* Panel */}
          <div className="fixed inset-y-0 right-0 z-50 w-72 bg-white shadow-xl md:hidden overflow-y-auto">
            <div className="flex items-center justify-between px-4 h-16 border-b border-slate-200">
              <span className="text-lg font-bold text-burgundy-800">
                {BRAND_NAME}
              </span>
              <button
                onClick={() => setMobileOpen(false)}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-50"
                aria-label="Menyuni yopish"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="px-2 py-4 space-y-1" aria-label="Mobil navigatsiya">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                    isActive(item.href)
                      ? 'text-burgundy-700 bg-burgundy-50'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {item.label}
                </Link>
              ))}

              {user && user.role === 'STUDENT' && (
                <Link
                  href="/notifications"
                  className={`flex items-center justify-between rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                    isActive('/notifications')
                      ? 'text-burgundy-700 bg-burgundy-50'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span>Bildirishnomalar</span>
                  {user.unreadNotifications && user.unreadNotifications > 0 && (
                    <span className="flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-red-500 px-1.5 text-[11px] font-bold text-white">
                      {user.unreadNotifications > 99
                        ? '99+'
                        : user.unreadNotifications}
                    </span>
                  )}
                </Link>
              )}
            </nav>

            {!user && (
              <div className="px-4 py-4 space-y-2 border-t border-slate-200 mt-2">
                <Link
                  href="/login"
                  className="block w-full rounded-lg border border-burgundy-300 px-4 py-2.5 text-center text-sm font-medium text-burgundy-700 hover:bg-burgundy-50 transition-colors"
                >
                  Kirish
                </Link>
                <Link
                  href="/register"
                  className="block w-full rounded-lg bg-burgundy-700 px-4 py-2.5 text-center text-sm font-medium text-white hover:bg-burgundy-800 transition-colors"
                >
                  Ro&apos;yxatdan o&apos;tish
                </Link>
              </div>
            )}
          </div>
        </>
      )}
    </header>
  );
}
