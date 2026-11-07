// ---------------------------------------------------------------------------
// AI Adapter – provider abstraction for TMC Start
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Result / data types
// ---------------------------------------------------------------------------

export interface CvReviewResult {
  overview: string;
  strengths: string[];
  suggestions: {
    section: string;
    passage: string;
    issue: string;
    suggestion: string;
    status: 'pending';
  }[];
}

export interface CareerRecommendation {
  role: string;
  organizationTypes: string[];
  whySuitable: string;
  strengths: string[];
  missingRequirements: string[];
  preparationStep: string;
  readinessLevel: 'ready_now' | 'needs_preparation';
}

export interface ExtractedProfileFields {
  fullName?: string;
  phone?: string;
  city?: string;
  institution?: string;
  studyField?: string;
  qualification?: string;
  courseYear?: string;
  skills?: { name: string; proficiency: string }[];
  languages?: { language: string; proficiency: string }[];
  experiences?: {
    title: string;
    company: string;
    startDate?: string;
    endDate?: string;
    description?: string;
  }[];
  education?: {
    institution: string;
    degree?: string;
    field?: string;
    startDate?: string;
    endDate?: string;
  }[];
  summary?: string;
}

// ---------------------------------------------------------------------------
// Adapter interface
// ---------------------------------------------------------------------------

export interface AiAdapter {
  reviewCv(
    cvText: string,
    targetRole?: string,
    vacancyText?: string,
  ): Promise<CvReviewResult>;

  extractCareerGuidance(
    profileText: string,
    context?: string,
  ): Promise<CareerRecommendation[]>;

  extractProfileFromText(
    transcript: string,
  ): Promise<ExtractedProfileFields>;

  transcribeAudio(
    audioBuffer: Buffer,
    format: string,
  ): Promise<string>;
}

// ---------------------------------------------------------------------------
// Gemini REST helpers
// ---------------------------------------------------------------------------

const GEMINI_BASE_URL =
  'https://generativelanguage.googleapis.com/v1beta/models';
const GEMINI_MODEL = 'gemini-2.0-flash';

interface GeminiPart {
  text?: string;
  inlineData?: { mimeType: string; data: string };
}

interface GeminiContent {
  role: string;
  parts: GeminiPart[];
}

interface GeminiRequest {
  contents: GeminiContent[];
  generationConfig?: {
    responseMimeType?: string;
    temperature?: number;
    maxOutputTokens?: number;
  };
}

async function callGemini(
  apiKey: string,
  request: GeminiRequest,
): Promise<string> {
  const url = `${GEMINI_BASE_URL}/${GEMINI_MODEL}:generateContent?key=${apiKey}`;

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });

  if (!res.ok) {
    const errorBody = await res.text();
    throw new Error(`Gemini API error (${res.status}): ${errorBody}`);
  }

  const data = await res.json();

  const candidate = data?.candidates?.[0];
  if (!candidate?.content?.parts?.length) {
    throw new Error('Gemini returned an empty response');
  }

  return candidate.content.parts
    .map((p: GeminiPart) => p.text ?? '')
    .join('');
}

/**
 * Parse a JSON string that may be wrapped in a markdown code fence.
 */
function parseJsonResponse<T>(raw: string): T {
  let cleaned = raw.trim();

  // Strip ```json ... ``` fences
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*\n?/, '').replace(/\n?```\s*$/, '');
  }

  return JSON.parse(cleaned) as T;
}

// ---------------------------------------------------------------------------
// GeminiAdapter
// ---------------------------------------------------------------------------

export class GeminiAdapter implements AiAdapter {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  // -----------------------------------------------------------------------
  // reviewCv
  // -----------------------------------------------------------------------
  async reviewCv(
    cvText: string,
    targetRole?: string,
    vacancyText?: string,
  ): Promise<CvReviewResult> {
    const rolePart = targetRole
      ? `\nMaqsadli lavozim: ${targetRole}`
      : '';
    const vacancyPart = vacancyText
      ? `\n\nVakansiya matni:\n${vacancyText}`
      : '';

    const prompt = `Sen professional karyera maslahatchi va CV ekspertisin. Quyidagi CV ni ko'rib chiq va batafsil tahlil qil.${rolePart}${vacancyPart}

CV matni:
${cvText}

Quyidagi JSON formatida javob ber (faqat JSON, boshqa matn yo'q):
{
  "overview": "CV haqida umumiy baho (2-3 gap, o'zbek tilida)",
  "strengths": ["kuchli tomon 1", "kuchli tomon 2", ...],
  "suggestions": [
    {
      "section": "CV bo'limi nomi",
      "passage": "muammoli matn parchasi",
      "issue": "muammo tavsifi",
      "suggestion": "taklif qilingan yaxshilanish",
      "status": "pending"
    }
  ]
}

Muhim ko'rsatmalar:
- Barcha javoblar o'zbek tilida (lotin alifbosida) bo'lsin
- Kamida 3 ta kuchli tomon va 3 ta taklif ber
- Takliflar aniq va amaliy bo'lsin
- "status" har doim "pending" bo'lsin`;

    const raw = await callGemini(this.apiKey, {
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.4,
        maxOutputTokens: 4096,
      },
    });

    return parseJsonResponse<CvReviewResult>(raw);
  }

  // -----------------------------------------------------------------------
  // extractCareerGuidance
  // -----------------------------------------------------------------------
  async extractCareerGuidance(
    profileText: string,
    context?: string,
  ): Promise<CareerRecommendation[]> {
    const contextPart = context
      ? `\nQo'shimcha kontekst: ${context}`
      : '';

    const prompt = `Sen professional karyera yo'naltirish bo'yicha maslahatchisin. O'zbekistondagi mehnat bozori va ta'lim tizimini yaxshi bilasan.${contextPart}

Quyidagi talaba/bitiruvchi profili asosida karyera tavsiyalari ber:

${profileText}

Quyidagi JSON formatida javob ber (faqat JSON massiv, boshqa matn yo'q):
[
  {
    "role": "Tavsiya etilgan lavozim nomi",
    "organizationTypes": ["mos tashkilot turlari"],
    "whySuitable": "Nima uchun bu lavozim mos (2-3 gap)",
    "strengths": ["nomzodning kuchli tomoni 1", ...],
    "missingRequirements": ["yetishmayotgan talab 1", ...],
    "preparationStep": "Tayyorlanish uchun birinchi qadam",
    "readinessLevel": "ready_now" yoki "needs_preparation"
  }
]

Muhim ko'rsatmalar:
- Barcha javoblar o'zbek tilida (lotin alifbosida) bo'lsin
- 3 dan 5 gacha tavsiya ber
- O'zbekiston mehnat bozoriga mos lavozimlarni tavsiya qil
- Har bir tavsiya aniq va amaliy bo'lsin
- readinessLevel faqat "ready_now" yoki "needs_preparation" bo'lsin`;

    const raw = await callGemini(this.apiKey, {
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.5,
        maxOutputTokens: 4096,
      },
    });

    return parseJsonResponse<CareerRecommendation[]>(raw);
  }

  // -----------------------------------------------------------------------
  // extractProfileFromText
  // -----------------------------------------------------------------------
  async extractProfileFromText(
    transcript: string,
  ): Promise<ExtractedProfileFields> {
    const prompt = `Sen ma'lumotlarni tahlil qilish bo'yicha mutaxassissan. Quyidagi matndan shaxsiy va professional ma'lumotlarni ajratib ol.

Matn:
${transcript}

Quyidagi JSON formatida javob ber (faqat JSON, boshqa matn yo'q):
{
  "fullName": "To'liq ism (agar topilsa)",
  "phone": "Telefon raqami (agar topilsa)",
  "city": "Shahar (agar topilsa)",
  "institution": "Ta'lim muassasasi (agar topilsa)",
  "studyField": "O'qish yo'nalishi (agar topilsa)",
  "qualification": "Malaka darajasi (agar topilsa)",
  "courseYear": "Kurs yili (agar topilsa)",
  "skills": [
    {"name": "Ko'nikma nomi", "proficiency": "Daraja: beginner/intermediate/advanced/expert"}
  ],
  "languages": [
    {"language": "Til nomi", "proficiency": "Daraja: beginner/intermediate/advanced/native"}
  ],
  "experiences": [
    {
      "title": "Lavozim",
      "company": "Tashkilot",
      "startDate": "Boshlanish sanasi",
      "endDate": "Tugash sanasi",
      "description": "Qisqa tavsif"
    }
  ],
  "education": [
    {
      "institution": "Ta'lim muassasasi",
      "degree": "Daraja",
      "field": "Yo'nalish",
      "startDate": "Boshlanish sanasi",
      "endDate": "Tugash sanasi"
    }
  ],
  "summary": "Qisqa professional xulosa (2-3 gap)"
}

Muhim ko'rsatmalar:
- Faqat matnda topilgan ma'lumotlarni qaytaring
- Topilmagan maydonlarni null qiling yoki tashlab keting
- skills, languages, experiences, education – bo'sh massiv qaytaring agar ma'lumot topilmasa
- Barcha qiymatlar o'zbek tilida bo'lsin`;

    const raw = await callGemini(this.apiKey, {
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.2,
        maxOutputTokens: 4096,
      },
    });

    return parseJsonResponse<ExtractedProfileFields>(raw);
  }

  // -----------------------------------------------------------------------
  // transcribeAudio
  // -----------------------------------------------------------------------
  async transcribeAudio(
    audioBuffer: Buffer,
    format: string,
  ): Promise<string> {
    // Map common format strings to MIME types
    const mimeMap: Record<string, string> = {
      webm: 'audio/webm',
      wav: 'audio/wav',
      mp3: 'audio/mp3',
      mpeg: 'audio/mpeg',
      ogg: 'audio/ogg',
    };
    const mimeType = mimeMap[format] ?? `audio/${format}`;

    const base64Audio = audioBuffer.toString('base64');

    const prompt = `Quyidagi audio yozuvni matnga o'gir (transkriptsiya qil). 

Ko'rsatmalar:
- Audio o'zbek tilida bo'lishi mumkin, rus tilida yoki ingliz tilida
- Faqat so'zlangan matnni qaytaring, boshqa izoh qo'shmang
- Agar audio tushunarsiz bo'lsa, eng yaqin taxminni qaytaring
- Tinish belgilarini to'g'ri qo'ying`;

    const raw = await callGemini(this.apiKey, {
      contents: [
        {
          role: 'user',
          parts: [
            { inlineData: { mimeType, data: base64Audio } },
            { text: prompt },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 8192,
      },
    });

    return raw.trim();
  }
}

// ---------------------------------------------------------------------------
// MockAdapter
// ---------------------------------------------------------------------------

export class MockAdapter implements AiAdapter {
  async reviewCv(
    _cvText: string,
    targetRole?: string,
  ): Promise<CvReviewResult> {
    const roleName = targetRole || 'umumiy lavozim';

    return {
      overview: `[Mock] Bu CV ${roleName} uchun o'rtacha darajada mos. Asosiy bo'limlar mavjud, lekin ba'zi yaxshilanishlar kerak.`,
      strengths: [
        "[Mock] Ta'lim ma'lumotlari to'liq kiritilgan",
        "[Mock] Ko'nikmalar bo'limi yaxshi tuzilgan",
        "[Mock] Professional tajriba aniq tasvirlangan",
      ],
      suggestions: [
        {
          section: 'Xulosa',
          passage: '[Mock] Mavjud xulosa matni',
          issue: "[Mock] Professional xulosa qisqa va umumiy yozilgan",
          suggestion:
            "[Mock] Xulosani kengaytiring va aniq maqsadlaringizni ko'rsating. Masalan: '3 yillik tajribaga ega dasturchi...'",
          status: 'pending',
        },
        {
          section: "Ko'nikmalar",
          passage: '[Mock] Mavjud ko\'nikmalar ro\'yxati',
          issue: "[Mock] Ko'nikmalar darajasi ko'rsatilmagan",
          suggestion:
            "[Mock] Har bir ko'nikma yoniga daraja qo'shing: boshlang'ich, o'rta, ilg'or",
          status: 'pending',
        },
        {
          section: 'Tajriba',
          passage: '[Mock] Mavjud tajriba tavsifi',
          issue: "[Mock] Ish tajribasida aniq natijalar ko'rsatilmagan",
          suggestion:
            "[Mock] Har bir lavozimda erishgan natijalaringizni raqamlar bilan ko'rsating",
          status: 'pending',
        },
      ],
    };
  }

  async extractCareerGuidance(
    _profileText: string,
  ): Promise<CareerRecommendation[]> {
    return [
      {
        role: '[Mock] Junior dasturchi',
        organizationTypes: ['IT kompaniya', 'Startap'],
        whySuitable:
          "[Mock] Texnik ko'nikmalari va ta'lim yo'nalishi dasturlashga mos keladi.",
        strengths: [
          "[Mock] Dasturlash tillarini biladi",
          "[Mock] Jamoa bilan ishlash tajribasi bor",
        ],
        missingRequirements: [
          "[Mock] Amaliy loyiha tajribasi kam",
          "[Mock] Git va CI/CD bilimi kerak",
        ],
        preparationStep:
          "[Mock] GitHub'da shaxsiy loyihalar yarating va open-source loyihalarga hissa qo'shing.",
        readinessLevel: 'needs_preparation',
      },
      {
        role: '[Mock] Marketing mutaxassisi',
        organizationTypes: ['Reklama agentligi', 'Savdo kompaniyasi'],
        whySuitable:
          "[Mock] Kommunikatsiya ko'nikmalari va ijodiy yondashuvi marketing sohasiga mos.",
        strengths: [
          "[Mock] Yaxshi muloqot qobiliyati",
          "[Mock] Ijtimoiy tarmoqlarda faol",
        ],
        missingRequirements: [
          '[Mock] Digital marketing sertifikati',
          "[Mock] Analytics vositalari bilimi",
        ],
        preparationStep:
          '[Mock] Google Digital Marketing sertifikatini oling.',
        readinessLevel: 'needs_preparation',
      },
      {
        role: "[Mock] Ma'muriy xodim",
        organizationTypes: ["Davlat tashkiloti", "Xalqaro tashkilot"],
        whySuitable:
          "[Mock] Tashkiliy qobiliyati va mas'uliyatli yondashuvi mos keladi.",
        strengths: [
          "[Mock] Mas'uliyatli va intizomli",
          "[Mock] Bir nechta tilni biladi",
        ],
        missingRequirements: [
          "[Mock] Ofis dasturlarida ilg'or bilim",
        ],
        preparationStep:
          "[Mock] MS Office va Google Workspace bo'yicha kursni tamommlang.",
        readinessLevel: 'ready_now',
      },
    ];
  }

  async extractProfileFromText(
    _transcript: string,
  ): Promise<ExtractedProfileFields> {
    return {
      fullName: "[Mock] Abdullayev Jasur",
      phone: "+998 90 123 45 67",
      city: "Toshkent",
      institution: "TMC Institute",
      studyField: "Axborot texnologiyalari",
      qualification: "Bakalavr",
      courseYear: "3-kurs",
      skills: [
        { name: "[Mock] JavaScript", proficiency: "intermediate" },
        { name: "[Mock] Python", proficiency: "beginner" },
      ],
      languages: [
        { language: "O'zbek", proficiency: "native" },
        { language: "Ingliz", proficiency: "intermediate" },
      ],
      experiences: [
        {
          title: "[Mock] Stajyor dasturchi",
          company: "IT Solutions",
          startDate: "2024-06",
          endDate: "2024-09",
          description: "[Mock] Veb-ilovalar ustida ishlash",
        },
      ],
      education: [
        {
          institution: "TMC Institute",
          degree: "Bakalavr",
          field: "Axborot texnologiyalari",
          startDate: "2022-09",
          endDate: "2026-06",
        },
      ],
      summary:
        "[Mock] IT sohasida boshlang'ich tajribaga ega, o'rganishga intiluvchi talaba.",
    };
  }

  async transcribeAudio(
    _audioBuffer: Buffer,
    _format: string,
  ): Promise<string> {
    return "[Mock] Salom, mening ismim Jasur. Men TMC Institute'da 3-kurs talabasi. Axborot texnologiyalari yo'nalishida o'qiyman. JavaScript va Python dasturlash tillarini bilaman. Kelajakda dasturchi bo'lib ishlashni xohlayman.";
  }
}

// ---------------------------------------------------------------------------
// Factory
// ---------------------------------------------------------------------------

/**
 * Returns true if a Gemini API key is configured.
 */
export function isAiConfigured(): boolean {
  return !!process.env.GEMINI_API_KEY;
}

/**
 * Get the appropriate AI adapter. Returns GeminiAdapter when an API key is
 * available, otherwise falls back to MockAdapter.
 */
export function getAiAdapter(): AiAdapter {
  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey) {
    return new GeminiAdapter(apiKey);
  }

  console.warn(
    '[TMC Start] GEMINI_API_KEY is not set – using MockAdapter. AI responses will be placeholder data.',
  );
  return new MockAdapter();
}
