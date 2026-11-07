import Link from 'next/link';
import { BRAND_NAME, INSTITUTE_NAME } from '@/lib/brand';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-200 bg-white no-print">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Copyright */}
          <p className="text-sm text-slate-500">
            &copy; {currentYear} {BRAND_NAME} &mdash; {INSTITUTE_NAME} Career Center
          </p>

          {/* Links */}
          <nav className="flex items-center gap-6" aria-label="Pastki navigatsiya">
            <Link
              href="/help"
              className="text-sm text-slate-500 hover:text-burgundy-700 transition-colors"
            >
              Yordam
            </Link>
            <Link
              href="/privacy"
              className="text-sm text-slate-500 hover:text-burgundy-700 transition-colors"
            >
              Maxfiylik siyosati
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
