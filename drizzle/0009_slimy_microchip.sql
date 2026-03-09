PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_monitorLogs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`monitorId` integer NOT NULL,
	`statusCode` integer DEFAULT 200 NOT NULL,
	`responseTimeDNS` integer DEFAULT -1 NOT NULL,
	`responseTimeTCP` integer DEFAULT -1 NOT NULL,
	`responseTimeTLS` integer DEFAULT -1 NOT NULL,
	`responseTimeFirstByte` integer DEFAULT -1 NOT NULL,
	`responseTime` integer DEFAULT -1 NOT NULL,
	`createdAt` integer
);
--> statement-breakpoint
INSERT INTO `__new_monitorLogs`("id", "monitorId", "statusCode", "responseTimeDNS", "responseTimeTCP", "responseTimeTLS", "responseTimeFirstByte", "responseTime", "createdAt") SELECT "id", "monitorId", "statusCode", "responseTimeDNS", "responseTimeTCP", "responseTimeTLS", "responseTimeFirstByte", "responseTime", "createdAt" FROM `monitorLogs`;--> statement-breakpoint
DROP TABLE `monitorLogs`;--> statement-breakpoint
ALTER TABLE `__new_monitorLogs` RENAME TO `monitorLogs`;--> statement-breakpoint
PRAGMA foreign_keys=ON;