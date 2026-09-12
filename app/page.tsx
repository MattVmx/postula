"use client";

import {
  BriefcaseBusiness,
  CalendarDays,
  Check,
  CircleDot,
  Command,
  ExternalLink,
  Languages,
  LoaderCircle,
  Moon,
  Plus,
  Search,
  Sparkles,
  Sun,
  Target,
  WalletCards,
} from "lucide-react";
import { type FormEvent, type ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Toaster } from "@/components/ui/sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  calculateSummary,
  filterApplications,
  type ApplicationStatus,
  type TrackedApplication,
} from "@/lib/application-utils";

type Locale = "en" | "es";
type Theme = "dark" | "light";

type WebMcpTool = {
  name: string;
  title?: string;
  description: string;
  inputSchema: Record<string, unknown>;
  annotations?: { readOnlyHint?: boolean; untrustedContentHint?: boolean };
  execute(input: unknown): unknown | Promise<unknown>;
};

declare global {
  interface Document {
    modelContext?: {
      registerTool(
        tool: WebMcpTool,
        options?: { signal?: AbortSignal },
      ): void | Promise<void>;
    };
  }
}

const STORAGE_KEY = "postula.applications.v1";

const translations = {
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

const initialApplications: TrackedApplication[] = [
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

const formSchema = z.object({
  company: z.string().trim().min(2),
  role: z.string().trim().min(2),
  location: z.string().trim().min(2),
  skills: z.string().trim().min(2),
  url: z.union([z.literal(""), z.string().url()]),
  status: z.enum(["applied", "interview", "next"]),
  match: z.coerce.number().min(1).max(100),
});

const emptyForm = {
  company: "",
  role: "",
  location: "",
  skills: "",
  url: "",
  status: "applied" as ApplicationStatus,
  match: "80",
};

const statusOrder: ApplicationStatus[] = ["applied", "interview", "next"];
const statusTone: Record<ApplicationStatus, string> = {
  applied: "bg-sky-400",
  interview: "bg-violet-400",
  next: "bg-amber-300",
};

export default function Home() {
  const [applications, setApplications] = useState(initialApplications);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | "all">("all");
  const [locale, setLocale] = useState<Locale>("en");
  const [theme, setTheme] = useState<Theme>("dark");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState("");
  const [hydrated, setHydrated] = useState(false);
  const [arsRate, setArsRate] = useState<number | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const t = translations[locale];

  useEffect(() => {
    const hydrationTimer = window.setTimeout(() => {
      try {
        const savedApplications = window.localStorage.getItem(STORAGE_KEY);
        const savedTheme = window.localStorage.getItem("postula.theme") as Theme | null;
        const savedLocale = window.localStorage.getItem("postula.locale") as Locale | null;

        if (savedApplications) {
          const parsed = JSON.parse(savedApplications);
          if (Array.isArray(parsed)) setApplications(parsed);
        }
        if (savedTheme === "dark" || savedTheme === "light") setTheme(savedTheme);
        if (savedLocale === "en" || savedLocale === "es") setLocale(savedLocale);
      } catch {
        setApplications(initialApplications);
      } finally {
        setHydrated(true);
      }
    }, 0);

    return () => window.clearTimeout(hydrationTimer);
  }, []);

  useEffect(() => {
    const context = document.modelContext;
    if (!context?.registerTool) return;
    const lifecycle = new AbortController();
    const options = { signal: lifecycle.signal };
    const registrations = [
      context.registerTool(
        {
          name: "list_applications",
          title: "List applications",
          description:
            "Read the applications currently saved in Postula, including their stage, match score, and relevant skills.",
          inputSchema: { type: "object", properties: {}, additionalProperties: false },
          annotations: { readOnlyHint: true, untrustedContentHint: true },
          execute() {
            return {
              count: applications.length,
              applications: applications.map((application) => ({
                id: application.id,
                company: application.company,
                role: application.role,
                location: application.location,
                match: application.match,
                status: application.status,
                skills: application.skills,
              })),
            };
          },
        },
        options,
      ),
      context.registerTool(
        {
          name: "add_application",
          title: "Add application",
          description:
            "Add a job application to the visible Postula pipeline after all required details have been provided.",
          inputSchema: {
            type: "object",
            properties: {
              company: { type: "string", minLength: 2 },
              role: { type: "string", minLength: 2 },
              location: { type: "string", minLength: 2 },
              skills: {
                type: "string",
                description: "Comma-separated relevant skills.",
                minLength: 2,
              },
              url: { type: "string", format: "uri" },
              status: { type: "string", enum: statusOrder },
              match: { type: "number", minimum: 1, maximum: 100 },
            },
            required: ["company", "role", "location", "skills", "status", "match"],
            additionalProperties: false,
          },
          annotations: { readOnlyHint: false, untrustedContentHint: true },
          execute(input) {
            const result = formSchema.safeParse({ url: "", ...(input as object) });
            if (!result.success) throw new Error("Invalid application details.");
            const created = addApplication(result.data);
            return { id: created.id, status: "created" };
          },
        },
        options,
      ),
    ];

    registrations.forEach((registration) => {
      void Promise.resolve(registration).catch(() => undefined);
    });
    return () => lifecycle.abort();
  }, [applications]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.lang = locale;
    if (hydrated) {
      window.localStorage.setItem("postula.theme", theme);
      window.localStorage.setItem("postula.locale", locale);
    }
  }, [theme, locale, hydrated]);

  useEffect(() => {
    if (hydrated) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(applications));
  }, [applications, hydrated]);

  useEffect(() => {
    const controller = new AbortController();
    fetch("https://open.er-api.com/v6/latest/USD", { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error("Exchange API unavailable");
        return response.json() as Promise<{ rates?: { ARS?: number } }>;
      })
      .then((data) => {
        const rate = Number(data?.rates?.ARS);
        if (Number.isFinite(rate)) setArsRate(rate);
      })
      .catch(() => setArsRate(null));

    return () => controller.abort();
  }, []);

  useEffect(() => {
    const focusSearch = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener("keydown", focusSearch);
    return () => window.removeEventListener("keydown", focusSearch);
  }, []);

  const filteredApplications = useMemo(
    () => filterApplications(applications, query, statusFilter),
    [applications, query, statusFilter],
  );
  const summary = useMemo(() => calculateSummary(applications), [applications]);
  const focusApplication =
    applications.find((application) => application.status === "next") ?? applications[0];

  function updateStatus(id: string, status: ApplicationStatus) {
    setApplications((current) =>
      current.map((application) =>
        application.id === id ? { ...application, status } : application,
      ),
    );
    toast.success(locale === "es" ? "Etapa actualizada" : "Stage updated");
  }

  function addApplication(data: z.infer<typeof formSchema>) {
    const initials = data.company
      .split(/\s+/)
      .slice(0, 2)
      .map((word) => word[0]?.toUpperCase())
      .join("");
    const id = globalThis.crypto?.randomUUID?.() ?? `application-${Date.now()}`;
    const application: TrackedApplication = {
      id,
      company: data.company,
      role: data.role,
      location: data.location,
      match: data.match,
      date: { en: "Added today", es: "Agregado hoy" },
      accent: initials || "JR",
      skills: data.skills
        .split(",")
        .map((skill) => skill.trim())
        .filter(Boolean)
        .slice(0, 4),
      status: data.status,
      url: data.url || undefined,
    };
    setApplications((current) => [application, ...current]);
    return application;
  }

  function submitApplication(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = formSchema.safeParse(form);
    if (!result.success) {
      setFormError(t.form.error);
      return;
    }

    addApplication(result.data);
    setForm(emptyForm);
    setFormError("");
    setDialogOpen(false);
    toast.success(t.form.success);
  }

  function clearFilters() {
    setQuery("");
    setStatusFilter("all");
    searchRef.current?.focus();
  }

  return (
    <TooltipProvider>
      <main className="min-h-screen bg-background text-foreground">
        <header className="sticky top-0 z-20 border-b border-border bg-background/85 backdrop-blur-xl">
          <div className="mx-auto flex min-h-[72px] max-w-[1500px] flex-wrap items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
            <div className="flex min-w-fit items-center gap-3">
              <span className="grid size-10 place-items-center rounded-xl bg-primary text-primary-foreground shadow-[0_0_30px_rgb(190_242_100/18%)]">
                <Target className="size-5" strokeWidth={2.4} />
              </span>
              <div>
                <p className="text-[17px] font-bold tracking-[-0.02em]">Postula</p>
                <p className="text-xs text-muted-foreground">{t.workspace}</p>
              </div>
            </div>

            <div className="relative order-3 w-full md:order-none md:ml-auto md:max-w-md">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                ref={searchRef}
                aria-label={t.search}
                placeholder={t.search}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="h-10 border-border bg-secondary/45 pl-10 pr-14 text-[15px] shadow-none"
              />
              <span className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 items-center gap-1 rounded border border-border px-1.5 py-0.5 text-[11px] text-muted-foreground sm:flex">
                <Command className="size-3" /> K
              </span>
            </div>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="ml-auto border-border bg-secondary/45 md:ml-0"
                  onClick={() => setLocale((current) => (current === "en" ? "es" : "en"))}
                >
                  <Languages className="size-4" />
                  <span className="sr-only">{t.language}</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>{t.language}</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="border-border bg-secondary/45"
                  onClick={() => setTheme((current) => (current === "dark" ? "light" : "dark"))}
                >
                  {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
                  <span className="sr-only">{t.theme}</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>{t.theme}</TooltipContent>
            </Tooltip>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="h-10 rounded-xl px-4 font-semibold">
                  <Plus className="size-4" />
                  <span className="hidden sm:inline">{t.newApplication}</span>
                  <span className="sm:hidden">{t.shortNewApplication}</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-h-[92vh] overflow-y-auto border-border bg-popover sm:max-w-xl">
                <DialogHeader>
                  <DialogTitle>{t.form.title}</DialogTitle>
                  <DialogDescription>{t.form.description}</DialogDescription>
                </DialogHeader>
                <form onSubmit={submitApplication} className="grid gap-5">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label={t.form.company} htmlFor="company">
                      <Input
                        id="company"
                        value={form.company}
                        onChange={(event) => setForm({ ...form, company: event.target.value })}
                        placeholder={t.form.companyPlaceholder}
                        autoComplete="organization"
                      />
                    </Field>
                    <Field label={t.form.role} htmlFor="role">
                      <Input
                        id="role"
                        value={form.role}
                        onChange={(event) => setForm({ ...form, role: event.target.value })}
                        placeholder={t.form.rolePlaceholder}
                      />
                    </Field>
                  </div>
                  <Field label={t.form.location} htmlFor="location">
                    <Input
                      id="location"
                      value={form.location}
                      onChange={(event) => setForm({ ...form, location: event.target.value })}
                      placeholder={t.form.locationPlaceholder}
                    />
                  </Field>
                  <Field label={t.form.skills} htmlFor="skills">
                    <Input
                      id="skills"
                      value={form.skills}
                      onChange={(event) => setForm({ ...form, skills: event.target.value })}
                      placeholder={t.form.skillsPlaceholder}
                    />
                  </Field>
                  <Field label={t.form.link} htmlFor="link">
                    <Input
                      id="link"
                      value={form.url}
                      onChange={(event) => setForm({ ...form, url: event.target.value })}
                      placeholder={t.form.linkPlaceholder}
                      inputMode="url"
                    />
                  </Field>
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div className="grid gap-2">
                      <Label>{t.form.status}</Label>
                      <Select
                        value={form.status}
                        onValueChange={(value) =>
                          setForm({ ...form, status: value as ApplicationStatus })
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {statusOrder.map((status) => (
                            <SelectItem key={status} value={status}>
                              {t.status[status]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-3">
                      <div className="flex items-center justify-between">
                        <Label>{t.form.match}</Label>
                        <span className="text-sm font-semibold text-primary">{form.match}%</span>
                      </div>
                      <Slider
                        aria-label={t.form.match}
                        min={1}
                        max={100}
                        step={1}
                        value={[Number(form.match)]}
                        onValueChange={(value) =>
                          setForm({ ...form, match: String(value[0] ?? 80) })
                        }
                      />
                    </div>
                  </div>
                  {formError && (
                    <p role="alert" className="text-sm text-destructive">
                      {formError}
                    </p>
                  )}
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                      {t.form.cancel}
                    </Button>
                    <Button type="submit">{t.form.save}</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </header>

        <div className="mx-auto max-w-[1500px] px-4 pb-12 pt-8 sm:px-6 lg:px-8">
          <section className="mb-8">
            <div className="mb-2 flex items-center gap-2 text-sm font-medium text-primary">
              <CircleDot className="size-4" /> {t.activeSearch}
            </div>
            <h1 className="max-w-3xl text-3xl font-bold tracking-[-0.04em] sm:text-4xl">
              {t.title}
            </h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground">{t.intro}</p>
          </section>

          <section
            aria-label={t.overview}
            className="mb-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
          >
            <Metric
              label={t.metrics.active}
              value={String(summary.active)}
              note={t.metrics.activeNote}
              icon={<BriefcaseBusiness />}
            />
            <Metric
              label={t.metrics.match}
              value={`${summary.averageMatch}%`}
              note={t.metrics.matchNote}
              icon={<Target />}
            />
            <Metric
              label={t.metrics.interviews}
              value={String(summary.interviews)}
              note={t.metrics.interviewsNote}
              icon={<CalendarDays />}
            />
            <Metric
              label={t.metrics.currency}
              value={
                arsRate
                  ? `$${new Intl.NumberFormat(locale === "es" ? "es-AR" : "en-US", {
                      maximumFractionDigits: 0,
                    }).format(arsRate)}`
                  : "—"
              }
              note={arsRate ? t.metrics.currencyNote : t.metrics.currencyLoading}
              icon={arsRate ? <WalletCards /> : <LoaderCircle className="animate-spin" />}
            />
          </section>

          <section>
            <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold tracking-tight">{t.pipeline}</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {t.attention(filteredApplications.length)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Select
                  value={statusFilter}
                  onValueChange={(value) =>
                    setStatusFilter(value as ApplicationStatus | "all")
                  }
                >
                  <SelectTrigger aria-label={t.filter} className="w-[165px] bg-secondary/40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t.all}</SelectItem>
                    {statusOrder.map((status) => (
                      <SelectItem key={status} value={status}>
                        {t.status[status]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Badge variant="outline" className="hidden h-9 border-border px-3 text-muted-foreground sm:inline-flex">
                  <Check className="size-3.5" /> {t.updated}
                </Badge>
              </div>
            </div>

            <div className="grid items-start gap-4 lg:grid-cols-3">
              {statusOrder.map((status) => {
                const items = filteredApplications.filter(
                  (application) => application.status === status,
                );
                return (
                  <section
                    key={status}
                    className="rounded-[22px] border border-border bg-secondary/20 p-3"
                  >
                    <header className="flex items-center justify-between px-2 py-2.5">
                      <div className="flex items-center gap-2.5">
                        <span className={`size-2 rounded-full ${statusTone[status]}`} />
                        <h3 className="text-sm font-semibold">{t.status[status]}</h3>
                      </div>
                      <span className="grid size-6 place-items-center rounded-full bg-secondary text-xs text-muted-foreground">
                        {items.length}
                      </span>
                    </header>
                    <div className="space-y-3 pt-1">
                      {items.map((item) => (
                        <ApplicationCard
                          key={item.id}
                          item={item}
                          locale={locale}
                          t={t}
                          onStatusChange={updateStatus}
                        />
                      ))}
                      {items.length === 0 && (
                        <Empty className="min-h-48 border border-dashed border-border bg-card/35 p-5">
                          <EmptyHeader>
                            <EmptyMedia variant="icon">
                              <Search />
                            </EmptyMedia>
                            <EmptyTitle className="text-base">{t.noResults}</EmptyTitle>
                            <EmptyDescription>{t.noResultsDescription}</EmptyDescription>
                          </EmptyHeader>
                        </Empty>
                      )}
                      <Button
                        variant="ghost"
                        className="h-11 w-full rounded-2xl border border-dashed border-border text-muted-foreground"
                        onClick={() => {
                          setForm({ ...emptyForm, status });
                          setDialogOpen(true);
                        }}
                      >
                        <Plus className="size-4" /> {t.addTo} {t.status[status].toLocaleLowerCase()}
                      </Button>
                    </div>
                  </section>
                );
              })}
            </div>
          </section>

          {focusApplication && (
            <aside className="mt-5 flex flex-col gap-4 rounded-[22px] border border-primary/20 bg-primary/[0.07] p-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground">
                  <Sparkles className="size-5" />
                </span>
                <div>
                  <p className="font-semibold">{t.focus}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {t.focusText(focusApplication.company)}
                  </p>
                </div>
              </div>
              <Button variant="outline" className="border-primary/25 bg-transparent" onClick={clearFilters}>
                {t.review}
              </Button>
            </aside>
          )}
        </div>
        <Toaster position="bottom-right" richColors />
      </main>
    </TooltipProvider>
  );
}

function ApplicationCard({
  item,
  locale,
  t,
  onStatusChange,
}: {
  item: TrackedApplication;
  locale: Locale;
  t: (typeof translations)[Locale];
  onStatusChange: (id: string, status: ApplicationStatus) => void;
}) {
  return (
    <article className="group rounded-[18px] border border-border bg-card p-4 shadow-[0_16px_50px_rgb(0_0_0/12%)] transition hover:-translate-y-0.5 hover:border-primary/30">
      <div className="flex items-start gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-secondary text-xs font-bold text-secondary-foreground ring-1 ring-inset ring-border">
          {item.accent}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-muted-foreground">{item.company}</p>
          <h4 className="mt-0.5 text-[15px] font-semibold leading-5 text-foreground">{item.role}</h4>
        </div>
        {item.url && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button asChild variant="ghost" size="icon-xs">
                <a href={item.url} target="_blank" rel="noreferrer">
                  <ExternalLink />
                  <span className="sr-only">{t.openRole}</span>
                </a>
              </Button>
            </TooltipTrigger>
            <TooltipContent>{t.openRole}</TooltipContent>
          </Tooltip>
        )}
      </div>
      <p className="mt-3 text-xs text-muted-foreground">{item.location}</p>
      <div className="mt-4 flex flex-wrap gap-1.5">
        {item.skills.map((skill) => (
          <Badge key={skill} variant="secondary" className="font-normal">
            {skill}
          </Badge>
        ))}
      </div>
      <div className="mt-4">
        <div className="mb-2 flex items-center justify-between text-xs">
          <span className="text-muted-foreground">{t.profileMatch}</span>
          <span className="font-semibold text-primary">{item.match}%</span>
        </div>
        <Progress
          value={item.match}
          className="h-1.5 bg-secondary [&_[data-slot=progress-indicator]]:bg-primary"
        />
      </div>
      <div className="mt-4 flex items-center justify-between gap-2 border-t border-border pt-3">
        <span className="flex items-center gap-2 text-xs text-muted-foreground">
          <CalendarDays className="size-3.5" />
          {item.date[locale]}
        </span>
        <Select
          value={item.status}
          onValueChange={(value) => onStatusChange(item.id, value as ApplicationStatus)}
        >
          <SelectTrigger size="sm" aria-label={t.form.status} className="h-7 max-w-[125px] border-0 bg-secondary px-2 text-xs shadow-none">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {statusOrder.map((status) => (
              <SelectItem key={status} value={status}>
                {t.status[status]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </article>
  );
}

function Metric({
  label,
  value,
  note,
  icon,
}: {
  label: string;
  value: string;
  note: string;
  icon: ReactNode;
}) {
  return (
    <article className="relative overflow-hidden rounded-[20px] border border-border bg-card p-5">
      <div className="absolute -right-8 -top-8 size-24 rounded-full bg-primary/[0.05] blur-xl" />
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-2 text-3xl font-bold tracking-[-0.04em]">{value}</p>
          <p className="mt-2 text-xs text-muted-foreground">{note}</p>
        </div>
        <span className="grid size-9 place-items-center rounded-xl bg-secondary text-primary [&_svg]:size-4">
          {icon}
        </span>
      </div>
    </article>
  );
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: ReactNode;
}) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
    </div>
  );
}
