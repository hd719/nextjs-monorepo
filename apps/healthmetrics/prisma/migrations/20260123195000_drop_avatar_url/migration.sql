-- Drop legacy avatar_url column now that we only use avatar_key.
ALTER TABLE "users" DROP COLUMN "avatar_url";
