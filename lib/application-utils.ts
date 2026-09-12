export type ApplicationStatus = "applied" | "interview" | "next";

export type TrackedApplication = {
  id: string;
  company: string;
  role: string;
  location: string;
  match: number;
  date: { en: string; es: string };
  accent: string;
  skills: string[];
  status: ApplicationStatus;
  url?: string;
};

export function calculateSummary(applications: TrackedApplication[]) {
  const averageMatch = applications.length
    ? Math.round(
        applications.reduce((total, application) => total + application.match, 0) /
          applications.length,
      )
    : 0;

  return {
    active: applications.length,
    averageMatch,
    interviews: applications.filter((application) => application.status === "interview").length,
    highFit: applications.filter((application) => application.match >= 85).length,
  };
}

export function filterApplications(
  applications: TrackedApplication[],
  query: string,
  status: ApplicationStatus | "all",
) {
  const normalizedQuery = query.trim().toLocaleLowerCase();

  return applications.filter((application) => {
    const matchesStatus = status === "all" || application.status === status;
    const searchable = [
      application.company,
      application.role,
      application.location,
      ...application.skills,
    ]
      .join(" ")
      .toLocaleLowerCase();

    return matchesStatus && (!normalizedQuery || searchable.includes(normalizedQuery));
  });
}
