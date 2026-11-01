# LaunchBoard — Production-Ready Internship Portal

**EdVyro · Full Stack Development · Task 4: Production-Ready Capstone**

LaunchBoard turns the earlier internship listing and secure application flow into a polished, responsive portal. It includes a searchable opportunity board, accessible application dialog, server-side validation, persistent SQLite storage, structured request logs, health checks, security middleware and automated regression tests.

## Highlights

- **Complete user journey:** browse, search, filter, open an application form, validate and submit.
- **Responsive UI:** desktop, tablet and mobile layouts with loading, empty, error and success states.
- **Accessibility:** semantic landmarks, skip link, keyboard-operable controls, form labels, accessible dialog, live status messages and reduced-motion support.
- **Backend reliability:** Express API, SQLite persistence, health endpoint, structured JSON logs and graceful shutdown.
- **Security:** Helmet headers, API rate limiting, bounded JSON payloads, server-side validation and parameterized SQL.
- **Quality checks:** Vitest + Supertest regression suite and GitHub Actions CI workflow.

## Tech stack

HTML5 · CSS3 · Vanilla JavaScript · Node.js 22 · Express 5 · SQLite (`better-sqlite3`) · Helmet · express-rate-limit · Vitest · Supertest · GitHub Actions

## Prerequisites

- Node.js **22 LTS** (recommended) and npm
- Windows, macOS or Linux

`better-sqlite3` is a native Node addon. Node 22 has broad prebuilt-binary support. On Windows, if npm cannot find a prebuilt binary, install Visual Studio Build Tools with the **Desktop development with C++** workload and retry.

## Setup

```bash
npm install
```

Copy the environment template:

**PowerShell**
```powershell
Copy-Item .env.example .env
```

**macOS / Linux**
```bash
cp .env.example .env
```

The default configuration runs on port `3000` and creates `data/applications.db` automatically. The database is intentionally excluded from Git.

## Run

```bash
npm run dev
```

Open `http://localhost:3000`.

For production-style start:

```bash
npm start
```

## API reference

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/health` | API and database health |
| GET | `/api/internships` | List internship opportunities |
| GET | `/api/internships?search=frontend` | Search title, company, location or skills |
| GET | `/api/internships?category=Engineering&mode=Remote` | Filter opportunities |
| POST | `/api/applications` | Validate and store an application |

Example application body:

```json
{
  "fullName": "Test Applicant",
  "email": "student@example.com",
  "phone": "+91 98765 43210",
  "skills": "HTML, CSS, JavaScript",
  "coverNote": "I am excited to learn and contribute.",
  "internshipId": 1
}
```

A valid application returns HTTP `201` and an application reference. Invalid input returns HTTP `400` with field-level errors.

## Tests and quality checks

```bash
npm test
npm run check
npm audit
```

The regression suite covers health, database connectivity, internship listing, search and filters, invalid input, successful application persistence, unknown API routes and security headers. GitHub Actions runs the checks on pushes and pull requests to `main`.

Before submission, also run a manual responsive and keyboard review and a Lighthouse audit. Add the actual scores and audit evidence to `docs/QUALITY_CHECKLIST.md`; scores are deliberately not fabricated.

## Project structure

```text
EdVyro_Task4_Production_Ready_Capstone/
├── .github/workflows/ci.yml
├── data/                       # SQLite database created at runtime
├── docs/QUALITY_CHECKLIST.md
├── public/
│   ├── index.html
│   ├── style.css
│   └── app.js
├── src/
│   ├── app.js
│   ├── database.js
│   ├── logger.js
│   └── server.js
├── tests/application.test.js
├── .env.example
├── .gitignore
└── package.json
```

## Engineering decisions

1. Keep the browser layer framework-free to reduce setup and runtime complexity for this capstone.
2. Use SQLite for durable local application records and parameterized statements for database safety.
3. Keep request logging structured and avoid logging applicant names, emails, phone numbers or application content.
4. Separate application creation from static assets and expose a database-aware health endpoint.
5. Keep audit scores as pending until measured; reproducible evidence is more valuable than invented metrics.

## Submission evidence

Use this repository as the single proof link. Include screenshots of the responsive portal, a successful application confirmation, passing test output, and completed Lighthouse/audit results before final submission. Optional: add a two-minute walkthrough link here.

---

Built as an educational full-stack capstone for EdVyro Task 4.
