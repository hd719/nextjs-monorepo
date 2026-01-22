import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import { DEFAULT_DEV_URL } from "@/constants";
import { getEnv, isDevelopment } from "@/utils/env";
import { createLogger } from "@/lib/logger";

const log = createLogger("lib:email");

export type EmailDeliveryMode = "log" | "ses";

export function getEmailDeliveryMode(): EmailDeliveryMode {
  const env = getEnv();
  if (env.EMAIL_DELIVERY_MODE) {
    return env.EMAIL_DELIVERY_MODE;
  }
  return isDevelopment() ? "log" : "ses";
}

const EMAIL_COLORS = {
  primary: "#0f172a",
  accent: "#06b6d4",
  background: "#f8fafc",
  muted: "#64748b",
  border: "#e2e8f0",
  card: "#ffffff",
};

type EmailTemplateParams = {
  title: string;
  preheader: string;
  bodyHtml: string;
  ctaText: string;
  ctaUrl: string;
  footerNote?: string;
};

function renderEmailTemplate({
  title,
  preheader,
  bodyHtml,
  ctaText,
  ctaUrl,
  footerNote,
}: EmailTemplateParams): string {
  return `
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">
      ${preheader}
    </div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:${EMAIL_COLORS.background};padding:24px 0;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;background:${EMAIL_COLORS.card};border:1px solid ${EMAIL_COLORS.border};border-radius:12px;overflow:hidden;">
            <tr>
              <td style="padding:28px 32px 8px 32px;">
                <h1 style="margin:0;font-family:Inter,Arial,sans-serif;font-size:22px;line-height:1.3;color:${EMAIL_COLORS.primary};">
                  ${title}
                </h1>
              </td>
            </tr>
            <tr>
              <td style="padding:4px 32px 20px 32px;font-family:Inter,Arial,sans-serif;font-size:15px;line-height:1.6;color:${EMAIL_COLORS.primary};">
                ${bodyHtml}
              </td>
            </tr>
            <tr>
              <td style="padding:0 32px 28px 32px;">
                <a href="${ctaUrl}" style="display:inline-block;background:${EMAIL_COLORS.accent};color:#ffffff;text-decoration:none;font-family:Inter,Arial,sans-serif;font-size:15px;font-weight:600;padding:12px 18px;border-radius:8px;">
                  ${ctaText}
                </a>
              </td>
            </tr>
            <tr>
              <td style="padding:0 32px 28px 32px;font-family:Inter,Arial,sans-serif;font-size:12px;line-height:1.5;color:${EMAIL_COLORS.muted};">
                ${footerNote ?? "If you didn't request this, you can ignore this email."}
              </td>
            </tr>
          </table>
          <p style="margin:16px 0 0 0;font-family:Inter,Arial,sans-serif;font-size:12px;color:${EMAIL_COLORS.muted};">
            HealthMetrics
          </p>
        </td>
      </tr>
    </table>
  `;
}

type SendEmailParams = {
  to: string;
  subject: string;
  html: string;
  text?: string;
};

function getSesClient(): SESClient {
  const env = getEnv();

  const missing: string[] = [];
  if (!env.SES_REGION) missing.push("SES_REGION");
  if (!env.AWS_ACCESS_KEY_ID) missing.push("AWS_ACCESS_KEY_ID");
  if (!env.AWS_SECRET_ACCESS_KEY) missing.push("AWS_SECRET_ACCESS_KEY");

  if (missing.length > 0) {
    log.error({ missing }, "Missing SES configuration");
    throw new Error(
      "SES env vars missing: SES_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY"
    );
  }

  return new SESClient({
    region: env.SES_REGION,
    credentials: {
      accessKeyId: env.AWS_ACCESS_KEY_ID,
      secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
    },
  });
}

export async function sendEmail({
  to,
  subject,
  html,
  text,
}: SendEmailParams): Promise<void> {
  if (getEmailDeliveryMode() === "log") {
    log.info(
      { to, subject },
      "EMAIL_DELIVERY_MODE=log; skipping SES send"
    );
    return;
  }

  const env = getEnv();

  if (!env.SES_FROM_EMAIL) {
    log.error({ missing: ["SES_FROM_EMAIL"] }, "Missing SES configuration");
    throw new Error("SES_FROM_EMAIL is required");
  }

  const sesClient = getSesClient();
  const command = new SendEmailCommand({
    Source: env.SES_FROM_EMAIL,
    Destination: {
      ToAddresses: [to],
    },
    Message: {
      Subject: { Data: subject },
      Body: {
        Html: { Data: html },
        Text: { Data: text || html.replace(/<[^>]*>/g, "") },
      },
    },
    ConfigurationSetName: env.SES_CONFIGURATION_SET || undefined,
  });

  await sesClient.send(command);
}

export async function sendVerificationEmail(
  email: string,
  token: string
): Promise<void> {
  const appUrl = getEnv().APP_URL || DEFAULT_DEV_URL;
  if (!appUrl) {
    throw new Error("APP_URL is required to build verification links");
  }
  const url = `${appUrl}/auth/verify-email?token=${token}`;

  await sendEmail({
    to: email,
    subject: "Verify your HealthMetrics account",
    html: renderEmailTemplate({
      title: "Verify your HealthMetrics account",
      preheader: "Confirm your email to finish setting up your account.",
      bodyHtml:
        "<p>Welcome to HealthMetrics! Please verify your email address by clicking the button below.</p>" +
        "<p>This link expires in 24 hours.</p>",
      ctaText: "Verify Email",
      ctaUrl: url,
    }),
  });
}

export async function sendPasswordResetEmail(
  email: string,
  token: string
): Promise<void> {
  const appUrl = getEnv().APP_URL || DEFAULT_DEV_URL;
  if (!appUrl) {
    throw new Error("APP_URL is required to build reset links");
  }
  const url = `${appUrl}/auth/reset-password?token=${token}`;

  await sendEmail({
    to: email,
    subject: "Reset your HealthMetrics password",
    html: renderEmailTemplate({
      title: "Reset your HealthMetrics password",
      preheader: "Reset your password securely.",
      bodyHtml:
        "<p>You requested to reset your password. Click the button below to continue.</p>" +
        "<p>This link expires in 1 hour.</p>",
      ctaText: "Reset Password",
      ctaUrl: url,
    }),
  });
}

export function logDevEmail(type: string, to: string, url: string, token: string) {
  if (!isDevelopment()) {
    return;
  }

  log.info(
    {
      type,
      to,
      url,
      token,
    },
    "DEV email output"
  );
}
