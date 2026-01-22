import { prisma } from "@/lib/prisma";
import { createLogger } from "@/lib/logger";
import { deleteFiles, listObjects } from "@/lib/storage";
import { isProduction } from "@/utils/env";

const log = createLogger("jobs:avatar-cleanup");

const MAX_AGE_DAYS = Number(process.env.AVATAR_ORPHAN_MAX_AGE_DAYS ?? "7");
const parseBoolean = (value?: string): boolean | undefined => {
  if (value === "true") return true;
  if (value === "false") return false;
  return undefined;
};

const dryRunOverride = parseBoolean(process.env.AVATAR_CLEANUP_DRY_RUN);
const DRY_RUN = dryRunOverride ?? !isProduction();

type OrphanedCandidate = {
  key: string;
  lastModified?: Date;
};

function isOlderThanCutoff(date?: Date, cutoffMs?: number): boolean {
  if (!date || cutoffMs === undefined) {
    return false;
  }
  return date.getTime() < cutoffMs;
}

export async function cleanupOrphanedAvatars(): Promise<void> {
  const cutoffMs =
    MAX_AGE_DAYS > 0 ? Date.now() - MAX_AGE_DAYS * 24 * 60 * 60 * 1000 : undefined;

  const users = await prisma.user.findMany({
    select: { avatarKey: true },
    where: { avatarKey: { not: null } },
  });

  const referencedKeys = new Set(
    users.map((user) => user.avatarKey!).filter(Boolean)
  );

  const objects = await listObjects("avatars/");
  const candidates: OrphanedCandidate[] = objects.filter((object) => {
    if (!object.key) return false;
    if (referencedKeys.has(object.key)) return false;
    if (cutoffMs && !isOlderThanCutoff(object.lastModified, cutoffMs)) {
      return false;
    }
    return true;
  });

  log.info(
    {
      totalObjects: objects.length,
      referenced: referencedKeys.size,
      candidates: candidates.length,
      dryRun: DRY_RUN,
      maxAgeDays: MAX_AGE_DAYS,
    },
    "Avatar cleanup summary"
  );

  if (DRY_RUN || candidates.length === 0) {
    if (DRY_RUN && candidates.length > 0) {
      log.info(
        { sample: candidates.slice(0, 5).map((c) => c.key) },
        "Dry run: would delete orphaned avatars"
      );
    }
    return;
  }

  await deleteFiles(candidates.map((candidate) => candidate.key));
  log.info({ deleted: candidates.length }, "Deleted orphaned avatars");
}

if (import.meta.url === `file://${process.argv[1]}`) {
  cleanupOrphanedAvatars().catch((error) => {
    log.error({ err: error }, "Avatar cleanup failed");
    process.exitCode = 1;
  });
}
