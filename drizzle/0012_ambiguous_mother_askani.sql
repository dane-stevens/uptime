PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_monitorLogs` (
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
INSERT INTO `__new_monitorLogs`("id", "monitorId", "statusCode", "responseTimeDNS", "responseTimeTCP", "responseTimeTLS", "responseTimeFirstByte", "responseTime", "createdAt") SELECT "id", "monitorId", "statusCode", "responseTimeDNS", "responseTimeTCP", "responseTimeTLS", "responseTimeFirstByte", "responseTime", "createdAt" FROM `monitorLogs`;--> statement-breakpoint
DROP TABLE `monitorLogs`;--> statement-breakpoint
ALTER TABLE `__new_monitorLogs` RENAME TO `monitorLogs`;--> statement-breakpoint
PRAGMA foreign_keys=ON;