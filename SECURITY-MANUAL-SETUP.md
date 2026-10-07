# TriStone security implementation — local configuration steps

No Google authorisation, deployment, GitHub push, DNS change or domain connection has been performed. The live website still runs its previous version. Use this hardened source for a reviewed private test, not the old frozen/visual ZIP.

The design and D1/R2 CMS are retained. Hostinger now has a Node gateway (npm start) that keeps the existing backend private and proxies pages/API calls. It authenticates the owner with password + authenticator code. The backend stores hashed 15-minute sessions in D1. Secrets remain on the two servers. Raw visitor identity headers are never used by the Hostinger gateway.

## Google — manual steps, only when you are ready to authorise

1. Use only google-drive-setup/WebsiteBackend.gs and appsscript.json in the Apps Script project. Replace the earlier pasted code. Remove legacy Setup.gs/CareersFeed.gs if they are present in that project.
2. Show the manifest in Project Settings and copy the provided appsscript.json. Its only OAuth scope is drive.file. Enable Advanced Drive API v3 and Sheets API v4; verify the matching APIs on the linked Google Cloud project.
3. Privately generate setup values with node scripts/private-admin-setup.mjs. This command is not run automatically. It writes an ignored .private/admin-setup.json and refuses to overwrite an existing setup. Do not commit/upload that file. Store the generated owner password in a password manager.
4. In Apps Script Script Properties, enter BRIDGE_SECRET using the generated GOOGLE_BRIDGE_SECRET (64 random hex characters). Do not use the older UUID-based secret.
5. When authorised, run setupWebsiteBackend. It creates a NEW app-managed TriStone Website Submissions root with two registers and two upload folders. It does not access or reuse your unrelated existing Drive files. Keep this root private; anonymous/domain-wide shares are rejected at runtime. You may organise the new root through the Drive UI; do not replace configured destination IDs with arbitrary existing files.
6. Later, deploy as a Web app, execute as Me, access Anyone. Copy the /exec URL into the backend's GOOGLE_SCRIPT_URL. Unsigned, replayed and non-submit requests are rejected. No photo/content/browse/delete endpoint exists.
7. Retain only required account access and script editors; a dedicated company intake account is still recommended. The narrow Google scope grants management of app-authorised files, including provider-level delete permission, but the implementation contains no Drive trash/delete operation. It does not grant access to unrelated files unless you independently authorise/share them with the app through another mechanism.
8. After setup is actually connected, perform real row/file readback. Local tests cannot prove Google consent, Cloud API configuration, file ACLs or deployment settings.

## Cloudflare/Sites backend — configure later, no change applied now

Apply the new generated drizzle/0001_warm_spectrum.sql through the normal reviewed deployment migration flow. Never alter deployed 0000 migration. D1 security tables hold limits, gateway nonces and hashed admin sessions; R2 remains the image store.

Backend runtime values:
- CMS_ADMIN_EMAIL: existing Sites owner, for the native Sites dashboard.
- HOSTINGER_BRIDGE_SECRET: generated random value; same value on Hostinger.
- GOOGLE_SCRIPT_URL: authorised HTTPS Apps Script /exec URL.
- GOOGLE_BRIDGE_SECRET: same generated value as Apps Script BRIDGE_SECRET.
- TURNSTILE_SITE_KEY and TURNSTILE_SECRET_KEY: real widget keys, with the visitor hostname approved.
- PUBLIC_ORIGIN: actual website HTTPS origin for canonical rendering.
- During a PRIVATE test only: DEPLOYMENT_STAGE=test and TEST_ORIGIN=<exact temporary HTTPS Hostinger origin>. Production defaults to https://tristone.ae exclusively. www and other subdomains are not implicitly allowed.

Use the existing D1 DB and R2 BUCKET bindings; these are not text variables. Redeploying to apply code, migrations or runtime values remains pending until authorised. The backend service-access credential is separate from owner identity and cannot itself edit the CMS.

## Hostinger — manual settings for a private test

Use the Node.js Web App flow, Node 24, repository package.json, npm run build and npm start (hostinger/start.mjs). This is the new gateway; the earlier export had no start command.

Hostinger runtime:
- PUBLIC_ORIGIN: exact temporary HTTPS test origin initially.
- DEPLOYMENT_STAGE=test and TEST_ORIGIN: identical exact test origin initially.
- HOSTINGER_BRIDGE_SECRET: same generated value as the backend.
- SITES_SERVICE_TOKEN: private backend's supported service-access credential. Keep it server-only; do not substitute a browser login cookie. A valid supported credential must be obtained/verified before testing the real connection.
- ADMIN_PASSWORD_HASH and ADMIN_TOTP_SECRET: generated private setup values. Enrol ADMIN_TOTP_SECRET in your authenticator before testing login; use the generated OWNER_PASSWORD, not the hash, at the login screen.
- PORT: hosting platform supplied, default 3000 if absent.

Google secrets are not needed on Hostinger when the existing Worker signs/stores submissions. The gateway strips incoming oai-/x-tristone- headers, signs fresh backend requests, never forwards its credentials to redirects, and returns generic errors rather than secrets. It uses socket addresses for conservative client limits; do not trust arbitrary X-Forwarded-For headers. Shared host proxy addresses may share a client budget until a provider-verified client-address integration is reviewed.

Owner cookies are Secure, HttpOnly, SameSite=Strict, host-only and expire after 15 minutes. Logout revokes the backend session, so copying the old cookie does not restore access. Passwords are scrypt-hashed and authenticator codes are single-use across logins.

## Limits and document policy

- CVs: one PDF, up to 5 MB.
- Customer attachments: up to three PDFs, each up to 5 MB, combined up to 10 MB.
- Accepted PDFs: standard/classic cross-reference files, at most 50 pages; no encrypted files, interactive forms, scripts, links/actions, embedded attachments, compressed object streams or unsupported stream filters. Export/print a simple PDF if rejected.
- Documents are parsed and re-saved deterministically; decompressed stream budgets are bounded. Google rechecks the canonical file's size, digest, structure markers and passive policy.
- CMS JPG/PNG images: up to 5 MB and 4 megapixels; decoded and re-encoded, metadata stripped, PNG inflation bounded.
- Submissions: 10 per client and 200 globally per ten-minute window. Login: 5 attempts per client and 100 globally per ten minutes. Gateway: 200 per client and 1,000 globally per ten minutes.
- Daily accepted/reserved submission budget: 200; uploaded bytes: 50 MiB/day and 500 MiB lifetime. Google also caps 2,000 intake records. Worker counters and Google counters fail closed.
- Failed/ambiguous writes keep reserved quota and uploaded files; they do not automatically trash files or guess whether to duplicate a save. Owner reconciliation is required where a pending marker remains. Do not blindly clear pending markers or reset lifetime budgets.

These are upload/resource safeguards, not a malware-free certificate. Staff must keep viewers patched and use document scanning/quarantine procedures before opening CVs. Public Apps Script still consumes Google's execution quota on invalid endpoint calls; HMAC prevents Drive work, not all provider-level quota abuse.

## GitHub and maintenance

The checkout has pre-commit/pre-push secret checks, ignores for .env/private credentials/archives, and a security CI workflow. Install the hooks again in any new clone with git config core.hooksPath .githooks. The scripts require Node on that developer machine's PATH. Enable GitHub secret scanning/push protection where available and inspect the real repository/history; no GitHub account was connected or pushed during this work.

Run npm run secrets:check -- --history, npm test, npm audit, and the local browser security check after meaningful changes. No real secrets are included in .env examples or browser bundles. Rotate any credential previously exposed; deleting a current file does not remove Git history.

Only after real private-test login/edit/upload/logout checks and separate Google submission readbacks pass should a production deployment or domain cutover be considered.
