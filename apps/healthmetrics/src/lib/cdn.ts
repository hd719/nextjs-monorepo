import { getSignedUrl } from "@aws-sdk/cloudfront-signer";
import { z } from "zod";
import { getEnv } from "@/utils/env";
import { createLogger } from "@/lib/logger";

const log = createLogger("lib:cdn");

const pemSchema = z
  .string()
  .trim()
  .transform((raw) => (raw.includes("\\n") ? raw.replaceAll("\\n", "\n") : raw))
  .refine((raw) => raw.includes("BEGIN"), {
    message: "Expected PEM format",
  });

const base64Schema = z
  .string()
  .trim()
  .base64()
  .transform((val) => Buffer.from(val, "base64").toString("utf8"))
  .refine((decoded) => decoded.includes("BEGIN"), {
    message: "Expected base64-encoded PEM",
  });

const privateKeySchema = z.union([pemSchema, base64Schema]);

function getPrivateKey(): string {
  const env = getEnv();
  if (!env.CLOUDFRONT_PRIVATE_KEY) {
    throw new Error("CLOUDFRONT_PRIVATE_KEY is required");
  }

  const raw = env.CLOUDFRONT_PRIVATE_KEY;
  const result = privateKeySchema.safeParse(raw);
  if (!result.success) {
    log.error(
      { reason: result.error.issues[0]?.message },
      "Invalid CloudFront private key format"
    );
    throw new Error(
      "CLOUDFRONT_PRIVATE_KEY must be PEM or base64-encoded PEM"
    );
  }

  return result.data;
}

export function signCdnUrl(path: string, expiresInSeconds = 300): string {
  const env = getEnv();
  if (!env.CLOUDFRONT_URL || !env.CLOUDFRONT_KEY_PAIR_ID) {
    throw new Error("CLOUDFRONT_URL and CLOUDFRONT_KEY_PAIR_ID are required");
  }

  const baseUrl = env.CLOUDFRONT_URL.replace(/\/+$/, "");
  const normalizedPath = path.replace(/^\/+/, "");
  const url = `${baseUrl}/${normalizedPath}`;
  const expires = new Date(Date.now() + expiresInSeconds * 1000).toISOString();

  return getSignedUrl({
    url,
    dateLessThan: expires,
    keyPairId: env.CLOUDFRONT_KEY_PAIR_ID,
    privateKey: getPrivateKey(),
  });
}
