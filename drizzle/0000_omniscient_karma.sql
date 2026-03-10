CREATE TABLE "monitorLogs" (
	"id" serial PRIMARY KEY NOT NULL,
	"monitorId" serial NOT NULL,
	"statusCode" integer,
	"responseTimeDNS" integer,
	"responseTimeTCP" integer,
	"responseTimeTLS" integer,
	"responseTimeFirstByte" integer,
	"responseTime" integer,
	"createdAt" timestamp (6) with time zone
);
--> statement-breakpoint
CREATE TABLE "monitors" (
	"id" serial PRIMARY KEY NOT NULL,
	"hId" varchar(40) NOT NULL,
	"url" varchar(255),
	"interval" integer DEFAULT 300,
	"isActive" boolean DEFAULT true,
	CONSTRAINT "monitors_hId_unique" UNIQUE("hId")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"hId" varchar(40) NOT NULL,
	"username" varchar(255),
	"userType" varchar(50) DEFAULT 'OWNER',
	"firstName" varchar(100),
	"lastName" varchar(100),
	"loginCodeHash" varchar(255),
	"loginCodeExpires" timestamp (6) with time zone,
	"isActive" boolean DEFAULT true,
	CONSTRAINT "users_hId_unique" UNIQUE("hId"),
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
