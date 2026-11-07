'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Users,
  ArrowLeft,
  Clock,
  MapPin,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Send,
  Trash2,
  ShieldAlert,
  Crown,
  LogOut,
  UserCheck,
  Check,
  Info,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const { user, token, isLoading } = useAuth();

  const [project, setProject] = useState<any>(null);
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals & tabs
  const [activeOwnerTab, setActiveOwnerTab] = useState<'requests' | 'members' | 'settings'>('requests');
  const [joinModalOpen, setJoinModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState('');
  const [introText, setIntroText] = useState('');
  const [submittingJoin, setSubmittingJoin] = useState(false);

  // Report modal
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportDetails, setReportDetails] = useState('');
  const [reporting, setReporting] = useState(false);

  // Status message
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Check user membership / pending request
  const [myMembership, setMyMembership] = useState<any>(null);
  const [myPendingRequest, setMyPendingRequest] = useState<any>(null);

  const isOwner = user && project && project.ownerId === user.id;

  const loadProject = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/projects/${id}`);
      if (res.ok) {
        const data = await res.json();
        setProject(data.project);

        if (user) {
          const mem = data.project.memberships?.find((m: any) => m.userId === user.id);
          setMyMembership(mem || null);
        }
      } else {
        router.push('/projects');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadRequests = async () => {
    if (!token || !isOwner) return;
    try {
      const res = await fetch(`/api/projects/${id}/requests`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setRequests(data.requests || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (id) loadProject();
  }, [id, user]);

  useEffect(() => {
    if (isOwner && token) loadRequests();
  }, [isOwner, token]);

  // Submit Join Request
  const handleJoinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      router.push('/login');
      return;
    }

    setSubmittingJoin(true);
    setMsg(null);

    try {
      const res = await fetch(`/api/projects/${id}/requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          roleId: selectedRole || null,
          introduction: introText,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setJoinModalOpen(false);
        setMyPendingRequest(data.request);
        setMsg({ type: 'success', text: 'Jamoaga qo‘shilish so‘rovingiz yuborildi!' });
      } else {
        setMsg({ type: 'error', text: data.error || 'Xatolik yuz berdi' });
      }
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message });
    } finally {
      setSubmittingJoin(false);
    }
  };

  // Withdraw Join Request
  const handleWithdrawRequest = async () => {
    if (!token || !confirm('So‘rovingizni bekor qilmoqchimisiz?')) return;
    try {
      const res = await fetch(`/api/projects/${id}/requests`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setMyPendingRequest(null);
        setMsg({ type: 'success', text: 'So‘rovingiz bekor qilindi' });
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Leave Team
  const handleLeaveTeam = async () => {
    if (!token || !confirm('Haqiqatan ham ushbu jamoani tark etmoqchimisiz?')) return;
    try {
      const res = await fetch(`/api/projects/${id}/members`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setMyMembership(null);
        setMsg({ type: 'success', text: 'Siz jamoani tark etdingiz' });
        loadProject();
      } else {
        alert(data.error);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Owner: Accept or Reject Request
  const handleRequestAction = async (requestId: string, action: 'ACCEPT' | 'REJECT') => {
    if (!token) return;
    try {
      const res = await fetch(`/api/projects/${id}/requests/${requestId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (res.ok) {
        loadRequests();
        loadProject();
      } else {
        alert(data.error || 'Amal bajarilmadi');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Owner: Remove Member
  const handleRemoveMember = async (targetUserId: string) => {
    if (!token || !confirm('Ushbu a‘zoni jamoa tarkibidan chiqarmoqchimisiz?')) return;
    try {
      const res = await fetch(`/api/projects/${id}/members?userId=${targetUserId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        loadProject();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Owner: Transfer Ownership
  const handleTransferOwnership = async (newOwnerId: string) => {
    if (!token || !confirm('Loyiha egaligini ushbu a‘zoga topshirmoqchimisiz? Bu amalni ortga qaytarib bo‘lmaydi.'))
      return;
    try {
      const res = await fetch(`/api/projects/${id}/members`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ newOwnerId }),
      });
      const data = await res.json();
      if (res.ok) {
        alert('Loyiha egaligi topshirildi!');
        loadProject();
      } else {
        alert(data.error);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Submit Report
  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setReporting(true);
    try {
      const res = await fetch(`/api/projects/${id}/report`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          reason: reportReason,
          details: reportDetails,
        }),
      });

      if (res.ok) {
        setReportModalOpen(false);
        setReportReason('');
        setReportDetails('');
        alert('Shikoyatingiz qabul qilindi va Career Center tomonidan ko‘rib chiqiladi.');
      } else {
        alert('Shikoyat yuborishda xatolik yuz berdi');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setReporting(false);
    }
  };

  if (loading || !project) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-burgundy-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-slate-500">Loyiha yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Navigation & Actions */}
        <div className="flex items-center justify-between">
          <Link
            href="/projects"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Loyihalar ro‘yxati
          </Link>

          <button
            onClick={() => setReportModalOpen(true)}
            className="text-slate-400 hover:text-rose-600 text-xs font-medium inline-flex items-center gap-1 transition"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            Shikoyat qilish
          </button>
        </div>

        {msg && (
          <div
            className={`p-4 rounded-xl text-xs flex items-center gap-2 ${
              msg.type === 'success'
                ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border border-rose-200 text-rose-800'
            }`}
          >
            {msg.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 shrink-0" />
            )}
            <span>{msg.text}</span>
          </div>
        )}

        {/* Project Card Header */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                  {project.category}
                </span>
                <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
                  {project.stage}
                </span>
                {project.status === 'CLOSED' && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                    Yopilgan
                  </span>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">{project.title}</h1>
              <p className="text-xs text-slate-500 mt-1">
                Loyiha asoschisi: <strong className="text-slate-800">{project.owner?.name}</strong>
              </p>
            </div>

            {/* User Interaction Button */}
            <div>
              {isOwner ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-burgundy-50 border border-burgundy-200 text-burgundy-900 text-xs font-bold">
                  <Crown className="w-3.5 h-3.5 text-burgundy-700" />
                  Siz loyiha egasisiz
                </span>
              ) : myMembership ? (
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold">
                    <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                    Jamoa a‘zosi ({myMembership.role})
                  </span>
                  <button
                    onClick={handleLeaveTeam}
                    className="p-2 text-rose-500 hover:text-rose-700 rounded hover:bg-rose-50"
                    title="Jamoani tark etish"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : myPendingRequest ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-lg font-medium">
                    So‘rovingiz kutilmoqda
                  </span>
                  <button
                    onClick={handleWithdrawRequest}
                    className="text-xs text-slate-500 hover:text-rose-600 underline"
                  >
                    Bekor qilish
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setJoinModalOpen(true)}
                  disabled={project.status === 'CLOSED'}
                  className="px-5 py-2.5 rounded-lg bg-burgundy-700 text-white text-xs font-semibold hover:bg-burgundy-800 transition shadow-sm disabled:opacity-50"
                >
                  Jamoaga qo‘shilish
                </button>
              )}
            </div>
          </div>

          <p className="text-sm text-slate-700 leading-relaxed">{project.description}</p>

          {/* Problem & Outcome */}
          {(project.problem || project.outcome) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t text-xs">
              {project.problem && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <strong className="block text-slate-900 mb-1">Muammo:</strong>
                  <p className="text-slate-600">{project.problem}</p>
                </div>
              )}
              {project.outcome && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <strong className="block text-slate-900 mb-1">Kutilayotgan natija:</strong>
                  <p className="text-slate-600">{project.outcome}</p>
                </div>
              )}
            </div>
          )}

          {/* Details Row */}
          <div className="pt-4 border-t flex flex-wrap gap-6 text-xs text-slate-600">
            <span>
              <strong>Format:</strong> {project.workFormat}
            </span>
            <span>
              <strong>Vaqt:</strong> {project.weeklyHours || 10} soat/hafta
            </span>
            <span>
              <strong>Davomiylik:</strong> {project.durationWeeks || 12} hafta
            </span>
            {project.compensation && (
              <span>
                <strong>Shartlar:</strong> {project.compensation}
              </span>
            )}
          </div>
        </div>

        {/* Open Roles & Capacities */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 border-b pb-2">
            Kerakli mutaxassislar va o‘rinlar ({project.roles?.length || 0})
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {project.roles?.map((role: any) => {
              const isFull = role.filledPlaces >= role.maxPlaces;
              return (
                <div
                  key={role.id}
                  className={`p-4 rounded-xl border transition ${
                    isFull ? 'bg-slate-50/70 border-slate-200' : 'bg-white border-slate-200 shadow-sm'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-bold text-slate-900 text-sm">{role.title}</h3>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isFull
                          ? 'bg-slate-200 text-slate-600'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {role.filledPlaces} / {role.maxPlaces} o‘rin
                    </span>
                  </div>

                  {role.skillsNeeded && (
                    <p className="text-xs text-slate-500 mt-2">
                      <strong>Ko‘nikmalar:</strong> {role.skillsNeeded}
                    </p>
                  )}

                  {!myMembership && !isOwner && !isFull && (
                    <div className="mt-3 pt-2 border-t flex justify-end">
                      <button
                        onClick={() => {
                          setSelectedRole(role.id);
                          setJoinModalOpen(true);
                        }}
                        className="text-xs text-burgundy-700 font-semibold hover:underline"
                      >
                        Shu rolga ariza topshirish →
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Team Members List */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 border-b pb-2">
            Jamoa tarkibi ({project.memberships?.length || 0})
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {project.memberships?.map((m: any) => (
              <div key={m.id} className="p-3 bg-slate-50 border rounded-xl flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-burgundy-100 text-burgundy-800 flex items-center justify-center font-bold text-xs shrink-0">
                  {m.user?.name ? m.user.name.slice(0, 2).toUpperCase() : 'JA'}
                </div>
                <div className="truncate flex-1">
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-semibold text-slate-900 text-xs truncate">
                      {m.profile?.fullName || m.user?.name}
                    </h4>
                    {m.isOwner && <Crown className="w-3 h-3 text-amber-500 shrink-0" />}
                  </div>
                  <p className="text-[11px] text-slate-500 truncate">{m.role}</p>

                  {m.profile?.skills && m.profile.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {m.profile.skills.slice(0, 2).map((s: any, idx: number) => (
                        <span key={idx} className="text-[9px] bg-white border px-1 py-0.5 rounded text-slate-600">
                          {s.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* OWNER MANAGEMENT AREA */}
        {isOwner && (
          <div className="bg-white rounded-2xl border-2 border-burgundy-200 p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <span className="text-[10px] font-bold text-burgundy-800 uppercase tracking-wider">
                  Loyiha egasi boshqaruvi
                </span>
                <h3 className="text-lg font-bold text-slate-900">
                  Arizalar va Jamoa sozlamalari
                </h3>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setActiveOwnerTab('requests')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                    activeOwnerTab === 'requests'
                      ? 'bg-burgundy-700 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Arizalar ({requests.filter((r) => r.status === 'PENDING').length})
                </button>
                <button
                  onClick={() => setActiveOwnerTab('members')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                    activeOwnerTab === 'members'
                      ? 'bg-burgundy-700 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  A‘zolar
                </button>
              </div>
            </div>

            {/* TAB 1: Requests */}
            {activeOwnerTab === 'requests' && (
              <div className="space-y-4">
                {requests.filter((r) => r.status === 'PENDING').length === 0 ? (
                  <p className="text-xs text-slate-500 py-4 text-center">
                    Hozircha yangi a‘zolik arizalari yo‘q.
                  </p>
                ) : (
                  requests
                    .filter((r) => r.status === 'PENDING')
                    .map((req) => (
                      <div
                        key={req.id}
                        className="p-4 bg-slate-50 border rounded-xl space-y-3 text-xs"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div>
                            <h4 className="font-bold text-slate-900 text-sm">
                              {req.user?.name}
                            </h4>
                            <p className="text-slate-500">
                              Rol so‘rovi: <strong className="text-burgundy-800">{req.roleTitle}</strong>
                            </p>
                          </div>
                          <span className="text-[10px] text-slate-400">
                            {new Date(req.createdAt).toLocaleString('uz-UZ')}
                          </span>
                        </div>

                        {req.introduction && (
                          <div className="p-2.5 bg-white border rounded text-slate-600">
                            <span className="font-semibold block text-[10px] text-slate-400">
                              Talaba xabari:
                            </span>
                            "{req.introduction}"
                          </div>
                        )}

                        <div className="flex justify-end gap-2 pt-2 border-t">
                          <button
                            onClick={() => handleRequestAction(req.id, 'REJECT')}
                            className="px-3 py-1.5 border border-slate-300 rounded text-slate-700 font-semibold hover:bg-slate-100"
                          >
                            Rad etish
                          </button>
                          <button
                            onClick={() => handleRequestAction(req.id, 'ACCEPT')}
                            className="px-4 py-1.5 bg-burgundy-700 text-white rounded font-semibold hover:bg-burgundy-800"
                          >
                            Qabul qilish
                          </button>
                        </div>
                      </div>
                    ))
                )}
              </div>
            )}

            {/* TAB 2: Members management & Ownership transfer */}
            {activeOwnerTab === 'members' && (
              <div className="space-y-3">
                {project.memberships?.map((m: any) => (
                  <div
                    key={m.id}
                    className="p-3 bg-slate-50 border rounded-xl flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-bold text-slate-900">{m.user?.name}</span>
                      <span className="text-slate-500 ml-2">({m.role})</span>
                      {m.isOwner && (
                        <span className="ml-2 text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                          Ega
                        </span>
                      )}
                    </div>

                    {!m.isOwner && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleTransferOwnership(m.userId)}
                          className="text-[11px] text-burgundy-700 hover:underline font-semibold"
                        >
                          Egalikni topshirish
                        </button>
                        <button
                          onClick={() => handleRemoveMember(m.userId)}
                          className="text-[11px] text-rose-600 hover:text-rose-800"
                        >
                          Chiqarish
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* JOIN MODAL */}
        {joinModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b pb-3">
                <h3 className="font-bold text-slate-900 text-base">Jamoaga qo‘shilish so‘rovi</h3>
                <button
                  onClick={() => setJoinModalOpen(false)}
                  className="text-slate-400 hover:text-slate-700 text-xl font-bold"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleJoinSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Qaysi rolga topshirmoqchisiz?
                  </label>
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="">Ixtiyoriy / Mos rol</option>
                    {project.roles?.map((r: any) => (
                      <option
                        key={r.id}
                        value={r.id}
                        disabled={r.filledPlaces >= r.maxPlaces}
                      >
                        {r.title} ({r.filledPlaces}/{r.maxPlaces})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Qisqa kirish so‘zi (o‘zingiz va motivatsiyangiz)
                  </label>
                  <textarea
                    rows={3}
                    value={introText}
                    onChange={(e) => setIntroText(e.target.value)}
                    placeholder="Loyiha egasiga nega sizni qabul qilishi kerakligi haqida yozing..."
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>

                <div className="pt-2 border-t flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setJoinModalOpen(false)}
                    className="px-4 py-2 border rounded-lg text-slate-600 font-semibold hover:bg-slate-50"
                  >
                    Bekor qilish
                  </button>
                  <button
                    type="submit"
                    disabled={submittingJoin}
                    className="px-4 py-2 bg-burgundy-700 text-white rounded-lg font-semibold hover:bg-burgundy-800 disabled:opacity-50"
                  >
                    {submittingJoin ? 'Yuborilmoqda...' : 'So‘rovni yuborish'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* REPORT MODAL */}
        {reportModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b pb-3">
                <h3 className="font-bold text-slate-900 text-base">Loyihadan shikoyat qilish</h3>
                <button
                  onClick={() => setReportModalOpen(false)}
                  className="text-slate-400 hover:text-slate-700 text-xl font-bold"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleReportSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Shikoyat sababi *
                  </label>
                  <select
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    required
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="">Sababni tanlang</option>
                    <option value="SPAM">Spam yoki yolg‘on e‘lon</option>
                    <option value="INAPPROPRIATE">Nomaqbul yoki haqoratomuz kontent</option>
                    <option value="COMMERCIAL">Ruxsatsiz tijoriy xizmat</option>
                    <option value="OTHER">Boshqa sabab</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Batafsil ma‘lumot
                  </label>
                  <textarea
                    rows={3}
                    value={reportDetails}
                    onChange={(e) => setReportDetails(e.target.value)}
                    placeholder="Vaziyatni qisqacha tushuntirib bering..."
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>

                <div className="pt-2 border-t flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setReportModalOpen(false)}
                    className="px-4 py-2 border rounded-lg text-slate-600 font-semibold hover:bg-slate-50"
                  >
                    Bekor qilish
                  </button>
                  <button
                    type="submit"
                    disabled={reporting}
                    className="px-4 py-2 bg-rose-600 text-white rounded-lg font-semibold hover:bg-rose-700 disabled:opacity-50"
                  >
                    {reporting ? 'Yuborilmoqda...' : 'Shikoyatni yuborish'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
