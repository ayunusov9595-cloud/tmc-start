import { TemplateConfig, getTemplateById } from './cv-templates';

export interface CvData {
  title?: string;
  personalInfo?: {
    fullName?: string;
    email?: string;
    phone?: string;
    city?: string;
    photoUrl?: string;
    linkedinUrl?: string;
    githubUrl?: string;
    portfolioUrl?: string;
  };
  summary?: string;
  educationData?: Array<{
    institution: string;
    degree: string;
    fieldOfStudy: string;
    startYear: number | string;
    endYear?: number | string;
    description?: string;
  }>;
  experienceData?: Array<{
    title: string;
    organization: string;
    category?: string;
    startDate: string;
    endDate?: string;
    description?: string;
  }>;
  projectsData?: Array<{
    title: string;
    description?: string;
    url?: string;
    technologies?: string;
  }>;
  skillsData?: Array<{
    name: string;
    category?: string;
    proficiency?: string;
  }>;
  languagesData?: Array<{
    language: string;
    proficiency?: string;
  }>;
  certificatesData?: Array<{
    title: string;
    issuer?: string;
    date?: string;
    url?: string;
  }>;
}

export function buildCvHtml(cv: CvData, templateConfig?: TemplateConfig): string {
  const t = templateConfig || {
    id: 'minimal-classic-slate',
    name: 'Klassik Minimal',
    family: 'minimal',
    variant: 'slate',
    description: 'Sodda va aniq tuzilma',
    colors: {
      primary: '#0f172a',
      secondary: '#475569',
      accent: '#8f1f41',
      text: '#1e293b',
      background: '#ffffff',
    },
    layout: {
      columns: 1,
      headerStyle: 'left',
      sectionStyle: 'lined',
    },
    fonts: {
      heading: 'Inter, sans-serif',
      body: 'Inter, sans-serif',
    },
    sectionOrder: ['summary', 'education', 'experience', 'projects', 'skills', 'languages', 'certificates'],
  };

  const p = cv.personalInfo || {};
  const educations = cv.educationData || [];
  const experiences = cv.experienceData || [];
  const projects = cv.projectsData || [];
  const skills = cv.skillsData || [];
  const languages = cv.languagesData || [];
  const certificates = cv.certificatesData || [];

  const primaryColor = t.colors.primary;
  const secondaryColor = t.colors.secondary;
  const accentColor = t.colors.accent;
  const textColor = t.colors.text;

  // Header styling based on template layout
  let headerHtml = '';
  if (t.layout.headerStyle === 'banner') {
    headerHtml = `
      <div style="background-color: ${primaryColor}; color: #ffffff; padding: 24px 32px; border-radius: 4px; margin-bottom: 24px;">
        <h1 style="font-size: 26px; font-weight: 700; margin: 0 0 6px 0; letter-spacing: -0.5px; font-family: ${t.fonts.heading};">
          ${p.fullName || 'Talaba Ismi'}
        </h1>
        <div style="font-size: 13px; opacity: 0.9; display: flex; flex-wrap: wrap; gap: 16px;">
          ${p.email ? `<span>✉ ${p.email}</span>` : ''}
          ${p.phone ? `<span>📞 ${p.phone}</span>` : ''}
          ${p.city ? `<span>📍 ${p.city}</span>` : ''}
          ${p.linkedinUrl ? `<span>🔗 ${p.linkedinUrl}</span>` : ''}
          ${p.githubUrl ? `<span>💻 ${p.githubUrl}</span>` : ''}
        </div>
      </div>
    `;
  } else if (t.layout.headerStyle === 'centered') {
    headerHtml = `
      <div style="text-align: center; border-bottom: 2px solid ${primaryColor}; padding-bottom: 18px; margin-bottom: 24px;">
        <h1 style="font-size: 26px; font-weight: 700; color: ${primaryColor}; margin: 0 0 6px 0; font-family: ${t.fonts.heading};">
          ${p.fullName || 'Talaba Ismi'}
        </h1>
        <div style="font-size: 13px; color: ${secondaryColor}; display: flex; justify-content: center; flex-wrap: wrap; gap: 14px;">
          ${p.email ? `<span>${p.email}</span>` : ''}
          ${p.phone ? `<span>• ${p.phone}</span>` : ''}
          ${p.city ? `<span>• ${p.city}</span>` : ''}
          ${p.portfolioUrl ? `<span>• ${p.portfolioUrl}</span>` : ''}
        </div>
      </div>
    `;
  } else {
    // left aligned
    headerHtml = `
      <div style="border-bottom: 1.5px solid #e2e8f0; padding-bottom: 16px; margin-bottom: 20px;">
        <h1 style="font-size: 28px; font-weight: 700; color: ${primaryColor}; margin: 0 0 4px 0; font-family: ${t.fonts.heading};">
          ${p.fullName || 'Talaba Ismi'}
        </h1>
        <div style="font-size: 13px; color: ${secondaryColor}; display: flex; flex-wrap: wrap; gap: 16px; margin-top: 6px;">
          ${p.email ? `<span>✉ ${p.email}</span>` : ''}
          ${p.phone ? `<span>📞 ${p.phone}</span>` : ''}
          ${p.city ? `<span>📍 ${p.city}</span>` : ''}
          ${p.linkedinUrl ? `<span>🔗 ${p.linkedinUrl}</span>` : ''}
          ${p.githubUrl ? `<span>💻 ${p.githubUrl}</span>` : ''}
        </div>
      </div>
    `;
  }

  // Section Header Generator
  const renderSectionHeader = (title: string) => {
    if (t.layout.sectionStyle === 'boxed') {
      return `
        <div style="background-color: #f8fafc; border-left: 4px solid ${primaryColor}; padding: 6px 12px; margin: 20px 0 12px 0;">
          <h2 style="font-size: 14px; text-transform: uppercase; letter-spacing: 1px; font-weight: 700; color: ${primaryColor}; margin: 0; font-family: ${t.fonts.heading};">
            ${title}
          </h2>
        </div>
      `;
    }
    if (t.layout.sectionStyle === 'dotted') {
      return `
        <div style="border-bottom: 2px dotted ${primaryColor}; padding-bottom: 4px; margin: 20px 0 12px 0;">
          <h2 style="font-size: 15px; font-weight: 700; color: ${primaryColor}; margin: 0; font-family: ${t.fonts.heading};">
            ${title}
          </h2>
        </div>
      `;
    }
    // lined (default)
    return `
      <div style="border-bottom: 1.5px solid ${accentColor}; padding-bottom: 4px; margin: 18px 0 10px 0;">
        <h2 style="font-size: 14px; text-transform: uppercase; letter-spacing: 0.8px; font-weight: 700; color: ${primaryColor}; margin: 0; font-family: ${t.fonts.heading};">
          ${title}
        </h2>
      </div>
    `;
  };

  // Section Renderers
  let summarySection = '';
  if (cv.summary && cv.summary.trim()) {
    summarySection = `
      <div class="cv-section" style="page-break-inside: avoid;">
        ${renderSectionHeader('Professional Xulosa')}
        <p style="font-size: 13px; line-height: 1.6; color: ${textColor}; margin: 0;">
          ${cv.summary}
        </p>
      </div>
    `;
  }

  let educationSection = '';
  if (educations.length > 0) {
    educationSection = `
      <div class="cv-section" style="page-break-inside: avoid;">
        ${renderSectionHeader('Ta‘lim')}
        ${educations
          .map(
            (edu) => `
          <div style="margin-bottom: 12px;">
            <div style="display: flex; justify-content: space-between; align-items: baseline;">
              <strong style="font-size: 13.5px; color: ${primaryColor}; font-weight: 600;">
                ${edu.institution}
              </strong>
              <span style="font-size: 12px; color: ${secondaryColor}; font-weight: 500;">
                ${edu.startYear} — ${edu.endYear || 'Hozirgacha'}
              </span>
            </div>
            <div style="font-size: 13px; color: ${textColor}; margin-top: 2px;">
              ${edu.degree ? `${edu.degree}, ` : ''}${edu.fieldOfStudy}
            </div>
            ${
              edu.description
                ? `<p style="font-size: 12px; color: ${secondaryColor}; margin: 4px 0 0 0; line-height: 1.4;">${edu.description}</p>`
                : ''
            }
          </div>
        `,
          )
          .join('')}
      </div>
    `;
  }

  let experienceSection = '';
  if (experiences.length > 0) {
    experienceSection = `
      <div class="cv-section" style="page-break-inside: avoid;">
        ${renderSectionHeader('Ish va Amaliyot Tajribasi')}
        ${experiences
          .map(
            (exp) => `
          <div style="margin-bottom: 14px;">
            <div style="display: flex; justify-content: space-between; align-items: baseline;">
              <strong style="font-size: 13.5px; color: ${primaryColor}; font-weight: 600;">
                ${exp.title}
              </strong>
              <span style="font-size: 12px; color: ${secondaryColor}; font-weight: 500;">
                ${exp.startDate} — ${exp.endDate || 'Hozirgacha'}
              </span>
            </div>
            <div style="font-size: 12.5px; color: ${accentColor}; font-weight: 500; margin-top: 1px;">
              ${exp.organization} ${exp.category ? `(${exp.category === 'INTERNSHIP' ? 'Amaliyot' : exp.category === 'VOLUNTEERING' ? 'Ko‘ngillilik' : 'Ish'})` : ''}
            </div>
            ${
              exp.description
                ? `<p style="font-size: 12.5px; color: ${textColor}; margin: 4px 0 0 0; line-height: 1.5;">${exp.description}</p>`
                : ''
            }
          </div>
        `,
          )
          .join('')}
      </div>
    `;
  }

  let projectsSection = '';
  if (projects.length > 0) {
    projectsSection = `
      <div class="cv-section" style="page-break-inside: avoid;">
        ${renderSectionHeader('Loyihalar')}
        ${projects
          .map(
            (proj) => `
          <div style="margin-bottom: 12px;">
            <div style="display: flex; justify-content: space-between; align-items: baseline;">
              <strong style="font-size: 13.5px; color: ${primaryColor}; font-weight: 600;">
                ${proj.title}
              </strong>
              ${
                proj.url
                  ? `<a href="${proj.url}" style="font-size: 11.5px; color: ${accentColor}; text-decoration: none;">Havola ↗</a>`
                  : ''
              }
            </div>
            ${
              proj.technologies
                ? `<div style="font-size: 11.5px; color: ${secondaryColor}; margin-top: 1px;"><strong>Texnologiyalar:</strong> ${proj.technologies}</div>`
                : ''
            }
            ${
              proj.description
                ? `<p style="font-size: 12.5px; color: ${textColor}; margin: 3px 0 0 0; line-height: 1.45;">${proj.description}</p>`
                : ''
            }
          </div>
        `,
          )
          .join('')}
      </div>
    `;
  }

  let skillsSection = '';
  if (skills.length > 0) {
    skillsSection = `
      <div class="cv-section" style="page-break-inside: avoid;">
        ${renderSectionHeader('Ko‘nikmalar')}
        <div style="display: flex; flex-wrap: wrap; gap: 6px; margin-top: 4px;">
          ${skills
            .map(
              (s) => `
            <span style="display: inline-block; background-color: #f1f5f9; border: 1px solid #e2e8f0; color: ${primaryColor}; font-size: 12px; padding: 3px 8px; border-radius: 4px; font-weight: 500;">
              ${s.name} ${s.proficiency ? `<small style="color: ${secondaryColor}; font-weight: normal;">(${s.proficiency})</small>` : ''}
            </span>
          `,
            )
            .join('')}
        </div>
      </div>
    `;
  }

  let languagesSection = '';
  if (languages.length > 0) {
    languagesSection = `
      <div class="cv-section" style="page-break-inside: avoid;">
        ${renderSectionHeader('Tillar')}
        <div style="display: flex; flex-wrap: wrap; gap: 12px; margin-top: 4px;">
          ${languages
            .map(
              (l) => `
            <div style="font-size: 12.5px; color: ${textColor};">
              <strong style="color: ${primaryColor};">${l.language}:</strong> ${l.proficiency}
            </div>
          `,
            )
            .join('')}
        </div>
      </div>
    `;
  }

  let certificatesSection = '';
  if (certificates.length > 0) {
    certificatesSection = `
      <div class="cv-section" style="page-break-inside: avoid;">
        ${renderSectionHeader('Sertifikatlar va Yutuqlar')}
        ${certificates
          .map(
            (c) => `
          <div style="margin-bottom: 8px; font-size: 12.5px; color: ${textColor};">
            <strong style="color: ${primaryColor};">${c.title}</strong>
            ${c.issuer ? ` — <span style="color: ${secondaryColor};">${c.issuer}</span>` : ''}
            ${c.date ? ` <small style="color: #94a3b8;">(${c.date})</small>` : ''}
          </div>
        `,
          )
          .join('')}
      </div>
    `;
  }

  // Two columns or one column layout
  let contentHtml = '';
  if (t.layout.columns === 2) {
    contentHtml = `
      <div style="display: flex; gap: 24px;">
        <div style="flex: 2;">
          ${summarySection}
          ${experienceSection}
          ${projectsSection}
        </div>
        <div style="flex: 1; border-left: 1px solid #f1f5f9; padding-left: 20px;">
          ${educationSection}
          ${skillsSection}
          ${languagesSection}
          ${certificatesSection}
        </div>
      </div>
    `;
  } else {
    contentHtml = `
      ${summarySection}
      ${educationSection}
      ${experienceSection}
      ${projectsSection}
      ${skillsSection}
      ${languagesSection}
      ${certificatesSection}
    `;
  }

  return `
    <!DOCTYPE html>
    <html lang="uz">
    <head>
      <meta charset="UTF-8">
      <title>${cv.title || 'Rezyume'} | TMC Start</title>
      <style>
        @page {
          size: A4;
          margin: 15mm 15mm 15mm 15mm;
        }
        * {
          box-sizing: border-box;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        body {
          font-family: ${t.fonts.body};
          background-color: #ffffff;
          color: ${textColor};
          margin: 0;
          padding: 0;
          font-size: 13px;
          line-height: 1.5;
        }
        .cv-container {
          max-width: 800px;
          margin: 0 auto;
          background: #ffffff;
        }
        .cv-section {
          page-break-inside: avoid;
          margin-bottom: 12px;
        }
        a {
          color: ${accentColor};
          text-decoration: none;
        }
      </style>
    </head>
    <body>
      <div class="cv-container">
        ${headerHtml}
        ${contentHtml}
      </div>
    </body>
    </html>
  `;
}
