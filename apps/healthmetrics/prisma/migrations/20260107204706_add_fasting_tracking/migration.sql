-- CreateEnum
CREATE TYPE "FastingStatus" AS ENUM ('active', 'paused', 'completed', 'cancelled');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "default_fasting_protocol_id" TEXT,
ADD COLUMN     "fasting_goal_per_week" INTEGER;

-- CreateTable
CREATE TABLE "fasting_protocols" (
    "id" TEXT NOT NULL,
    "user_id" TEXT,
    "name" TEXT NOT NULL,
    "fasting_minutes" INTEGER NOT NULL,
    "eating_minutes" INTEGER NOT NULL,
    "is_preset" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fasting_protocols_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fasting_sessions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "protocol_id" TEXT NOT NULL,
    "start_time" TIMESTAMP(3) NOT NULL,
    "end_time" TIMESTAMP(3),
    "target_duration_min" INTEGER NOT NULL,
    "actual_duration_min" INTEGER,
    "paused_at" TIMESTAMP(3),
    "total_paused_min" INTEGER NOT NULL DEFAULT 0,
    "status" "FastingStatus" NOT NULL,
    "completed_at_target" BOOLEAN,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fasting_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "fasting_protocols_user_id_idx" ON "fasting_protocols"("user_id");

-- CreateIndex
CREATE INDEX "fasting_protocols_is_preset_idx" ON "fasting_protocols"("is_preset");

-- CreateIndex
CREATE INDEX "fasting_sessions_user_id_idx" ON "fasting_sessions"("user_id");

-- CreateIndex
CREATE INDEX "fasting_sessions_user_id_status_idx" ON "fasting_sessions"("user_id", "status");

-- CreateIndex
CREATE INDEX "fasting_sessions_user_id_start_time_idx" ON "fasting_sessions"("user_id", "start_time");

-- AddForeignKey
ALTER TABLE "fasting_protocols" ADD CONSTRAINT "fasting_protocols_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fasting_sessions" ADD CONSTRAINT "fasting_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fasting_sessions" ADD CONSTRAINT "fasting_sessions_protocol_id_fkey" FOREIGN KEY ("protocol_id") REFERENCES "fasting_protocols"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
