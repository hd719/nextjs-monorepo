-- CreateEnum
CREATE TYPE "IntegrationProvider" AS ENUM ('whoop');

-- CreateEnum
CREATE TYPE "IntegrationStatus" AS ENUM ('connected', 'disconnected', 'error');

-- CreateTable
CREATE TABLE "integration" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "provider" "IntegrationProvider" NOT NULL,
    "status" "IntegrationStatus" NOT NULL DEFAULT 'disconnected',
    "last_sync_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "integration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "integration_token" (
    "id" TEXT NOT NULL,
    "integration_id" TEXT NOT NULL,
    "access_token_encrypted" TEXT NOT NULL,
    "refresh_token_encrypted" TEXT,
    "expires_at" TIMESTAMP(3),
    "scopes" TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "integration_token_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "integration_connection" (
    "id" TEXT NOT NULL,
    "integration_id" TEXT NOT NULL,
    "provider_user_id" TEXT,
    "connected_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_error" TEXT,

    CONSTRAINT "integration_connection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "integration_raw_event" (
    "id" TEXT NOT NULL,
    "integration_id" TEXT NOT NULL,
    "resource_type" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "source_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "integration_raw_event_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "integration_user_id_idx" ON "integration"("user_id");

-- CreateIndex
CREATE INDEX "integration_provider_idx" ON "integration"("provider");

-- CreateIndex
CREATE UNIQUE INDEX "integration_user_id_provider_key" ON "integration"("user_id", "provider");

-- CreateIndex
CREATE INDEX "integration_token_integration_id_idx" ON "integration_token"("integration_id");

-- CreateIndex
CREATE UNIQUE INDEX "integration_connection_integration_id_key" ON "integration_connection"("integration_id");

-- CreateIndex
CREATE INDEX "integration_raw_event_integration_id_idx" ON "integration_raw_event"("integration_id");

-- CreateIndex
CREATE INDEX "integration_raw_event_resource_type_idx" ON "integration_raw_event"("resource_type");

-- CreateIndex
CREATE UNIQUE INDEX "integration_raw_event_integration_id_source_id_resource_typ_key" ON "integration_raw_event"("integration_id", "source_id", "resource_type");

-- AddForeignKey
ALTER TABLE "integration" ADD CONSTRAINT "integration_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "integration_token" ADD CONSTRAINT "integration_token_integration_id_fkey" FOREIGN KEY ("integration_id") REFERENCES "integration"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "integration_connection" ADD CONSTRAINT "integration_connection_integration_id_fkey" FOREIGN KEY ("integration_id") REFERENCES "integration"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "integration_raw_event" ADD CONSTRAINT "integration_raw_event_integration_id_fkey" FOREIGN KEY ("integration_id") REFERENCES "integration"("id") ON DELETE CASCADE ON UPDATE CASCADE;
