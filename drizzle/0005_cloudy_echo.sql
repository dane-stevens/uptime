ALTER TABLE "monitors" ADD COLUMN "failureQuorum" integer DEFAULT 2;--> statement-breakpoint
ALTER TABLE "monitors" ADD COLUMN "successQuorum" integer DEFAULT 2;