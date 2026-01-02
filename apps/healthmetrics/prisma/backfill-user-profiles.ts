import { PrismaClient } from "./generated/client";
import { PrismaPg } from "@prisma/adapter-pg";

// Create Prisma client instance
const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({
  adapter,
});

/**
 * Backfill User profiles for existing BetterAuthUsers
 * Run this once after implementing the afterSignUp hook
 */
async function main() {
  console.log("Starting User profile backfill...");

  // Find all BetterAuthUsers without a User profile
  const betterAuthUsers = await prisma.betterAuthUser.findMany({
    include: {
      userProfile: true,
    },
  });

  const usersWithoutProfile = betterAuthUsers.filter(
    (user) => !user.userProfile
  );

  if (usersWithoutProfile.length === 0) {
    console.log("✅ All users already have profiles!");
    return;
  }

  console.log(
    `📝 Found ${usersWithoutProfile.length} users without profiles. Creating...`
  );

  // Create User profiles for each BetterAuthUser
  for (const betterAuthUser of usersWithoutProfile) {
    try {
      await prisma.user.create({
        data: {
          id: betterAuthUser.id, // Same id as BetterAuthUser
          timezone: "UTC",
          unitsPreference: "metric",
        },
      });
      console.log(`Created profile for ${betterAuthUser.email}`);
    } catch (error) {
      console.error(`Failed for ${betterAuthUser.email}:`, error);
    }
  }

  console.log("✅ Backfill completed!");
}

main()
  .catch((e) => {
    console.error("❌ Backfill failed:");
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
