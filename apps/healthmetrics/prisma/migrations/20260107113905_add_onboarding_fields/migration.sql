-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "GoalType" ADD VALUE 'improve_fitness';
ALTER TYPE "GoalType" ADD VALUE 'eat_healthier';

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "onboarding_completed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "onboarding_completed_at" TIMESTAMP(3),
ADD COLUMN     "onboarding_skipped_at" TIMESTAMP(3),
ADD COLUMN     "onboarding_step" INTEGER NOT NULL DEFAULT 0;
