'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Compass,
  FileText,
  User,
  Edit3,
  CheckCircle2,
  AlertCircle,
  Building2,
  ArrowRight,
  Sparkles,
  Info,
  Clock,
  BookOpen,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { CareerRecommendation } from '@/lib/ai-adapter';

export default function CareerGuidancePage() {
  const { user, token, isLoading } = useAuth();
  const router = useRouter();

  const [entryMode, setEntryMode] = useState<'BIOGRAPHY' | 'PROFILE' | 'CV'>('PROFILE');
  const [bioText, setBioText] = useState('');
  const [userCvs, setUserCvs] = useState<any[]>([]);
  const [selectedCvId, setSelectedCvId] = useState('');

  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<CareerRecommendation[]>([]);
  const [notice, setNotice] = useState<string | null>(null);
  const [creatingCvForRole, setCreatingCvForRole] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (!token) return;

    async function loadInitial() {
      try {
        const cvRes = await fetch('/api/cv', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (cvRes.ok) {
          const cvData = await cvRes.json();
          setUserCvs(cvData.cvs || []);
          if (cvData.cvs?.length > 0) setSelectedCvId(cvData.cvs[0].id);
        }

        // Load latest session if any
        const sessRes = await fetch('/api/career', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (sessRes.ok) {
          const sessData = await sessRes.json();
          if (sessData.sessions?.length > 0 && sessData.sessions[0].recommendationsJson) {
            try {
              setRecommendations(JSON.parse(sessData.sessions[0].recommendationsJson));
            } catch {
              // ignore
            }
          }
        }
      } catch (err) {
        console.error(err);
      }
    }

    loadInitial();
  }, [token]);

  const handleGenerate = async () => {
    if (!token) return;
    setLoading(true);
    setNotice(null);

    try {
      const res = await fetch('/api/career', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          inputType: entryMode,
          inputText: entryMode === 'BIOGRAPHY' ? bioText : undefined,
          cvDocumentId: entryMode === 'CV' ? selectedCvId : undefined,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setRecommendations(data.recommendations || []);
        setNotice(data.notice || null);
      } else {
        alert(data.error || 'Tavsiyalarni olishda xatolik yuz berdi');
      }
    } catch (err: any) {
      alert('Tarmoq xatosi: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCvForRole = async (roleName: string) => {
    if (!token) return;
    setCreatingCvForRole(roleName);
    try {
      const res = await fetch('/api/cv', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: `CV — ${roleName}`,
          templateId: 'corporate-executive-navy',
        }),
      });

      if (res.ok) {
        const data = await res.json();
        router.push(`/cv/${data.cv.id}/edit`);
      } else {
        alert('CV yaratishda xatolik yuz berdi');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCreatingCvForRole(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Header */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-800 mb-3">
              <Compass className="w-3.5 h-3.5 text-blue-600" />
              <span>Kasbiy yo‘nalish va tavsiyalar</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
              Menga mos kasblar va tashkilot turlari
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
              Faqat diplom nomiga qarab emas, balki sizning amaliy ko‘nikmalaringiz, tillar, o‘rgangan fanlaringiz
              va qiziqishlaringiz asosida mos tashkilot turlari va kasb lavozimlarini aniqlang.
            </p>
          </div>
        </div>

        {notice && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2">
            <Info className="w-4 h-4 shrink-0 text-amber-700 mt-0.5" />
            <span>{notice}</span>
          </div>
        )}

        {/* 3 Entry Routes Selector */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Tahlil manbasini tanlang:
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              onClick={() => setEntryMode('PROFILE')}
              className={`p-4 rounded-xl border text-left transition flex items-start gap-3 ${
                entryMode === 'PROFILE'
                  ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-500'
                  : 'border-slate-200 hover:bg-slate-50'
              }`}
            >
              <User className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-slate-900 text-xs">Saqlangan profilim</h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Ta‘lim, ko‘nikmalar, tillar va loyihalaringiz
                </p>
              </div>
            </button>

            <button
              onClick={() => setEntryMode('BIOGRAPHY')}
              className={`p-4 rounded-xl border text-left transition flex items-start gap-3 ${
                entryMode === 'BIOGRAPHY'
                  ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-500'
                  : 'border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Edit3 className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-slate-900 text-xs">Qisqa tarjimai hol</h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  O‘zingiz, qiziqishlaringiz haqida matn yozing
                </p>
              </div>
            </button>

            <button
              onClick={() => setEntryMode('CV')}
              className={`p-4 rounded-xl border text-left transition flex items-start gap-3 ${
                entryMode === 'CV'
                  ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-500'
                  : 'border-slate-200 hover:bg-slate-50'
              }`}
            >
              <FileText className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-slate-900 text-xs">Mavjud CV orqali</h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Platformadagi CV hujjati asosida
                </p>
              </div>
            </button>
          </div>

          {/* Conditional inputs */}
          {entryMode === 'BIOGRAPHY' && (
            <div className="pt-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Qisqa tarjimai hol yoki intilishlaringizni yozing:
              </label>
              <textarea
                rows={4}
                value={bioText}
                onChange={(e) => setBioText(e.target.value)}
                placeholder="Masalan: Men TMC Institute 3-kurs talabasiman. Dasturlash va veb-saytlar yaratishga qiziqaman, React va JavaScript bilaman. Moliya va bank sohasida ishlashni xohlayman..."
                className="w-full px-3 py-2 border rounded-xl text-xs"
              />
            </div>
          )}

          {entryMode === 'CV' && (
            <div className="pt-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tahlil qilinadigan CV-ni tanlang:
              </label>
              {userCvs.length === 0 ? (
                <p className="text-xs text-slate-500">
                  CV topilmadi. Avval profilingiz orqali yoki tarjimai hol rejimida sinab ko‘ring.
                </p>
              ) : (
                <select
                  value={selectedCvId}
                  onChange={(e) => setSelectedCvId(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl text-xs"
                >
                  {userCvs.map((cv) => (
                    <option key={cv.id} value={cv.id}>
                      {cv.title} ({new Date(cv.updatedAt).toLocaleDateString('uz-UZ')})
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}

          <div className="pt-2 flex justify-end">
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="px-6 py-2.5 rounded-lg bg-blue-700 text-white text-xs font-semibold hover:bg-blue-800 transition flex items-center gap-2 shadow-sm disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Mos kasblar aniqlanmoqda...
                </>
              ) : (
                <>
                  <Compass className="w-4 h-4" />
                  Kasb tavsiyalarini olish
                </>
              )}
            </button>
          </div>
        </div>

        {/* Results */}
        {recommendations.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">
                Siz uchun tavsiya etilgan kasb yo‘nalishlari ({recommendations.length})
              </h2>
              <span className="text-xs text-slate-500">
                Hozir mos va qo‘shimcha tayyorgarlik talab qiladigan lavozimlar
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {recommendations.map((rec, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            rec.readinessLevel === 'ready_now'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {rec.readinessLevel === 'ready_now'
                            ? 'Hozir kirishish mumkin'
                            : 'Tayyorgarlik talab qilinadi'}
                        </span>
                        <h3 className="text-lg font-bold text-slate-900 mt-2">{rec.role}</h3>
                      </div>
                    </div>

                    {/* Suitable Reason */}
                    <div className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <strong>Nega mos keladi:</strong> {rec.whySuitable}
                    </div>

                    {/* Organization Types */}
                    <div>
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5 flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5" />
                        Mos tashkilot turlari:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {rec.organizationTypes?.map((org, oIdx) => (
                          <span
                            key={oIdx}
                            className="text-xs bg-blue-50 text-blue-900 border border-blue-200 px-2.5 py-1 rounded-lg"
                          >
                            {org}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Strengths */}
                    {rec.strengths?.length > 0 && (
                      <div>
                        <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block mb-1">
                          Mavjud kuchli tomonlaringiz:
                        </span>
                        <ul className="text-xs text-slate-600 space-y-1">
                          {rec.strengths.map((s, sIdx) => (
                            <li key={sIdx} className="flex items-start gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                              <span>{s}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Missing requirements */}
                    {rec.missingRequirements?.length > 0 && (
                      <div>
                        <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider block mb-1">
                          Yetishmayotgan / o‘rganish kerak bo‘lgan talablar:
                        </span>
                        <ul className="text-xs text-slate-600 space-y-1">
                          {rec.missingRequirements.map((m, mIdx) => (
                            <li key={mIdx} className="flex items-start gap-1.5">
                              <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                              <span>{m}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Preparation step */}
                    {rec.preparationStep && (
                      <div className="p-3 bg-purple-50/60 border border-purple-200 rounded-xl text-xs text-purple-950">
                        <span className="font-bold flex items-center gap-1 text-[11px] text-purple-800 mb-0.5">
                          <BookOpen className="w-3.5 h-3.5" />
                          Amaliy tayyorgarlik qadami:
                        </span>
                        {rec.preparationStep}
                      </div>
                    )}
                  </div>

                  {/* Action Button: Shu lavozim uchun CV tayyorlash */}
                  <div className="mt-6 pt-4 border-t flex justify-end">
                    <button
                      onClick={() => handleCreateCvForRole(rec.role)}
                      disabled={creatingCvForRole === rec.role}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-burgundy-700 text-white text-xs font-semibold hover:bg-burgundy-800 transition shadow-sm"
                    >
                      {creatingCvForRole === rec.role ? (
                        'CV yaratilmoqda...'
                      ) : (
                        <>
                          Shu lavozim uchun CV tayyorlash
                          <ArrowRight className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
