'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  FileText,
  Plus,
  Download,
  Copy,
  Trash2,
  Clock,
  Sparkles,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface CvItem {
  id: string;
  title: string;
  status: string;
  isFavorite: boolean;
  updatedAt: string;
  templateId?: string;
  template?: { name: string; family: string; variant: string };
}

export default function CvListPage() {
  const { user, token, isLoading } = useAuth();
  const router = useRouter();

  const [cvs, setCvs] = useState<CvItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  const loadCvs = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const res = await fetch('/api/cv', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setCvs(data.cvs || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCvs();
  }, [token]);

  const handleDuplicate = async (id: string) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/cv/${id}/duplicate`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setCvs((prev) => [data.cv, ...prev]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!token || !confirm('Haqiqatan ham ushbu CV-ni o‘chirmoqchimisiz?')) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/cv/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setCvs((prev) => prev.filter((c) => c.id !== id));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-burgundy-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-slate-500">CV ro‘yxati yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Header */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Mening CV‘larim</h1>
            <p className="text-xs text-slate-500 mt-1">
              Barcha saqlangan rezyumelaringiz. Bir xil profildan turli maqsadlar uchun bir nechta CV versiyasini yaratishingiz mumkin.
            </p>
          </div>
          <Link
            href="/cv/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-burgundy-700 text-white font-medium hover:bg-burgundy-800 transition shadow-sm text-sm"
          >
            <Plus className="w-4 h-4" />
            Yangi CV yaratish
          </Link>
        </div>

        {cvs.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center max-w-xl mx-auto my-8">
            <div className="w-16 h-16 rounded-full bg-burgundy-50 text-burgundy-700 flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">Sizda hali CV mavjud emas</h3>
            <p className="text-xs text-slate-500 mt-2 max-w-md mx-auto">
              100 dan ortiq professional shablonlar (minimal, akademik, korporativ, ijodiy) asosida bir necha daqiqada rezyume yarating.
            </p>
            <div className="mt-6">
              <Link
                href="/cv/new"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-burgundy-700 text-white text-xs font-semibold hover:bg-burgundy-800 transition shadow"
              >
                <Plus className="w-4 h-4" />
                Birinchi CV-ni yaratish
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cvs.map((cv) => (
              <div
                key={cv.id}
                className="bg-white rounded-2xl border border-slate-200 hover:border-slate-300 shadow-sm hover:shadow transition flex flex-col justify-between overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <h3 className="font-bold text-slate-900 text-base line-clamp-1">
                      {cv.title}
                    </h3>
                    <span
                      className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full shrink-0 ${
                        cv.status === 'COMPLETED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {cv.status === 'COMPLETED' ? 'Tayyor' : 'Qoralama'}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-500">
                    <p>
                      <strong>Shablon:</strong> {cv.template?.name || 'Klassik'}
                    </p>
                    <p className="flex items-center gap-1 text-[11px] text-slate-400">
                      <Clock className="w-3 h-3" />
                      Oxirgi tahrir: {new Date(cv.updatedAt).toLocaleString('uz-UZ')}
                    </p>
                  </div>
                </div>

                <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
                  <Link
                    href={`/cv/${cv.id}/edit`}
                    className="font-semibold text-burgundy-700 hover:text-burgundy-800 inline-flex items-center gap-1"
                  >
                    Tahrirlash <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                  <div className="flex items-center gap-1">
                    <a
                      href={`/api/cv/${cv.id}/pdf`}
                      target="_blank"
                      rel="noreferrer"
                      title="PDF yuklab olish"
                      className="p-1.5 text-slate-600 hover:text-slate-900 rounded hover:bg-slate-200 transition"
                    >
                      <Download className="w-4 h-4" />
                    </a>
                    <button
                      onClick={() => handleDuplicate(cv.id)}
                      title="Nusxa yaratish"
                      className="p-1.5 text-slate-600 hover:text-slate-900 rounded hover:bg-slate-200 transition"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(cv.id)}
                      disabled={deletingId === cv.id}
                      title="O‘chirish"
                      className="p-1.5 text-rose-500 hover:text-rose-700 rounded hover:bg-rose-50 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
