/*
  Warnings:

  - You are about to drop the column `target_weight_kg` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `muscle_mass_kg` on the `weight_entries` table. All the data in the column will be lost.
  - You are about to drop the column `weight_kg` on the `weight_entries` table. All the data in the column will be lost.
  - You are about to drop the column `weight_kg` on the `workout_logs` table. All the data in the column will be lost.

*/
-- AlterTable: Add new weight columns in lbs
ALTER TABLE "users" ADD COLUMN "target_weight_lbs" DECIMAL(6,2);
ALTER TABLE "weight_entries" ADD COLUMN "weight_lbs" DECIMAL(6,2);
ALTER TABLE "weight_entries" ADD COLUMN "muscle_mass_lbs" DECIMAL(6,2);
ALTER TABLE "workout_logs" ADD COLUMN "weight_lbs" DECIMAL(7,2);

-- Convert existing data from kg to lbs (1 kg = 2.20462 lbs)
UPDATE "users" SET "target_weight_lbs" = "target_weight_kg" * 2.20462 WHERE "target_weight_kg" IS NOT NULL;
UPDATE "weight_entries" SET "weight_lbs" = "weight_kg" * 2.20462 WHERE "weight_kg" IS NOT NULL;
UPDATE "weight_entries" SET "muscle_mass_lbs" = "muscle_mass_kg" * 2.20462 WHERE "muscle_mass_kg" IS NOT NULL;
UPDATE "workout_logs" SET "weight_lbs" = "weight_kg" * 2.20462 WHERE "weight_kg" IS NOT NULL;

-- Drop old kg columns
ALTER TABLE "users" DROP COLUMN "target_weight_kg";
ALTER TABLE "weight_entries" DROP COLUMN "weight_kg";
ALTER TABLE "weight_entries" DROP COLUMN "muscle_mass_kg";
ALTER TABLE "workout_logs" DROP COLUMN "weight_kg";
