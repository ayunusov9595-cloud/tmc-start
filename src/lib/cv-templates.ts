// ---------------------------------------------------------------------------
// CV Template Definitions – 108 templates (6 families × 3 layouts × 6 colors)
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface TemplateConfig {
  id: string;
  name: string;
  family: 'minimal' | 'academic' | 'corporate' | 'creative' | 'internship' | 'graduate';
  variant: string;
  description: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    text: string;
    background: string;
  };
  layout: {
    columns: 1 | 2;
    headerStyle: 'centered' | 'left' | 'banner' | 'sidebar';
    sectionStyle: 'lined' | 'boxed' | 'minimal' | 'dotted';
  };
  fonts: {
    heading: string;
    body: string;
  };
  sectionOrder: string[];
}

// ---------------------------------------------------------------------------
// Family metadata
// ---------------------------------------------------------------------------

export const TEMPLATE_FAMILIES: Record<
  TemplateConfig['family'],
  { label: string; description: string }
> = {
  minimal: {
    label: 'Minimalist',
    description: "Sodda va toza dizayn – tarkib e'tiborni tortadi",
  },
  academic: {
    label: 'Akademik',
    description: "Ilmiy va ta'lim sohasiga mos rasmiy shablon",
  },
  corporate: {
    label: 'Korporativ',
    description: "Professional biznes muhitiga mos dizayn",
  },
  creative: {
    label: 'Ijodiy',
    description: "Ijodiy sohalar uchun zamonaviy va rang-barang shablon",
  },
  internship: {
    label: 'Stajirovka',
    description: "Stajyor va boshlang'ich darajadagi nomzodlar uchun",
  },
  graduate: {
    label: 'Bitiruvchi',
    description: "Universitet bitiruvchilari uchun maxsus shablon",
  },
};

// ---------------------------------------------------------------------------
// Layout definitions per family (3 layouts each)
// ---------------------------------------------------------------------------

interface LayoutDef {
  variantPrefix: string;
  columns: 1 | 2;
  headerStyle: 'centered' | 'left' | 'banner' | 'sidebar';
  sectionStyle: 'lined' | 'boxed' | 'minimal' | 'dotted';
  fonts: { heading: string; body: string };
  sectionOrder: string[];
}

const FAMILY_LAYOUTS: Record<TemplateConfig['family'], LayoutDef[]> = {
  minimal: [
    {
      variantPrefix: 'classic',
      columns: 1,
      headerStyle: 'centered',
      sectionStyle: 'minimal',
      fonts: { heading: 'Inter', body: 'Inter' },
      sectionOrder: ['summary', 'experience', 'education', 'skills', 'languages'],
    },
    {
      variantPrefix: 'split',
      columns: 2,
      headerStyle: 'left',
      sectionStyle: 'lined',
      fonts: { heading: 'Inter', body: 'Inter' },
      sectionOrder: ['summary', 'experience', 'skills', 'education', 'languages'],
    },
    {
      variantPrefix: 'clean',
      columns: 1,
      headerStyle: 'left',
      sectionStyle: 'dotted',
      fonts: { heading: 'Helvetica', body: 'Helvetica' },
      sectionOrder: ['summary', 'skills', 'experience', 'education', 'languages', 'projects'],
    },
  ],
  academic: [
    {
      variantPrefix: 'traditional',
      columns: 1,
      headerStyle: 'centered',
      sectionStyle: 'lined',
      fonts: { heading: 'Georgia', body: 'Georgia' },
      sectionOrder: ['summary', 'education', 'research', 'publications', 'experience', 'skills', 'languages'],
    },
    {
      variantPrefix: 'research',
      columns: 2,
      headerStyle: 'banner',
      sectionStyle: 'boxed',
      fonts: { heading: 'Merriweather', body: 'Source Sans Pro' },
      sectionOrder: ['summary', 'education', 'research', 'experience', 'publications', 'skills', 'languages'],
    },
    {
      variantPrefix: 'scholar',
      columns: 1,
      headerStyle: 'left',
      sectionStyle: 'minimal',
      fonts: { heading: 'Libre Baskerville', body: 'Libre Baskerville' },
      sectionOrder: ['education', 'summary', 'research', 'experience', 'skills', 'publications', 'languages'],
    },
  ],
  corporate: [
    {
      variantPrefix: 'executive',
      columns: 1,
      headerStyle: 'banner',
      sectionStyle: 'lined',
      fonts: { heading: 'Montserrat', body: 'Open Sans' },
      sectionOrder: ['summary', 'experience', 'skills', 'education', 'languages', 'certifications'],
    },
    {
      variantPrefix: 'sidebar',
      columns: 2,
      headerStyle: 'sidebar',
      sectionStyle: 'boxed',
      fonts: { heading: 'Raleway', body: 'Lato' },
      sectionOrder: ['summary', 'experience', 'education', 'skills', 'languages', 'certifications'],
    },
    {
      variantPrefix: 'professional',
      columns: 1,
      headerStyle: 'left',
      sectionStyle: 'dotted',
      fonts: { heading: 'Roboto', body: 'Roboto' },
      sectionOrder: ['summary', 'experience', 'skills', 'education', 'certifications', 'languages'],
    },
  ],
  creative: [
    {
      variantPrefix: 'bold',
      columns: 2,
      headerStyle: 'banner',
      sectionStyle: 'boxed',
      fonts: { heading: 'Poppins', body: 'Nunito' },
      sectionOrder: ['summary', 'portfolio', 'experience', 'skills', 'education', 'languages'],
    },
    {
      variantPrefix: 'vibrant',
      columns: 1,
      headerStyle: 'centered',
      sectionStyle: 'minimal',
      fonts: { heading: 'Quicksand', body: 'Quicksand' },
      sectionOrder: ['summary', 'skills', 'portfolio', 'experience', 'education', 'languages'],
    },
    {
      variantPrefix: 'artisan',
      columns: 2,
      headerStyle: 'sidebar',
      sectionStyle: 'dotted',
      fonts: { heading: 'Playfair Display', body: 'Source Sans Pro' },
      sectionOrder: ['summary', 'experience', 'portfolio', 'skills', 'education', 'languages'],
    },
  ],
  internship: [
    {
      variantPrefix: 'starter',
      columns: 1,
      headerStyle: 'centered',
      sectionStyle: 'boxed',
      fonts: { heading: 'Nunito', body: 'Nunito' },
      sectionOrder: ['summary', 'education', 'skills', 'projects', 'experience', 'languages'],
    },
    {
      variantPrefix: 'compact',
      columns: 2,
      headerStyle: 'left',
      sectionStyle: 'minimal',
      fonts: { heading: 'Rubik', body: 'Rubik' },
      sectionOrder: ['summary', 'education', 'skills', 'experience', 'projects', 'languages'],
    },
    {
      variantPrefix: 'fresh',
      columns: 1,
      headerStyle: 'banner',
      sectionStyle: 'lined',
      fonts: { heading: 'DM Sans', body: 'DM Sans' },
      sectionOrder: ['summary', 'skills', 'education', 'projects', 'experience', 'languages', 'interests'],
    },
  ],
  graduate: [
    {
      variantPrefix: 'thesis',
      columns: 1,
      headerStyle: 'centered',
      sectionStyle: 'lined',
      fonts: { heading: 'Lora', body: 'Source Sans Pro' },
      sectionOrder: ['summary', 'education', 'experience', 'skills', 'projects', 'languages'],
    },
    {
      variantPrefix: 'diploma',
      columns: 2,
      headerStyle: 'banner',
      sectionStyle: 'boxed',
      fonts: { heading: 'Josefin Sans', body: 'Open Sans' },
      sectionOrder: ['summary', 'education', 'skills', 'experience', 'projects', 'languages', 'certifications'],
    },
    {
      variantPrefix: 'alumnus',
      columns: 1,
      headerStyle: 'left',
      sectionStyle: 'dotted',
      fonts: { heading: 'Cabin', body: 'Cabin' },
      sectionOrder: ['education', 'summary', 'experience', 'skills', 'projects', 'languages'],
    },
  ],
};

// ---------------------------------------------------------------------------
// Color palettes (6 per layout)
// ---------------------------------------------------------------------------

interface ColorPalette {
  name: string;
  primary: string;
  secondary: string;
  accent: string;
  text: string;
  background: string;
}

const COLOR_PALETTES: ColorPalette[] = [
  {
    name: 'Burgundy',
    primary: '#7B2D3B',
    secondary: '#A65D6A',
    accent: '#C9919B',
    text: '#1A1A1A',
    background: '#FDFBF9',
  },
  {
    name: 'Navy',
    primary: '#1E3A5F',
    secondary: '#4A6F8A',
    accent: '#8AAEC4',
    text: '#1A1A1A',
    background: '#F9FBFD',
  },
  {
    name: 'Forest',
    primary: '#2D5F3B',
    secondary: '#5D8A6A',
    accent: '#91C99B',
    text: '#1A1A1A',
    background: '#F9FDF9',
  },
  {
    name: 'Charcoal',
    primary: '#333333',
    secondary: '#666666',
    accent: '#999999',
    text: '#1A1A1A',
    background: '#FFFFFF',
  },
  {
    name: 'Teal',
    primary: '#1A6B6B',
    secondary: '#4A9696',
    accent: '#85C4C4',
    text: '#1A1A1A',
    background: '#F8FDFD',
  },
  {
    name: 'Plum',
    primary: '#5B2D6B',
    secondary: '#8A5D9A',
    accent: '#B991C9',
    text: '#1A1A1A',
    background: '#FDF9FD',
  },
];

// ---------------------------------------------------------------------------
// Family display names (for template naming)
// ---------------------------------------------------------------------------

const FAMILY_DISPLAY: Record<TemplateConfig['family'], string> = {
  minimal: 'Minimalist',
  academic: 'Akademik',
  corporate: 'Korporativ',
  creative: 'Ijodiy',
  internship: 'Stajirovka',
  graduate: 'Bitiruvchi',
};

// ---------------------------------------------------------------------------
// Generator
// ---------------------------------------------------------------------------

function generateTemplates(): TemplateConfig[] {
  const templates: TemplateConfig[] = [];

  const families: TemplateConfig['family'][] = [
    'minimal',
    'academic',
    'corporate',
    'creative',
    'internship',
    'graduate',
  ];

  for (const family of families) {
    const layouts = FAMILY_LAYOUTS[family];

    for (let li = 0; li < layouts.length; li++) {
      const layout = layouts[li];

      for (let ci = 0; ci < COLOR_PALETTES.length; ci++) {
        const color = COLOR_PALETTES[ci];

        const id = `${family}-${layout.variantPrefix}-${color.name.toLowerCase()}`;
        const variant = `${layout.variantPrefix}-${color.name.toLowerCase()}`;

        const familyLabel = FAMILY_DISPLAY[family];
        const name = `${familyLabel} — ${capitalize(layout.variantPrefix)} (${color.name})`;

        const description = `${TEMPLATE_FAMILIES[family].description}. ${capitalize(layout.variantPrefix)} uslub, ${color.name} rang sxemasi.`;

        templates.push({
          id,
          name,
          family,
          variant,
          description,
          colors: {
            primary: color.primary,
            secondary: color.secondary,
            accent: color.accent,
            text: color.text,
            background: color.background,
          },
          layout: {
            columns: layout.columns,
            headerStyle: layout.headerStyle,
            sectionStyle: layout.sectionStyle,
          },
          fonts: { ...layout.fonts },
          sectionOrder: [...layout.sectionOrder],
        });
      }
    }
  }

  return templates;
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

export const TEMPLATE_CONFIGS: TemplateConfig[] = generateTemplates();

export function getTemplateById(id: string): TemplateConfig | undefined {
  return TEMPLATE_CONFIGS.find((t) => t.id === id);
}

export function getTemplatesByFamily(
  family: TemplateConfig['family'],
): TemplateConfig[] {
  return TEMPLATE_CONFIGS.filter((t) => t.family === family);
}
