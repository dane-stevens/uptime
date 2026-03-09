CREATE TABLE `monitors` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`hId` text NOT NULL,
	`url` text,
	`frequency` integer,
	`isActive` integer DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `monitors_hId_unique` ON `monitors` (`hId`);