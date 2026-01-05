/*
  Warnings:

  - Added the required column `workout_session_id` to the `workout_logs` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "workout_logs" ADD COLUMN     "workout_session_id" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "workout_sessions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "session_type" TEXT NOT NULL DEFAULT 'full',
    "total_minutes" INTEGER NOT NULL DEFAULT 0,
    "total_calories" INTEGER,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "workout_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "workout_sessions_user_id_date_idx" ON "workout_sessions"("user_id", "date");

-- CreateIndex
CREATE INDEX "workout_logs_workout_session_id_idx" ON "workout_logs"("workout_session_id");

-- AddForeignKey
ALTER TABLE "workout_sessions" ADD CONSTRAINT "workout_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workout_logs" ADD CONSTRAINT "workout_logs_workout_session_id_fkey" FOREIGN KEY ("workout_session_id") REFERENCES "workout_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
