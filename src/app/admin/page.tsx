'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck,
  Users,
  FileText,
  AlertTriangle,
  FolderGit2,
  Sparkles,
  CheckCircle2,
  XCircle,
  Plus,
  BookOpen,
  Building2,
  History,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function AdminPage() {
  const { user, token, isLoading } = useAuth();
  const router = useRouter();

  const [metrics, setMetrics] = useState<any>(null);
  const [reports, setReports] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [orgTypes, setOrgTypes] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);

  const [activeTab, setActiveTab] = useState<'reports' | 'references' | 'audit'>('reports');
  const [loading, setLoading] = useState(true);

  // New reference form
  const [newRoleTitle, setNewRoleTitle] = useState('');
  const [newRoleCategory, setNewRoleCategory] = useState('IT');
  const [newRoleDesc, setNewRoleDesc] = useState('');

  const [newOrgName, setNewOrgName] = useState('');
  const [newOrgDesc, setNewOrgDesc] = useState('');

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push('/login');
      } else if (user.role !== 'ADMIN') {
        router.push('/');
      }
    }
  }, [user, isLoading, router]);

  const loadData = async () => {
    if (!token) return;
    try {
      setLoading(true);
      // Metrics
      const mRes = await fetch('/api/admin/metrics', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (mRes.ok) {
        const mData = await mRes.json();
        setMetrics(mData.metrics);
        setAuditLogs(mData.recentAuditLogs || []);
      }

      // Reports
      const rRes = await fetch('/api/admin/reports', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (rRes.ok) {
        const rData = await rRes.json();
        setReports(rData.reports || []);
      }

      // References
      const refRes = await fetch('/api/admin/references', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (refRes.ok) {
        const refData = await refRes.json();
        setRoles(refData.roles || []);
        setOrgTypes(refData.orgTypes || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'ADMIN' && token) {
      loadData();
    }
  }, [user, token]);

  const handleResolveReport = async (reportId: string, status: 'RESOLVED' | 'DISMISSED', closeProject: boolean) => {
    if (!token) return;
    try {
      const res = await fetch('/api/admin/reports', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reportId, status, closeProject }),
      });
      if (res.ok) {
        loadData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !newRoleTitle.trim()) return;
    try {
      const res = await fetch('/api/admin/references', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          type: 'ROLE',
          title: newRoleTitle.trim(),
          category: newRoleCategory,
          description: newRoleDesc,
        }),
      });
      if (res.ok) {
        setNewRoleTitle('');
        setNewRoleDesc('');
        loadData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !newOrgName.trim()) return;
    try {
      const res = await fetch('/api/admin/references', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          type: 'ORG',
          name: newOrgName.trim(),
          description: newOrgDesc,
        }),
      });
      if (res.ok) {
        setNewOrgName('');
        setNewOrgDesc('');
        loadData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading || !user || user.role !== 'ADMIN') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-burgundy-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-slate-500">Administrator paneli yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Header */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm flex items-center justify-between">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-burgundy-100 text-burgundy-800 mb-2">
              <ShieldCheck className="w-3.5 h-3.5 text-burgundy-700" />
              <span>Career Center Ma‘muriyati</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
              Boshqaruv va Moderatsiya Paneli
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Platforma operatsion holati, shikoyatlarni tekshirish va ma‘lumotnomalarni yuritish.
            </p>
          </div>
        </div>

        {/* Metrics Cards */}
        {metrics && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <Users className="w-4 h-4 text-blue-600 mb-1" />
              <div className="text-xl font-bold text-slate-900">{metrics.totalStudents}</div>
              <div className="text-[10px] text-slate-500">Talabalar</div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <FileText className="w-4 h-4 text-purple-600 mb-1" />
              <div className="text-xl font-bold text-slate-900">{metrics.totalCvs}</div>
              <div className="text-[10px] text-slate-500">Jami CV‘lar</div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <FolderGit2 className="w-4 h-4 text-emerald-600 mb-1" />
              <div className="text-xl font-bold text-slate-900">{metrics.totalProjects}</div>
              <div className="text-[10px] text-slate-500">Nashr loyihalar</div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <AlertTriangle className="w-4 h-4 text-rose-600 mb-1" />
              <div className="text-xl font-bold text-slate-900">{metrics.pendingReports}</div>
              <div className="text-[10px] text-slate-500">Shikoyatlar</div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <Sparkles className="w-4 h-4 text-amber-600 mb-1" />
              <div className="text-xl font-bold text-slate-900">{metrics.totalReviews}</div>
              <div className="text-[10px] text-slate-500">AI tekshiruvlar</div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <History className="w-4 h-4 text-slate-600 mb-1" />
              <div className="text-xl font-bold text-slate-900">{metrics.totalVoiceJobs}</div>
              <div className="text-[10px] text-slate-500">Ovozli yozuvlar</div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex border-b border-slate-200 bg-white px-4 pt-2 rounded-xl shadow-sm gap-2">
          <button
            onClick={() => setActiveTab('reports')}
            className={`px-4 py-3 text-xs sm:text-sm font-semibold border-b-2 transition ${
              activeTab === 'reports'
                ? 'border-burgundy-700 text-burgundy-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Moderatsiya va Shikoyatlar ({reports.filter((r) => r.status === 'PENDING').length})
          </button>
          <button
            onClick={() => setActiveTab('references')}
            className={`px-4 py-3 text-xs sm:text-sm font-semibold border-b-2 transition ${
              activeTab === 'references'
                ? 'border-burgundy-700 text-burgundy-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Ma‘lumotnomalar (Kasblar & Tashkilotlar)
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`px-4 py-3 text-xs sm:text-sm font-semibold border-b-2 transition ${
              activeTab === 'audit'
                ? 'border-burgundy-700 text-burgundy-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Audit Jurnali
          </button>
        </div>

        {/* TAB 1: Moderation Reports */}
        {activeTab === 'reports' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-slate-900 border-b pb-2">
              Loyiha va kontent shikoyatlari
            </h2>

            {reports.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">Hozircha shikoyatlar mavjud emas.</p>
            ) : (
              <div className="space-y-3">
                {reports.map((rep) => (
                  <div
                    key={rep.id}
                    className="p-4 bg-slate-50 border rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs"
                  >
                    <div className="space-y-1 max-w-xl">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">Sabab: {rep.reason}</span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            rep.status === 'PENDING'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-200 text-slate-600'
                          }`}
                        >
                          {rep.status}
                        </span>
                      </div>
                      <p className="text-slate-600">
                        Loyiha: <strong>{rep.project?.title || 'O‘chirilgan'}</strong>
                      </p>
                      {rep.details && <p className="text-slate-500 italic">"{rep.details}"</p>}
                      <p className="text-[10px] text-slate-400">
                        Yuboruvchi: {rep.reporter?.name} • {new Date(rep.createdAt).toLocaleString('uz-UZ')}
                      </p>
                    </div>

                    {rep.status === 'PENDING' && (
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => handleResolveReport(rep.id, 'DISMISSED', false)}
                          className="px-3 py-1.5 border border-slate-300 rounded text-slate-700 font-semibold hover:bg-slate-100"
                        >
                          Rad etish
                        </button>
                        <button
                          onClick={() => handleResolveReport(rep.id, 'RESOLVED', true)}
                          className="px-3 py-1.5 bg-rose-600 text-white rounded font-semibold hover:bg-rose-700"
                        >
                          Loyihani yopish
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: References */}
        {activeTab === 'references' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Roles reference */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
              <h2 className="text-base font-bold text-slate-900 border-b pb-2 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-blue-600" />
                Kasbiy rollar taksonomiyasi ({roles.length})
              </h2>

              <div className="space-y-1.5 max-h-60 overflow-y-auto text-xs">
                {roles.map((r) => (
                  <div key={r.id} className="p-2 bg-slate-50 rounded flex justify-between">
                    <span className="font-semibold text-slate-800">{r.title}</span>
                    <span className="text-[10px] text-slate-500">{r.category}</span>
                  </div>
                ))}
              </div>

              <form onSubmit={handleAddRole} className="pt-2 border-t space-y-2 text-xs">
                <h3 className="font-bold text-slate-700">Yangi rol qo‘shish</h3>
                <input
                  type="text"
                  required
                  placeholder="Rol nomi (masalan: Data Analyst)"
                  value={newRoleTitle}
                  onChange={(e) => setNewRoleTitle(e.target.value)}
                  className="w-full px-2.5 py-1.5 border rounded"
                />
                <select
                  value={newRoleCategory}
                  onChange={(e) => setNewRoleCategory(e.target.value)}
                  className="w-full px-2.5 py-1.5 border rounded"
                >
                  <option value="IT">IT & Dasturlash</option>
                  <option value="FINANCE">Moliya & Bank</option>
                  <option value="MARKETING">Marketing & Sotuv</option>
                  <option value="DESIGN">Dizayn</option>
                  <option value="MANAGEMENT">Menejment</option>
                </select>
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-burgundy-700 text-white rounded font-medium hover:bg-burgundy-800"
                >
                  Qo‘shish
                </button>
              </form>
            </div>

            {/* Organization types reference */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
              <h2 className="text-base font-bold text-slate-900 border-b pb-2 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-emerald-600" />
                Tashkilot turlari taksonomiyasi ({orgTypes.length})
              </h2>

              <div className="space-y-1.5 max-h-60 overflow-y-auto text-xs">
                {orgTypes.map((o) => (
                  <div key={o.id} className="p-2 bg-slate-50 rounded flex justify-between">
                    <span className="font-semibold text-slate-800">{o.name}</span>
                    <span className="text-[10px] text-slate-500">{o.description}</span>
                  </div>
                ))}
              </div>

              <form onSubmit={handleAddOrg} className="pt-2 border-t space-y-2 text-xs">
                <h3 className="font-bold text-slate-700">Yangi tashkilot turi qo‘shish</h3>
                <input
                  type="text"
                  required
                  placeholder="Tashkilot turi nomi (masalan: Fintech kompaniyalar)"
                  value={newOrgName}
                  onChange={(e) => setNewOrgName(e.target.value)}
                  className="w-full px-2.5 py-1.5 border rounded"
                />
                <input
                  type="text"
                  placeholder="Qisqa izoh"
                  value={newOrgDesc}
                  onChange={(e) => setNewOrgDesc(e.target.value)}
                  className="w-full px-2.5 py-1.5 border rounded"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-burgundy-700 text-white rounded font-medium hover:bg-burgundy-800"
                >
                  Qo‘shish
                </button>
              </form>
            </div>
          </div>
        )}

        {/* TAB 3: Audit Logs */}
        {activeTab === 'audit' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-slate-900 border-b pb-2">
              So‘nggi ma‘muriy amallar jurnali
            </h2>
            <div className="space-y-2 text-xs">
              {auditLogs.length === 0 ? (
                <p className="text-slate-400 py-4 text-center">Audit yozuvlari mavjud emas.</p>
              ) : (
                auditLogs.map((log) => (
                  <div key={log.id} className="p-2.5 bg-slate-50 rounded border flex justify-between">
                    <div>
                      <span className="font-bold text-slate-800">{log.action}</span>
                      <p className="text-slate-600 mt-0.5">{log.details}</p>
                    </div>
                    <span className="text-[10px] text-slate-400">
                      {new Date(log.createdAt).toLocaleString('uz-UZ')}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
