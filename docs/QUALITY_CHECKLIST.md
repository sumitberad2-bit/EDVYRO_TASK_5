# Production Readiness Checklist

## User journey and responsive experience
- [x] Discover, search and filter internship roles.
- [x] Apply from a role card without leaving the page.
- [x] Show loading, empty, validation, success and failure states.
- [x] Responsive layouts for desktop, tablet and mobile.
- [x] Keyboard-accessible dialog, visible focus, skip link and semantic landmarks.
- [x] Respect `prefers-reduced-motion` and use descriptive labels.

## Operations and security
- [x] JSON request logging with timestamp, method, path, status and duration.
- [x] Database-backed `/api/health` endpoint.
- [x] Helmet security headers and API rate limiting.
- [x] Request body size limit and server-side validation.
- [x] Parameterized SQL statements and centralized error responses.
- [x] Environment configuration and ignored local database file.

## Verification to perform before submission
- [ ] `npm run check` passes locally.
- [ ] Test manually at 375px, 768px and desktop widths.
- [ ] Keyboard-only navigation and screen-reader labels reviewed.
- [ ] Lighthouse Performance, Accessibility, Best Practices and SEO audit run; record actual scores below.
- [ ] `npm audit` reviewed and any actionable vulnerabilities resolved.
- [ ] Walkthrough recorded (optional).

## Audit evidence
Record actual results here after running the checks. Do not claim a score until the audit has been run.

- Lighthouse Performance: pending
- Lighthouse Accessibility: pending
- Lighthouse Best Practices: pending
- Lighthouse SEO: pending
- `npm audit`: pending
