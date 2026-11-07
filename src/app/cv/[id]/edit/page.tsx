'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Save,
  Download,
  Copy,
  Layout,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  ExternalLink,
  Eye,
  Edit3,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { TemplateConfig, TEMPLATE_CONFIGS } from '@/lib/cv-templates';
import { buildCvHtml } from '@/lib/cv-html-builder';

export default function CvEditorPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const { user, token, isLoading } = useAuth();

  // CV Data state
  const [title, setTitle] = useState('Rezyume');
  const [templateId, setTemplateId] = useState('minimal-classic-burgundy');
  const [template, setTemplate] = useState<TemplateConfig>(TEMPLATE_CONFIGS[0]);

  const [personalInfo, setPersonalInfo] = useState({
    fullName: '',
    email: '',
    phone: '',
    city: 'Toshkent',
    photoUrl: '',
    linkedinUrl: '',
    githubUrl: '',
    portfolioUrl: '',
  });

  const [summary, setSummary] = useState('');
  const [educations, setEducations] = useState<any[]>([]);
  const [experiences, setExperiences] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [skills, setSkills] = useState<any[]>([]);
  const [languages, setLanguages] = useState<any[]>([]);
  const [certificates, setCertificates] = useState<any[]>([]);

  // UI state
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [activeMobileView, setActiveMobileView] = useState<'editor' | 'preview'>('editor');
  const [templateModalOpen, setTemplateModalOpen] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Active accordion section
  const [openSection, setOpenSection] = useState<string>('personal');

  // New item inputs
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillProf, setNewSkillProf] = useState('INTERMEDIATE');

  const [newLangName, setNewLangName] = useState('');
  const [newLangProf, setNewLangProf] = useState('B2');

  const autosaveTimerRef = useRef<any>(null);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  // Load CV
  useEffect(() => {
    if (!token || !id) return;

    async function fetchCv() {
      try {
        setLoading(true);
        const res = await fetch(`/api/cv/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const data = await res.json();
          const cv = data.cv;
          setTitle(cv.title || 'Rezyume');
          setTemplateId(cv.templateId || 'minimal-classic-burgundy');

          const foundTmpl = TEMPLATE_CONFIGS.find((t) => t.id === cv.templateId);
          if (foundTmpl) setTemplate(foundTmpl);

          if (cv.personalInfo) setPersonalInfo(JSON.parse(cv.personalInfo));
          if (cv.summary) setSummary(cv.summary);
          if (cv.educationData) setEducations(JSON.parse(cv.educationData));
          if (cv.experienceData) setExperiences(JSON.parse(cv.experienceData));
          if (cv.projectsData) setProjects(JSON.parse(cv.projectsData));
          if (cv.skillsData) setSkills(JSON.parse(cv.skillsData));
          if (cv.languagesData) setLanguages(JSON.parse(cv.languagesData));
          if (cv.certificatesData) setCertificates(JSON.parse(cv.certificatesData));
        } else {
          router.push('/cv');
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchCv();
  }, [id, token, router]);

  // Save CV
  const saveCv = async (isManual = false) => {
    if (!token || !id) return;
    setSaveStatus('saving');
    try {
      const res = await fetch(`/api/cv/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          templateId,
          personalInfo,
          summary,
          educationData: educations,
          experienceData: experiences,
          projectsData: projects,
          skillsData: skills,
          languagesData: languages,
          certificatesData: certificates,
        }),
      });

      if (res.ok) {
        setSaveStatus('saved');
        if (isManual) {
          setStatusMessage('Rezyume muvaffaqiyatli saqlandi ✓');
          setTimeout(() => setStatusMessage(null), 3000);
        }
      } else {
        setSaveStatus('error');
      }
    } catch (err) {
      console.error(err);
      setSaveStatus('error');
    }
  };

  // Debounced auto-save on content change
  useEffect(() => {
    if (loading) return;

    if (autosaveTimerRef.current) {
      clearTimeout(autosaveTimerRef.current);
    }

    autosaveTimerRef.current = setTimeout(() => {
      saveCv(false);
    }, 4000); // Autosave 4 seconds after typing stops

    return () => {
      if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current);
    };
  }, [
    title,
    templateId,
    personalInfo,
    summary,
    educations,
    experiences,
    projects,
    skills,
    languages,
    certificates,
  ]);

  // Import from shared profile
  const handleImportProfile = async () => {
    if (!token) return;
    if (
      !confirm(
        'Profilingizdagi ma‘lumotlar CV maydonlariga o‘tkazilsinmi? Mavjud ma‘lumotlar to‘ldiriladi.',
      )
    )
      return;

    try {
      const res = await fetch('/api/profile', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        const p = data.profile;
        if (p) {
          setPersonalInfo({
            fullName: p.fullName || personalInfo.fullName,
            email: user?.email || personalInfo.email,
            phone: p.phone || personalInfo.phone,
            city: p.city || personalInfo.city,
            photoUrl: p.photoUrl || personalInfo.photoUrl,
            linkedinUrl: p.linkedinUrl || personalInfo.linkedinUrl,
            githubUrl: p.githubUrl || personalInfo.githubUrl,
            portfolioUrl: p.portfolioUrl || personalInfo.portfolioUrl,
          });

          if (p.bio && !summary) setSummary(p.bio);

          if (p.educations?.length) {
            setEducations(
              p.educations.map((e: any) => ({
                institution: e.institution,
                degree: e.degree,
                fieldOfStudy: e.fieldOfStudy,
                startYear: e.startYear,
                endYear: e.endYear,
                description: e.description || '',
              })),
            );
          }

          if (p.skills?.length) {
            setSkills(
              p.skills.map((s: any) => ({
                name: s.name,
                proficiency: s.proficiency || 'INTERMEDIATE',
              })),
            );
          }

          if (p.languages?.length) {
            setLanguages(
              p.languages.map((l: any) => ({
                language: l.language,
                proficiency: l.proficiency || 'B1',
              })),
            );
          }

          setStatusMessage('Profil ma‘lumotlari muvaffaqiyatli import qilindi!');
          setTimeout(() => setStatusMessage(null), 3000);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Change Template without data loss
  const selectNewTemplate = (newTmpl: TemplateConfig) => {
    setTemplateId(newTmpl.id);
    setTemplate(newTmpl);
    setTemplateModalOpen(false);
    setStatusMessage(`Shablon o‘zgartirildi: ${newTmpl.name} (Ma‘lumotlaringiz to‘liq saqlandi)`);
    setTimeout(() => setStatusMessage(null), 3500);
  };

  // Build live preview HTML
  const previewHtml = buildCvHtml(
    {
      title,
      personalInfo,
      summary,
      educationData: educations,
      experienceData: experiences,
      projectsData: projects,
      skillsData: skills,
      languagesData: languages,
      certificatesData: certificates,
    },
    template,
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-burgundy-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-slate-500">CV yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200 px-4 py-2.5 shadow-sm flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href="/cv"
            className="p-1.5 text-slate-500 hover:text-slate-800 rounded hover:bg-slate-100"
            title="Orqaga"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>

          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="font-bold text-slate-900 text-sm sm:text-base px-2 py-1 border border-transparent hover:border-slate-300 focus:border-burgundy-500 rounded bg-transparent focus:bg-white truncate"
            title="CV nomini o‘zgartirish uchun bosing"
          />

          <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-slate-400">
            {saveStatus === 'saving' && (
              <span className="text-amber-600 flex items-center gap-1">
                <Clock className="w-3 h-3 animate-spin" /> Saqlanmoqda...
              </span>
            )}
            {saveStatus === 'saved' && (
              <span className="text-emerald-600 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Saqlandi
              </span>
            )}
            {saveStatus === 'error' && (
              <span className="text-rose-600 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> Xatolik
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Mobile view toggle */}
          <div className="flex lg:hidden rounded-lg border border-slate-300 p-0.5 bg-slate-50">
            <button
              onClick={() => setActiveMobileView('editor')}
              className={`px-2.5 py-1 text-xs font-semibold rounded ${
                activeMobileView === 'editor'
                  ? 'bg-white text-burgundy-800 shadow-sm'
                  : 'text-slate-600'
              }`}
            >
              Tahrir
            </button>
            <button
              onClick={() => setActiveMobileView('preview')}
              className={`px-2.5 py-1 text-xs font-semibold rounded ${
                activeMobileView === 'preview'
                  ? 'bg-white text-burgundy-800 shadow-sm'
                  : 'text-slate-600'
              }`}
            >
              Ko‘rish
            </button>
          </div>

          <button
            onClick={() => setTemplateModalOpen(true)}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 text-xs font-medium hover:bg-slate-50"
          >
            <Layout className="w-3.5 h-3.5" />
            <span>Shablon ({template.name})</span>
          </button>

          <button
            onClick={() => saveCv(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-burgundy-700 text-white text-xs font-semibold hover:bg-burgundy-800 shadow-sm"
          >
            <Save className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Saqlash</span>
          </button>

          <a
            href={`/api/cv/${id}/pdf`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>PDF yuklash</span>
          </a>
        </div>
      </header>

      {statusMessage && (
        <div className="bg-emerald-600 text-white text-xs py-1.5 px-4 text-center font-medium shadow-sm transition">
          {statusMessage}
        </div>
      )}

      {/* Main workspace */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT PANEL: Editor */}
        <div
          className={`w-full lg:w-1/2 overflow-y-auto p-4 sm:p-6 space-y-4 ${
            activeMobileView === 'preview' ? 'hidden lg:block' : 'block'
          }`}
        >
          {/* Action helper bar */}
          <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-slate-200 text-xs">
            <span className="text-slate-500">
              Shablon: <strong>{template.name}</strong> ({template.family})
            </span>
            <div className="flex gap-2">
              <button
                onClick={handleImportProfile}
                className="text-burgundy-700 hover:text-burgundy-800 font-semibold inline-flex items-center gap-1"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Profildan import qilish
              </button>
            </div>
          </div>

          {/* SECTION 1: Personal Info */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
            <button
              onClick={() => setOpenSection(openSection === 'personal' ? '' : 'personal')}
              className="w-full p-4 flex items-center justify-between text-left font-bold text-slate-900 text-sm hover:bg-slate-50"
            >
              <span>1. Shaxsiy ma‘lumotlar</span>
              {openSection === 'personal' ? (
                <ChevronUp className="w-4 h-4 text-slate-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-400" />
              )}
            </button>

            {openSection === 'personal' && (
              <div className="p-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-slate-600 font-medium mb-1">To‘liq ism</label>
                  <input
                    type="text"
                    value={personalInfo.fullName}
                    onChange={(e) =>
                      setPersonalInfo({ ...personalInfo, fullName: e.target.value })
                    }
                    className="w-full px-2.5 py-1.5 border rounded-lg"
                    placeholder="Sardor Aliyev"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Email</label>
                  <input
                    type="email"
                    value={personalInfo.email}
                    onChange={(e) => setPersonalInfo({ ...personalInfo, email: e.target.value })}
                    className="w-full px-2.5 py-1.5 border rounded-lg"
                    placeholder="sardor@example.com"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Telefon</label>
                  <input
                    type="tel"
                    value={personalInfo.phone}
                    onChange={(e) => setPersonalInfo({ ...personalInfo, phone: e.target.value })}
                    className="w-full px-2.5 py-1.5 border rounded-lg"
                    placeholder="+998 90 123 45 67"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Shahar</label>
                  <input
                    type="text"
                    value={personalInfo.city}
                    onChange={(e) => setPersonalInfo({ ...personalInfo, city: e.target.value })}
                    className="w-full px-2.5 py-1.5 border rounded-lg"
                    placeholder="Toshkent"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">LinkedIn URL</label>
                  <input
                    type="url"
                    value={personalInfo.linkedinUrl}
                    onChange={(e) =>
                      setPersonalInfo({ ...personalInfo, linkedinUrl: e.target.value })
                    }
                    className="w-full px-2.5 py-1.5 border rounded-lg"
                    placeholder="linkedin.com/in/username"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">GitHub URL</label>
                  <input
                    type="url"
                    value={personalInfo.githubUrl}
                    onChange={(e) =>
                      setPersonalInfo({ ...personalInfo, githubUrl: e.target.value })
                    }
                    className="w-full px-2.5 py-1.5 border rounded-lg"
                    placeholder="github.com/username"
                  />
                </div>
              </div>
            )}
          </div>

          {/* SECTION 2: Summary */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
            <button
              onClick={() => setOpenSection(openSection === 'summary' ? '' : 'summary')}
              className="w-full p-4 flex items-center justify-between text-left font-bold text-slate-900 text-sm hover:bg-slate-50"
            >
              <span>2. Professional xulosa</span>
              {openSection === 'summary' ? (
                <ChevronUp className="w-4 h-4 text-slate-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-400" />
              )}
            </button>

            {openSection === 'summary' && (
              <div className="p-4 border-t border-slate-100 text-xs">
                <textarea
                  rows={4}
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="Maqsadlaringiz, asosiy qiziqishlaringiz va yutuqlaringiz haqida 2-3 jumla..."
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
            )}
          </div>

          {/* SECTION 3: Education */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
            <button
              onClick={() => setOpenSection(openSection === 'education' ? '' : 'education')}
              className="w-full p-4 flex items-center justify-between text-left font-bold text-slate-900 text-sm hover:bg-slate-50"
            >
              <span>3. Ta‘lim ({educations.length})</span>
              {openSection === 'education' ? (
                <ChevronUp className="w-4 h-4 text-slate-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-400" />
              )}
            </button>

            {openSection === 'education' && (
              <div className="p-4 border-t border-slate-100 space-y-4 text-xs">
                {educations.map((edu, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 border rounded-lg space-y-2 relative">
                    <button
                      onClick={() => setEducations(educations.filter((_, i) => i !== idx))}
                      className="absolute top-2 right-2 text-rose-500 hover:text-rose-700"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={edu.institution}
                        placeholder="Muassasa nomi"
                        onChange={(e) => {
                          const updated = [...educations];
                          updated[idx].institution = e.target.value;
                          setEducations(updated);
                        }}
                        className="px-2 py-1 border rounded bg-white"
                      />
                      <input
                        type="text"
                        value={edu.fieldOfStudy}
                        placeholder="Yo‘nalish"
                        onChange={(e) => {
                          const updated = [...educations];
                          updated[idx].fieldOfStudy = e.target.value;
                          setEducations(updated);
                        }}
                        className="px-2 py-1 border rounded bg-white"
                      />
                      <input
                        type="text"
                        value={edu.degree}
                        placeholder="Daraja (Bakalavr)"
                        onChange={(e) => {
                          const updated = [...educations];
                          updated[idx].degree = e.target.value;
                          setEducations(updated);
                        }}
                        className="px-2 py-1 border rounded bg-white"
                      />
                      <div className="flex gap-1">
                        <input
                          type="text"
                          value={edu.startYear}
                          placeholder="Boshlanish"
                          onChange={(e) => {
                            const updated = [...educations];
                            updated[idx].startYear = e.target.value;
                            setEducations(updated);
                          }}
                          className="w-1/2 px-2 py-1 border rounded bg-white"
                        />
                        <input
                          type="text"
                          value={edu.endYear || ''}
                          placeholder="Tugash"
                          onChange={(e) => {
                            const updated = [...educations];
                            updated[idx].endYear = e.target.value;
                            setEducations(updated);
                          }}
                          className="w-1/2 px-2 py-1 border rounded bg-white"
                        />
                      </div>
                    </div>
                  </div>
                ))}

                <button
                  onClick={() =>
                    setEducations([
                      ...educations,
                      {
                        institution: 'TMC Institute',
                        degree: 'Bakalavr',
                        fieldOfStudy: '',
                        startYear: 2022,
                        endYear: 2026,
                      },
                    ])
                  }
                  className="w-full py-2 border border-dashed border-slate-300 rounded-lg text-slate-600 hover:border-burgundy-500 hover:text-burgundy-800 font-medium"
                >
                  + Ta‘lim qo‘shish
                </button>
              </div>
            )}
          </div>

          {/* SECTION 4: Experience */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
            <button
              onClick={() => setOpenSection(openSection === 'experience' ? '' : 'experience')}
              className="w-full p-4 flex items-center justify-between text-left font-bold text-slate-900 text-sm hover:bg-slate-50"
            >
              <span>4. Ish va Amaliyot tajribasi ({experiences.length}) (Ixtiyoriy)</span>
              {openSection === 'experience' ? (
                <ChevronUp className="w-4 h-4 text-slate-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-400" />
              )}
            </button>

            {openSection === 'experience' && (
              <div className="p-4 border-t border-slate-100 space-y-4 text-xs">
                {experiences.map((exp, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 border rounded-lg space-y-2 relative">
                    <button
                      onClick={() => setExperiences(experiences.filter((_, i) => i !== idx))}
                      className="absolute top-2 right-2 text-rose-500 hover:text-rose-700"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={exp.title}
                        placeholder="Lavozim"
                        onChange={(e) => {
                          const updated = [...experiences];
                          updated[idx].title = e.target.value;
                          setExperiences(updated);
                        }}
                        className="px-2 py-1 border rounded bg-white"
                      />
                      <input
                        type="text"
                        value={exp.organization}
                        placeholder="Tashkilot"
                        onChange={(e) => {
                          const updated = [...experiences];
                          updated[idx].organization = e.target.value;
                          setExperiences(updated);
                        }}
                        className="px-2 py-1 border rounded bg-white"
                      />
                      <input
                        type="text"
                        value={exp.startDate}
                        placeholder="Boshlanish (2023-01)"
                        onChange={(e) => {
                          const updated = [...experiences];
                          updated[idx].startDate = e.target.value;
                          setExperiences(updated);
                        }}
                        className="px-2 py-1 border rounded bg-white"
                      />
                      <input
                        type="text"
                        value={exp.endDate || ''}
                        placeholder="Tugash (hozirgacha)"
                        onChange={(e) => {
                          const updated = [...experiences];
                          updated[idx].endDate = e.target.value;
                          setExperiences(updated);
                        }}
                        className="px-2 py-1 border rounded bg-white"
                      />
                    </div>
                    <textarea
                      rows={2}
                      value={exp.description || ''}
                      placeholder="Bajargan vazifalaringiz..."
                      onChange={(e) => {
                        const updated = [...experiences];
                        updated[idx].description = e.target.value;
                        setExperiences(updated);
                      }}
                      className="w-full px-2 py-1 border rounded bg-white"
                    />
                  </div>
                ))}

                <button
                  onClick={() =>
                    setExperiences([
                      ...experiences,
                      {
                        title: 'Amaliyotchi',
                        organization: '',
                        category: 'INTERNSHIP',
                        startDate: '2023-06',
                        endDate: '2023-09',
                        description: '',
                      },
                    ])
                  }
                  className="w-full py-2 border border-dashed border-slate-300 rounded-lg text-slate-600 hover:border-burgundy-500 hover:text-burgundy-800 font-medium"
                >
                  + Tajriba qo‘shish
                </button>
              </div>
            )}
          </div>

          {/* SECTION 5: Projects */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
            <button
              onClick={() => setOpenSection(openSection === 'projects' ? '' : 'projects')}
              className="w-full p-4 flex items-center justify-between text-left font-bold text-slate-900 text-sm hover:bg-slate-50"
            >
              <span>5. Loyihalar ({projects.length})</span>
              {openSection === 'projects' ? (
                <ChevronUp className="w-4 h-4 text-slate-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-400" />
              )}
            </button>

            {openSection === 'projects' && (
              <div className="p-4 border-t border-slate-100 space-y-4 text-xs">
                {projects.map((proj, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 border rounded-lg space-y-2 relative">
                    <button
                      onClick={() => setProjects(projects.filter((_, i) => i !== idx))}
                      className="absolute top-2 right-2 text-rose-500 hover:text-rose-700"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={proj.title}
                        placeholder="Loyiha nomi"
                        onChange={(e) => {
                          const updated = [...projects];
                          updated[idx].title = e.target.value;
                          setProjects(updated);
                        }}
                        className="px-2 py-1 border rounded bg-white"
                      />
                      <input
                        type="text"
                        value={proj.url || ''}
                        placeholder="Havola (URL)"
                        onChange={(e) => {
                          const updated = [...projects];
                          updated[idx].url = e.target.value;
                          setProjects(updated);
                        }}
                        className="px-2 py-1 border rounded bg-white"
                      />
                    </div>
                    <input
                      type="text"
                      value={proj.technologies || ''}
                      placeholder="Texnologiyalar (React, Node.js, Python)"
                      onChange={(e) => {
                        const updated = [...projects];
                        updated[idx].technologies = e.target.value;
                        setProjects(updated);
                      }}
                      className="w-full px-2 py-1 border rounded bg-white"
                    />
                    <textarea
                      rows={2}
                      value={proj.description || ''}
                      placeholder="Loyiha maqsadi va erishilgan natija..."
                      onChange={(e) => {
                        const updated = [...projects];
                        updated[idx].description = e.target.value;
                        setProjects(updated);
                      }}
                      className="w-full px-2 py-1 border rounded bg-white"
                    />
                  </div>
                ))}

                <button
                  onClick={() =>
                    setProjects([
                      ...projects,
                      {
                        title: 'Kurs ishi loyihasi',
                        technologies: 'React, Tailwind CSS',
                        description: '',
                      },
                    ])
                  }
                  className="w-full py-2 border border-dashed border-slate-300 rounded-lg text-slate-600 hover:border-burgundy-500 hover:text-burgundy-800 font-medium"
                >
                  + Loyiha qo‘shish
                </button>
              </div>
            )}
          </div>

          {/* SECTION 6: Skills & Languages */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
            <button
              onClick={() => setOpenSection(openSection === 'skills' ? '' : 'skills')}
              className="w-full p-4 flex items-center justify-between text-left font-bold text-slate-900 text-sm hover:bg-slate-50"
            >
              <span>6. Ko‘nikmalar va Tillar</span>
              {openSection === 'skills' ? (
                <ChevronUp className="w-4 h-4 text-slate-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-400" />
              )}
            </button>

            {openSection === 'skills' && (
              <div className="p-4 border-t border-slate-100 space-y-4 text-xs">
                {/* Skills */}
                <div>
                  <label className="block text-slate-600 font-bold mb-2">Ko‘nikmalar</label>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {skills.map((s, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded bg-slate-100 text-slate-800 border"
                      >
                        <span>{s.name}</span>
                        <button
                          onClick={() => setSkills(skills.filter((_, i) => i !== idx))}
                          className="text-slate-400 hover:text-rose-600 ml-1 font-bold"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Yangi ko‘nikma..."
                      value={newSkillName}
                      onChange={(e) => setNewSkillName(e.target.value)}
                      className="flex-1 px-2 py-1 border rounded"
                    />
                    <button
                      onClick={() => {
                        if (newSkillName.trim()) {
                          setSkills([
                            ...skills,
                            { name: newSkillName.trim(), proficiency: newSkillProf },
                          ]);
                          setNewSkillName('');
                        }
                      }}
                      className="px-3 py-1 bg-burgundy-700 text-white rounded font-medium"
                    >
                      Qo‘shish
                    </button>
                  </div>
                </div>

                {/* Languages */}
                <div className="pt-3 border-t">
                  <label className="block text-slate-600 font-bold mb-2">Tillar</label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {languages.map((l, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded bg-burgundy-50 text-burgundy-900 border border-burgundy-200"
                      >
                        <strong>{l.language}:</strong> {l.proficiency}
                        <button
                          onClick={() => setLanguages(languages.filter((_, i) => i !== idx))}
                          className="text-burgundy-400 hover:text-rose-600 ml-1 font-bold"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Til nomi..."
                      value={newLangName}
                      onChange={(e) => setNewLangName(e.target.value)}
                      className="flex-1 px-2 py-1 border rounded"
                    />
                    <select
                      value={newLangProf}
                      onChange={(e) => setNewLangProf(e.target.value)}
                      className="px-2 py-1 border rounded"
                    >
                      <option value="A1">A1</option>
                      <option value="A2">A2</option>
                      <option value="B1">B1</option>
                      <option value="B2">B2</option>
                      <option value="C1">C1</option>
                      <option value="NATIVE">Ona tili</option>
                    </select>
                    <button
                      onClick={() => {
                        if (newLangName.trim()) {
                          setLanguages([
                            ...languages,
                            { language: newLangName.trim(), proficiency: newLangProf },
                          ]);
                          setNewLangName('');
                        }
                      }}
                      className="px-3 py-1 bg-burgundy-700 text-white rounded font-medium"
                    >
                      Qo‘shish
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT PANEL: Live Interactive Preview */}
        <div
          className={`w-full lg:w-1/2 bg-slate-200/80 p-4 sm:p-6 overflow-y-auto flex flex-col items-center ${
            activeMobileView === 'editor' ? 'hidden lg:flex' : 'flex'
          }`}
        >
          <div className="w-full max-w-[700px] flex items-center justify-between text-xs text-slate-500 mb-2">
            <span>
              Jonli A4 ko‘rinishi • Shablon: <strong>{template.name}</strong>
            </span>
            <button
              onClick={() => setTemplateModalOpen(true)}
              className="text-burgundy-700 font-semibold hover:underline"
            >
              Shablonni almashtirish
            </button>
          </div>

          {/* Rendered HTML document inside shadow container */}
          <div
            className="w-full max-w-[700px] bg-white rounded-lg shadow-xl border border-slate-300 min-h-[900px] p-6 sm:p-10 transition-all"
            dangerouslySetInnerHTML={{ __html: previewHtml }}
          />
        </div>
      </div>

      {/* Template Switcher Modal */}
      {templateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[85vh] flex flex-col shadow-2xl">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-lg">
                  Shablonni almashtirish
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Barcha kiritilgan ma‘lumotlaringiz to‘liq saqlanib qoladi. Faqat dizayn va maket o‘zgaradi.
                </p>
              </div>
              <button
                onClick={() => setTemplateModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-xl font-bold"
              >
                ×
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {TEMPLATE_CONFIGS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => selectNewTemplate(t)}
                  className={`p-4 rounded-xl border text-left transition flex flex-col justify-between ${
                    templateId === t.id
                      ? 'border-burgundy-600 bg-burgundy-50/50 ring-2 ring-burgundy-500'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="font-bold text-slate-900 text-xs truncate">
                        {t.name}
                      </h4>
                      <div className="flex gap-1">
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: t.colors.primary }}
                        />
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: t.colors.accent }}
                        />
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                      {t.description}
                    </p>
                  </div>

                  <div className="mt-3 flex items-center justify-between text-[10px] text-slate-500 border-t pt-2">
                    <span className="capitalize">{t.family}</span>
                    <span>{t.layout.columns === 1 ? '1 ustun' : '2 ustun'}</span>
                  </div>
                </button>
              ))}
            </div>

            <div className="p-4 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setTemplateModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200"
              >
                Yopish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
