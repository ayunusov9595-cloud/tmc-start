import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { TEMPLATE_CONFIGS } from '../src/lib/cv-templates';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding TMC Start database...');

  const passwordHash = await bcrypt.hash('Student2026!', 10);
  const adminPasswordHash = await bcrypt.hash('AdminSecret2026!', 10);

  // 1. Seed all 108 Templates into CvTemplate table
  console.log(`Seeding ${TEMPLATE_CONFIGS.length} CV templates...`);
  for (let i = 0; i < TEMPLATE_CONFIGS.length; i++) {
    const t = TEMPLATE_CONFIGS[i];
    await prisma.cvTemplate.upsert({
      where: { id: t.id },
      update: {
        name: t.name,
        family: t.family,
        variant: t.variant,
        description: t.description,
        layoutConfig: JSON.stringify({
          colors: t.colors,
          layout: t.layout,
          fonts: t.fonts,
          sectionOrder: t.sectionOrder,
        }),
        isPublished: true,
        sortOrder: i,
      },
      create: {
        id: t.id,
        name: t.name,
        family: t.family,
        variant: t.variant,
        description: t.description,
        layoutConfig: JSON.stringify({
          colors: t.colors,
          layout: t.layout,
          fonts: t.fonts,
          sectionOrder: t.sectionOrder,
        }),
        isPublished: true,
        sortOrder: i,
      },
    });
  }
  console.log('✓ 108 CV Templates seeded into database');

  // 2. Create Admin
  const admin = await prisma.user.upsert({
    where: { email: 'admin@tmc.uz' },
    update: {},
    create: {
      email: 'admin@tmc.uz',
      passwordHash: adminPasswordHash,
      name: 'Career Center Administrator',
      role: 'ADMIN',
      status: 'ACTIVE',
    },
  });
  console.log('✓ Admin created:', admin.email);

  // 3. Create Student 1: Jasur Bekmurodov
  const student1 = await prisma.user.upsert({
    where: { email: 'jasur@tmc.uz' },
    update: {},
    create: {
      email: 'jasur@tmc.uz',
      passwordHash,
      name: 'Jasur Bekmurodov',
      role: 'STUDENT',
      status: 'ACTIVE',
      profile: {
        create: {
          fullName: 'Jasur Bekmurodov',
          phone: '+998 90 123 45 67',
          city: 'Toshkent',
          bio: 'TMC Institute 3-kurs dasturiy injiniring talabasiman. Zamonaviy veb-texnologiyalar (React, Next.js, Node.js) va sun‘iy intellekt integratsiyasiga qiziqaman.',
          institution: 'TMC Institute',
          studyField: 'Dasturiy injiniring va axborot tizimlari',
          qualification: 'Bakalavr',
          courseYear: 3,
          graduationStatus: 'STUDYING',
          relevantSubjects: JSON.stringify(['Ma‘lumotlar tuzilmasi', 'Algoritmlar', 'Veb-dasturlash', 'Ma‘lumotlar bazasi']),
          careerInterests: JSON.stringify(['Frontend dasturlash', 'Fullstack veb-ilova', 'Sun‘iy intellekt']),
          preferredWorkFormat: 'HYBRID',
          availability: 'PART_TIME',
          linkedinUrl: 'https://linkedin.com/in/jasur-bekmurodov',
          githubUrl: 'https://github.com/jasurbek',
          publicBio: true,
          publicSkills: true,
          publicProjects: true,
          skills: {
            create: [
              { name: 'JavaScript / TypeScript', category: 'Dasturlash', proficiency: 'ADVANCED' },
              { name: 'React & Next.js', category: 'Frontend', proficiency: 'ADVANCED' },
              { name: 'Tailwind CSS', category: 'Dizayn', proficiency: 'EXPERT' },
              { name: 'Node.js & Express', category: 'Backend', proficiency: 'INTERMEDIATE' },
              { name: 'PostgreSQL & SQLite', category: 'Baza', proficiency: 'INTERMEDIATE' },
              { name: 'Git & GitHub', category: 'Vosita', proficiency: 'ADVANCED' },
            ],
          },
          languages: {
            create: [
              { language: "O'zbek tili", proficiency: 'NATIVE' },
              { language: 'Ingliz tili', proficiency: 'B2' },
              { language: 'Rus tili', proficiency: 'B1' },
            ],
          },
          educations: {
            create: [
              {
                institution: 'TMC Institute',
                degree: 'Bakalavr',
                fieldOfStudy: 'Axborot texnologiyalari',
                startYear: 2022,
                endYear: 2026,
                description: 'GPA: 3.8 / 4.0. Fan olimpiadalari ishtirokchisi.',
              },
            ],
          },
          experiences: {
            create: [
              {
                title: 'Junior Frontend Amaliyotchi',
                organization: 'IT Park Uzbekistan rezident kompaniyasi',
                category: 'INTERNSHIP',
                startDate: '2023-06',
                endDate: '2023-09',
                description: 'Mijozlar kabinetining interfeysini React va Tailwind CSS yordamida yaratishda qatnashdim.',
              },
            ],
          },
          profileProjects: {
            create: [
              {
                title: 'TMC Talabalar Karyera Portali',
                description: 'Talabalar uchun rezyume yaratuvchi va loyihalarga jamoa yig‘uvchi veb-platforma.',
                url: 'https://github.com/jasurbek/tmc-start',
                technologies: 'Next.js, TypeScript, Prisma, SQLite',
                category: 'EDUCATIONAL',
              },
            ],
          },
          certificates: {
            create: [
              {
                title: 'Meta Front-End Developer Professional Certificate',
                issuer: 'Coursera / Meta',
                date: '2023',
                category: 'CERTIFICATE',
              },
            ],
          },
        },
      },
    },
  });
  console.log('✓ Student 1 created:', student1.email);

  // 4. Create Student 2: Malika Karimova
  const student2 = await prisma.user.upsert({
    where: { email: 'malika@tmc.uz' },
    update: {},
    create: {
      email: 'malika@tmc.uz',
      passwordHash,
      name: 'Malika Karimova',
      role: 'STUDENT',
      status: 'ACTIVE',
      profile: {
        create: {
          fullName: 'Malika Karimova',
          phone: '+998 91 234 56 78',
          city: 'Toshkent',
          bio: 'UI/UX dizayner va mahsulot boshqaruvi (Product Management) bo‘yicha talaba. Foydalanuvchi tajribasini soddalashtirishga intilaman.',
          institution: 'TMC Institute',
          studyField: 'Biznes va axborot tizimlari',
          qualification: 'Bakalavr',
          courseYear: 2,
          graduationStatus: 'STUDYING',
          relevantSubjects: JSON.stringify(['UI/UX Dizayn', 'Biznes tahlil', 'Loyiha boshqaruvi']),
          careerInterests: JSON.stringify(['UI/UX Dizayn', 'Product Manager']),
          preferredWorkFormat: 'REMOTE',
          availability: 'PART_TIME',
          publicBio: true,
          publicSkills: true,
          publicProjects: true,
          skills: {
            create: [
              { name: 'Figma', category: 'Dizayn', proficiency: 'ADVANCED' },
              { name: 'User Research', category: 'UX', proficiency: 'INTERMEDIATE' },
              { name: 'Wireframing', category: 'Dizayn', proficiency: 'ADVANCED' },
            ],
          },
          languages: {
            create: [
              { language: "O'zbek tili", proficiency: 'NATIVE' },
              { language: 'Ingliz tili', proficiency: 'C1' },
            ],
          },
        },
      },
    },
  });
  console.log('✓ Student 2 created:', student2.email);

  // 5. Create Student 3: Bobur Mirzayev
  const student3 = await prisma.user.upsert({
    where: { email: 'bobur@tmc.uz' },
    update: {},
    create: {
      email: 'bobur@tmc.uz',
      passwordHash,
      name: 'Bobur Mirzayev',
      role: 'STUDENT',
      status: 'ACTIVE',
      profile: {
        create: {
          fullName: 'Bobur Mirzayev',
          phone: '+998 93 345 67 89',
          city: 'Samarqand',
          bio: 'Backend dasturchi. Python, Django, PostgreSQL va API arxitekturasi bilan ishlayman.',
          institution: 'TMC Institute',
          studyField: 'Dasturiy injiniring',
          qualification: 'Bakalavr',
          courseYear: 4,
          graduationStatus: 'GRADUATED',
          careerInterests: JSON.stringify(['Backend dasturlash', 'DevOps']),
          preferredWorkFormat: 'HYBRID',
          availability: 'FULL_TIME',
          publicBio: true,
          publicSkills: true,
          publicProjects: true,
          skills: {
            create: [
              { name: 'Python', category: 'Backend', proficiency: 'ADVANCED' },
              { name: 'Django / FastAPI', category: 'Backend', proficiency: 'ADVANCED' },
              { name: 'Docker', category: 'DevOps', proficiency: 'INTERMEDIATE' },
            ],
          },
          languages: {
            create: [
              { language: "O'zbek tili", proficiency: 'NATIVE' },
              { language: 'Ingliz tili', proficiency: 'B2' },
            ],
          },
        },
      },
    },
  });
  console.log('✓ Student 3 created:', student3.email);

  // 6. Pre-create CV for Jasur
  const sampleCv = await prisma.cvDocument.upsert({
    where: { id: 'sample-cv-jasur-01' },
    update: {},
    create: {
      id: 'sample-cv-jasur-01',
      userId: student1.id,
      title: 'Frontend Dasturchi — Standart CV',
      templateId: TEMPLATE_CONFIGS[0].id,
      status: 'COMPLETED',
      isFavorite: true,
      personalInfo: JSON.stringify({
        fullName: 'Jasur Bekmurodov',
        email: 'jasur@tmc.uz',
        phone: '+998 90 123 45 67',
        city: 'Toshkent',
        linkedinUrl: 'https://linkedin.com/in/jasur-bekmurodov',
        githubUrl: 'https://github.com/jasurbek',
      }),
      summary:
        'TMC Institute 3-kurs talabasiman. Zamonaviy React, Next.js va TypeScript texnologiyalari orqali qulay va tezkor veb-ilovalarni yaratish bo‘yicha amaliy tajribaga egaman.',
      educationData: JSON.stringify([
        {
          institution: 'TMC Institute',
          degree: 'Bakalavr',
          fieldOfStudy: 'Axborot texnologiyalari va dasturiy injiniring',
          startYear: 2022,
          endYear: 2026,
          description: 'Akademik reyting: A. Talabalar ilmiy jamiyati a‘zosi.',
        },
      ]),
      experienceData: JSON.stringify([
        {
          title: 'Frontend Amaliyotchi',
          organization: 'IT Park Rezidenti',
          category: 'INTERNSHIP',
          startDate: '2023-06',
          endDate: '2023-09',
          description: 'Interfeys komponentlarini yaratish va API bilan integratsiya qilish.',
        },
      ]),
      projectsData: JSON.stringify([
        {
          title: 'TMC Start — Talabalar karyera tizimi',
          description: 'Avtomatlashtirilgan CV generatori va jamoa shakllantirish ekotizimi.',
          technologies: 'Next.js, TypeScript, SQLite, Tailwind',
          url: 'https://github.com/jasurbek/tmc-start',
        },
      ]),
      skillsData: JSON.stringify([
        { name: 'JavaScript / TypeScript', proficiency: 'Yuqori' },
        { name: 'React / Next.js', proficiency: 'Yuqori' },
        { name: 'Tailwind CSS', proficiency: 'Mukammal' },
        { name: 'PostgreSQL', proficiency: 'O‘rta' },
      ]),
      languagesData: JSON.stringify([
        { language: "O'zbek tili", proficiency: 'Ona tili' },
        { language: 'Ingliz tili', proficiency: 'B2 (IELTS 6.5)' },
      ]),
      certificatesData: JSON.stringify([
        { title: 'Meta Front-End Developer', issuer: 'Meta', date: '2023' },
      ]),
    },
  });
  console.log('✓ Sample CV created:', sampleCv.title);

  // 7. Pre-create Projects & Teams
  const proj1 = await prisma.project.upsert({
    where: { id: 'sample-project-01' },
    update: {},
    create: {
      id: 'sample-project-01',
      ownerId: student1.id,
      title: 'EduPulse — Talabalar uchun AI repetitor',
      description:
        'Talabalarning dars jadvallari va konspektlari asosida avtomatik testlar va tushuntirishlar beruvchi sun‘iy intellekt repetitori.',
      problem:
        'Ko‘p talabalar imtihon oldidan qiyin fanlardan individual savollariga tezkor javob topishda qiynalishadi.',
      outcome:
        'Mobil va veb platforma orqali 1000+ talabaga imtihonga tayyorlanishda AI yordamchi taqdim etish.',
      category: 'STARTUP',
      stage: 'MVP',
      weeklyHours: 12,
      durationWeeks: 16,
      workFormat: 'HYBRID',
      location: 'TMC Institute kovorking',
      compensation: 'Loyiha grantidan stipendiya va kelajakdagi startap ulushi',
      status: 'PUBLISHED',
      roles: {
        create: [
          {
            title: 'UI/UX Dizayner',
            description: 'Talabalar uchun qulay mobil ilova prototipini yaratish',
            skillsNeeded: 'Figma, Mobile UI, Wireframing',
            maxPlaces: 1,
            filledPlaces: 1,
          },
          {
            title: 'Backend / AI Muhandis',
            description: 'Python va Gemini API integratsiyasi, matnlarni qayta ishlash',
            skillsNeeded: 'Python, FastAPI, RAG, SQLite',
            maxPlaces: 2,
            filledPlaces: 0,
          },
        ],
      },
      memberships: {
        create: [
          { userId: student1.id, role: 'Loyiha asoschisi (Owner)', isOwner: true },
          { userId: student2.id, role: 'UI/UX Dizayner', isOwner: false },
        ],
      },
    },
  });
  console.log('✓ Project 1 created:', proj1.title);

  const proj2 = await prisma.project.upsert({
    where: { id: 'sample-project-02' },
    update: {},
    create: {
      id: 'sample-project-02',
      ownerId: student2.id,
      title: 'GreenCampus TMC — Chiqindilarni saralash va eko-monitoring',
      description:
        'Institut hududida chiqindilarni aqlli saralash va energiya tejash bo‘yicha ekologik monitoring tizimi.',
      category: 'INNOVATION',
      stage: 'IDEA',
      weeklyHours: 8,
      durationWeeks: 10,
      workFormat: 'ONSITE',
      location: 'TMC Asosiy bino',
      compensation: 'Institut ma‘muriyatining maxsus diplomi va yutuqlar',
      status: 'PUBLISHED',
      roles: {
        create: [
          {
            title: 'IoT & Dasturchi',
            description: 'Sensorlar va ma‘lumot yig‘ish mikrokontrollerlari',
            skillsNeeded: 'Arduino, C++, Python',
            maxPlaces: 2,
            filledPlaces: 0,
          },
        ],
      },
      memberships: {
        create: [{ userId: student2.id, role: 'Loyiha koordinatori', isOwner: true }],
      },
    },
  });
  console.log('✓ Project 2 created:', proj2.title);

  // 8. Reference Data: Roles & Org Types
  const rolesData = [
    { title: 'Frontend Dasturchi', category: 'IT', description: 'Veb va mobil interfeyslarni ishlab chiquvchi mutaxassis' },
    { title: 'Backend Dasturchi', category: 'IT', description: 'Server, ma‘lumotlar bazasi va API tizimlarini yaratuvchi' },
    { title: 'UI/UX Dizayner', category: 'DESIGN', description: 'Foydalanuvchi tajribasi va vizual interfeys dizayneri' },
    { title: 'Data Analyst (Ma‘lumotlar tahlilchisi)', category: 'DATA', description: 'Katta ma‘lumotlarni tahlil qilish va vizualizatsiya' },
    { title: 'Mahsulot Menejeri (Product Manager)', category: 'MANAGEMENT', description: 'Mahsulot strategiyasi va jamoa yo‘naltiruvchisi' },
    { title: 'Kiberxavfsizlik Mutaxassisi', category: 'SECURITY', description: 'Axborot xavfsizligi va audit bo‘yicha mutaxassis' },
    { title: 'Moliyaviy Tahlilchi', category: 'FINANCE', description: 'Moliyaviy modellashtirish va risklarni baholovchi' },
    { title: 'QA / Sinovchi Muhandis', category: 'IT', description: 'Dasturiy ta‘minot sifatini tekshiruvchi' },
  ];

  for (const r of rolesData) {
    await prisma.roleReference.upsert({
      where: { title: r.title },
      update: {},
      create: r,
    });
  }

  const orgTypesData = [
    { name: 'Startap va Texnologik Kompaniyalar', description: 'Tez o‘suvchi, innovatsion IT va raqamli mahsulot ishlab chiquvchilar' },
    { name: 'Bank va Moliya Institutlari', description: 'Tijorat banklari, fintech xizmatlar va to‘lov tizimlari' },
    { name: 'Xalqaro IT Autsorsing Kompaniyalari', description: 'Xorijiy buyurtmachilar uchun dasturiy ta‘minot yetkazib beruvchilar' },
    { name: 'Davlat va Ta‘lim Muassasalari', description: 'Vazirliklar, universitetlar va ilmiy-tadqiqot institutlari' },
    { name: 'E-tijorat va Logistika Korxonalari', description: 'Onlayn savdo platformalari, yetkazib berish xizmatlari' },
  ];

  for (const o of orgTypesData) {
    await prisma.organizationType.upsert({
      where: { name: o.name },
      update: {},
      create: o,
    });
  }
  console.log('✓ Taxonomy references seeded');

  // Seed sample moderation report
  await prisma.moderationReport.upsert({
    where: { id: 'sample-report-01' },
    update: {},
    create: {
      id: 'sample-report-01',
      reporterId: student3.id,
      projectId: proj2.id,
      reason: 'OTHER',
      details: 'Loyihaning aloqa tafsilotlari yetarlicha aniq emas.',
      status: 'PENDING',
    },
  });

  // Seed sample audit log
  await prisma.auditLog.create({
    data: {
      userId: admin.id,
      action: 'SYSTEM_INITIALIZATION',
      entityType: 'PLATFORM',
      entityId: 'SYSTEM',
      details: 'TMC Start platformasi ishga tushirildi va dastlabki ma‘lumotlar yuklandi.',
    },
  });

  console.log('Seeding finished successfully! 🎉');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
