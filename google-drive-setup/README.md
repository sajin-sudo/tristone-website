# TriStone submission backend v2

Use WebsiteBackend.gs plus appsscript.json. The manifest uses only drive.file and Advanced Drive v3 / Sheets v4 services. This replaces the old broadly scoped and portfolio-reading backend.

The app creates dedicated private intake storage and supports only authenticated, fresh, non-replayed inquiry/application submissions. Customers and candidates have separate registers/upload folders. No visitor-supplied destination IDs, file reading, listing, trashing, deleting or overwriting is implemented. Use PDF only.

Read ../SECURITY-MANUAL-SETUP.md before authorising. No Google connection or deployment is active merely because these files exist. Earlier setup instructions and pasted code must be replaced; do not authorise the old script.
