-- AlterTable
ALTER TABLE "users" ADD COLUMN     "daily_step_goal" INTEGER NOT NULL DEFAULT 10000;

-- CreateTable
CREATE TABLE "step_entries" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "steps" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "step_entries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "step_entries_user_id_idx" ON "step_entries"("user_id");

-- CreateIndex
CREATE INDEX "step_entries_date_idx" ON "step_entries"("date");

-- CreateIndex
CREATE UNIQUE INDEX "step_entries_user_id_date_key" ON "step_entries"("user_id", "date");

-- AddForeignKey
ALTER TABLE "step_entries" ADD CONSTRAINT "step_entries_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
