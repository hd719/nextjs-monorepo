import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";
import { createHash, randomBytes } from "crypto";
import { z } from "zod";
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

const whoopCallbackSchema = z.object({
  code: z.string().min(1),
  state: z.string().min(8),
});

function generateRequestId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 10);
  return `req_${timestamp}_${random}`;
}

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
    // "state" is the random CSRF (Cross-Site Request Forgery) token we generated in startWhoopOAuth
    // we hash it so we can store/compare securely without keeping the raw value in DB.
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
  },
);

export const completeWhoopOAuth = createServerFn({ method: "POST" })
  .inputValidator((data: z.infer<typeof whoopCallbackSchema>) => {
    whoopCallbackSchema.parse(data);
    return data;
  })
  .handler(async ({ data: { code, state } }) => {
    const env = getEnv();

    if (!isWhoopIntegrationEnabled()) {
      throw new Error("WHOOP integration is disabled");
    }

    if (!env.WHOOP_REDIRECT_URL) {
      throw new Error("WHOOP_REDIRECT_URL is required");
    }

    const serviceUrl = env.GO_SERVICE_URL;
    if (!serviceUrl) {
      throw new Error("GO_SERVICE_URL is required for WHOOP integration");
    }

    const headers = getRequestHeaders();
    const session = await auth.api.getSession({ headers });

    if (!session) {
      throw new Error("Authentication required");
    }

    const stateHash = createHash("sha256").update(state).digest("hex");
    const now = new Date();

    const stateRecord = await prisma.integrationOAuthState.findFirst({
      where: {
        userId: session.user.id,
        provider: "whoop",
        stateHash,
        expiresAt: { gt: now },
      },
    });

    if (!stateRecord) {
      log.warn(
        { userId: session.user.id },
        "WHOOP OAuth state invalid or expired",
      );
      throw new Error("Invalid or expired OAuth state");
    }

    await prisma.integrationOAuthState.delete({
      where: { id: stateRecord.id },
    });

    const requestId = generateRequestId();
    const cookieHeader = headers.get("cookie") || "";

    const serviceHeaders: Record<string, string> = {
      Accept: "application/json",
      "Content-Type": "application/json",
      "X-Request-ID": requestId,
      "X-User-ID": session.user.id,
    };

    if (env.BARCODE_SERVICE_API_KEY) {
      serviceHeaders["X-API-Key"] = env.BARCODE_SERVICE_API_KEY;
    } else {
      log.warn(
        { requestId },
        "BARCODE_SERVICE_API_KEY not configured - service auth disabled",
      );
    }

    if (cookieHeader) {
      serviceHeaders["Cookie"] = cookieHeader;
    }

    const response = await fetch(
      `${serviceUrl}/internal/whoop/oauth/exchange`,
      {
        method: "POST",
        headers: serviceHeaders,
        body: JSON.stringify({
          userId: session.user.id,
          code,
          redirectUri: env.WHOOP_REDIRECT_URL,
        }),
      },
    );

    if (response.status === 401) {
      log.warn(
        { requestId, userId: session.user.id },
        "WHOOP exchange rejected authentication",
      );
      throw new Error("Authentication failed");
    }

    if (response.status === 403) {
      log.warn(
        { requestId, userId: session.user.id },
        "WHOOP exchange rejected authorization",
      );
      throw new Error("Not authorized to link WHOOP");
    }

    if (!response.ok) {
      const errorText = await response.text();
      log.error(
        { requestId, status: response.status, error: errorText },
        "WHOOP exchange failed",
      );
      throw new Error("Failed to connect WHOOP. Please try again.");
    }

    log.info(
      { requestId, userId: session.user.id },
      "WHOOP OAuth exchange succeeded",
    );

    return { status: "ok" };
  });

export const getWhoopIntegrationStatus = createServerFn({ method: "GET" }).handler(
  async () => {
    if (!isWhoopIntegrationEnabled()) {
      throw new Error("WHOOP integration is disabled");
    }

    const headers = getRequestHeaders();
    const session = await auth.api.getSession({ headers });

    if (!session) {
      throw new Error("Authentication required");
    }

    const integration = await prisma.integration.findUnique({
      where: {
        userId_provider: {
          userId: session.user.id,
          provider: "whoop",
        },
      },
      select: {
        status: true,
        lastSyncAt: true,
      },
    });

    return {
      status: integration?.status ?? "disconnected",
      lastSyncAt: integration?.lastSyncAt ?? null,
    };
  }
);

export const triggerWhoopSync = createServerFn({ method: "POST" }).handler(
  async () => {
    const env = getEnv();

    if (!isWhoopIntegrationEnabled()) {
      throw new Error("WHOOP integration is disabled");
    }

    const serviceUrl = env.GO_SERVICE_URL;
    if (!serviceUrl) {
      throw new Error("GO_SERVICE_URL is required for WHOOP sync");
    }

    const headers = getRequestHeaders();
    const session = await auth.api.getSession({ headers });

    if (!session) {
      throw new Error("Authentication required");
    }

    const requestId = generateRequestId();
    const cookieHeader = headers.get("cookie") || "";

    const serviceHeaders: Record<string, string> = {
      Accept: "application/json",
      "Content-Type": "application/json",
      "X-Request-ID": requestId,
      "X-User-ID": session.user.id,
    };

    if (env.BARCODE_SERVICE_API_KEY) {
      serviceHeaders["X-API-Key"] = env.BARCODE_SERVICE_API_KEY;
    } else {
      log.warn(
        { requestId },
        "BARCODE_SERVICE_API_KEY not configured - service auth disabled"
      );
    }

    if (cookieHeader) {
      serviceHeaders["Cookie"] = cookieHeader;
    }

    const response = await fetch(`${serviceUrl}/internal/whoop/sync`, {
      method: "POST",
      headers: serviceHeaders,
      body: JSON.stringify({ userId: session.user.id }),
    });

    if (response.status === 401) {
      log.warn(
        { requestId, userId: session.user.id },
        "WHOOP sync rejected authentication"
      );
      throw new Error("Authentication failed");
    }

    if (response.status === 403) {
      log.warn(
        { requestId, userId: session.user.id },
        "WHOOP sync rejected authorization"
      );
      throw new Error("Not authorized to sync WHOOP");
    }

    if (!response.ok) {
      const errorText = await response.text();
      log.error(
        { requestId, status: response.status, error: errorText },
        "WHOOP sync failed"
      );
      throw new Error("Failed to sync WHOOP. Please try again.");
    }

    log.info(
      { requestId, userId: session.user.id },
      "WHOOP sync triggered"
    );

    return { status: "ok" };
  }
);

export const disconnectWhoop = createServerFn({ method: "POST" }).handler(
  async () => {
    const env = getEnv();

    if (!isWhoopIntegrationEnabled()) {
      throw new Error("WHOOP integration is disabled");
    }

    const serviceUrl = env.GO_SERVICE_URL;
    if (!serviceUrl) {
      throw new Error("GO_SERVICE_URL is required for WHOOP disconnect");
    }

    const headers = getRequestHeaders();
    const session = await auth.api.getSession({ headers });

    if (!session) {
      throw new Error("Authentication required");
    }

    const requestId = generateRequestId();
    const cookieHeader = headers.get("cookie") || "";

    const serviceHeaders: Record<string, string> = {
      Accept: "application/json",
      "Content-Type": "application/json",
      "X-Request-ID": requestId,
      "X-User-ID": session.user.id,
    };

    if (env.BARCODE_SERVICE_API_KEY) {
      serviceHeaders["X-API-Key"] = env.BARCODE_SERVICE_API_KEY;
    } else {
      log.warn(
        { requestId },
        "BARCODE_SERVICE_API_KEY not configured - service auth disabled"
      );
    }

    if (cookieHeader) {
      serviceHeaders["Cookie"] = cookieHeader;
    }

    const response = await fetch(`${serviceUrl}/internal/whoop/disconnect`, {
      method: "POST",
      headers: serviceHeaders,
      body: JSON.stringify({ userId: session.user.id }),
    });

    if (response.status === 401) {
      log.warn(
        { requestId, userId: session.user.id },
        "WHOOP disconnect rejected authentication"
      );
      throw new Error("Authentication failed");
    }

    if (response.status === 403) {
      log.warn(
        { requestId, userId: session.user.id },
        "WHOOP disconnect rejected authorization"
      );
      throw new Error("Not authorized to disconnect WHOOP");
    }

    if (!response.ok) {
      const errorText = await response.text();
      log.error(
        { requestId, status: response.status, error: errorText },
        "WHOOP disconnect failed"
      );
      throw new Error("Failed to disconnect WHOOP. Please try again.");
    }

    log.info(
      { requestId, userId: session.user.id },
      "WHOOP disconnected"
    );

    return { status: "ok" };
  }
);
