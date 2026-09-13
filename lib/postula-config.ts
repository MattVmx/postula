import { z } from "zod";

import type { ApplicationStatus, TrackedApplication } from "@/lib/application-utils";

export type Locale = "en" | "es";
export type Theme = "dark" | "light";

export const STORAGE_KEYS = {
  applications: "postula.applications.v1",
  locale: "postula.locale",
  theme: "postula.theme",
} as const;

export const translations = {
  en: {
    workspace: "Career workspace",
    search: "Search roles, companies or skills",
    newApplication: "New application",
    shortNewApplication: "Add",
    activeSearch: "Active search · September",
    title: "Turn applications into a clear next step.",
    intro: "Track every role, compare your fit, and focus on the opportunities that deserve your time.",
    overview: "Application overview",
    metrics: {
      active: "Active applications",
      activeNote: "Saved on this device",
      match: "Average match",
      matchNote: "Across your pipeline",
      interviews: "Interviews",
      interviewsNote: "Currently scheduled",
      currency: "USD reference",
      currencyNote: "Live public exchange API",
      currencyLoading: "Loading live rate",
    },
    pipeline: "Application pipeline",
    attention: (count: number) => `${count} ${count === 1 ? "opportunity needs" : "opportunities need"} your attention.`,
    filter: "Filter status",
    all: "All statuses",
    updated: "Saved locally",
    profileMatch: "Profile match",
    noResults: "No applications found",
    noResultsDescription: "Try another search or add a role to this stage.",
    addTo: "Add to",
    focus: "Focus suggestion",
    focusText: (company: string) => `Review your next step with ${company} before adding another application.`,
    review: "Clear filters",
    status: {
      applied: "Applied",
      interview: "Interview",
      next: "Next step",
    },
    form: {
      title: "Add an application",
      description: "Save the role, estimate your fit, and place it in the pipeline.",
      company: "Company",
      companyPlaceholder: "Acme Studio",
      role: "Role",
      rolePlaceholder: "Junior Frontend Developer",
      location: "Location",
      locationPlaceholder: "Remote · LATAM",
      skills: "Relevant skills",
      skillsPlaceholder: "React, accessibility, APIs",
      link: "Job link (optional)",
      linkPlaceholder: "https://…",
      status: "Pipeline stage",
      match: "Estimated match",
      cancel: "Cancel",
      save: "Save application",
      error: "Check the required fields and enter a valid link.",
      success: "Application added",
    },
    openRole: "Open job link",
    theme: "Toggle color theme",
    language: "Cambiar a español",
  },
  es: {
    workspace: "Espacio de búsqueda",
    search: "Buscar puestos, empresas o habilidades",
    newApplication: "Nueva postulación",
    shortNewApplication: "Agregar",
    activeSearch: "Búsqueda activa · Septiembre",
    title: "Convertí cada postulación en un próximo paso claro.",
    intro: "Organizá los puestos, compará tu compatibilidad y enfocá tu tiempo en las mejores oportunidades.",
    overview: "Resumen de postulaciones",
    metrics: {
      active: "Postulaciones activas",
      activeNote: "Guardadas en este dispositivo",
      match: "Compatibilidad promedio",
      matchNote: "En todo el tablero",
      interviews: "Entrevistas",
      interviewsNote: "Programadas actualmente",
      currency: "Referencia USD",
      currencyNote: "API pública en tiempo real",
      currencyLoading: "Consultando cotización",
    },
    pipeline: "Flujo de postulaciones",
    attention: (count: number) => `${count} ${count === 1 ? "oportunidad requiere" : "oportunidades requieren"} tu atención.`,
    filter: "Filtrar estado",
    all: "Todos los estados",
    updated: "Guardado localmente",
    profileMatch: "Compatibilidad",
    noResults: "No hay postulaciones",
    noResultsDescription: "Probá otra búsqueda o agregá un puesto a esta etapa.",
    addTo: "Agregar a",
    focus: "Sugerencia de enfoque",
    focusText: (company: string) => `Revisá el próximo paso con ${company} antes de sumar otra postulación.`,
    review: "Limpiar filtros",
    status: {
      applied: "Postulado",
      interview: "Entrevista",
      next: "Próximo paso",
    },
    form: {
      title: "Agregar una postulación",
      description: "Guardá el puesto, estimá la compatibilidad y ubicalo en el flujo.",
      company: "Empresa",
      companyPlaceholder: "Estudio Acme",
      role: "Puesto",
      rolePlaceholder: "Desarrollador Frontend Junior",
      location: "Ubicación",
      locationPlaceholder: "Remoto · LATAM",
      skills: "Habilidades relevantes",
      skillsPlaceholder: "React, accesibilidad, APIs",
      link: "Enlace de la oferta (opcional)",
      linkPlaceholder: "https://…",
      status: "Etapa del proceso",
      match: "Compatibilidad estimada",
      cancel: "Cancelar",
      save: "Guardar postulación",
      error: "Revisá los campos obligatorios y verificá que el enlace sea válido.",
      success: "Postulación agregada",
    },
    openRole: "Abrir oferta",
    theme: "Cambiar tema de color",
    language: "Switch to English",
  },
} as const;

export type Translation = (typeof translations)[Locale];

export const initialApplications: TrackedApplication[] = [
  {
    id: "northstar-support",
    company: "Northstar",
    role: "Technical Support Specialist",
    location: "Remote · LATAM",
    match: 88,
    date: { en: "Applied today", es: "Postulado hoy" },
    accent: "NS",
    skills: ["WordPress", "English C2"],
    status: "applied",
  },
  {
    id: "brightlayer-frontend",
    company: "BrightLayer",
    role: "Junior Frontend Developer",
    location: "Remote · Argentina",
    match: 82,
    date: { en: "Applied Sep 9", es: "Postulado el 9 sep." },
    accent: "BL",
    skills: ["React", "JavaScript"],
    status: "applied",
  },
  {
    id: "orbital-qa",
    company: "Orbital Labs",
    role: "Web QA Analyst",
    location: "Remote · Americas",
    match: 91,
    date: { en: "Interview · Fri 11:00", es: "Entrevista · Vie 11:00" },
    accent: "OL",
    skills: ["Manual QA", "Web testing"],
    status: "interview",
  },
  {
    id: "pixelharbor-wordpress",
    company: "Pixel Harbor",
    role: "WordPress Support",
    location: "Remote · Global",
    match: 86,
    date: { en: "Follow up tomorrow", es: "Seguimiento mañana" },
    accent: "PH",
    skills: ["WordPress", "Customer support"],
    status: "next",
  },
  {
    id: "cobalt-content",
    company: "Cobalt Studio",
    role: "Content QA Assistant",
    location: "Remote · LATAM",
    match: 79,
    date: { en: "Review CV", es: "Revisar CV" },
    accent: "CS",
    skills: ["Content", "Attention to detail"],
    status: "next",
  },
];

export const applicationFormSchema = z.object({
  company: z.string().trim().min(2),
  role: z.string().trim().min(2),
  location: z.string().trim().min(2),
  skills: z.string().trim().min(2),
  url: z.union([z.literal(""), z.string().url()]),
  status: z.enum(["applied", "interview", "next"]),
  match: z.coerce.number().min(1).max(100),
});

export type ApplicationFormValues = {
  company: string;
  role: string;
  location: string;
  skills: string;
  url: string;
  status: ApplicationStatus;
  match: string;
};

export const emptyApplicationForm: ApplicationFormValues = {
  company: "",
  role: "",
  location: "",
  skills: "",
  url: "",
  status: "applied",
  match: "80",
};

export const statusOrder: ApplicationStatus[] = ["applied", "interview", "next"];

export const statusTone: Record<ApplicationStatus, string> = {
  applied: "bg-sky-400",
  interview: "bg-violet-400",
  next: "bg-amber-300",
};

const storedApplicationSchema = z.object({
  id: z.string(),
  company: z.string(),
  role: z.string(),
  location: z.string(),
  match: z.number().min(1).max(100),
  date: z.object({ en: z.string(), es: z.string() }),
  accent: z.string(),
  skills: z.array(z.string()),
  status: z.enum(["applied", "interview", "next"]),
  url: z.string().url().optional(),
});

export const storedApplicationsSchema = z.array(storedApplicationSchema);
