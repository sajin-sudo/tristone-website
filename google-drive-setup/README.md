# Tri Stone enquiry registration

Destination: Tri stone website folder
https://drive.google.com/drive/folders/1u7PMcMaF8M_LCQwwA9L7IB8MqaPmhwjI

The website currently has a working email enquiry builder. Automatic registration is NOT active yet.
The supplied setup creates a Google Form and its response spreadsheet in the destination folder.
Customers submit through Google Forms; Google records responses in the private spreadsheet.
No customer Google Drive access, service-account secret, or website API key is required.

## One-time Google account setup

1. Sign in to https://script.google.com/ as admin@tristone.ae and choose New project.
2. Name the project Tri Stone Website Enquiries.
3. Replace the editor contents with Setup.gs.
4. Select setupTristoneEnquiries, click Run, and approve the Google permissions.
5. Copy the formUrl printed in the Execution log and send it in this chat.
6. In the Google Form, verify that respondents with the link can access it without belonging to the company Google Workspace. Organisation policies may require an administrator to allow external responses.
7. The website integration will be enabled using that verified form URL.
8. Submit one clearly labelled test enquiry through the live form. Check the response register in the folder, then confirm the record before treating registration as active.

Rerunning the same Apps Script project reuses the original form and register rather than creating duplicates.
Keep the response spreadsheet private; publish only the customer form. No notifications are sent by this setup.
Do not add passwords, tokens, or Google account credentials to the website.

## Website configuration

Once the form has been created, set dist/enquiry-config.json:
{"formUrl":"THE_PUBLISHED_GOOGLE_FORM_URL"}

Use the full published URL from the setup, not a shortened forms.gle link.
The Services & Manpower page will embed the form and hide the email enquiry builder automatically.
Publish the updated site and verify a live response is saved to the register.

Google documentation: https://developers.google.com/apps-script/reference/forms/form
