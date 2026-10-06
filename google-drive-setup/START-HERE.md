# TriStone website connection

The website is built. Google storage is **not connected yet**. It will not display a successful submission until Google confirms a saved record. No client credentials are used.

## First step: authorise the company storage

1. Sign in to Google with the company account that can access the **Tri stone website** folder. The connected owner is `sajin@tristone.ae`; the customer-facing contact remains `admin@tristone.ae`.
2. Open https://script.google.com/ and create a **New project** named **TriStone Website Backend**.
3. Replace the editor content with `WebsiteBackend.gs` from this folder. Save, select **setupWebsiteBackend**, then click **Run** and authorise access to your Drive and Sheets.

Tell me when this step is complete. It creates **Customer Inquiries**, **Candidate Applications**, **Project Portfolio**, **Customer Inquiry Files** and **Candidate CVs** inside your existing website folder. It reuses its saved IDs if you run it again.

## Later connection steps (we will do these together)

Deploy the script as a **Web app**, execute as **Me**, access **Anyone**. The server checks a signed request; being reachable does not make the Sheets public. Copy the `/exec` deployment URL. In Script Settings → Script Properties, the generated **BRIDGE_SECRET** belongs only in a secret server environment variable. Never put it in a Sheet, public page or browser JavaScript.

Create Cloudflare Turnstile keys for the actual website host. Configure server runtime variables: `GOOGLE_SCRIPT_URL`, secret `GOOGLE_BRIDGE_SECRET`, public `TURNSTILE_SITE_KEY`, secret `TURNSTILE_SECRET_KEY`. Deploy after changing them. We will test real enquiry and CV submissions, verify separate rows and private file links, and remove test records.

## Updating projects without code

Open **Project Portfolio**. Each row has Project ID, Title, Location, Description, Photo URL and Status. Use **Draft** while preparing; change Status to **Published** when ready. Set **Closed** or **Draft** to hide it. Only Published rows with title, location and description appear. Do not enter private customer information in portfolio rows.

Upload a JPG or PNG project photo (up to 5 MB) to your company Drive, then paste its normal Drive file link into **Photo URL**. The backend displays that selected photo only while the project row is **Published**, so the Drive file itself can stay private. Marking a project Published authorises the website to display its details and selected photo publicly. A photo is optional: a text project card is valid. Use a unique Project ID per row. Keep enquiries, CVs and the registers private. External HTTPS direct image URLs also work.

## Updating jobs without code

Use the existing **TriStone Vacancy Register**. Add the job title, location, type, requirements and optional closing date. Change Status to **Published** to display it. Draft and Closed rows and expired jobs are hidden.

## Operations

Google Apps Script and Drive have account-specific quotas. Failed or timed-out writes do not show a false success. Retrying the same unchanged submission uses its Request ID to return the existing reference without creating another row. Staff should review uploaded documents with their normal security tools; file format checks are not malware scanning. Agree your retention policy before opening forms to the public.
