'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  User,
  GraduationCap,
  Briefcase,
  Wrench,
  Award,
  FolderGit2,
  Sliders,
  Mic,
  MicOff,
  Upload,
  Play,
  Square,
  Trash2,
  Plus,
  Save,
  CheckCircle2,
  AlertCircle,
  Eye,
  Info,
  Clock,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function ProfilePage() {
  const { user, token, isLoading } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState('personal');
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form states
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [bio, setBio] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');

  // Education state
  const [institution, setInstitution] = useState('');
  const [studyField, setStudyField] = useState('');
  const [qualification, setQualification] = useState('');
  const [courseYear, setCourseYear] = useState<number | ''>('');
  const [graduationStatus, setGraduationStatus] = useState('STUDYING');
  const [relevantSubjects, setRelevantSubjects] = useState('');

  // Career preferences
  const [preferredWorkFormat, setPreferredWorkFormat] = useState('ANY');
  const [availability, setAvailability] = useState('PART_TIME');
  const [careerInterests, setCareerInterests] = useState('');

  // Links
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('');

  // Privacy
  const [publicBio, setPublicBio] = useState(true);
  const [publicSkills, setPublicSkills] = useState(true);
  const [publicProjects, setPublicProjects] = useState(true);

  // Child lists
  const [skills, setSkills] = useState<any[]>([]);
  const [languages, setLanguages] = useState<any[]>([]);
  const [educations, setEducations] = useState<any[]>([]);
  const [experiences, setExperiences] = useState<any[]>([]);
  const [certificates, setCertificates] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);

  // Item form states
  const [newSkill, setNewSkill] = useState({ name: '', category: 'Dasturlash', proficiency: 'INTERMEDIATE', description: '' });
  const [newLang, setNewLang] = useState({ language: "O'zbek", proficiency: 'NATIVE' });
  const [newExp, setNewExp] = useState({ category: 'INTERNSHIP', title: '', organization: '', startDate: '', endDate: '', description: '' });
  const [newEdu, setNewEdu] = useState({ institution: '', degree: 'Bakalavr', fieldOfStudy: '', startYear: 2022, endYear: 2026, description: '' });
  const [newCert, setNewCert] = useState({ title: '', issuer: '', date: '', url: '', category: 'CERTIFICATE' });
  const [newProj, setNewProj] = useState({ title: '', description: '', url: '', technologies: '', category: 'EDUCATIONAL' });

  // Voice completion states
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [transcribing, setTranscribing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [extractedData, setExtractedData] = useState<any>(null);
  const [selectedMergeFields, setSelectedMergeFields] = useState<Record<string, boolean>>({});
  const [voiceNotice, setVoiceNotice] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  const loadProfile = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const res = await fetch('/api/profile', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        const p = data.profile;
        setProfile(p);
        setFullName(p.fullName || '');
        setPhone(p.phone || '');
        setCity(p.city || '');
        setBio(p.bio || '');
        setPhotoUrl(p.photoUrl || '');
        setInstitution(p.institution || 'TMC Institute');
        setStudyField(p.studyField || '');
        setQualification(p.qualification || 'Bakalavr');
        setCourseYear(p.courseYear || 3);
        setGraduationStatus(p.graduationStatus || 'STUDYING');
        setRelevantSubjects(p.relevantSubjects ? JSON.parse(p.relevantSubjects).join(', ') : '');
        setPreferredWorkFormat(p.preferredWorkFormat || 'ANY');
        setAvailability(p.availability || 'PART_TIME');
        setCareerInterests(p.careerInterests ? JSON.parse(p.careerInterests).join(', ') : '');
        setLinkedinUrl(p.linkedinUrl || '');
        setGithubUrl(p.githubUrl || '');
        setPortfolioUrl(p.portfolioUrl || '');
        setPublicBio(p.publicBio ?? true);
        setPublicSkills(p.publicSkills ?? true);
        setPublicProjects(p.publicProjects ?? true);

        setSkills(p.skills || []);
        setLanguages(p.languages || []);
        setEducations(p.educations || []);
        setExperiences(p.experiences || []);
        setCertificates(p.certificates || []);
        setProjects(p.profileProjects || []);
      }
    } catch (err) {
      console.error('Error loading profile:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, [token]);

  const handleSaveMain = async () => {
    if (!token) return;
    setSaving(true);
    setStatusMsg(null);
    try {
      const subjectArray = relevantSubjects.split(',').map((s) => s.trim()).filter(Boolean);
      const interestArray = careerInterests.split(',').map((s) => s.trim()).filter(Boolean);

      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          fullName,
          phone,
          city,
          bio,
          photoUrl: photoUrl || null,
          institution,
          studyField,
          qualification,
          courseYear: courseYear ? Number(courseYear) : null,
          graduationStatus,
          relevantSubjects: JSON.stringify(subjectArray),
          careerInterests: JSON.stringify(interestArray),
          preferredWorkFormat,
          availability,
          linkedinUrl: linkedinUrl || null,
          githubUrl: githubUrl || null,
          portfolioUrl: portfolioUrl || null,
          publicBio,
          publicSkills,
          publicProjects,
        }),
      });

      if (res.ok) {
        setStatusMsg({ type: 'success', text: 'Profil ma‘lumotlari muvaffaqiyatli saqlandi!' });
      } else {
        const err = await res.json();
        setStatusMsg({ type: 'error', text: err.error || 'Saqlashda xatolik yuz berdi' });
      }
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'Tarmoq xatosi' });
    } finally {
      setSaving(false);
    }
  };

  // Add Item Helpers
  const addSkill = async () => {
    if (!newSkill.name.trim() || !token) return;
    try {
      const res = await fetch('/api/profile/skills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(newSkill),
      });
      if (res.ok) {
        const data = await res.json();
        setSkills([...skills, data.skill]);
        setNewSkill({ name: '', category: 'Dasturlash', proficiency: 'INTERMEDIATE', description: '' });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const removeSkill = async (id: string) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/profile/skills?id=${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setSkills(skills.filter((s) => s.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const addLanguage = async () => {
    if (!newLang.language.trim() || !token) return;
    try {
      const res = await fetch('/api/profile/languages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(newLang),
      });
      if (res.ok) {
        const data = await res.json();
        setLanguages([...languages, data.language]);
        setNewLang({ language: '', proficiency: 'B1' });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const removeLanguage = async (id: string) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/profile/languages?id=${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setLanguages(languages.filter((l) => l.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const addExperience = async () => {
    if (!newExp.title.trim() || !newExp.organization.trim() || !token) return;
    try {
      const res = await fetch('/api/profile/experiences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(newExp),
      });
      if (res.ok) {
        const data = await res.json();
        setExperiences([...experiences, data.experience]);
        setNewExp({ category: 'INTERNSHIP', title: '', organization: '', startDate: '', endDate: '', description: '' });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const removeExperience = async (id: string) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/profile/experiences?id=${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setExperiences(experiences.filter((e) => e.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const addProject = async () => {
    if (!newProj.title.trim() || !token) return;
    try {
      const res = await fetch('/api/profile/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(newProj),
      });
      if (res.ok) {
        const data = await res.json();
        setProjects([...projects, data.project]);
        setNewProj({ title: '', description: '', url: '', technologies: '', category: 'EDUCATIONAL' });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const removeProject = async (id: string) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/profile/projects?id=${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setProjects(projects.filter((p) => p.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  // ---------------------------------------------------------------------------
  // Voice Recording & Completion Workflow
  // ---------------------------------------------------------------------------
  const startRecording = async () => {
    try {
      audioChunksRef.current = [];
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        // Stop audio tracks
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingSeconds(0);
      timerRef.current = setInterval(() => {
        setRecordingSeconds((s) => s + 1);
      }, 1000);
    } catch (err: any) {
      alert('Mikrofondan foydalanishga ruxsat berilmadi yoki brauzer tomonidan qo‘llab-quvvatlanmadi: ' + err.message);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(timerRef.current);
    }
  };

  const cancelRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(timerRef.current);
    }
    setAudioBlob(null);
    setRecordingSeconds(0);
  };

  const processAudio = async (blobToProcess?: Blob) => {
    const targetBlob = blobToProcess || audioBlob;
    if (!targetBlob || !token) return;

    setTranscribing(true);
    setStatusMsg(null);
    try {
      const formData = new FormData();
      formData.append('audio', targetBlob, 'speech.webm');

      const res = await fetch('/api/voice', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        setTranscript(data.transcript || '');
        setExtractedData(data.extractedFields || null);
        setVoiceNotice(data.notice || null);

        // Pre-select non-empty fields for merge
        if (data.extractedFields) {
          const keys = Object.keys(data.extractedFields);
          const initialSelection: Record<string, boolean> = {};
          keys.forEach((k) => {
            if (data.extractedFields[k]) initialSelection[k] = true;
          });
          setSelectedMergeFields(initialSelection);
        }
      } else {
        alert(data.error || 'Ovozni qayta ishlashda xatolik yuz berdi');
      }
    } catch (err: any) {
      alert('Tarmoq xatosi: ' + err.message);
    } finally {
      setTranscribing(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAudioBlob(file);
      processAudio(file);
    }
  };

  const applyExtractedFields = () => {
    if (!extractedData) return;

    if (selectedMergeFields.fullName && extractedData.fullName) setFullName(extractedData.fullName);
    if (selectedMergeFields.phone && extractedData.phone) setPhone(extractedData.phone);
    if (selectedMergeFields.city && extractedData.city) setCity(extractedData.city);
    if (selectedMergeFields.institution && extractedData.institution) setInstitution(extractedData.institution);
    if (selectedMergeFields.studyField && extractedData.studyField) setStudyField(extractedData.studyField);
    if (selectedMergeFields.courseYear && extractedData.courseYear) setCourseYear(Number(extractedData.courseYear));
    if (selectedMergeFields.summary && extractedData.summary) setBio(extractedData.summary);

    if (selectedMergeFields.skills && extractedData.skills && Array.isArray(extractedData.skills)) {
      extractedData.skills.forEach((s: any) => {
        setNewSkill({ name: s.name, category: 'Dasturlash', proficiency: s.proficiency || 'INTERMEDIATE', description: '' });
      });
    }

    setStatusMsg({
      type: 'success',
      text: 'Tanlangan ovozli ma‘lumotlar profil maydonlariga o‘tkazildi. Iltimos, saqlash tugmasini bosing.',
    });
    setExtractedData(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-burgundy-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-slate-500">Profil ma‘lumotlari yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Header */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Mening umumiy profilim</h1>
            <p className="text-xs text-slate-500 mt-1">
              Bu yerda kiritilgan ma‘lumotlar CV yaratishda avtomatik to‘ldiriladi va jamoa izlashda qatnashadi.
            </p>
          </div>
          <button
            onClick={handleSaveMain}
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-burgundy-700 text-white font-medium hover:bg-burgundy-800 transition shadow-sm text-sm disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saqlanmoqda...' : 'O‘zgarishlarni saqlash'}
          </button>
        </div>

        {statusMsg && (
          <div
            className={`p-4 rounded-xl border text-sm flex items-center gap-2 ${
              statusMsg.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}
          >
            {statusMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
            <span>{statusMsg.text}</span>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 overflow-x-auto gap-2 bg-white px-4 pt-2 rounded-xl shadow-sm">
          {[
            { id: 'personal', label: 'Shaxsiy', icon: User },
            { id: 'education', label: 'Ta‘lim', icon: GraduationCap },
            { id: 'skills', label: 'Ko‘nikma & Tillar', icon: Wrench },
            { id: 'experience', label: 'Tajriba', icon: Briefcase },
            { id: 'projects', label: 'Loyihalar', icon: FolderGit2 },
            { id: 'certificates', label: 'Sertifikatlar', icon: Award },
            { id: 'voice', label: 'Ovozli yordamchi', icon: Mic },
            { id: 'privacy', label: 'Maxfiylik & Ko‘rinish', icon: Sliders },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-medium border-b-2 whitespace-nowrap transition ${
                  activeTab === tab.id
                    ? 'border-burgundy-700 text-burgundy-800'
                    : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* TAB 1: Personal Details */}
        {activeTab === 'personal' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
            <h2 className="text-base font-bold text-slate-900 border-b pb-2">Shaxsiy ma‘lumotlar</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">To‘liq ism-sharif *</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-burgundy-500 focus:outline-none"
                  placeholder="Masalan: Sardor Aliyev"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Telefon raqam</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-burgundy-500 focus:outline-none"
                  placeholder="+998 90 123 45 67"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Shahar / Viloyat</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-burgundy-500 focus:outline-none"
                  placeholder="Toshkent shahri"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Rasm havolasi (URL - ixtiyoriy)</label>
                <input
                  type="url"
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-burgundy-500 focus:outline-none"
                  placeholder="https://example.com/photo.jpg"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Qisqa professional xulosa (Bio)
                </label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-burgundy-500 focus:outline-none"
                  placeholder="O‘zingiz, qiziqishlaringiz va professional intilishlaringiz haqida 2-3 jumlada yozing..."
                />
              </div>
            </div>

            <div className="pt-4 border-t flex justify-end">
              <button
                onClick={handleSaveMain}
                disabled={saving}
                className="px-5 py-2 rounded-lg bg-burgundy-700 text-white text-xs font-semibold hover:bg-burgundy-800 transition"
              >
                {saving ? 'Saqlanmoqda...' : 'Saqlash'}
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: Education */}
        {activeTab === 'education' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
            <h2 className="text-base font-bold text-slate-900 border-b pb-2">Hozirgi ta‘lim holati</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Ta‘lim muassasasi</label>
                <input
                  type="text"
                  value={institution}
                  onChange={(e) => setInstitution(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-burgundy-500 focus:outline-none"
                  placeholder="TMC Institute"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Ta‘lim yo‘nalishi / Mutaxassislik</label>
                <input
                  type="text"
                  value={studyField}
                  onChange={(e) => setStudyField(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-burgundy-500 focus:outline-none"
                  placeholder="Axborot texnologiyalari va dasturiy injiniring"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Daraja / Malaka</label>
                <select
                  value={qualification}
                  onChange={(e) => setQualification(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-burgundy-500 focus:outline-none"
                >
                  <option value="Bakalavr">Bakalavr</option>
                  <option value="Magistr">Magistr</option>
                  <option value="Kollej / Litsey">Kollej / Litsey</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Kurs / Yil</label>
                <input
                  type="number"
                  min={1}
                  max={6}
                  value={courseYear}
                  onChange={(e) => setCourseYear(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-burgundy-500 focus:outline-none"
                  placeholder="Masalan: 3"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tegishli fanlar va asosiy bilimlar (vergul bilan ajrating)
                </label>
                <input
                  type="text"
                  value={relevantSubjects}
                  onChange={(e) => setRelevantSubjects(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-burgundy-500 focus:outline-none"
                  placeholder="Ma‘lumotlar bazasi, Algoritmlar, Veb dasturlash, Moliya asoslari"
                />
              </div>
            </div>

            <div className="pt-4 border-t flex justify-end">
              <button
                onClick={handleSaveMain}
                disabled={saving}
                className="px-5 py-2 rounded-lg bg-burgundy-700 text-white text-xs font-semibold hover:bg-burgundy-800 transition"
              >
                {saving ? 'Saqlanmoqda...' : 'Saqlash'}
              </button>
            </div>
          </div>
        )}

        {/* TAB 3: Skills & Languages */}
        {activeTab === 'skills' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-8">
            {/* Skills */}
            <div>
              <h2 className="text-base font-bold text-slate-900 border-b pb-2 mb-4">
                Texnik ko‘nikmalar va vositalar
              </h2>
              <div className="flex flex-wrap gap-2 mb-4">
                {skills.length === 0 ? (
                  <p className="text-xs text-slate-400">Hozircha ko‘nikmalar qo‘shilmagan.</p>
                ) : (
                  skills.map((s) => (
                    <span
                      key={s.id}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-100 text-slate-800 text-xs border border-slate-200"
                    >
                      <span className="font-medium">{s.name}</span>
                      <span className="text-[10px] text-slate-500">({s.proficiency})</span>
                      <button
                        onClick={() => removeSkill(s.id)}
                        className="text-slate-400 hover:text-rose-600 ml-1"
                      >
                        ×
                      </button>
                    </span>
                  ))
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 pt-2 bg-slate-50 p-3 rounded-xl border">
                <input
                  type="text"
                  placeholder="Ko‘nikma nomi (masalan: React)"
                  value={newSkill.name}
                  onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })}
                  className="px-3 py-1.5 border rounded-lg text-xs"
                />
                <select
                  value={newSkill.proficiency}
                  onChange={(e) => setNewSkill({ ...newSkill, proficiency: e.target.value })}
                  className="px-3 py-1.5 border rounded-lg text-xs"
                >
                  <option value="BEGINNER">Boshlang‘ich</option>
                  <option value="INTERMEDIATE">O‘rta (Intermediate)</option>
                  <option value="ADVANCED">Yuqori (Advanced)</option>
                  <option value="EXPERT">Ekspert</option>
                </select>
                <input
                  type="text"
                  placeholder="Izoh (masalan: 1 yillik amaliyot)"
                  value={newSkill.description}
                  onChange={(e) => setNewSkill({ ...newSkill, description: e.target.value })}
                  className="px-3 py-1.5 border rounded-lg text-xs"
                />
                <button
                  onClick={addSkill}
                  className="px-3 py-1.5 bg-burgundy-700 text-white rounded-lg text-xs font-medium hover:bg-burgundy-800"
                >
                  Qo‘shish
                </button>
              </div>
            </div>

            {/* Languages */}
            <div>
              <h2 className="text-base font-bold text-slate-900 border-b pb-2 mb-4">
                Tillar va darajalar
              </h2>
              <div className="flex flex-wrap gap-2 mb-4">
                {languages.length === 0 ? (
                  <p className="text-xs text-slate-400">Hozircha tillar qo‘shilmagan.</p>
                ) : (
                  languages.map((l) => (
                    <span
                      key={l.id}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-burgundy-50 text-burgundy-900 text-xs border border-burgundy-200"
                    >
                      <span className="font-semibold">{l.language}:</span>
                      <span>{l.proficiency}</span>
                      <button
                        onClick={() => removeLanguage(l.id)}
                        className="text-burgundy-400 hover:text-rose-600 ml-1"
                      >
                        ×
                      </button>
                    </span>
                  ))
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 bg-slate-50 p-3 rounded-xl border">
                <input
                  type="text"
                  placeholder="Til nomi (masalan: Ingliz tili)"
                  value={newLang.language}
                  onChange={(e) => setNewLang({ ...newLang, language: e.target.value })}
                  className="px-3 py-1.5 border rounded-lg text-xs"
                />
                <select
                  value={newLang.proficiency}
                  onChange={(e) => setNewLang({ ...newLang, proficiency: e.target.value })}
                  className="px-3 py-1.5 border rounded-lg text-xs"
                >
                  <option value="A1">A1 (Boshlang‘ich)</option>
                  <option value="A2">A2</option>
                  <option value="B1">B1 (O‘rta)</option>
                  <option value="B2">B2 (Yaxshi)</option>
                  <option value="C1">C1 (Erkin)</option>
                  <option value="NATIVE">Ona tili</option>
                </select>
                <button
                  onClick={addLanguage}
                  className="px-3 py-1.5 bg-burgundy-700 text-white rounded-lg text-xs font-medium hover:bg-burgundy-800"
                >
                  Tilni qo‘shish
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: Experience */}
        {activeTab === 'experience' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b pb-2">
              <h2 className="text-base font-bold text-slate-900">
                Ish, amaliyot va ko‘ngillilik (Volunteering)
              </h2>
              <span className="text-xs text-slate-500">Tajriba bo‘lishi shart emas</span>
            </div>

            <div className="space-y-3">
              {experiences.length === 0 ? (
                <p className="text-xs text-slate-400 py-4 text-center">
                  Hozircha tajriba yozilmagan. Yangi boshlovchilar uchun loyihalar yetarli.
                </p>
              ) : (
                experiences.map((exp) => (
                  <div
                    key={exp.id}
                    className="p-3 border rounded-xl flex items-start justify-between bg-slate-50/50"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-slate-900">{exp.title}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 uppercase">
                          {exp.category === 'INTERNSHIP' ? 'Amaliyot' : exp.category === 'VOLUNTEERING' ? 'Ko‘ngillilik' : 'Ish'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-0.5">{exp.organization}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {exp.startDate} - {exp.endDate || 'Hozirgacha'}
                      </p>
                      {exp.description && <p className="text-xs text-slate-600 mt-1">{exp.description}</p>}
                    </div>
                    <button
                      onClick={() => removeExperience(exp.id)}
                      className="text-rose-500 hover:text-rose-700 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Add Exp Form */}
            <div className="p-4 bg-slate-50 rounded-xl border space-y-3">
              <h3 className="text-xs font-bold text-slate-800">Yangi tajriba qo‘shish</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <select
                  value={newExp.category}
                  onChange={(e) => setNewExp({ ...newExp, category: e.target.value })}
                  className="px-3 py-1.5 border rounded-lg text-xs"
                >
                  <option value="INTERNSHIP">Amaliyot (Internship)</option>
                  <option value="EMPLOYMENT">Ish joyi (Employment)</option>
                  <option value="VOLUNTEERING">Ko‘ngillilik (Volunteering)</option>
                </select>
                <input
                  type="text"
                  placeholder="Lavozim / Rol"
                  value={newExp.title}
                  onChange={(e) => setNewExp({ ...newExp, title: e.target.value })}
                  className="px-3 py-1.5 border rounded-lg text-xs"
                />
                <input
                  type="text"
                  placeholder="Tashkilot / Kompaniya"
                  value={newExp.organization}
                  onChange={(e) => setNewExp({ ...newExp, organization: e.target.value })}
                  className="px-3 py-1.5 border rounded-lg text-xs"
                />
                <input
                  type="text"
                  placeholder="Boshlanish sanasi (masalan: 2023-06)"
                  value={newExp.startDate}
                  onChange={(e) => setNewExp({ ...newExp, startDate: e.target.value })}
                  className="px-3 py-1.5 border rounded-lg text-xs"
                />
                <input
                  type="text"
                  placeholder="Tugash sanasi (bo‘sh qoldiring = hozirgacha)"
                  value={newExp.endDate}
                  onChange={(e) => setNewExp({ ...newExp, endDate: e.target.value })}
                  className="px-3 py-1.5 border rounded-lg text-xs"
                />
                <button
                  onClick={addExperience}
                  className="px-3 py-1.5 bg-burgundy-700 text-white rounded-lg text-xs font-medium hover:bg-burgundy-800"
                >
                  Qo‘shish
                </button>
              </div>
              <textarea
                rows={2}
                placeholder="Vazifalar va yutuqlar haqida qisqacha..."
                value={newExp.description}
                onChange={(e) => setNewExp({ ...newExp, description: e.target.value })}
                className="w-full px-3 py-1.5 border rounded-lg text-xs"
              />
            </div>
          </div>
        )}

        {/* TAB 5: Projects */}
        {activeTab === 'projects' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
            <h2 className="text-base font-bold text-slate-900 border-b pb-2">
              Ta‘limiy va shaxsiy loyihalar
            </h2>
            <div className="space-y-3">
              {projects.length === 0 ? (
                <p className="text-xs text-slate-400 py-4 text-center">
                  Hozircha loyihalar qo‘shilmagan.
                </p>
              ) : (
                projects.map((proj) => (
                  <div
                    key={proj.id}
                    className="p-3 border rounded-xl flex items-start justify-between bg-slate-50/50"
                  >
                    <div>
                      <h4 className="font-semibold text-sm text-slate-900">{proj.title}</h4>
                      <p className="text-xs text-slate-600 mt-0.5">{proj.description}</p>
                      {proj.url && (
                        <a
                          href={proj.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[11px] text-burgundy-700 hover:underline block mt-1"
                        >
                          {proj.url}
                        </a>
                      )}
                    </div>
                    <button
                      onClick={() => removeProject(proj.id)}
                      className="text-rose-500 hover:text-rose-700 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Add Project Form */}
            <div className="p-4 bg-slate-50 rounded-xl border space-y-3">
              <h3 className="text-xs font-bold text-slate-800">Yangi loyiha qo‘shish</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <input
                  type="text"
                  placeholder="Loyiha nomi"
                  value={newProj.title}
                  onChange={(e) => setNewProj({ ...newProj, title: e.target.value })}
                  className="px-3 py-1.5 border rounded-lg text-xs"
                />
                <input
                  type="url"
                  placeholder="Havola (GitHub yoki veb-sayt)"
                  value={newProj.url}
                  onChange={(e) => setNewProj({ ...newProj, url: e.target.value })}
                  className="px-3 py-1.5 border rounded-lg text-xs"
                />
                <button
                  onClick={addProject}
                  className="px-3 py-1.5 bg-burgundy-700 text-white rounded-lg text-xs font-medium hover:bg-burgundy-800"
                >
                  Loyihani qo‘shish
                </button>
              </div>
              <textarea
                rows={2}
                placeholder="Loyiha maqsadi, muammo va foydalanilgan texnologiyalar..."
                value={newProj.description}
                onChange={(e) => setNewProj({ ...newProj, description: e.target.value })}
                className="w-full px-3 py-1.5 border rounded-lg text-xs"
              />
            </div>
          </div>
        )}

        {/* TAB 6: Certificates */}
        {activeTab === 'certificates' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
            <h2 className="text-base font-bold text-slate-900 border-b pb-2">
              Sertifikatlar va yutuqlar
            </h2>
            <div className="space-y-3">
              {certificates.length === 0 ? (
                <p className="text-xs text-slate-400 py-4 text-center">
                  Hozircha sertifikatlar kiritilmagan.
                </p>
              ) : (
                certificates.map((c) => (
                  <div
                    key={c.id}
                    className="p-3 border rounded-xl flex items-start justify-between bg-slate-50/50"
                  >
                    <div>
                      <h4 className="font-semibold text-sm text-slate-900">{c.title}</h4>
                      <p className="text-xs text-slate-600">
                        {c.issuer} {c.date && `(${c.date})`}
                      </p>
                    </div>
                    <button
                      onClick={async () => {
                        await fetch(`/api/profile/certificates?id=${c.id}`, {
                          method: 'DELETE',
                          headers: { Authorization: `Bearer ${token}` },
                        });
                        setCertificates(certificates.filter((item) => item.id !== c.id));
                      }}
                      className="text-rose-500 hover:text-rose-700 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border space-y-3">
              <h3 className="text-xs font-bold text-slate-800">Sertifikat qo‘shish</h3>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                <input
                  type="text"
                  placeholder="Sertifikat / Kurs nomi"
                  value={newCert.title}
                  onChange={(e) => setNewCert({ ...newCert, title: e.target.value })}
                  className="px-3 py-1.5 border rounded-lg text-xs"
                />
                <input
                  type="text"
                  placeholder="Beruvchi tashkilot (Coursera, etc)"
                  value={newCert.issuer}
                  onChange={(e) => setNewCert({ ...newCert, issuer: e.target.value })}
                  className="px-3 py-1.5 border rounded-lg text-xs"
                />
                <input
                  type="text"
                  placeholder="Yil / Sana"
                  value={newCert.date}
                  onChange={(e) => setNewCert({ ...newCert, date: e.target.value })}
                  className="px-3 py-1.5 border rounded-lg text-xs"
                />
                <button
                  onClick={async () => {
                    if (!newCert.title.trim()) return;
                    const res = await fetch('/api/profile/certificates', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                      body: JSON.stringify(newCert),
                    });
                    if (res.ok) {
                      const data = await res.json();
                      setCertificates([...certificates, data.certificate]);
                      setNewCert({ title: '', issuer: '', date: '', url: '', category: 'CERTIFICATE' });
                    }
                  }}
                  className="px-3 py-1.5 bg-burgundy-700 text-white rounded-lg text-xs font-medium hover:bg-burgundy-800"
                >
                  Qo‘shish
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 7: Voice Assistant Workflow */}
        {activeTab === 'voice' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
            <div className="flex items-start justify-between border-b pb-3">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Mic className="w-5 h-5 text-burgundy-700" />
                  Ovozli profil va CV to‘ldirish
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  O‘zbek tilida erkin so‘zlang (ta‘limingiz, bilgan tillar va texnologiyalaringiz haqida).
                  Tizim matnni transkripsiya qiladi, maydonlarni taklif qiladi va siz tasdiqlaganingizdan keyin saqlanadi.
                </p>
              </div>
            </div>

            {voiceNotice && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
                {voiceNotice}
              </div>
            )}

            {/* Recorder controls */}
            <div className="p-6 bg-slate-50 rounded-2xl border flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-burgundy-100 text-burgundy-800 flex items-center justify-center">
                {isRecording ? (
                  <span className="w-5 h-5 rounded bg-rose-600 animate-pulse" />
                ) : (
                  <Mic className="w-8 h-8" />
                )}
              </div>

              {isRecording ? (
                <div>
                  <p className="text-sm font-semibold text-rose-700">Yozib olinmoqda...</p>
                  <p className="text-2xl font-mono font-bold text-slate-800 mt-1">
                    {Math.floor(recordingSeconds / 60)}:
                    {(recordingSeconds % 60).toString().padStart(2, '0')}
                  </p>
                  <div className="flex items-center gap-3 mt-4">
                    <button
                      onClick={stopRecording}
                      className="px-4 py-2 bg-rose-600 text-white rounded-lg text-xs font-semibold hover:bg-rose-700 transition"
                    >
                      To‘xtatish & Tahlil qilish
                    </button>
                    <button
                      onClick={cancelRecording}
                      className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-300 transition"
                    >
                      Bekor qilish
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex flex-wrap items-center justify-center gap-3">
                    <button
                      onClick={startRecording}
                      className="px-5 py-2.5 bg-burgundy-700 text-white rounded-lg text-xs font-semibold hover:bg-burgundy-800 transition inline-flex items-center gap-2"
                    >
                      <Mic className="w-4 h-4" />
                      Ovoz yozishni boshlash
                    </button>
                    <label className="px-5 py-2.5 bg-white border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-50 transition cursor-pointer inline-flex items-center gap-2">
                      <Upload className="w-4 h-4" />
                      Audio fayl yuklash (WebM, WAV, MP3)
                      <input
                        type="file"
                        accept="audio/*"
                        className="hidden"
                        onChange={handleFileUpload}
                      />
                    </label>
                  </div>
                  {audioBlob && !isRecording && (
                    <div className="mt-4 flex items-center justify-center gap-3">
                      <span className="text-xs text-slate-600">Yozuv tayyor</span>
                      <button
                        onClick={() => processAudio()}
                        disabled={transcribing}
                        className="px-4 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700 disabled:opacity-50"
                      >
                        {transcribing ? 'Transkripsiya qilinmoqda...' : 'Transkripsiya qilish'}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Step 2: Editable transcript */}
            {transcript && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900">
                    1-qadam: Transkripsiya matni (tahrirlashingiz mumkin)
                  </h3>
                  <span className="text-[11px] text-slate-400">
                    Noma‘lum yoki noto‘g‘ri so‘zlarni to‘g‘rilang
                  </span>
                </div>
                <textarea
                  rows={4}
                  value={transcript}
                  onChange={(e) => setTranscript(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl text-xs bg-slate-50/50 focus:bg-white"
                />

                {/* Step 3: Extracted fields preview & confirmation */}
                {extractedData && (
                  <div className="p-4 rounded-xl border border-burgundy-200 bg-burgundy-50/30 space-y-3">
                    <h3 className="text-sm font-bold text-burgundy-950 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-burgundy-700" />
                      2-qadam: Aniqlangan maydonlarni tasdiqlash
                    </h3>
                    <p className="text-xs text-slate-600">
                      Qaysi ma‘lumotlarni profilingizga qo‘shishni xohlasangiz, katakchalarni belgilang.
                      Mavjud ma‘lumotlar sizning ruxsatingizsiz o‘chirib yuborilmaydi.
                    </p>

                    <div className="space-y-2 pt-2">
                      {extractedData.fullName && (
                        <label className="flex items-center gap-2 text-xs">
                          <input
                            type="checkbox"
                            checked={!!selectedMergeFields.fullName}
                            onChange={(e) =>
                              setSelectedMergeFields({ ...selectedMergeFields, fullName: e.target.checked })
                            }
                          />
                          <span>
                            <strong>Ism:</strong> {extractedData.fullName}
                          </span>
                        </label>
                      )}
                      {extractedData.city && (
                        <label className="flex items-center gap-2 text-xs">
                          <input
                            type="checkbox"
                            checked={!!selectedMergeFields.city}
                            onChange={(e) =>
                              setSelectedMergeFields({ ...selectedMergeFields, city: e.target.checked })
                            }
                          />
                          <span>
                            <strong>Shahar:</strong> {extractedData.city}
                          </span>
                        </label>
                      )}
                      {extractedData.institution && (
                        <label className="flex items-center gap-2 text-xs">
                          <input
                            type="checkbox"
                            checked={!!selectedMergeFields.institution}
                            onChange={(e) =>
                              setSelectedMergeFields({ ...selectedMergeFields, institution: e.target.checked })
                            }
                          />
                          <span>
                            <strong>Institut:</strong> {extractedData.institution}
                          </span>
                        </label>
                      )}
                      {extractedData.studyField && (
                        <label className="flex items-center gap-2 text-xs">
                          <input
                            type="checkbox"
                            checked={!!selectedMergeFields.studyField}
                            onChange={(e) =>
                              setSelectedMergeFields({ ...selectedMergeFields, studyField: e.target.checked })
                            }
                          />
                          <span>
                            <strong>Yo‘nalish:</strong> {extractedData.studyField}
                          </span>
                        </label>
                      )}
                      {extractedData.summary && (
                        <label className="flex items-center gap-2 text-xs">
                          <input
                            type="checkbox"
                            checked={!!selectedMergeFields.summary}
                            onChange={(e) =>
                              setSelectedMergeFields({ ...selectedMergeFields, summary: e.target.checked })
                            }
                          />
                          <span>
                            <strong>Bio / Xulosa:</strong> {extractedData.summary}
                          </span>
                        </label>
                      )}
                      {extractedData.skills && extractedData.skills.length > 0 && (
                        <label className="flex items-center gap-2 text-xs">
                          <input
                            type="checkbox"
                            checked={!!selectedMergeFields.skills}
                            onChange={(e) =>
                              setSelectedMergeFields({ ...selectedMergeFields, skills: e.target.checked })
                            }
                          />
                          <span>
                            <strong>Ko‘nikmalar:</strong>{' '}
                            {extractedData.skills.map((s: any) => s.name).join(', ')}
                          </span>
                        </label>
                      )}
                    </div>

                    <div className="pt-3 border-t flex justify-end">
                      <button
                        onClick={applyExtractedFields}
                        className="px-4 py-2 bg-burgundy-700 text-white rounded-lg text-xs font-semibold hover:bg-burgundy-800 transition"
                      >
                        Tanlanganlarni profilga qo‘shish
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* TAB 8: Privacy & Discovery Preview */}
        {activeTab === 'privacy' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
            <h2 className="text-base font-bold text-slate-900 border-b pb-2">
              Maxfiylik va Jamoa qidiruvi sozlamalari
            </h2>
            <p className="text-xs text-slate-600">
              Platformadagi startap va loyihalar egalari boshqa talabalarni jamoaga jalb qilishda ushbu ma‘lumotlarni ko‘rishadi.
              Telefon raqami yoki shaxsiy CV fayllar hech qachon ochiq ko‘rsatilmaydi.
            </p>

            <div className="space-y-3 pt-2">
              <label className="flex items-center gap-3 p-3 rounded-xl border bg-slate-50/50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={publicBio}
                  onChange={(e) => setPublicBio(e.target.checked)}
                  className="w-4 h-4 text-burgundy-700 rounded"
                />
                <div>
                  <p className="text-xs font-semibold text-slate-800">Bio va qisqa xulosani ko‘rsatish</p>
                  <p className="text-[11px] text-slate-500">Loyiha qidiruvchilar siz haqingizda o‘qiy olishadi</p>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 rounded-xl border bg-slate-50/50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={publicSkills}
                  onChange={(e) => setPublicSkills(e.target.checked)}
                  className="w-4 h-4 text-burgundy-700 rounded"
                />
                <div>
                  <p className="text-xs font-semibold text-slate-800">Ko‘nikmalar va bilgan dasturlarni ko‘rsatish</p>
                  <p className="text-[11px] text-slate-500">Loyiha egalari mos texnik mutaxassislarni topishlari uchun</p>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 rounded-xl border bg-slate-50/50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={publicProjects}
                  onChange={(e) => setPublicProjects(e.target.checked)}
                  className="w-4 h-4 text-burgundy-700 rounded"
                />
                <div>
                  <p className="text-xs font-semibold text-slate-800">Shaxsiy va ta‘limiy loyihalarni ko‘rsatish</p>
                  <p className="text-[11px] text-slate-500">Portfolio sifatidagi loyihalaringiz</p>
                </div>
              </label>
            </div>

            {/* Public Card Preview */}
            <div className="mt-8 pt-6 border-t">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                Boshqa foydalanuvchilar qanday ko‘radi (Ko‘rinish namunalari)
              </h3>
              <div className="max-w-md p-4 rounded-xl border border-slate-200 bg-slate-50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-burgundy-100 text-burgundy-800 flex items-center justify-center font-bold text-sm">
                    {fullName ? fullName.slice(0, 2).toUpperCase() : 'TA'}
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 text-sm">{fullName || 'Ism kiritilmagan'}</h4>
                    <p className="text-[11px] text-slate-500">
                      {institution} {studyField && `• ${studyField}`}
                    </p>
                  </div>
                </div>

                {publicBio && bio && (
                  <p className="text-xs text-slate-600 mt-3 italic line-clamp-2">"{bio}"</p>
                )}

                {publicSkills && skills.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {skills.slice(0, 4).map((s) => (
                      <span key={s.id} className="text-[10px] bg-white border px-1.5 py-0.5 rounded text-slate-700">
                        {s.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="pt-4 border-t flex justify-end">
              <button
                onClick={handleSaveMain}
                disabled={saving}
                className="px-5 py-2 rounded-lg bg-burgundy-700 text-white text-xs font-semibold hover:bg-burgundy-800 transition"
              >
                {saving ? 'Saqlanmoqda...' : 'Saqlash'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
