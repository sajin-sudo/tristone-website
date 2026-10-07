CREATE TABLE `admin_sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`expires` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `security_counters` (
	`id` text PRIMARY KEY NOT NULL,
	`used` integer NOT NULL,
	`expires` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `security_nonces` (
	`id` text PRIMARY KEY NOT NULL,
	`expires` integer NOT NULL
);
