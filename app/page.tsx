"use client";

import {
  BriefcaseBusiness,
  CalendarDays,
  CircleDot,
  Command,
  Languages,
  LoaderCircle,
  Moon,
  Search,
  Sparkles,
  Sun,
  Target,
  WalletCards,
} from "lucide-react";
import { type FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

import { ApplicationFormDialog } from "@/components/postula/application-form-dialog";
import { ApplicationPipeline } from "@/components/postula/application-pipeline";
import { Metric } from "@/components/postula/metric";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Toaster } from "@/components/ui/sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { usePostulaData } from "@/hooks/use-postula-data";
import {
  calculateSummary,
  filterApplications,
  type ApplicationStatus,
  type TrackedApplication,
} from "@/lib/application-utils";
import {
  applicationFormSchema,
  emptyApplicationForm,
  statusOrder,
  translations,
} from "@/lib/postula-config";

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

export default function Home() {
  const {
    applications,
    setApplications,
    locale,
    setLocale,
    theme,
    setTheme,
    arsRate,
  } = usePostulaData();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | "all">("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState(emptyApplicationForm);
  const [formError, setFormError] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);
  const t = translations[locale];

  const addApplication = useCallback(
    (data: z.infer<typeof applicationFormSchema>) => {
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
    },
    [setApplications],
  );

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
            const result = applicationFormSchema.safeParse({ url: "", ...(input as object) });
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
  }, [addApplication, applications]);

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

  function submitApplication(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = applicationFormSchema.safeParse(form);
    if (!result.success) {
      setFormError(t.form.error);
      return;
    }

    addApplication(result.data);
    setForm(emptyApplicationForm);
    setFormError("");
    setDialogOpen(false);
    toast.success(t.form.success);
  }

  function clearFilters() {
    setQuery("");
    setStatusFilter("all");
    searchRef.current?.focus();
  }

  function openFormAtStatus(status: ApplicationStatus) {
    setForm({ ...emptyApplicationForm, status });
    setFormError("");
    setDialogOpen(true);
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
                  {theme === "dark" ? (
                    <Sun className="size-4" />
                  ) : (
                    <Moon className="size-4" />
                  )}
                  <span className="sr-only">{t.theme}</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>{t.theme}</TooltipContent>
            </Tooltip>

            <ApplicationFormDialog
              open={dialogOpen}
              onOpenChange={setDialogOpen}
              form={form}
              setForm={setForm}
              error={formError}
              onSubmit={submitApplication}
              t={t}
            />
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
            <p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground">
              {t.intro}
            </p>
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

          <ApplicationPipeline
            applications={filteredApplications}
            locale={locale}
            statusFilter={statusFilter}
            onFilterChange={setStatusFilter}
            onStatusChange={updateStatus}
            onAddToStatus={openFormAtStatus}
            t={t}
          />

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
              <Button
                variant="outline"
                className="border-primary/25 bg-transparent"
                onClick={clearFilters}
              >
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
