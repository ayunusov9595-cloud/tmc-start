# TMC Start — TMC Institute Karyera Markazi Platformasi

TMC Institute talabalari va bitiruvchilari uchun ishlab chiqilgan to‘liq funksional karyera platformasi.

## 5 ta Asosiy Imkoniyat

1. **Shablonli CV yaratish va PDF eksporti**:
   - 108 ta professional tanlanuvchi dizayn varianti (6 ta asosiy oila: minimal, akademik, korporativ, ijodiy, amaliyot, bitiruvchi; 18 ta tayanch maket × 6 xil stil/rang).
   - Qadamma-qadam tahrirlash, jonli oldindan ko‘rish (Live Preview), avtosaqlash (Autosave).
   - Profil ma‘lumotlaridan bir tugma bilan import qilish.
   - Shablonni o‘zgartirganda ma‘lumotlarni yo‘qotmaslik kafolati.
   - A4 formatidagi to‘liq matnli, o‘zbekcha belgilarni (`o‘`, `g‘`) to‘g‘ri aks ettiruvchi server-side PDF eksporti.

2. **Ovozli profil va CV to‘ldirish**:
   - Brauzer orqali to‘g‘ridan-to‘g‘ri ovoz yozish yoki audio fayl (WebM, WAV, MP3) yuklash.
   - O‘zbek tilidagi nutqni transkripsiya qilish (Speech-to-Text).
   - Tahrirlanuvchi transkript va aniqlangan strukturaviy maydonlarni ko‘rish.
   - Talaba tasdiqlashi asosida profilga xavfsiz birlashtirish (hech qachon yashirincha ustiga yozilmaydi).
   - Maxfiylik uchun audio yozuvni o‘chirish (GDPR/shaxsiy ma‘lumotlar himoyasi).

3. **AI bilan CV tekshiruvi (AI Review)**:
   - Platformada yaratilgan CV-ni yoki yuklangan PDF/DOCX hujjatini chuqur tahlil qilish.
   - Maqsadli lavozim va vakansiya matniga moslashtirish imkoniyati.
   - Umumiy xulosa, kuchli tomonlar va aniq matn bo‘laklari (passage) bo‘yicha takliflar.
   - Har bir taklifni alohida qabul qilish yoki rad etish, qabul qilinganlarini tahrirlanuvchi nusxaga kiritish.
   - CV tahrirlanganda tahlil eskirganligini ko‘rsatuvchi xavfsizlik nazorati.

4. **Kasbiy yo‘nalish va tavsiyalar (Career Guidance)**:
   - 3 ta kirish yo‘li: qisqa tarjimai hol yozish, saqlangan profil yoki mavjud CV asosida.
   - Mos tashkilot turlari (masalan, startaplar, banklar, IT autsorsing) va lavozimlar tavsiyasi.
   - "Hozir kirishish mumkin" va "Qo‘shimcha tayyorgarlik talab qilinadi" darajalari.
   - Mavjud kuchli tomonlar, yetishmayotgan talablar va amaliy tayyorgarlik qadami.
   - "Shu lavozim uchun CV tayyorlash" tugmasi orqali yolg‘on ko‘nikmalarsiz moslashtirilgan CV boshlash.

5. **Startap va innovatsiya jamoalarini shakllantirish (Team Formation)**:
   - Talabalar startap/loyiha e‘lon qilishlari va kerakli rollar bo‘yicha bo‘sh o‘rinlar belgilashlari mumkin.
   - Filtrlash va qidiruv (toifa, bosqich, ish formati, vaqt).
   - Jamoaga a‘zolik so‘rovi yuborish, so‘rovni qaytarib olish (withdraw).
   - Loyiha egasi tomonidan arizalarni qabul qilish/rad etish (rol o‘rinlari haddan tashqari to‘lishini oldini oluvchi tranzaksiya).
   - A‘zolik ro‘yxati, a‘zoni chiqarish, loyiha egaligini topshirish (ownership transfer), loyihani yopish.
   - Ichki bildirishnomalar tizimi (In-app notifications).
   - Nomaqbul loyihalar bo‘yicha shikoyat yuborish va moderatsiya.

6. **Career Center Ma‘muriyat Paneli (Admin Area)**:
   - Foydalanuvchilar, CV‘lar, loyihalar va tahlillar bo‘yicha operatsion statistika.
   - Shikoyatlarni ko‘rib chiqish va loyihalarni yopish.
   - Kasbiy rollar va tashkilot turlari taksonomiyasini boshqarish.
   - Audit jurnali (harakatlar tarixi).

---

## Texnologik Asos

- **Freymvork**: Next.js 14 (App Router) + React 18 + TypeScript
- **Stil va UI**: Tailwind CSS (burgundy va warm ranglar palitrasi), Lucide Icons
- **Ma‘lumotlar bazasi**: SQLite (dev.db) + Prisma ORM
- **Autentifikatsiya**: JWT (jose) + bcryptjs parollarni xeshlash + httpOnly cookie
- **AI / Nutq Adapteri**: Gemini REST API integratsiyasi + mustaqil MockAdapter (kalitsiz rejimda ishlash uchun)
- **PDF eksporti**: Server-side Puppeteer A4 brauzer renderlash + print-optimized HTML fallback
- **Testlar**: Vitest

---

## Ishga tushirish yo‘riqnomasi

### 1. Bog‘liqliklarni o‘rnatish:
```bash
cd /Users/aliakbaryunusov/.gemini/antigravity/scratch/tmc-start
npm install
```

### 2. Ma‘lumotlar bazasini sozlash va ma‘lumotlar bilan to‘ldirish (Seed):
```bash
npx prisma db push
npx tsx prisma/seed.ts
```

### 3. Testlarni ishga tushirish:
```bash
npm test
```

### 4. Ishga tushirish:
Ishlab chiqish rejimida:
```bash
npm run dev
```
Yoki ishlab chiqarish (production) rejimida:
```bash
npm run build
npm start
```
Platforma standart holatda `http://localhost:3000` (yoki ko‘rsatilgan portda) ishga tushadi.

---

## Sinov uchun hisoblar (Demo Accounts)

| Rol | Email | Parol | Tavsif |
|---|---|---|---|
| **Talaba 1** | `jasur@tmc.uz` | `Student2026!` | Frontendchi, to‘liq profil, namunaviy CV, EduPulse loyihasi egasi |
| **Talaba 2** | `malika@tmc.uz` | `Student2026!` | UI/UX dizayner, GreenCampus loyihasi egasi |
| **Talaba 3** | `bobur@tmc.uz` | `Student2026!` | Backend dasturchi |
| **Administrator** | `admin@tmc.uz` | `AdminSecret2026!` | Career Center administratori |

---

## Muhit o‘zgaruvchilari (.env)

```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="tmc-start-dev-jwt-secret-change-in-production"
GEMINI_API_KEY=""
SPEECH_PROVIDER="gemini"
NODE_ENV="development"
STORAGE_DRIVER="local"
UPLOAD_DIR="./uploads"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_BRAND_NAME="TMC Start"
NEXT_PUBLIC_INSTITUTE_NAME="TMC Institute"
```

*Eslatma*: `GEMINI_API_KEY` kiritilmaganda platforma to‘liq ishlaydi va sun‘iy intellekt funksiyalari (CV review, kasb tavsiyalari, ovoz transkripsiyasi) avtomatik tarzda to‘g‘ri belgilangan namunaviy (mock) AI adapteridan foydalanadi. Haqiqiy Gemini API kaliti kiritilganda esa jonli Google Gemini xizmatiga ulanadi.
