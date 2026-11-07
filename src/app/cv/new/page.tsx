'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Sparkles,
  Search,
  Filter,
  Check,
  ArrowRight,
  Info,
  Layers,
  ChevronLeft,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { TemplateConfig } from '@/lib/cv-templates';

export default function CvNewTemplatePage() {
  const { user, token, isLoading } = useAuth();
  const router = useRouter();

  const [templates, setTemplates] = useState<TemplateConfig[]>([]);
  const [familyStats, setFamilyStats] = useState<any>({});
  const [totalCount, setTotalCount] = useState(108);
  const [baseLayoutsCount, setBaseLayoutsCount] = useState(18);
  const [selectedFamily, setSelectedFamily] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    async function fetchTemplates() {
      try {
        setLoading(true);
        const url = new URL('/api/cv/templates', window.location.origin);
        if (selectedFamily !== 'all') url.searchParams.set('family', selectedFamily);
        if (search) url.searchParams.set('search', search);

        const res = await fetch(url.toString());
        if (res.ok) {
          const data = await res.json();
          setTemplates(data.templates || []);
          setFamilyStats(data.familyStats || {});
          setTotalCount(data.totalCount || 108);
          setBaseLayoutsCount(data.baseLayoutsCount || 18);
        }
      } catch (err) {
        console.error('Error fetching templates:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchTemplates();
  }, [selectedFamily, search]);

  const handleSelectTemplate = async (templateId: string) => {
    if (!token) return;
    setCreating(templateId);
    try {
      const res = await fetch('/api/cv', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: 'Yangi CV',
          templateId,
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
      alert('Tarmoq xatosi');
    } finally {
      setCreating(null);
    }
  };

  const familyTabs = [
    { id: 'all', label: 'Barcha shablonlar', count: totalCount },
    { id: 'minimal', label: 'Minimal', count: familyStats.minimal?.count || 18 },
    { id: 'academic', label: 'Akademik', count: familyStats.academic?.count || 18 },
    { id: 'corporate', label: 'Korporativ', count: familyStats.corporate?.count || 18 },
    { id: 'creative', label: 'Ijodiy (Creative)', count: familyStats.creative?.count || 18 },
    { id: 'internship', label: 'Amaliyot (Internship)', count: familyStats.internship?.count || 18 },
    { id: 'graduate', label: 'Bitiruvchi (Graduate)', count: familyStats.graduate?.count || 18 },
  ];

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Back button */}
        <Link
          href="/cv"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
        >
          <ChevronLeft className="w-4 h-4" />
          CV‘lar ro‘yxatiga qaytish
        </Link>

        {/* Header */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-burgundy-50 text-burgundy-800 mb-3">
              <Layers className="w-3.5 h-3.5" />
              <span>Haqiqiy 108 ta dizayn varianti</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
              CV shablonini tanlang
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
              Katalogimizda 6 ta asosiy oilaga mansub 18 ta mustaqil strukturaviy maket va ularning
              har biri uchun 6 xil rang/tipografiya uyg‘unligi mavjud (jami {totalCount} ta tanlov).
              Istalgan vaqtda ma‘lumotlaringizni yo‘qotmasdan shablonni o‘zgartirishingiz mumkin.
            </p>
          </div>

          {/* Honest Structure vs Variant Banner */}
          <div className="mt-6 p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-burgundy-700 shrink-0" />
              <span>
                <strong>Haqiqiy hisob:</strong> 18 ta tayanch maket (1 va 2 ustunli, har xil sarlavha va ajratuvchilar)
                × 6 ta stil va rang varianti = <strong>108 ta to‘liq ishlaydigan variant</strong>.
              </span>
            </div>
            <span className="shrink-0 font-medium text-burgundy-800 bg-burgundy-100/50 px-2.5 py-1 rounded-md">
              A4 & PDF muvofiq
            </span>
          </div>

          {/* Search & Family Filter */}
          <div className="mt-6 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Shablon nomi yoki rangini qidiring (masalan: navy, emerald, akademik)..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-burgundy-500 focus:outline-none bg-white"
              />
            </div>
          </div>

          {/* Family Tabs */}
          <div className="mt-6 flex border-b border-slate-200 overflow-x-auto gap-2">
            {familyTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedFamily(tab.id)}
                className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold border-b-2 whitespace-nowrap transition ${
                  selectedFamily === tab.id
                    ? 'border-burgundy-700 text-burgundy-800'
                    : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
                }`}
              >
                <span>{tab.label}</span>
                <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-full">
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Template Cards Grid */}
        {loading ? (
          <div className="py-16 text-center">
            <div className="w-8 h-8 border-4 border-burgundy-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs text-slate-500">Shablonlar yuklanmoqda...</p>
          </div>
        ) : templates.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
            <p className="text-sm text-slate-600">Qidiruv bo‘yicha shablonlar topilmadi.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {templates.map((tmpl) => (
              <div
                key={tmpl.id}
                className="bg-white rounded-2xl border border-slate-200 hover:border-burgundy-400 shadow-sm hover:shadow-md transition overflow-hidden flex flex-col justify-between group"
              >
                {/* Visual Preview Representation */}
                <div
                  className="p-4 border-b border-slate-100 relative"
                  style={{ backgroundColor: '#fcfcfc' }}
                >
                  <div
                    className="aspect-[1/1.3] w-full rounded-lg border shadow-sm p-3 flex flex-col justify-between text-[7px] leading-tight overflow-hidden"
                    style={{
                      borderColor: '#e2e8f0',
                      backgroundColor: tmpl.colors.background || '#ffffff',
                    }}
                  >
                    {/* Header Mini Preview */}
                    <div
                      className="p-1.5 rounded mb-1.5"
                      style={{
                        backgroundColor:
                          tmpl.layout.headerStyle === 'banner'
                            ? tmpl.colors.primary
                            : '#f8fafc',
                        color:
                          tmpl.layout.headerStyle === 'banner'
                            ? '#ffffff'
                            : tmpl.colors.primary,
                        borderBottom:
                          tmpl.layout.headerStyle === 'centered'
                            ? `1px solid ${tmpl.colors.primary}`
                            : 'none',
                        textAlign:
                          tmpl.layout.headerStyle === 'centered'
                            ? 'center'
                            : 'left',
                      }}
                    >
                      <div className="font-bold truncate">Talaba Ismi</div>
                      <div className="opacity-75 truncate text-[6px]">
                        Toshkent • email@tmc.uz
                      </div>
                    </div>

                    {/* Columns Preview */}
                    <div
                      className="flex-1 flex gap-2 overflow-hidden"
                      style={{
                        flexDirection:
                          tmpl.layout.columns === 2 ? 'row' : 'column',
                      }}
                    >
                      <div className="flex-1 space-y-1.5">
                        <div>
                          <div
                            className="font-bold border-b pb-0.5 truncate text-[6.5px]"
                            style={{
                              color: tmpl.colors.primary,
                              borderColor: tmpl.colors.accent,
                            }}
                          >
                            TA‘LIM & TAJRIBA
                          </div>
                          <div className="text-slate-500 mt-0.5 truncate">
                            TMC Institute • Axborot texnologiyalari
                          </div>
                        </div>
                        <div>
                          <div
                            className="font-bold border-b pb-0.5 truncate text-[6.5px]"
                            style={{
                              color: tmpl.colors.primary,
                              borderColor: tmpl.colors.accent,
                            }}
                          >
                            LOYIHALAR
                          </div>
                          <div className="text-slate-500 mt-0.5 truncate">
                            Startup veb-platformasi
                          </div>
                        </div>
                      </div>

                      {tmpl.layout.columns === 2 && (
                        <div
                          className="w-1/3 space-y-1.5 border-l pl-1.5"
                          style={{ borderColor: '#f1f5f9' }}
                        >
                          <div>
                            <div
                              className="font-bold truncate text-[6.5px]"
                              style={{ color: tmpl.colors.primary }}
                            >
                              KO‘NIKMALAR
                            </div>
                            <div className="text-slate-500 truncate">
                              React, Python
                            </div>
                          </div>
                          <div>
                            <div
                              className="font-bold truncate text-[6.5px]"
                              style={{ color: tmpl.colors.primary }}
                            >
                              TILLAR
                            </div>
                            <div className="text-slate-500 truncate">
                              O‘zbek, Ingliz
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Badges on preview */}
                  <div className="absolute top-6 right-6 flex flex-col gap-1 items-end">
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-white/90 text-slate-700 shadow-sm border border-slate-200">
                      {tmpl.layout.columns === 1 ? '1 ustun' : '2 ustun'}
                    </span>
                  </div>
                </div>

                {/* Card Info */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-bold text-slate-900 text-sm truncate">
                        {tmpl.name}
                      </h3>
                      {/* Color dots */}
                      <div className="flex items-center gap-1 shrink-0">
                        <span
                          className="w-3 h-3 rounded-full border border-black/10"
                          style={{ backgroundColor: tmpl.colors.primary }}
                          title={`Asosiy rang: ${tmpl.colors.primary}`}
                        />
                        <span
                          className="w-3 h-3 rounded-full border border-black/10"
                          style={{ backgroundColor: tmpl.colors.accent }}
                          title={`Urg‘u rang: ${tmpl.colors.accent}`}
                        />
                      </div>
                    </div>

                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                      {tmpl.description}
                    </p>

                    <div className="mt-3 flex flex-wrap gap-1 text-[10px] text-slate-500">
                      <span className="bg-slate-100 px-1.5 py-0.5 rounded">
                        Oila: {tmpl.family}
                      </span>
                      <span className="bg-slate-100 px-1.5 py-0.5 rounded">
                        Stil: {tmpl.variant}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleSelectTemplate(tmpl.id)}
                    disabled={creating === tmpl.id}
                    className="mt-4 w-full py-2 px-3 rounded-lg bg-burgundy-700 text-white text-xs font-semibold hover:bg-burgundy-800 transition flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50"
                  >
                    {creating === tmpl.id ? (
                      'Yaratilmoqda...'
                    ) : (
                      <>
                        Shu shablonni tanlash <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
