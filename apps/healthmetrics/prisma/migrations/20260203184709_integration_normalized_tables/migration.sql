-- AlterTable
ALTER TABLE "integration" ALTER COLUMN "created_at" SET DEFAULT now(),
ALTER COLUMN "updated_at" SET DEFAULT now();

-- AlterTable
ALTER TABLE "integration_token" ALTER COLUMN "created_at" SET DEFAULT now(),
ALTER COLUMN "updated_at" SET DEFAULT now();

-- CreateTable
CREATE TABLE "integration_sleep" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "integration_id" TEXT NOT NULL,
    "external_id" TEXT NOT NULL,
    "start_at" TIMESTAMP(3) NOT NULL,
    "end_at" TIMESTAMP(3) NOT NULL,
    "local_date" DATE NOT NULL,
    "source_tz_offset_minutes" INTEGER NOT NULL,
    "duration_seconds" INTEGER NOT NULL,
    "sleep_score" INTEGER,
    "is_nap" BOOLEAN NOT NULL DEFAULT false,
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "extras" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "integration_sleep_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "integration_recovery" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "integration_id" TEXT NOT NULL,
    "external_id" TEXT NOT NULL,
    "local_date" DATE NOT NULL,
    "source_tz_offset_minutes" INTEGER NOT NULL,
    "recovery_score" INTEGER,
    "hrv_rmssd_ms" DOUBLE PRECISION,
    "resting_hr_bpm" INTEGER,
    "spo2_pct" DOUBLE PRECISION,
    "extras" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "integration_recovery_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "integration_workout" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "integration_id" TEXT NOT NULL,
    "external_id" TEXT NOT NULL,
    "start_at" TIMESTAMP(3) NOT NULL,
    "end_at" TIMESTAMP(3) NOT NULL,
    "local_date" DATE NOT NULL,
    "source_tz_offset_minutes" INTEGER NOT NULL,
    "sport_name" TEXT,
    "strain" DOUBLE PRECISION,
    "calories_kcal" DOUBLE PRECISION,
    "distance_km" DOUBLE PRECISION,
    "extras" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "integration_workout_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "integration_cycle" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "integration_id" TEXT NOT NULL,
    "external_id" TEXT NOT NULL,
    "start_at" TIMESTAMP(3) NOT NULL,
    "end_at" TIMESTAMP(3) NOT NULL,
    "local_date" DATE NOT NULL,
    "source_tz_offset_minutes" INTEGER NOT NULL,
    "day_strain" DOUBLE PRECISION,
    "kilojoules" DOUBLE PRECISION,
    "avg_hr_bpm" INTEGER,
    "max_hr_bpm" INTEGER,
    "extras" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "integration_cycle_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "integration_sleep_integration_id_idx" ON "integration_sleep"("integration_id");

-- CreateIndex
CREATE INDEX "integration_sleep_local_date_idx" ON "integration_sleep"("local_date");

-- CreateIndex
CREATE UNIQUE INDEX "integration_sleep_integration_id_external_id_key" ON "integration_sleep"("integration_id", "external_id");

-- CreateIndex
CREATE INDEX "integration_recovery_integration_id_idx" ON "integration_recovery"("integration_id");

-- CreateIndex
CREATE INDEX "integration_recovery_local_date_idx" ON "integration_recovery"("local_date");

-- CreateIndex
CREATE UNIQUE INDEX "integration_recovery_integration_id_external_id_key" ON "integration_recovery"("integration_id", "external_id");

-- CreateIndex
CREATE INDEX "integration_workout_integration_id_idx" ON "integration_workout"("integration_id");

-- CreateIndex
CREATE INDEX "integration_workout_local_date_idx" ON "integration_workout"("local_date");

-- CreateIndex
CREATE UNIQUE INDEX "integration_workout_integration_id_external_id_key" ON "integration_workout"("integration_id", "external_id");

-- CreateIndex
CREATE INDEX "integration_cycle_integration_id_idx" ON "integration_cycle"("integration_id");

-- CreateIndex
CREATE INDEX "integration_cycle_local_date_idx" ON "integration_cycle"("local_date");

-- CreateIndex
CREATE UNIQUE INDEX "integration_cycle_integration_id_external_id_key" ON "integration_cycle"("integration_id", "external_id");

-- AddForeignKey
ALTER TABLE "integration_sleep" ADD CONSTRAINT "integration_sleep_integration_id_fkey" FOREIGN KEY ("integration_id") REFERENCES "integration"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "integration_recovery" ADD CONSTRAINT "integration_recovery_integration_id_fkey" FOREIGN KEY ("integration_id") REFERENCES "integration"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "integration_workout" ADD CONSTRAINT "integration_workout_integration_id_fkey" FOREIGN KEY ("integration_id") REFERENCES "integration"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "integration_cycle" ADD CONSTRAINT "integration_cycle_integration_id_fkey" FOREIGN KEY ("integration_id") REFERENCES "integration"("id") ON DELETE CASCADE ON UPDATE CASCADE;
