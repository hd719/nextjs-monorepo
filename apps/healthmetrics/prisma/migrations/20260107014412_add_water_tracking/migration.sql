-- AlterTable
ALTER TABLE "users" ADD COLUMN     "daily_water_goal" INTEGER NOT NULL DEFAULT 8;

-- CreateTable
CREATE TABLE "water_entries" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "glasses" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "water_entries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "water_entries_user_id_idx" ON "water_entries"("user_id");

-- CreateIndex
CREATE INDEX "water_entries_date_idx" ON "water_entries"("date");

-- CreateIndex
CREATE UNIQUE INDEX "water_entries_user_id_date_key" ON "water_entries"("user_id", "date");

-- AddForeignKey
ALTER TABLE "water_entries" ADD CONSTRAINT "water_entries_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
