-- AlterTable
ALTER TABLE "integration" ALTER COLUMN "created_at" SET DEFAULT now(),
ALTER COLUMN "updated_at" SET DEFAULT now();

-- AlterTable
ALTER TABLE "integration_cycle" ALTER COLUMN "updated_at" SET DEFAULT now();

-- AlterTable
ALTER TABLE "integration_recovery" ALTER COLUMN "updated_at" SET DEFAULT now();

-- AlterTable
ALTER TABLE "integration_sleep" ALTER COLUMN "updated_at" SET DEFAULT now();

-- AlterTable
ALTER TABLE "integration_token" ALTER COLUMN "created_at" SET DEFAULT now(),
ALTER COLUMN "updated_at" SET DEFAULT now();

-- AlterTable
ALTER TABLE "integration_workout" ALTER COLUMN "updated_at" SET DEFAULT now();
