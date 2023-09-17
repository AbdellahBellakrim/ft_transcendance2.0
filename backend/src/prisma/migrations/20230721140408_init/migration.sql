-- AlterTable
ALTER TABLE "Channel" ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Stats" ALTER COLUMN "wins" SET DEFAULT 0,
ALTER COLUMN "losses" SET DEFAULT 0,
ALTER COLUMN "ladder_level" SET DEFAULT 0;
