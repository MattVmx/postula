# Postula

Postula is a bilingual job-application tracker designed to make an active search easier to understand at a glance. Applications are grouped by stage, searchable by role, company, or skill, and paired with a simple profile-match score.

The project began with a practical question: when several applications are moving at once, what deserves attention next? The result is a focused dashboard that keeps the important details visible without turning the search into another complicated system to maintain.

## What it includes

- An application pipeline with editable stages
- Search and status filters
- A validated form for adding new opportunities
- Local persistence in the browser
- English and Spanish interfaces
- Light and dark themes
- A live USD-to-ARS reference from a public API
- Responsive layouts for desktop and mobile
- WebMCP tools for reading and adding applications
- Unit tests for filtering and dashboard calculations

## Built with

React, TypeScript, Vinext, Tailwind CSS, shadcn/ui, Zod, Lucide, and the ExchangeRate API.

## Run locally

This project requires Node.js 22.13 or newer.

```bash
pnpm install
pnpm dev
```

Then open `http://localhost:5173`.

## Quality checks

```bash
pnpm lint
pnpm test
pnpm build
```

Application data is stored only in the current browser, so no account or database is required.
