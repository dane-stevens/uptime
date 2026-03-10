ALTER TABLE "monitorLogs" ALTER COLUMN "responseTimeDNS" SET DATA TYPE numeric(2);--> statement-breakpoint
ALTER TABLE "monitorLogs" ALTER COLUMN "responseTimeTCP" SET DATA TYPE numeric(2);--> statement-breakpoint
ALTER TABLE "monitorLogs" ALTER COLUMN "responseTimeTLS" SET DATA TYPE numeric(2);--> statement-breakpoint
ALTER TABLE "monitorLogs" ALTER COLUMN "responseTimeFirstByte" SET DATA TYPE numeric(2);--> statement-breakpoint
ALTER TABLE "monitorLogs" ALTER COLUMN "responseTime" SET DATA TYPE numeric(2);