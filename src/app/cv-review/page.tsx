'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  Upload,
  FileText,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowRight,
  Info,
  Clock,
  Briefcase,
  Check,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function CvReviewPage() {
  const { user, token, isLoading } = useAuth();
  const router = useRouter();

  // Mode: select existing CV vs upload file
  const [sourceMode, setSourceMode] = useState<'existing' | 'upload'>('existing');

  // Existing CVs
  const [userCvs, setUserCvs] = useState<any[]>([]);
  const [selectedCvId, setSelectedCvId] = useState('');

  // Uploaded file
  const [file, setFile] = useState<File | null>(null);

  // Target role & vacancy
  const [targetRole, setTargetRole] = useState('');
  const [vacancyText, setVacancyText] = useState('');

  // Reviews state
  const [reviews, setReviews] = useState<any[]>([]);
  const [activeReview, setActiveReview] = useState<any>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [loadingList, setLoadingList] = useState(true);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  // Load CVs & past reviews
  useEffect(() => {
    if (!token) return;

    async function loadData() {
      try {
        setLoadingList(true);
        // Load CVs
        const cvRes = await fetch('/api/cv', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (cvRes.ok) {
          const cvData = await cvRes.json();
          setUserCvs(cvData.cvs || []);
          if (cvData.cvs?.length > 0) {
            setSelectedCvId(cvData.cvs[0].id);
          }
        }

        // Load Reviews
        const revRes = await fetch('/api/cv-review', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (revRes.ok) {
          const revData = await revRes.json();
          setReviews(revData.reviews || []);
          if (revData.reviews?.length > 0) {
            setActiveReview(revData.reviews[0]);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingList(false);
      }
    }

    loadData();
  }, [token]);

  // Start analysis
  const handleStartReview = async () => {
    if (!token) return;
    setAnalyzing(true);
    setNotice(null);

    try {
      let res: Response;

      if (sourceMode === 'upload') {
        if (!file) {
          alert('Iltimos, avval PDF yoki DOCX fayl tanlang');
          setAnalyzing(false);
          return;
        }
        const formData = new FormData();
        formData.append('file', file);
        if (targetRole) formData.append('targetRole', targetRole);
        if (vacancyText) formData.append('vacancyText', vacancyText);

        res = await fetch('/api/cv-review', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });
      } else {
        if (!selectedCvId) {
          alert('Iltimos, platformadagi CV-ni tanlang');
          setAnalyzing(false);
          return;
        }
        res = await fetch('/api/cv-review', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            cvDocumentId: selectedCvId,
            targetRole: targetRole || null,
            vacancyText: vacancyText || null,
          }),
        });
      }

      const data = await res.json();
      if (res.ok) {
        setActiveReview(data.review);
        setReviews([data.review, ...reviews]);
        setNotice(data.notice || null);
      } else {
        alert(data.error || 'Tahlil jarayonida xatolik yuz berdi');
      }
    } catch (err: any) {
      alert('Tarmoq xatosi: ' + err.message);
    } finally {
      setAnalyzing(false);
    }
  };

  // Suggestion action
  const handleSuggestionAction = async (idx: number, action: 'accept' | 'reject') => {
    if (!token || !activeReview) return;
    try {
      const res = await fetch(`/api/cv-review/${activeReview.id}/suggestion`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          suggestionIndex: idx,
          action,
          applyToCv: true,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setActiveReview(data.review);
        setReviews(reviews.map((r) => (r.id === data.review.id ? data.review : r)));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const parsedStrengths: string[] = activeReview?.strengthsJson
    ? JSON.parse(activeReview.strengthsJson)
    : [];

  const parsedSuggestions: any[] = activeReview?.suggestionsJson
    ? JSON.parse(activeReview.suggestionsJson)
    : [];

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Header */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 mb-3">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>AI asoslangan tahlil</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
              CV-ni AI bilan tekshirish
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
              Mavjud rezyumengizni yoki yangi yuklangan faylni grammatika, to‘liqlik, noaniq jumlalar va
              tanlangan lavozimga muvofiqlik bo‘yicha chuqur tahlil qiling. Har bir taklifni alohida
              qabul qilishingiz yoki rad etishingiz mumkin.
            </p>
          </div>
        </div>

        {notice && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2">
            <Info className="w-4 h-4 shrink-0 text-amber-700 mt-0.5" />
            <span>{notice}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT: Analysis Setup Form */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
              <h2 className="text-base font-bold text-slate-900 border-b pb-2">
                Tekshirish uchun CV tanlash
              </h2>

              {/* Source Mode Toggle */}
              <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
                <button
                  onClick={() => setSourceMode('existing')}
                  className={`py-2 rounded-lg transition ${
                    sourceMode === 'existing'
                      ? 'bg-white text-burgundy-800 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Platformadagi CV
                </button>
                <button
                  onClick={() => setSourceMode('upload')}
                  className={`py-2 rounded-lg transition ${
                    sourceMode === 'upload'
                      ? 'bg-white text-burgundy-800 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Fayl yuklash (PDF/DOCX)
                </button>
              </div>

              {sourceMode === 'existing' ? (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Mening rezyumelarim
                  </label>
                  {userCvs.length === 0 ? (
                    <div className="text-xs text-slate-500 p-3 bg-slate-50 rounded-lg border">
                      Sizda hali saqlangan CV yo‘q.{' '}
                      <Link href="/cv/new" className="text-burgundy-700 font-semibold underline">
                        Yangi CV yarating
                      </Link>{' '}
                      yoki fayl yuklang.
                    </div>
                  ) : (
                    <select
                      value={selectedCvId}
                      onChange={(e) => setSelectedCvId(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg text-xs"
                    >
                      {userCvs.map((cv) => (
                        <option key={cv.id} value={cv.id}>
                          {cv.title} ({new Date(cv.updatedAt).toLocaleDateString('uz-UZ')})
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    CV faylini tanlang (PDF yoki DOCX, maks. 10MB)
                  </label>
                  <input
                    type="file"
                    accept=".pdf,.docx,.doc"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-burgundy-50 file:text-burgundy-700 hover:file:bg-burgundy-100"
                  />
                  {file && (
                    <p className="text-[11px] text-emerald-700 mt-1">
                      Tanlandi: {file.name} ({(file.size / 1024).toFixed(0)} KB)
                    </p>
                  )}
                </div>
              )}

              {/* Target vacancy options */}
              <div className="space-y-3 pt-2 border-t">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Maqsadli kasb / lavozim (ixtiyoriy)
                  </label>
                  <input
                    type="text"
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                    placeholder="Masalan: Frontend Developer, Moliyaviy tahlilchi"
                    className="w-full px-3 py-2 border rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Vakansiya talablari yoki tavsifi (ixtiyoriy)
                  </label>
                  <textarea
                    rows={3}
                    value={vacancyText}
                    onChange={(e) => setVacancyText(e.target.value)}
                    placeholder="Ish beruvchi talablari matnini qo‘ysangiz, tavsiyalar yanada aniqroq bo‘ladi..."
                    className="w-full px-3 py-2 border rounded-lg text-xs"
                  />
                </div>
              </div>

              <button
                onClick={handleStartReview}
                disabled={analyzing}
                className="w-full py-2.5 px-4 rounded-lg bg-burgundy-700 text-white text-xs font-semibold hover:bg-burgundy-800 transition flex items-center justify-center gap-2 disabled:opacity-50 shadow-sm"
              >
                {analyzing ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Tahlil qilinmoqda...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    CV-ni AI bilan tekshirish
                  </>
                )}
              </button>
            </div>

            {/* Past Reviews List */}
            {reviews.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Oldingi tahlillar ({reviews.length})
                </h3>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {reviews.map((rev) => (
                    <button
                      key={rev.id}
                      onClick={() => setActiveReview(rev)}
                      className={`w-full p-2.5 rounded-lg border text-left text-xs transition flex items-center justify-between ${
                        activeReview?.id === rev.id
                          ? 'border-burgundy-600 bg-burgundy-50/50'
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="truncate">
                        <span className="font-semibold text-slate-800 block truncate">
                          {rev.cvDocument?.title || 'CV tahlili'}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(rev.createdAt).toLocaleString('uz-UZ')}
                        </span>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT: Review Results */}
          <div className="lg:col-span-7">
            {!activeReview ? (
              <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center h-full flex flex-col items-center justify-center">
                <Sparkles className="w-12 h-12 text-amber-500 mb-3" />
                <h3 className="text-base font-bold text-slate-800">
                  Tahlil natijalari bu yerda chiqadi
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mt-1">
                  Chap tomondagi shakl orqali CV tanlang yoki fayl yuklang, so‘ng "CV-ni tekshirish" tugmasini bosing.
                </p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
                <div className="flex items-start justify-between gap-3 border-b pb-4">
                  <div>
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      Tahlil yakunlandi
                    </span>
                    <h2 className="text-lg font-bold text-slate-900 mt-2">
                      {activeReview.cvDocument?.title} uchun AI xulosasi
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Tahlil sanasi: {new Date(activeReview.createdAt).toLocaleString('uz-UZ')}
                    </p>
                  </div>

                  {activeReview.cvDocument && (
                    <Link
                      href={`/cv/${activeReview.cvDocument.id}/edit`}
                      className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 shrink-0"
                    >
                      CV-ni ochish
                    </Link>
                  )}
                </div>

                {/* Overview */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                    Umumiy xulosa
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                    {activeReview.overviewText || 'Rezyume ko‘rib chiqildi.'}
                  </p>
                </div>

                {/* Strengths */}
                {parsedStrengths.length > 0 && (
                  <div>
                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
                      Kuchli tomonlar ({parsedStrengths.length})
                    </h3>
                    <div className="space-y-2">
                      {parsedStrengths.map((s, idx) => (
                        <div
                          key={idx}
                          className="flex items-start gap-2.5 p-3 rounded-xl bg-emerald-50/50 border border-emerald-200 text-xs text-emerald-950"
                        >
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{s}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Prioritized Actionable Suggestions */}
                {parsedSuggestions.length > 0 && (
                  <div>
                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
                      Amaliy tavsiyalar va tuzatishlar ({parsedSuggestions.length})
                    </h3>

                    <div className="space-y-4">
                      {parsedSuggestions.map((item, idx) => (
                        <div
                          key={idx}
                          className={`p-4 rounded-xl border text-xs space-y-3 transition ${
                            item.status === 'accepted'
                              ? 'bg-emerald-50/30 border-emerald-300'
                              : item.status === 'rejected'
                              ? 'bg-slate-100/50 border-slate-200 opacity-60'
                              : 'bg-white border-slate-200 shadow-sm'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-bold text-burgundy-800 text-[11px] uppercase tracking-wide">
                              Bo‘lim: {item.section || 'Umumiy'}
                            </span>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                item.status === 'accepted'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : item.status === 'rejected'
                                  ? 'bg-slate-200 text-slate-600'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {item.status === 'accepted'
                                ? 'Qabul qilingan'
                                : item.status === 'rejected'
                                ? 'Rad etilgan'
                                : 'Kutilmoqda'}
                            </span>
                          </div>

                          {item.passage && (
                            <div className="p-2.5 bg-slate-50 border rounded-lg text-slate-600 italic">
                              <span className="font-semibold not-italic block text-[10px] text-slate-400 mb-0.5">
                                Hozirgi matn:
                              </span>
                              "{item.passage}"
                            </div>
                          )}

                          <div>
                            <span className="font-semibold block text-slate-700 mb-0.5">
                              Kamchilik sababi:
                            </span>
                            <p className="text-slate-600">{item.issue}</p>
                          </div>

                          <div className="p-2.5 bg-burgundy-50/50 border border-burgundy-200 rounded-lg text-burgundy-950">
                            <span className="font-semibold block text-[10px] text-burgundy-800 mb-0.5">
                              Taklif etilgan tuzatish:
                            </span>
                            <p className="font-medium">{item.suggestion}</p>
                          </div>

                          {item.status !== 'accepted' && item.status !== 'rejected' && (
                            <div className="pt-2 border-t flex justify-end gap-2">
                              <button
                                onClick={() => handleSuggestionAction(idx, 'reject')}
                                className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-600 text-xs font-semibold hover:bg-slate-50"
                              >
                                Rad etish
                              </button>
                              <button
                                onClick={() => handleSuggestionAction(idx, 'accept')}
                                className="px-3 py-1.5 rounded-lg bg-burgundy-700 text-white text-xs font-semibold hover:bg-burgundy-800"
                              >
                                Qabul qilish va qo‘llash
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
