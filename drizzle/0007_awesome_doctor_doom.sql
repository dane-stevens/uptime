ALTER TABLE `monitorLogs` ADD `responseTimeDNS` integer NOT NULL;--> statement-breakpoint
ALTER TABLE `monitorLogs` ADD `responseTimeTCP` integer NOT NULL;--> statement-breakpoint
ALTER TABLE `monitorLogs` ADD `responseTimeTLS` integer NOT NULL;--> statement-breakpoint
ALTER TABLE `monitorLogs` ADD `responseTimeFirstByte` integer NOT NULL;