ALTER TABLE `users` ADD `hId` text NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX `users_hId_unique` ON `users` (`hId`);