# Editing TriStone without code

The secured local project includes an owner dashboard. The older adapter currently deployed on Hostinger blocks admin access; these instructions become live only after the secure gateway, database and image storage are configured and tested together.

## Signing in after activation

1. Open https://tristone.ae/auth/login.
2. Enter your privately configured owner password and the six-digit code from your authenticator.
3. The dashboard opens at /admin.html. Visitors cannot access the editor or its APIs without a valid owner session.
4. Sessions expire after 15 minutes. Use Sign out when finished.

Do not post your password, authenticator seed, session cookie or bridge secrets in chat, GitHub or browser code. Initial credentials are configured privately using the setup procedure in SECURITY-MANUAL-SETUP.md. There is no shared default password.

## Changing the website

Choose a section in the menu, edit its fields, then click Save changes. Successful saves update the content database and rendered pages. If another tab saved first, reload before retrying.

- Pages: headings, descriptions, photographs and SEO titles/descriptions.
- Services: add/edit services and their descriptions. The service-request dropdown updates automatically.
- Vacancies: add a position and requirements; choose Draft, Published or Closed. Expired vacancies are hidden.
- Projects, testimonials and certifications: publish genuine entries; empty collections stay hidden.
- Company/contact: email, phone, coverage, address and working hours.
- WhatsApp: country code, phone and separate customer/candidate messages; blank settings hide buttons.
- Social links: full HTTPS addresses; empty settings hide icons.
- Forms: supported wording, labels and optional fields. Essential identity/consent/security requirements remain enforced.
- Banners, announcements, buttons, footer, privacy and terms have controls.

Upload JPG/PNG photos with appropriate permissions, up to 5 MiB and four megapixels. Add descriptive alternative text. Candidate documents and customer submissions are not public dashboard media; they use separate private Google destinations once connected.

Website editing does not require Google submission storage to be enabled. It does require working owner authentication, D1 content/security tables, R2 photo storage and the private server-to-server connection. See SECURITY-MANUAL-SETUP.md. Do not unblock the older adapter's admin routes without these protections.
