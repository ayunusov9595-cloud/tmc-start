import Link from 'next/link';
import {
  FileText,
  Sparkles,
  Compass,
  Users,
  Mic,
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  GraduationCap,
} from 'lucide-react';
import { BRAND_NAME, INSTITUTE_NAME } from '@/lib/brand';

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-burgundy-50 via-warm-50 to-white py-16 sm:py-24 border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-burgundy-100 text-burgundy-800 mb-6">
              <GraduationCap className="w-4 h-4" />
              <span>{INSTITUTE_NAME} Karyera Markazi platformasi</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 leading-tight">
              Karyerangizni{' '}
              <span className="text-burgundy-800 underline decoration-burgundy-300 decoration-wavy">
                {BRAND_NAME}
              </span>{' '}
              bilan boshlang
            </h1>

            <p className="mt-6 text-lg sm:text-xl text-slate-600 leading-relaxed">
              Talabalar va bitiruvchilar uchun professional rezyume yaratish, sun‘iy
              intellekt yordamida CV tahlili, mos kasb yo‘nalishlarini tanlash hamda
              startap jamoalarini shakllantirish platformasi.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/register"
                className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3.5 rounded-lg text-base font-medium text-white bg-burgundy-700 hover:bg-burgundy-800 shadow-sm transition-all focus:ring-2 focus:ring-burgundy-500 focus:ring-offset-2"
              >
                Bepul boshlash
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
              <Link
                href="/login"
                className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3.5 rounded-lg text-base font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 shadow-sm transition-all"
              >
                Mavjud hisobga kirish
              </Link>
            </div>

            <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-slate-500">
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                100+ professional shablon
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Ovozli to‘ldirish
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                AI tavsiyalari va xulosa
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                PDF eksporti
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 5 Main Pillars */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Platformaning 5 ta asosiy imkoniyati
            </h2>
            <p className="mt-4 text-slate-600">
              Karyerangizning ilk qadamidan boshlab mustahkam mutaxassis bo‘lishgacha bo‘lgan barcha bosqichlar.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* 1. CV Builder */}
            <div className="relative rounded-2xl border border-slate-200 bg-slate-50/50 p-8 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-burgundy-100 text-burgundy-800 flex items-center justify-center mb-5">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                1. Shablonli CV yaratish
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed mb-4">
                100 dan ortiq tartiblangan shablonlar (minimal, akademik, korporativ, ijodiy). 
                Bir marta to‘ldirilgan profil ma‘lumotlaridan bir necha xil CV nusxalari va PDF yuklab olish.
              </p>
              <Link
                href="/cv"
                className="inline-flex items-center text-sm font-semibold text-burgundy-700 hover:text-burgundy-800"
              >
                CV yaratishga o‘tish <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </div>

            {/* 2. Voice Completion */}
            <div className="relative rounded-2xl border border-slate-200 bg-slate-50/50 p-8 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center mb-5">
                <Mic className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                2. Ovozli to‘ldirish
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed mb-4">
                O‘zbek tilida tabiiy ovozli xabar yozing yoki audio yuklang. Tizim avtomatik matnga aylantiradi,
                ma‘lumotlarni maydonlarga ajratadi va siz tasdiqlaganingizdan so‘ng saqlaydi.
              </p>
              <Link
                href="/profile"
                className="inline-flex items-center text-sm font-semibold text-purple-700 hover:text-purple-800"
              >
                Profil orqali sinab ko‘rish <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </div>

            {/* 3. AI CV Review */}
            <div className="relative rounded-2xl border border-slate-200 bg-slate-50/50 p-8 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center mb-5">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                3. AI bilan CV tekshiruvi
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed mb-4">
                Mavjud PDF/DOCX yoki platformadagi CV-ni tahlil qiling. Aniq matn bo‘laklari bo‘yicha kamchiliklar,
                imlo, kuchli tomonlar va yaxshilash takliflarini bittalab qabul qiling.
              </p>
              <Link
                href="/cv-review"
                className="inline-flex items-center text-sm font-semibold text-amber-700 hover:text-amber-800"
              >
                CV tekshiruvini boshlash <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </div>

            {/* 4. Career Guidance */}
            <div className="relative rounded-2xl border border-slate-200 bg-slate-50/50 p-8 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center mb-5">
                <Compass className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                4. Menga mos kasblar
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed mb-4">
                Qisqa tarjimai hol, profil yoki CV asosida mos tashkilot turlari va kasb lavozimlari tavsiyasi.
                Hozir mos keladigan va qo‘shimcha tayyorgarlik talab qiladigan yo‘nalishlar.
              </p>
              <Link
                href="/career"
                className="inline-flex items-center text-sm font-semibold text-blue-700 hover:text-blue-800"
              >
                Kasb tavsiyalarini olish <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </div>

            {/* 5. Team Formation */}
            <div className="relative rounded-2xl border border-slate-200 bg-slate-50/50 p-8 hover:shadow-md transition-shadow lg:col-span-2">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center mb-5">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                5. Loyihalar va jamoalar
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed mb-4">
                TMC talabalari startap va innovatsion loyihalar yaratishlari, rollar bo‘yicha ishtirokchilarni jalb qilishlari,
                so‘rov yuborishlari yoki jamoalarga taklif qilinishlari mumkin.
              </p>
              <Link
                href="/projects"
                className="inline-flex items-center text-sm font-semibold text-emerald-700 hover:text-emerald-800"
              >
                Loyihalarni ko‘rish <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Safety & Academic Tone Banner */}
      <section className="py-12 bg-burgundy-900 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <ShieldCheck className="w-10 h-10 text-burgundy-300 shrink-0" />
              <div>
                <h4 className="text-lg font-semibold">
                  Talabalar ma‘lumotlari xavfsizligi va maxfiylik kafolati
                </h4>
                <p className="text-burgundy-200 text-sm mt-1">
                  Pasport ma‘lumotlari so‘ralmaydi. Shaxsiy profilingiz jamoat qidiruvidan alohida himoyalangan.
                </p>
              </div>
            </div>
            <Link
              href="/register"
              className="px-5 py-2.5 rounded-lg bg-white text-burgundy-900 font-semibold text-sm hover:bg-burgundy-50 shrink-0 transition"
            >
              Hozir ro‘yxatdan o‘tish
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
