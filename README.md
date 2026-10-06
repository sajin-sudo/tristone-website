# TriStone website

Five primary pages (Home, Services, About, Careers, Contact), separate service request/privacy pages and the preserved portfolio route. Authored CSS/JS lives in `web/`. Default content is `content/site.json`; production content is edited through `/admin.html`, persisted in D1 and rendered server-side for SEO. Company facts are grounded in the licence. Stock photos illustrate services and are not presented as completed work or TriStone employees. Credits and licence sources are in `content/photo-credits.md`.

Run `npm run build` then `npm test`. `node scripts/preview.mjs --owner` serves the actual Worker with local SQLite/R2 substitutes and a clearly local-only simulated owner identity. The deployable Worker is `dist/server/index.js`; it serves assets, rendered pages and same-origin API routes. No filesystem, Node APIs, external dependency or visitor Google login is required at runtime. Schema changes use `db/schema.ts` and generated Drizzle migrations.

## No-code editing

Open `/admin.html` while signed in with the ChatGPT account that owns this Site. Sites dispatch owns sign-in and forwards authenticated identity; the backend checks an explicit owner email allowlist (`CMS_ADMIN_EMAIL`, stored only in runtime settings) for the dashboard HTML, dashboard script and every CMS API call. The service-access credential alone supplies no identity and cannot edit. There is no password or Google secret embedded in browser code. Mutations also require same-origin requests.

The editor controls page text/photos and SEO, services, vacancies, projects, testimonials, certifications, forms and extra fields, banners, announcements, journey buttons, WhatsApp, social links, footer, privacy and terms. See ADMIN-GUIDE.md. Save publishes changes immediately. Revision checks prevent overwriting newer edits. Images are checked JPG/PNG files, limited to 5 MB and stored in R2. Site text is escaped before HTML rendering. Jobs and projects are now maintained directly in the owner dashboard, with Draft, Published and Closed statuses.

The source `.openai/hosting.json` preserves the existing Site ID. Deployment remains owner-private. DNS connection/public launch are separate pending steps.

## Storage connection

Use `google-drive-setup/START-HERE.md` and `WebsiteBackend.gs`. These supersede the old email/Form and standalone vacancy feed setup. The backend uses server environment secrets and HMAC-signed Apps Script requests. It requires Turnstile keys before accepting submissions. It rejects unsupported formats, enforces request/file limits, validates origin and CAPTCHA hostname/action, and sanitises formula-leading spreadsheet values.

Apps Script stores customer rows and candidate rows in separate private spreadsheets with separate upload folders. A locked durable request-ID lookup prevents duplicate rows on unchanged retries. A response reference is returned only after writing the record and flushing the spreadsheet. File checks are format checks, not malware scanning. No CVs, personal submissions or Drive record URLs are returned to visitors.

Only Published dashboard portfolio and vacancy entries are returned by the public content endpoint. Images are owner-uploaded R2 media or approved HTTPS URLs. Draft/Closed entries are hidden, and expired vacancies are excluded.

## Validation evidence and limits

Thirteen backend/CMS tests exercise input/file checks, disconnected failure, origin/spam rejection, signed storage requests, separate references, owner authorization, actual SQLite persistence, revision conflicts, HTML escaping and image storage. A VM harness runs the authored Apps Script storage function against fake Sheets/Drive. Browser checks cover responsive pages at 390, 768 and 1440 pixels, mobile navigation and both form flows with explicitly mocked storage/security responses. The admin browser check performs real local saves and image uploads, reloads to verify persistence, adds a service and checks mobile layout, then restores the company content.

These checks do not prove the Google deployment is authorised or live. Final acceptance requires Google-authorised setup, deployment URL, secret environment configuration, real Turnstile and verification of actual rows/uploads. Do not claim live intake until that succeeds. Apps Script/Drive quotas should be reviewed against expected traffic.

SEO includes editable page-specific title/description, canonical/Open Graph, semantic landmarks, sitemap and robots.txt. Admin routes are noindex and excluded from the sitemap. Canonicals currently use the verified hosted origin. Set `PUBLIC_ORIGIN` and update sitemap/robots after `tristone.ae` is verified and serving the site. Private access prevents normal public indexing until launch.
