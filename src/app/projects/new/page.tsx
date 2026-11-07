'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Users,
  Plus,
  Trash2,
  ArrowLeft,
  Save,
  Info,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function NewProjectPage() {
  const { user, token, isLoading } = useAuth();
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [problem, setProblem] = useState('');
  const [outcome, setOutcome] = useState('');
  const [category, setCategory] = useState('STARTUP');
  const [stage, setStage] = useState('IDEA');
  const [weeklyHours, setWeeklyHours] = useState<number | ''>(10);
  const [durationWeeks, setDurationWeeks] = useState<number | ''>(12);
  const [workFormat, setWorkFormat] = useState('HYBRID');
  const [location, setLocation] = useState('Toshkent, TMC');
  const [compensation, setCompensation] = useState('Uskunalar va ulush / tajriba almashinuvi');

  // Roles state
  const [roles, setRoles] = useState<
    Array<{ title: string; description: string; skillsNeeded: string; maxPlaces: number }>
  >([
    {
      title: 'Frontend Dasturchi',
      description: 'Veb-sayt interfeysini ishlab chiqish',
      skillsNeeded: 'React, Next.js, Tailwind CSS',
      maxPlaces: 1,
    },
  ]);

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  const addRole = () => {
    setRoles([
      ...roles,
      { title: '', description: '', skillsNeeded: '', maxPlaces: 1 },
    ]);
  };

  const removeRole = (index: number) => {
    if (roles.length <= 1) {
      alert('Kamida bitta rol bo‘lishi kerak');
      return;
    }
    setRoles(roles.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    if (!title.trim() || !description.trim()) {
      setErrorMsg('Iltimos, loyiha nomi va tavsifini kiriting');
      return;
    }

    const invalidRole = roles.find((r) => !r.title.trim());
    if (invalidRole) {
      setErrorMsg('Barcha rollarga nom berilishi shart');
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          description,
          problem: problem || null,
          outcome: outcome || null,
          category,
          stage,
          weeklyHours: weeklyHours ? Number(weeklyHours) : null,
          durationWeeks: durationWeeks ? Number(durationWeeks) : null,
          workFormat,
          location: location || null,
          compensation: compensation || null,
          roles: roles.map((r) => ({
            ...r,
            maxPlaces: Number(r.maxPlaces) || 1,
          })),
        }),
      });

      const data = await res.json();
      if (res.ok) {
        router.push(`/projects/${data.project.id}`);
      } else {
        setErrorMsg(data.error || 'Loyiha yaratishda xatolik yuz berdi');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Tarmoq xatosi');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-6">
        <Link
          href="/projects"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Loyihalar ro‘yxatiga qaytish
        </Link>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                Yangi startap yoki innovatsiya loyihasi yaratish
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Loyiha maqsadini va qanday mutaxassislar kerakligini ko‘rsating. Talabalar sizning
                loyihangizga qo‘shilish so‘rovlarini yuborishadi.
              </p>
            </div>

            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-lg">
                {errorMsg}
              </div>
            )}

            {/* Basic Info */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Loyiha nomi *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Masalan: EduPulse — Talabalar uchun AI repetitor"
                  className="w-full px-3 py-2 border rounded-lg text-xs focus:ring-2 focus:ring-burgundy-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Toifa
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg text-xs"
                  >
                    <option value="STARTUP">Startap</option>
                    <option value="INNOVATION">Innovatsiya</option>
                    <option value="RESEARCH">Ilmiy tadqiqot</option>
                    <option value="SOCIAL">Ijtimoiy tashabbus</option>
                    <option value="HACKATHON">Hakaton loyihasi</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Joriy bosqich
                  </label>
                  <select
                    value={stage}
                    onChange={(e) => setStage(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg text-xs"
                  >
                    <option value="IDEA">G‘oya bosqichi</option>
                    <option value="PLANNING">Rejalashtirish</option>
                    <option value="MVP">MVP / Prototip</option>
                    <option value="ACTIVE">Faol rivojlanishda</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Qisqa tavsif *
                </label>
                <textarea
                  rows={3}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Loyiha nima haqida, uning asosiy mohiyati..."
                  className="w-full px-3 py-2 border rounded-lg text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Hal qilinayotgan muammo
                  </label>
                  <textarea
                    rows={2}
                    value={problem}
                    onChange={(e) => setProblem(e.target.value)}
                    placeholder="Qanday muammo yechiladi?"
                    className="w-full px-3 py-2 border rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Kutilayotgan natija
                  </label>
                  <textarea
                    rows={2}
                    value={outcome}
                    onChange={(e) => setOutcome(e.target.value)}
                    placeholder="Qanday natijaga erishmoqchisiz?"
                    className="w-full px-3 py-2 border rounded-lg text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Conditions & Format */}
            <div className="pt-4 border-t space-y-4">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Hamkorlik shartlari va vaqt
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Haftalik vaqt (soat)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={60}
                    value={weeklyHours}
                    onChange={(e) =>
                      setWeeklyHours(e.target.value === '' ? '' : Number(e.target.value))
                    }
                    className="w-full px-3 py-2 border rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Format
                  </label>
                  <select
                    value={workFormat}
                    onChange={(e) => setWorkFormat(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg text-xs"
                  >
                    <option value="HYBRID">Gibrid</option>
                    <option value="REMOTE">Masofaviy (Remote)</option>
                    <option value="ONSITE">Ofisda / Institutda</option>
                    <option value="ANY">Ixtiyoriy</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Davomiylik (hafta)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={durationWeeks}
                    onChange={(e) =>
                      setDurationWeeks(e.target.value === '' ? '' : Number(e.target.value))
                    }
                    className="w-full px-3 py-2 border rounded-lg text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Kompensatsiya va qatnashish shartlari
                </label>
                <input
                  type="text"
                  value={compensation}
                  onChange={(e) => setCompensation(e.target.value)}
                  placeholder="Masalan: Tajriba orttirish, jamoa ulushi yoki stipendiya"
                  className="w-full px-3 py-2 border rounded-lg text-xs"
                />
              </div>
            </div>

            {/* Roles Builder */}
            <div className="pt-4 border-t space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Kerakli rollar va bo‘sh o‘rinlar ({roles.length})
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Har bir rol bo‘yicha talabalarni alohida qabul qilasiz.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={addRole}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Rol qo‘shish
                </button>
              </div>

              <div className="space-y-3">
                {roles.map((r, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 relative"
                  >
                    {roles.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeRole(idx)}
                        className="absolute top-3 right-3 text-rose-500 hover:text-rose-700"
                        title="O‘chirish"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <div className="sm:col-span-2">
                        <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">
                          Rol nomi *
                        </label>
                        <input
                          type="text"
                          required
                          value={r.title}
                          placeholder="Masalan: UI/UX Dizayner, Backend dasturchi"
                          onChange={(e) => {
                            const updated = [...roles];
                            updated[idx].title = e.target.value;
                            setRoles(updated);
                          }}
                          className="w-full px-2.5 py-1.5 border rounded bg-white text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">
                          O‘rinlar soni
                        </label>
                        <input
                          type="number"
                          min={1}
                          max={10}
                          value={r.maxPlaces}
                          onChange={(e) => {
                            const updated = [...roles];
                            updated[idx].maxPlaces = Number(e.target.value) || 1;
                            setRoles(updated);
                          }}
                          className="w-full px-2.5 py-1.5 border rounded bg-white text-xs"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">
                        Kerakli ko‘nikmalar
                      </label>
                      <input
                        type="text"
                        value={r.skillsNeeded}
                        placeholder="Figma, Wireframing, User Research"
                        onChange={(e) => {
                          const updated = [...roles];
                          updated[idx].skillsNeeded = e.target.value;
                          setRoles(updated);
                        }}
                        className="w-full px-2.5 py-1.5 border rounded bg-white text-xs"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4 border-t flex justify-end gap-3">
              <Link
                href="/projects"
                className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50"
              >
                Bekor qilish
              </Link>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2 rounded-lg bg-burgundy-700 text-white text-xs font-semibold hover:bg-burgundy-800 disabled:opacity-50 transition shadow-sm"
              >
                {submitting ? 'Yaratilmoqda...' : 'Loyihani nashr qilish'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
