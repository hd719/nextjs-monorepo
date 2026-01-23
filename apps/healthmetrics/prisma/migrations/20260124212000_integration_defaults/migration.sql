-- Ensure pgcrypto is available for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- integration defaults
ALTER TABLE "integration"
  ALTER COLUMN "id" SET DEFAULT gen_random_uuid(),
  ALTER COLUMN "created_at" SET DEFAULT now(),
  ALTER COLUMN "updated_at" SET DEFAULT now();

-- integration_token defaults
ALTER TABLE "integration_token"
  ALTER COLUMN "id" SET DEFAULT gen_random_uuid(),
  ALTER COLUMN "created_at" SET DEFAULT now(),
  ALTER COLUMN "updated_at" SET DEFAULT now();

-- integration_connection defaults
ALTER TABLE "integration_connection"
  ALTER COLUMN "id" SET DEFAULT gen_random_uuid();

-- integration_raw_event defaults
ALTER TABLE "integration_raw_event"
  ALTER COLUMN "id" SET DEFAULT gen_random_uuid();

-- integration_oauth_state defaults
ALTER TABLE "integration_oauth_state"
  ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
