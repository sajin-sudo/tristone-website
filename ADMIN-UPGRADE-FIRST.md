# TriStone admin upgrade: source only

Upload extracted source files to the admin_upgrade branch only. Keep main and Hostinger unchanged. Do not upload the ZIP itself as a website file.

The package contains the secured editor and Hostinger gateway. It is not a working live account until owner credentials, D1 migration, R2 and the private Sites service connection are configured and tested. Public forms still require their separate Google and Turnstile setup.

When replacing older repository files, also remove obsolete google-drive-setup/Setup.gs and CareersFeed.gs from this branch. The new backend has no Drive browse/photo/delete routes.

Never upload private setup values or .env files. Follow SECURITY-MANUAL-SETUP.md. Do not merge or deploy this branch until private testing passes and the owner approves activation.

The previous migration 0000 is a baseline; do not replace an already-deployed migration with a differently formatted copy. Only the new 0001 adds security tables.
