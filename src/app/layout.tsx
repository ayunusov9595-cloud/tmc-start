import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: {
    default: 'TMC Start — Karyera Markazi',
    template: '%s | TMC Start',
  },
  description:
    "TMC Institute talabalari uchun karyera platformasi. CV yaratish, karyera yo'nalishlarini aniqlash va loyihalarda ishtirok etish imkoniyati.",
  keywords: ['TMC', 'karyera', 'CV', 'talaba', 'loyiha', 'ish'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="uz">
      <body className="font-sans antialiased bg-[var(--background)] text-[var(--foreground)] flex flex-col min-h-screen">
        <AuthProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
