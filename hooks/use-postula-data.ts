"use client";

import { useEffect, useState } from "react";

import type { TrackedApplication } from "@/lib/application-utils";
import {
  initialApplications,
  STORAGE_KEYS,
  storedApplicationsSchema,
  type Locale,
  type Theme,
} from "@/lib/postula-config";

export function usePostulaData() {
  const [applications, setApplications] = useState<TrackedApplication[]>(initialApplications);
  const [locale, setLocale] = useState<Locale>("en");
  const [theme, setTheme] = useState<Theme>("dark");
  const [hydrated, setHydrated] = useState(false);
  const [arsRate, setArsRate] = useState<number | null>(null);

  useEffect(() => {
    const hydrationTimer = window.setTimeout(() => {
      try {
        const savedApplications = window.localStorage.getItem(STORAGE_KEYS.applications);
        const savedTheme = window.localStorage.getItem(STORAGE_KEYS.theme);
        const savedLocale = window.localStorage.getItem(STORAGE_KEYS.locale);

        if (savedApplications) {
          const result = storedApplicationsSchema.safeParse(JSON.parse(savedApplications));
          setApplications(result.success ? result.data : initialApplications);
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
    document.documentElement.dataset.theme = theme;
    document.documentElement.lang = locale;
    if (hydrated) {
      window.localStorage.setItem(STORAGE_KEYS.theme, theme);
      window.localStorage.setItem(STORAGE_KEYS.locale, locale);
    }
  }, [theme, locale, hydrated]);

  useEffect(() => {
    if (hydrated) {
      window.localStorage.setItem(STORAGE_KEYS.applications, JSON.stringify(applications));
    }
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

  return {
    applications,
    setApplications,
    locale,
    setLocale,
    theme,
    setTheme,
    arsRate,
  };
}
