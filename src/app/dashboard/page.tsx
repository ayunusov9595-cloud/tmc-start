'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  FileText,
  Sparkles,
  Compass,
  Users,
  Plus,
  ArrowRight,
  Clock,
  Download,
  Copy,
  Trash2,
  ExternalLink,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { BRAND_NAME } from '@/lib/brand';

interface CvItem {
  id: string;
  title: string;
  status: string;
  isFavorite: boolean;
  updatedAt: string;
  templateId?: string;
  template?: { name: string; family: string };
}

interface CareerItem {
  role: string;
  organizationTypes: string[];
  whySuitable: string;
  readinessLevel: 'ready_now' | 'needs_preparation';
}

interface ProjectMembership {
  id: string;
  role: string;
  isOwner: boolean;
  project: {
    id: string;
    title: string;
    stage: string;
    category: string;
  };
}

export default function DashboardPage() {
  const { user, token, isLoading } = useAuth();
  const router = useRouter();

  const [cvs, setCvs] = useState<CvItem[]>([]);
  const [careerTips, setCareerTips] = useState<CareerItem[]>([]);
  const [memberships, setMemberships] = useState<ProjectMembership[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (!token) return;

    async function fetchData() {
      try {
        setLoadingData(true);
        // Fetch CVs
        const cvRes = await fetch('/api/cv', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (cvRes.ok) {
          const cvData = await cvRes.json();
          setCvs(cvData.cvs || []);
        }

        // Fetch latest career recommendations
        const careerRes = await fetch('/api/career', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (careerRes.ok) {
          const careerData = await careerRes.json();
          if (careerData.sessions && careerData.sessions.length > 0) {
            const latest = careerData.sessions[0];
            if (latest.recommendationsJson) {
              try {
                setCareerTips(JSON.parse(latest.recommendationsJson).slice(0, 2));
              } catch {
                // ignore json error
              }
            }
          }
        }

        // Fetch project memberships
        const projRes = await fetch('/api/projects/my-memberships', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (projRes.ok) {
          const projData = await projRes.json();
          setMemberships(projData.memberships || []);
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoadingData(false);
      }
    }

    fetchData();
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
      console.error('Duplicate error:', err);
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
        setCvs((prev) => prev.filter((item) => item.id !== id));
      }
    } catch (err) {
      console.error('Delete error:', err);
    } finally {
      setDeletingId(null);
    }
  };

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-burgundy-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-slate-500">Yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Welcome Banner */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
              Assalomu alaykum, {user.name}! 👋
            </h1>
            <p className="mt-1 text-slate-600 text-sm">
              {BRAND_NAME} platformasidagi boshqaruv paneli. CV yaratish, tekshirish yoki loyihalarga qo‘shilish imkoniyatlari.
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

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/cv"
            className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-burgundy-400 hover:shadow-md transition group"
          >
            <div className="w-10 h-10 rounded-lg bg-burgundy-50 text-burgundy-700 flex items-center justify-center mb-3 group-hover:scale-105 transition">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-slate-900 text-base">Mening CV‘larim</h3>
            <p className="text-xs text-slate-500 mt-1">
              Shablonlar asosida yaratilgan va yuklab olingan rezyumelar
            </p>
          </Link>

          <Link
            href="/cv-review"
            className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-amber-400 hover:shadow-md transition group"
          >
            <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center mb-3 group-hover:scale-105 transition">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-slate-900 text-base">AI CV tekshiruvi</h3>
            <p className="text-xs text-slate-500 mt-1">
              CV matnidagi xatolarni topish va kuchli takliflar olish
            </p>
          </Link>

          <Link
            href="/career"
            className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-blue-400 hover:shadow-md transition group"
          >
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center mb-3 group-hover:scale-105 transition">
              <Compass className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-slate-900 text-base">Mos kasblar</h3>
            <p className="text-xs text-slate-500 mt-1">
              Qobiliyat va qiziqishlaringizga mos kasbiy yo‘nalishlar
            </p>
          </Link>

          <Link
            href="/projects"
            className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-emerald-400 hover:shadow-md transition group"
          >
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center mb-3 group-hover:scale-105 transition">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-slate-900 text-base">Loyihalar & Jamoalar</h3>
            <p className="text-xs text-slate-500 mt-1">
              Talabalar startaplari, bo‘sh o‘rinlar va jamoalar
            </p>
          </Link>
        </div>

        {/* Saved CVs Section */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Mening CV hujjatlarim</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Saqlangan qoralamalar va tayyor rezyumelar
              </p>
            </div>
            <Link
              href="/cv"
              className="text-xs font-semibold text-burgundy-700 hover:text-burgundy-800 inline-flex items-center gap-1"
            >
              Barchasini ko‘rish <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loadingData ? (
            <div className="py-8 text-center text-sm text-slate-400">
              Ma‘lumotlar yuklanmoqda...
            </div>
          ) : cvs.length === 0 ? (
            <div className="text-center py-10 px-4 border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
              <FileText className="w-10 h-10 text-slate-400 mx-auto mb-3" />
              <h4 className="text-sm font-semibold text-slate-700">
                Sizda hali saqlangan CV mavjud emas
              </h4>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                100 dan ortiq shablonlardan birini tanlang va bir necha daqiqada rezyume tayyorlang.
              </p>
              <Link
                href="/cv/new"
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-burgundy-700 text-white text-xs font-medium hover:bg-burgundy-800 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                Birinchi CV-ni yaratish
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {cvs.slice(0, 6).map((cv) => (
                <div
                  key={cv.id}
                  className="p-4 rounded-xl border border-slate-200 hover:border-slate-300 transition flex flex-col justify-between bg-slate-50/30"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-semibold text-slate-900 text-sm line-clamp-1">
                        {cv.title}
                      </h4>
                      <span
                        className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full ${
                          cv.status === 'COMPLETED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {cv.status === 'COMPLETED' ? 'Tayyor' : 'Qoralama'}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 mt-1">
                      Shablon: {cv.template?.name || 'Klassik'}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-2 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(cv.updatedAt).toLocaleDateString('uz-UZ')}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <Link
                      href={`/cv/${cv.id}/edit`}
                      className="font-medium text-burgundy-700 hover:text-burgundy-800"
                    >
                      Tahrirlash
                    </Link>
                    <div className="flex items-center gap-1">
                      <a
                        href={`/api/cv/${cv.id}/pdf`}
                        target="_blank"
                        rel="noreferrer"
                        title="PDF yuklab olish"
                        className="p-1.5 text-slate-500 hover:text-slate-800 rounded hover:bg-slate-100"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </a>
                      <button
                        onClick={() => handleDuplicate(cv.id)}
                        title="Nusxa yaratish"
                        className="p-1.5 text-slate-500 hover:text-slate-800 rounded hover:bg-slate-100"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(cv.id)}
                        disabled={deletingId === cv.id}
                        title="O‘chirish"
                        className="p-1.5 text-rose-500 hover:text-rose-700 rounded hover:bg-rose-50"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Lower Row: Career Recommendations & Projects */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Career Recommendations */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Compass className="w-5 h-5 text-blue-700" />
                <h3 className="font-bold text-slate-900 text-base">So‘nggi kasb tavsiyalari</h3>
              </div>
              <Link
                href="/career"
                className="text-xs font-semibold text-blue-700 hover:text-blue-800"
              >
                Barchasi →
              </Link>
            </div>

            {careerTips.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-500 bg-slate-50 rounded-xl p-4">
                Hali kasb tahlili o‘tkazilmadi. Tarjimai holingiz yoki profilingiz orqali mos kasblarni aniqlang.
                <div className="mt-3">
                  <Link
                    href="/career"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-700 text-white text-xs font-medium hover:bg-blue-800 transition"
                  >
                    Tahlilni boshlash
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {careerTips.map((tip, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="font-semibold text-slate-900 text-sm">{tip.role}</h4>
                      <span
                        className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                          tip.readinessLevel === 'ready_now'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {tip.readinessLevel === 'ready_now' ? 'Hozir mos' : 'Tayyorgarlik kerak'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1 line-clamp-2">{tip.whySuitable}</p>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {tip.organizationTypes?.slice(0, 2).map((org, oIdx) => (
                        <span
                          key={oIdx}
                          className="text-[10px] bg-white border border-slate-200 px-2 py-0.5 rounded text-slate-600"
                        >
                          {org}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Active Projects */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-700" />
                <h3 className="font-bold text-slate-900 text-base">Mening jamoalarim</h3>
              </div>
              <Link
                href="/projects"
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-800"
              >
                Loyihalar ro‘yxati →
              </Link>
            </div>

            {memberships.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-500 bg-slate-50 rounded-xl p-4">
                Siz hozircha hech qaysi loyiha jamoasida emassiz.
                <div className="mt-3 flex items-center justify-center gap-2">
                  <Link
                    href="/projects"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-700 text-white text-xs font-medium hover:bg-emerald-800 transition"
                  >
                    Jamoa izlash
                  </Link>
                  <Link
                    href="/projects/new"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 text-xs font-medium hover:bg-slate-100 transition"
                  >
                    Yangi loyiha ochish
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {memberships.map((m) => (
                  <div key={m.id} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-slate-900 text-sm">
                        {m.project.title}
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Rol: <span className="font-medium text-slate-700">{m.role}</span>
                        {m.isOwner && ' (Loyiha egasi)'}
                      </p>
                    </div>
                    <Link
                      href={`/projects/${m.project.id}`}
                      className="text-xs text-emerald-700 hover:text-emerald-800 font-medium inline-flex items-center gap-1"
                    >
                      Ochish <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
