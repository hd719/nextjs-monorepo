import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";
import { createHash, randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth-config";
import { createLogger } from "@/lib/logger";
import { getEnv, isWhoopIntegrationEnabled } from "@/utils/env";

const log = createLogger("server:integrations");

const WHOOP_AUTH_URL = "https://api.prod.whoop.com/oauth/oauth2/auth";
const WHOOP_SCOPES = [
  "read:profile",
  "read:body_measurement",
  "read:cycles",
  "read:recovery",
  "read:sleep",
  "read:workout",
  "offline",
];

export const startWhoopOAuth = createServerFn({ method: "POST" }).handler(
  async () => {
    const env = getEnv();

    if (!isWhoopIntegrationEnabled()) {
      throw new Error("WHOOP integration is disabled");
    }

    if (!env.WHOOP_CLIENT_ID || !env.WHOOP_REDIRECT_URL) {
      throw new Error("WHOOP_CLIENT_ID and WHOOP_REDIRECT_URL are required");
    }

    const headers = getRequestHeaders();
    const session = await auth.api.getSession({ headers });

    if (!session) {
      throw new Error("Authentication required");
    }

    const state = randomBytes(32).toString("hex");
    const stateHash = createHash("sha256").update(state).digest("hex");
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await prisma.integrationOAuthState.deleteMany({
      where: {
        userId: session.user.id,
        provider: "whoop",
      },
    });

    await prisma.integrationOAuthState.create({
      data: {
        userId: session.user.id,
        provider: "whoop",
        stateHash,
        expiresAt,
      },
    });

    const authUrl = new URL(WHOOP_AUTH_URL);
    authUrl.searchParams.set("response_type", "code");
    authUrl.searchParams.set("client_id", env.WHOOP_CLIENT_ID);
    authUrl.searchParams.set("redirect_uri", env.WHOOP_REDIRECT_URL);
    authUrl.searchParams.set("scope", WHOOP_SCOPES.join(" "));
    authUrl.searchParams.set("state", state);

    log.info({ userId: session.user.id }, "Starting WHOOP OAuth");

    return { url: authUrl.toString() };
  }
);
