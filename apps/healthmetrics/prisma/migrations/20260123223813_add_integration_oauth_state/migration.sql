-- CreateTable
CREATE TABLE "integration_oauth_state" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "provider" "IntegrationProvider" NOT NULL,
    "state_hash" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "integration_oauth_state_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "integration_oauth_state_user_id_idx" ON "integration_oauth_state"("user_id");

-- CreateIndex
CREATE INDEX "integration_oauth_state_provider_idx" ON "integration_oauth_state"("provider");

-- CreateIndex
CREATE UNIQUE INDEX "integration_oauth_state_state_hash_key" ON "integration_oauth_state"("state_hash");

-- AddForeignKey
ALTER TABLE "integration_oauth_state" ADD CONSTRAINT "integration_oauth_state_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
