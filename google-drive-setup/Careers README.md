# Connect the private vacancy register to Careers

Register: https://docs.google.com/spreadsheets/d/1s3eAD-vJwr6AKRpGkK5F51Lkbm49oT0W2XAoHCJZaPU/edit
The connected Drive account is sajin@tristone.ae. The register remains private.
Candidate applications go to admin@tristone.ae by email.

1. Open https://script.google.com/ using the Google account that owns or can read the register (currently sajin@tristone.ae).
2. Create a project named Tri Stone Careers Feed and paste CareersFeed.gs.
3. Run setupCareersFeed and approve Google access to the vacancy register.
4. Deploy > New deployment > Web app. Execute as Me. Access: Anyone.
5. Copy the Web app URL ending in /exec and send it in this chat.
6. We will connect that URL to the website and verify Published jobs appear while Draft, Closed, and expired jobs remain hidden.

Add real vacancy rows in the Vacancies tab. Use a unique Vacancy ID and complete Job title and Requirements.
Set Status to Published only when the vacancy should appear on the website. Set Draft or Closed to hide it.
Optional closing dates must be real date cells. No jobs are published until the feed is connected.
The script is read-only and returns only selected public vacancy fields. It never publishes the full spreadsheet or candidate data.
Keep the register itself private. Do not add confidential information to a Published vacancy's public fields.
Applications currently prepare email messages. Candidates must attach their CV and press Send in their email app.
