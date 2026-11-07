'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Users,
  Plus,
  Search,
  Filter,
  ArrowRight,
  Briefcase,
  Clock,
  MapPin,
  CheckCircle2,
  FolderGit2,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function ProjectsDiscoveryPage() {
  const { user, token, isLoading } = useAuth();
  const router = useRouter();

  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('ALL');
  const [stage, setStage] = useState('ALL');
  const [workFormat, setWorkFormat] = useState('ALL');

  useEffect(() => {
    async function loadProjects() {
      try {
        setLoading(true);
        const url = new URL('/api/projects', window.location.origin);
        if (search) url.searchParams.set('search', search);
        if (category !== 'ALL') url.searchParams.set('category', category);
        if (stage !== 'ALL') url.searchParams.set('stage', stage);
        if (workFormat !== 'ALL') url.searchParams.set('workFormat', workFormat);

        const res = await fetch(url.toString());
        if (res.ok) {
          const data = await res.json();
          setProjects(data.projects || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadProjects();
  }, [search, category, stage, workFormat]);

  const categoryLabels: Record<string, string> = {
    STARTUP: 'Startap',
    INNOVATION: 'Innovatsiya',
    RESEARCH: 'Ilmiy tadqiqot',
    SOCIAL: 'Ijtimoiy',
    HACKATHON: 'Hakaton',
  };

  const stageLabels: Record<string, string> = {
    IDEA: 'G‘oya bosqichi',
    PLANNING: 'Rejalashtirish',
    MVP: 'MVP / Prototip',
    ACTIVE: 'Faol rivojlanishda',
    COMPLETED: 'Yakunlangan',
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Header */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 mb-2">
              <Users className="w-3.5 h-3.5 text-emerald-600" />
              <span>Talabalar startap va innovatsiya ekotizimi</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
              Loyihalar va jamoalar
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-600 max-w-2xl">
              TMC talabalari tashabbuslari bilan tanishing, qiziqarli startap loyihalarga o‘z
              rolingiz bilan qo‘shiling yoki o‘z jamoangizni shakllantiring.
            </p>
          </div>

          <Link
            href="/projects/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-burgundy-700 text-white font-medium hover:bg-burgundy-800 transition shadow-sm text-sm shrink-0"
          >
            <Plus className="w-4 h-4" />
            Yangi loyiha yaratish
          </Link>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-sm space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Loyiha nomi yoki muammo..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-burgundy-500 focus:outline-none"
              />
            </div>

            <div>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-burgundy-500 focus:outline-none"
              >
                <option value="ALL">Barcha toifalar</option>
                <option value="STARTUP">Startap</option>
                <option value="INNOVATION">Innovatsiya</option>
                <option value="RESEARCH">Ilmiy tadqiqot</option>
                <option value="SOCIAL">Ijtimoiy</option>
                <option value="HACKATHON">Hakaton</option>
              </select>
            </div>

            <div>
              <select
                value={stage}
                onChange={(e) => setStage(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-burgundy-500 focus:outline-none"
              >
                <option value="ALL">Barcha bosqichlar</option>
                <option value="IDEA">G‘oya bosqichi</option>
                <option value="PLANNING">Rejalashtirish</option>
                <option value="MVP">MVP / Prototip</option>
                <option value="ACTIVE">Faol rivojlanishda</option>
              </select>
            </div>

            <div>
              <select
                value={workFormat}
                onChange={(e) => setWorkFormat(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-burgundy-500 focus:outline-none"
              >
                <option value="ALL">Barcha ish formatlari</option>
                <option value="REMOTE">Masofaviy (Remote)</option>
                <option value="HYBRID">Gibrid</option>
                <option value="ONSITE">Ofisda / Institutda</option>
                <option value="ANY">Ixtiyoriy</option>
              </select>
            </div>
          </div>
        </div>

        {/* Project List */}
        {loading ? (
          <div className="py-16 text-center">
            <div className="w-8 h-8 border-4 border-burgundy-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs text-slate-500">Loyihalar yuklanmoqda...</p>
          </div>
        ) : projects.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center max-w-lg mx-auto">
            <FolderGit2 className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <h3 className="font-bold text-slate-800 text-sm">Loyihalar topilmadi</h3>
            <p className="text-xs text-slate-500 mt-1">
              Kiritilgan mezonlar bo‘yicha loyiha topilmadi. Qidiruvni tozalang yoki o‘zingiz birinchi bo‘lib yangi loyiha oching.
            </p>
            <Link
              href="/projects/new"
              className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-burgundy-700 text-white text-xs font-semibold hover:bg-burgundy-800"
            >
              <Plus className="w-3.5 h-3.5" />
              Loyiha yaratish
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((proj) => (
              <div
                key={proj.id}
                className="bg-white rounded-2xl border border-slate-200 hover:border-slate-300 shadow-sm hover:shadow-md transition flex flex-col justify-between overflow-hidden"
              >
                <div className="p-6">
                  {/* Badges */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                      {categoryLabels[proj.category] || proj.category}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                      {stageLabels[proj.stage] || proj.stage}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h3 className="font-bold text-slate-900 text-base mb-2 line-clamp-1">
                    {proj.title}
                  </h3>
                  <p className="text-xs text-slate-600 line-clamp-3 mb-4 leading-relaxed">
                    {proj.description}
                  </p>

                  {/* Open Roles Preview */}
                  {proj.roles && proj.roles.length > 0 && (
                    <div className="border-t border-slate-100 pt-3">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                        Kerakli rollar ({proj.roles.length}):
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {proj.roles.slice(0, 3).map((r: any) => (
                          <span
                            key={r.id}
                            className={`text-[11px] px-2 py-0.5 rounded border ${
                              r.filledPlaces < r.maxPlaces
                                ? 'bg-burgundy-50 border-burgundy-200 text-burgundy-900 font-medium'
                                : 'bg-slate-100 border-slate-200 text-slate-500'
                            }`}
                          >
                            {r.title} ({r.filledPlaces}/{r.maxPlaces})
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Info stats */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Haftasiga: {proj.weeklyHours ? `${proj.weeklyHours} soat` : 'Moslashuvchan'}
                    </span>
                    <span>
                      Jamoa: <strong>{proj._count?.memberships || 1}</strong> kishi
                    </span>
                  </div>
                </div>

                <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500 truncate text-[11px]">
                    Muallif: <strong className="text-slate-700">{proj.owner?.name}</strong>
                  </span>
                  <Link
                    href={`/projects/${proj.id}`}
                    className="font-semibold text-burgundy-700 hover:text-burgundy-800 inline-flex items-center gap-1 shrink-0"
                  >
                    Batafsil <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
