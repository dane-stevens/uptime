CREATE TABLE `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`email` text NOT NULL,
	`userType` text DEFAULT 'OWNER',
	`firstName` text,
	`lastName` text,
	`loginCodeHash` text,
	`loginCodeExpires` integer,
	`isActive` integer DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);