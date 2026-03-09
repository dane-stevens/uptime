PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_monitors` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`hId` text NOT NULL,
	`url` text,
	`interval` integer DEFAULT 300 NOT NULL,
	`isActive` integer DEFAULT true NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_monitors`("id", "hId", "url", "interval", "isActive") SELECT "id", "hId", "url", "interval", "isActive" FROM `monitors`;--> statement-breakpoint
DROP TABLE `monitors`;--> statement-breakpoint
ALTER TABLE `__new_monitors` RENAME TO `monitors`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `monitors_hId_unique` ON `monitors` (`hId`);