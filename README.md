# TriStone website and private editor

The existing design, services, careers and separate customer/candidate forms are retained. The Sites Cloudflare Worker renders pages and stores CMS content in D1, with owner photos in R2. A new Hostinger Node gateway proxies the private Worker and authenticates the owner using a scrypt password hash plus an authenticator code. The backend stores hashed, expiring sessions in D1.

No deployment, Google authorisation or DNS change was performed during the security work. See SECURITY-MANUAL-SETUP.md before configuring any provider. The old frozen export is not the hardened production source.

Use Node 24, npm ci, npm run build and npm test. npm start runs the Hostinger gateway; it requires private runtime settings and a valid Sites server-access credential. Do not directly expose the Worker's native Sites authentication adapter on Node.

Customer and candidate attachments are PDF-only initially. The Worker parses and canonicalises restricted passive PDFs; Apps Script accepts only authenticated submission envelopes and writes to separate, app-managed private destinations. There are no public Drive content, photo, browse, download, edit or delete endpoints. Jobs and projects remain editable through the D1 CMS.

Protections include exact HTTPS origins, server-side CAPTCHA, persistent atomic rate/storage counters, signed requests, nonce replay checks, idempotent IDs and secret scanning. Upload validation is not antivirus scanning. The drive.file scope limits Google access to app-authorised files; provider permissions remain broader than the submission-only operations exposed by this code.

Run node scripts/check-secrets.mjs --history before pushing. Local hooks are in .githooks; configure core.hooksPath in every clone and enable repository secret scanning/push protection. The setup generator writes only to ignored .private/admin-setup.json; do not commit or distribute it.

Tests use real in-memory SQLite and simulated Google/Turnstile/R2 services. Passing tests does not establish that Google is authorised, Hostinger is deployed or the domain is connected. Real provider integration remains a separate acceptance step.
