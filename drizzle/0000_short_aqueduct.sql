CREATE TABLE `monitorLogs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`monitorId` integer,
	`statusCode` integer,
	`responseTimeDNS` integer,
	`responseTimeTCP` integer,
	`responseTimeTLS` integer,
	`responseTimeFirstByte` integer,
	`responseTime` integer,
	`createdAt` integer
);
--> statement-breakpoint
CREATE TABLE `monitors` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`hId` text NOT NULL,
	`url` text,
	`interval` integer DEFAULT 300 NOT NULL,
	`isActive` integer DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `monitors_hId_unique` ON `monitors` (`hId`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`hId` text NOT NULL,
	`username` text NOT NULL,
	`userType` text DEFAULT 'OWNER',
	`firstName` text,
	`lastName` text,
	`loginCodeHash` text,
	`loginCodeExpires` integer,
	`isActive` integer DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_hId_unique` ON `users` (`hId`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_username_unique` ON `users` (`username`);