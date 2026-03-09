CREATE TABLE `monitorLogs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`monitorId` integer NOT NULL,
	`statusCode` integer NOT NULL,
	`responseTime` integer NOT NULL,
	`createdAt` integer
);
