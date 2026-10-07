# TriStone security fix report — 6 October 2026

Status: implemented and tested locally. Nothing has been deployed, pushed to GitHub, authorised in Google, connected to tristone.ae or changed in DNS. Existing live code has not received these fixes.

| Requirement | Local result | Implementation and evidence |
| --- | --- | --- |
| 1. Secure Hostinger owner authentication | PASS | hostinger/server.mjs uses scrypt password verification plus TOTP, refuses reused codes, issues a Secure/HttpOnly/SameSite=Strict cookie, and revokes hashed 15-minute D1 sessions on logout. Forged owner headers fail. Native Sites identity handling remains confined to the trusted Sites adapter. |
| 2. Strong upload validation | PASS | server/uploads.mjs parses, restricts and canonicalises passive PDFs; CVs and all submission attachments are PDF-only initially. CV: one required PDF; inquiry: up to three optional PDFs; 5 MiB each, 10 MiB total. Active content, attachments, encrypted PDFs and unsupported structures are rejected. CMS JPEG/PNG photos are fully decoded and re-encoded, capped at 4 megapixels. Invalid/header-only/CRC-invalid files fail tests. |
| 3. Server-side abuse and storage limits | PASS | server/security.mjs uses atomic persistent D1 counters, not process memory. Login/submission/gateway limits are separate. Google quotas are enforced again under an Apps Script lock. Daily limits are 200 submissions and 50 MiB, with 500 MiB lifetime uploaded-byte accounting; Google also caps records at 2,000. Quota exhaustion blocks creation. Server-side Turnstile checks success, hostname and action. |
| 4. Remove unnecessary Drive read/content/photo features | PASS | WebsiteBackend.gs accepts only submit operations. Legacy Google feed scripts and the Drive photo endpoint were removed. CMS/public photos use D1/R2. Public requests cannot select Drive file IDs or browse/download Google content. |
| 5. Reduce Google account exposure | PASS in code; manual authorisation pending | appsscript.json uses drive.file rather than full Drive scope. Setup creates new app-managed private folders and sheets. Request-controlled destination IDs are rejected; stored destinations are checked for purpose, parent and public permissions. Account ownership and actual sharing settings require manual verification. |
| 6. Exact approved HTTPS origins | PASS | Production origin is exactly https://tristone.ae. HTTP, null, arbitrary and similar origins are rejected for protected requests. A separate exact HTTPS TEST_ORIGIN requires DEPLOYMENT_STAGE=test. CORS uses the approved origin, not a wildcard; it is not relied upon as authentication. |
| 7. Replay protection and no destructive Drive operations | PASS | HMAC binds body, method/path and freshness. D1 rejects gateway nonce reuse; Apps Script rejects stale/unsigned/wrong-audience/replayed submissions. A fresh nonce with an unchanged request ID returns the previous reference; changed retries fail. Ambiguous failures require owner reconciliation. No Google trash/delete or overwrite-existing-file route remains. Setup changes only newly created app-owned sheets. |
| 8. Keep secrets off browser/GitHub | PASS for inspected local source; remote GitHub pending | Runtime-only secrets, ignored private setup files, pre-commit/pre-push scans and CI history checks were added. No production secrets were generated or embedded in public assets. Actual remote GitHub repository/history and its push-protection settings have not been verified. |

## Verification

- 26 of 26 backend, CMS, security and regression tests passed, with no skipped tests.
- Offline Edge browser journey passed: password/authenticator login, CMS save/readback, R2 photo upload, customer inquiry, separate PDF candidate application, and logout/revocation.
- Browser testing ran the real local gateway/Worker and real in-memory SQLite; Google, CAPTCHA and object storage were simulated. No live Google records were created.
- npm audit reported zero known vulnerabilities across production and development dependencies.
- Local source/history secret-pattern checks are a detection measure, not a guarantee against unknown secret formats. Remote history requires a separate check.

## Limits and remaining manual work

Use SECURITY-MANUAL-SETUP.md. Google needs the replacement script and restrictive manifest, Advanced APIs, private Script Properties, owner-reviewed permissions and later authorised setup/deployment. Cloudflare/Sites needs the new D1 migration, server-only gateway/Google secrets, working service-access credential and Turnstile configuration. Hostinger needs Node 24, the gateway start command, private environment variables, owner password hash/TOTP and an approved HTTPS test origin. GitHub needs actual repository/history scanning and secret push protection.

The drive.file provider scope can manage app-authorised files, including provider-level delete permission; this implementation exposes no delete operation. It is not an OAuth permission that mathematically forbids deletion. Existing/unrelated Drive files are not chosen or exposed by this backend. A publicly reachable Apps Script exec endpoint can still consume provider execution quota on invalid requests; unsigned requests are rejected before Drive access. PDF validation is not antivirus scanning. Staff should scan candidate files and use patched PDF viewers.

No passing local result is a claim of production readiness or live Google integration. Provider integration and actual Drive rows/uploads must be tested before a separately authorised launch. Retain the previous frozen source as a baseline, but do not upload it expecting these fixes.
