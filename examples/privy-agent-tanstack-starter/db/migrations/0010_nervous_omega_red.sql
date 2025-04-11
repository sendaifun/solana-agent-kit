ALTER TABLE "User" ALTER COLUMN "email" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "User" ADD COLUMN "walletAddress" json NOT NULL;