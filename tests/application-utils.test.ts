import assert from "node:assert/strict";
import test from "node:test";

import {
  calculateSummary,
  filterApplications,
  type TrackedApplication,
} from "../lib/application-utils.ts";

const applications: TrackedApplication[] = [
  {
    id: "1",
    company: "Northstar",
    role: "Technical Support Specialist",
    location: "Remote",
    match: 90,
    date: { en: "Today", es: "Hoy" },
    accent: "NS",
    skills: ["WordPress"],
    status: "applied",
  },
  {
    id: "2",
    company: "Orbital Labs",
    role: "Web QA Analyst",
    location: "Argentina",
    match: 80,
    date: { en: "Friday", es: "Viernes" },
    accent: "OL",
    skills: ["Manual QA"],
    status: "interview",
  },
];

test("calculateSummary derives dashboard metrics", () => {
  assert.deepEqual(calculateSummary(applications), {
    active: 2,
    averageMatch: 85,
    interviews: 1,
    highFit: 1,
  });
});

test("filterApplications searches skills and status together", () => {
  assert.equal(filterApplications(applications, "manual", "interview").length, 1);
  assert.equal(filterApplications(applications, "manual", "applied").length, 0);
});

test("filterApplications returns all records for empty filters", () => {
  assert.equal(filterApplications(applications, "", "all").length, 2);
});
