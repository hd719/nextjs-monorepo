# PRD: AWS Infrastructure (S3 + SES) with Terraform

## Overview

This PRD defines the AWS infrastructure required for HealthMetrics production deployment, managed via Terraform. It covers file storage (S3 with CloudFront CDN) and transactional email (SES).

---

## Problem Statement

HealthMetrics requires:
1. **File storage** for user avatars and future photo uploads (progress photos, food photos)
2. **Transactional email** for account verification, password reset, and notifications

Currently, both are mocked in development. Production requires real infrastructure with proper security, scalability, and cost management.

---

## Goals

1. **Infrastructure as Code** - All resources defined in Terraform for reproducibility
2. **Secure by default** - Least-privilege IAM, encryption at rest and in transit
3. **Cost-effective** - Minimal spend at low usage, scales with growth
4. **CDN delivery** - Fast global file access via CloudFront
5. **Email deliverability** - Proper domain verification for inbox placement

---

## Non-Goals

- Multi-region deployment (single region for v1)
- Custom email templates (handled in application code)
- Image transformation/resizing (future enhancement)
- Video uploads (out of scope)

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              AWS ACCOUNT                                     │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                         FILE STORAGE                                 │    │
│  │                                                                      │    │
│  │   ┌──────────────┐      ┌──────────────┐      ┌──────────────┐      │    │
│  │   │   Browser    │ ---> │  CloudFront  │ ---> │     S3       │      │    │
│  │   │   (upload)   │      │   (CDN)      │      │   Bucket     │      │    │
│  │   └──────────────┘      └──────────────┘      └──────────────┘      │    │
│  │          │                                           │               │    │
│  │          │ presigned URL                             │               │    │
│  │          ▼                                           │               │    │
│  │   ┌──────────────┐                                   │               │    │
│  │   │  App Server  │ ─────────────────────────────────►│               │    │
│  │   │  (generate)  │       (IAM credentials)           │               │    │
│  │   └──────────────┘                                                   │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                           EMAIL                                      │    │
│  │                                                                      │    │
│  │   ┌──────────────┐      ┌──────────────┐      ┌──────────────┐      │    │
│  │   │  App Server  │ ---> │     SES      │ ---> │  User Inbox  │      │    │
│  │   │  (send)      │      │   (SMTP)     │      │              │      │    │
│  │   └──────────────┘      └──────────────┘      └──────────────┘      │    │
│  │                                │                                     │    │
│  │                                │ verification                        │    │
│  │                                ▼                                     │    │
│  │                         ┌──────────────┐                             │    │
│  │                         │  Route 53    │                             │    │
│  │                         │  (DNS)       │                             │    │
│  │                         └──────────────┘                             │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Technical Specification

### Project Structure

```
infrastructure/
├── terraform/
│   ├── main.tf              # Provider configuration
│   ├── variables.tf         # Input variables
│   ├── outputs.tf           # Output values
│   ├── s3.tf                # S3 bucket + policies
│   ├── cloudfront.tf        # CloudFront distribution
│   ├── ses.tf               # SES configuration
│   ├── iam.tf               # IAM users and policies
│   └── terraform.tfvars     # Variable values (gitignored)
├── .gitignore
└── README.md
```

---

## Terraform Configuration

### 1. Provider Configuration (`main.tf`)

```hcl
# main.tf

terraform {
  required_version = ">= 1.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  # Recommended: Store state remotely
  # backend "s3" {
  #   bucket = "healthmetrics-terraform-state"
  #   key    = "prod/terraform.tfstate"
  #   region = "us-east-1"
  # }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = "healthmetrics"
      Environment = var.environment
      ManagedBy   = "terraform"
    }
  }
}

# CloudFront requires ACM certificates in us-east-1
provider "aws" {
  alias  = "us_east_1"
  region = "us-east-1"
}
```

### 2. Variables (`variables.tf`)

```hcl
# variables.tf

variable "aws_region" {
  description = "AWS region for resources"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Environment name (dev, staging, prod)"
  type        = string
  default     = "prod"
}

variable "app_name" {
  description = "Application name"
  type        = string
  default     = "healthmetrics"
}

variable "domain_name" {
  description = "Primary domain name"
  type        = string
  default     = "healthmetrics.com"
}

variable "cors_allowed_origins" {
  description = "Allowed origins for CORS"
  type        = list(string)
  default     = ["https://healthmetrics.com", "https://www.healthmetrics.com"]
}

# For development, add localhost
# default = ["https://healthmetrics.com", "http://localhost:3003"]
```

### 3. S3 Bucket (`s3.tf`)

```hcl
# s3.tf

# Main uploads bucket
resource "aws_s3_bucket" "uploads" {
  bucket = "${var.app_name}-uploads-${var.environment}"

  tags = {
    Name = "User uploads bucket"
  }
}

# Enable versioning for accidental deletion protection
resource "aws_s3_bucket_versioning" "uploads" {
  bucket = aws_s3_bucket.uploads.id

  versioning_configuration {
    status = "Enabled"
  }
}

# Server-side encryption
resource "aws_s3_bucket_server_side_encryption_configuration" "uploads" {
  bucket = aws_s3_bucket.uploads.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

# Block all public access (CloudFront will access via OAC)
resource "aws_s3_bucket_public_access_block" "uploads" {
  bucket = aws_s3_bucket.uploads.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# CORS configuration for browser uploads
resource "aws_s3_bucket_cors_configuration" "uploads" {
  bucket = aws_s3_bucket.uploads.id

  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["GET", "PUT", "POST", "HEAD"]
    allowed_origins = var.cors_allowed_origins
    expose_headers  = ["ETag"]
    max_age_seconds = 3600
  }
}

# Lifecycle policy - delete incomplete multipart uploads
resource "aws_s3_bucket_lifecycle_configuration" "uploads" {
  bucket = aws_s3_bucket.uploads.id

  rule {
    id     = "abort-incomplete-multipart"
    status = "Enabled"

    abort_incomplete_multipart_upload {
      days_after_initiation = 7
    }
  }

  # Optional: Move old versions to cheaper storage
  rule {
    id     = "transition-old-versions"
    status = "Enabled"

    noncurrent_version_transition {
      noncurrent_days = 30
      storage_class   = "STANDARD_IA"
    }

    noncurrent_version_expiration {
      noncurrent_days = 90
    }
  }
}

# Bucket policy allowing CloudFront access
resource "aws_s3_bucket_policy" "uploads" {
  bucket = aws_s3_bucket.uploads.id
  policy = data.aws_iam_policy_document.uploads_bucket_policy.json
}

data "aws_iam_policy_document" "uploads_bucket_policy" {
  # Allow CloudFront to read objects
  statement {
    sid    = "AllowCloudFrontRead"
    effect = "Allow"

    principals {
      type        = "Service"
      identifiers = ["cloudfront.amazonaws.com"]
    }

    actions   = ["s3:GetObject"]
    resources = ["${aws_s3_bucket.uploads.arn}/*"]

    condition {
      test     = "StringEquals"
      variable = "AWS:SourceArn"
      values   = [aws_cloudfront_distribution.uploads.arn]
    }
  }
}
```

### 4. CloudFront CDN (`cloudfront.tf`)

```hcl
# cloudfront.tf

# Origin Access Control for secure S3 access
resource "aws_cloudfront_origin_access_control" "uploads" {
  name                              = "${var.app_name}-uploads-oac"
  description                       = "OAC for uploads bucket"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

# CloudFront distribution
resource "aws_cloudfront_distribution" "uploads" {
  enabled             = true
  is_ipv6_enabled     = true
  comment             = "CDN for ${var.app_name} uploads"
  default_root_object = ""
  price_class         = "PriceClass_100" # Use only NA and EU edge locations (cheapest)

  origin {
    domain_name              = aws_s3_bucket.uploads.bucket_regional_domain_name
    origin_id                = "S3-${aws_s3_bucket.uploads.id}"
    origin_access_control_id = aws_cloudfront_origin_access_control.uploads.id
  }

  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD", "OPTIONS"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "S3-${aws_s3_bucket.uploads.id}"

    forwarded_values {
      query_string = false

      cookies {
        forward = "none"
      }
    }

    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 86400    # 1 day
    max_ttl                = 31536000 # 1 year
    compress               = true
  }

  # Cache avatars aggressively (they rarely change)
  ordered_cache_behavior {
    path_pattern     = "avatars/*"
    allowed_methods  = ["GET", "HEAD"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "S3-${aws_s3_bucket.uploads.id}"

    forwarded_values {
      query_string = false

      cookies {
        forward = "none"
      }
    }

    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 86400     # 1 day minimum
    default_ttl            = 604800    # 1 week
    max_ttl                = 31536000  # 1 year
    compress               = true
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    cloudfront_default_certificate = true
    # For custom domain, use ACM certificate:
    # acm_certificate_arn      = aws_acm_certificate.cdn.arn
    # ssl_support_method       = "sni-only"
    # minimum_protocol_version = "TLSv1.2_2021"
  }

  tags = {
    Name = "Uploads CDN"
  }
}
```

### 5. SES Email (`ses.tf`)

```hcl
# ses.tf

# Domain identity for sending emails
resource "aws_ses_domain_identity" "main" {
  domain = var.domain_name
}

# Domain verification
resource "aws_ses_domain_identity_verification" "main" {
  domain = aws_ses_domain_identity.main.id

  depends_on = [aws_route53_record.ses_verification]
}

# DKIM for email authentication
resource "aws_ses_domain_dkim" "main" {
  domain = aws_ses_domain_identity.main.domain
}

# Mail FROM domain (for SPF)
resource "aws_ses_domain_mail_from" "main" {
  domain           = aws_ses_domain_identity.main.domain
  mail_from_domain = "mail.${var.domain_name}"
}

# DNS Records (if using Route 53)
# If using external DNS, output these values and add manually

data "aws_route53_zone" "main" {
  name         = var.domain_name
  private_zone = false
}

# SES verification TXT record
resource "aws_route53_record" "ses_verification" {
  zone_id = data.aws_route53_zone.main.zone_id
  name    = "_amazonses.${var.domain_name}"
  type    = "TXT"
  ttl     = 600
  records = [aws_ses_domain_identity.main.verification_token]
}

# DKIM records
resource "aws_route53_record" "ses_dkim" {
  count   = 3
  zone_id = data.aws_route53_zone.main.zone_id
  name    = "${aws_ses_domain_dkim.main.dkim_tokens[count.index]}._domainkey.${var.domain_name}"
  type    = "CNAME"
  ttl     = 600
  records = ["${aws_ses_domain_dkim.main.dkim_tokens[count.index]}.dkim.amazonses.com"]
}

# SPF record for Mail FROM
resource "aws_route53_record" "ses_spf" {
  zone_id = data.aws_route53_zone.main.zone_id
  name    = "mail.${var.domain_name}"
  type    = "TXT"
  ttl     = 600
  records = ["v=spf1 include:amazonses.com ~all"]
}

# MX record for Mail FROM
resource "aws_route53_record" "ses_mx" {
  zone_id = data.aws_route53_zone.main.zone_id
  name    = "mail.${var.domain_name}"
  type    = "MX"
  ttl     = 600
  records = ["10 feedback-smtp.${var.aws_region}.amazonses.com"]
}

# DMARC record (recommended for deliverability)
resource "aws_route53_record" "dmarc" {
  zone_id = data.aws_route53_zone.main.zone_id
  name    = "_dmarc.${var.domain_name}"
  type    = "TXT"
  ttl     = 600
  records = ["v=DMARC1; p=quarantine; rua=mailto:dmarc@${var.domain_name}"]
}

# Configuration set for tracking
resource "aws_ses_configuration_set" "main" {
  name = "${var.app_name}-${var.environment}"

  delivery_options {
    tls_policy = "REQUIRE"
  }

  reputation_metrics_enabled = true
}

# Email templates (optional - can also be defined in app code)
resource "aws_ses_template" "verification" {
  name    = "email-verification"
  subject = "Verify your HealthMetrics account"
  html    = <<EOF
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .button { display: inline-block; padding: 12px 24px; background: #10b981; color: white; text-decoration: none; border-radius: 6px; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Welcome to HealthMetrics!</h1>
    <p>Please verify your email address by clicking the button below:</p>
    <p><a href="{{verification_url}}" class="button">Verify Email</a></p>
    <p>This link expires in 24 hours.</p>
    <p>If you didn't create an account, you can ignore this email.</p>
  </div>
</body>
</html>
EOF
  text    = "Welcome to HealthMetrics! Please verify your email by visiting: {{verification_url}}"
}

resource "aws_ses_template" "password_reset" {
  name    = "password-reset"
  subject = "Reset your HealthMetrics password"
  html    = <<EOF
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .button { display: inline-block; padding: 12px 24px; background: #10b981; color: white; text-decoration: none; border-radius: 6px; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Password Reset</h1>
    <p>You requested to reset your password. Click the button below:</p>
    <p><a href="{{reset_url}}" class="button">Reset Password</a></p>
    <p>This link expires in 1 hour.</p>
    <p>If you didn't request this, you can ignore this email.</p>
  </div>
</body>
</html>
EOF
  text    = "Reset your password by visiting: {{reset_url}}"
}
```

### 6. IAM Users and Policies (`iam.tf`)

```hcl
# iam.tf

# IAM user for application (S3 + SES access)
resource "aws_iam_user" "app" {
  name = "${var.app_name}-app-${var.environment}"

  tags = {
    Name = "Application service account"
  }
}

# Access keys for the app user
resource "aws_iam_access_key" "app" {
  user = aws_iam_user.app.name
}

# S3 upload policy
resource "aws_iam_user_policy" "app_s3" {
  name = "s3-uploads-policy"
  user = aws_iam_user.app.name

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "AllowUploadOperations"
        Effect = "Allow"
        Action = [
          "s3:PutObject",
          "s3:GetObject",
          "s3:DeleteObject",
          "s3:ListBucket"
        ]
        Resource = [
          aws_s3_bucket.uploads.arn,
          "${aws_s3_bucket.uploads.arn}/*"
        ]
      }
    ]
  })
}

# SES sending policy
resource "aws_iam_user_policy" "app_ses" {
  name = "ses-sending-policy"
  user = aws_iam_user.app.name

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "AllowSendEmail"
        Effect = "Allow"
        Action = [
          "ses:SendEmail",
          "ses:SendRawEmail",
          "ses:SendTemplatedEmail"
        ]
        Resource = "*"
        Condition = {
          StringEquals = {
            "ses:FromAddress" = "noreply@${var.domain_name}"
          }
        }
      }
    ]
  })
}
```

### 7. Outputs (`outputs.tf`)

```hcl
# outputs.tf

# S3 Outputs
output "s3_bucket_name" {
  description = "Name of the uploads S3 bucket"
  value       = aws_s3_bucket.uploads.id
}

output "s3_bucket_arn" {
  description = "ARN of the uploads S3 bucket"
  value       = aws_s3_bucket.uploads.arn
}

# CloudFront Outputs
output "cloudfront_distribution_id" {
  description = "ID of the CloudFront distribution"
  value       = aws_cloudfront_distribution.uploads.id
}

output "cloudfront_domain_name" {
  description = "Domain name of the CloudFront distribution"
  value       = aws_cloudfront_distribution.uploads.domain_name
}

output "cloudfront_url" {
  description = "Full URL for CloudFront distribution"
  value       = "https://${aws_cloudfront_distribution.uploads.domain_name}"
}

# SES Outputs
output "ses_domain_identity_arn" {
  description = "ARN of the SES domain identity"
  value       = aws_ses_domain_identity.main.arn
}

output "ses_verification_status" {
  description = "SES domain verification status"
  value       = aws_ses_domain_identity.main.verification_status
}

# IAM Outputs (Sensitive)
output "app_access_key_id" {
  description = "Access key ID for application"
  value       = aws_iam_access_key.app.id
  sensitive   = true
}

output "app_secret_access_key" {
  description = "Secret access key for application"
  value       = aws_iam_access_key.app.secret
  sensitive   = true
}

# Environment Variables Output
output "environment_variables" {
  description = "Environment variables to add to your application"
  value       = <<-EOT
    # Add these to your production environment:

    AWS_ACCESS_KEY_ID=${aws_iam_access_key.app.id}
    AWS_SECRET_ACCESS_KEY=<run: terraform output -raw app_secret_access_key>
    AWS_REGION=${var.aws_region}
    S3_BUCKET_NAME=${aws_s3_bucket.uploads.id}
    CLOUDFRONT_URL=https://${aws_cloudfront_distribution.uploads.domain_name}
    SES_FROM_EMAIL=noreply@${var.domain_name}
    SES_REGION=${var.aws_region}
  EOT
  sensitive   = true
}
```

---

## Application Integration

### S3 Presigned URL Generation

```typescript
// src/lib/storage.ts

import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const BUCKET = process.env.S3_BUCKET_NAME!;
const CDN_URL = process.env.CLOUDFRONT_URL!;

/**
 * Generate a presigned URL for uploading a file
 */
export async function getUploadUrl(
  userId: string,
  fileName: string,
  contentType: string
): Promise<{ uploadUrl: string; publicUrl: string; key: string }> {
  const ext = fileName.split(".").pop() || "jpg";
  const key = `avatars/${userId}/${Date.now()}.${ext}`;

  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    ContentType: contentType,
    // Metadata for tracking
    Metadata: {
      "user-id": userId,
      "original-name": fileName,
    },
  });

  // URL expires in 5 minutes
  const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 });

  return {
    uploadUrl,
    publicUrl: `${CDN_URL}/${key}`,
    key,
  };
}

/**
 * Delete a file from S3
 */
export async function deleteFile(key: string): Promise<void> {
  const command = new DeleteObjectCommand({
    Bucket: BUCKET,
    Key: key,
  });

  await s3Client.send(command);
}
```

### SES Email Sending

```typescript
// src/lib/email.ts

import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

const sesClient = new SESClient({
  region: process.env.SES_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const FROM_EMAIL = process.env.SES_FROM_EMAIL!;

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * Send an email via SES
 */
export async function sendEmail({
  to,
  subject,
  html,
  text,
}: SendEmailParams): Promise<void> {
  const command = new SendEmailCommand({
    Source: FROM_EMAIL,
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
  });

  await sesClient.send(command);
}

/**
 * Send verification email
 */
export async function sendVerificationEmail(
  email: string,
  token: string
): Promise<void> {
  const url = `${process.env.APP_URL}/auth/verify-email?token=${token}`;

  await sendEmail({
    to: email,
    subject: "Verify your HealthMetrics account",
    html: `
      <h1>Welcome to HealthMetrics!</h1>
      <p>Please verify your email address by clicking the link below:</p>
      <p><a href="${url}">Verify Email</a></p>
      <p>This link expires in 24 hours.</p>
    `,
  });
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(
  email: string,
  token: string
): Promise<void> {
  const url = `${process.env.APP_URL}/auth/reset-password?token=${token}`;

  await sendEmail({
    to: email,
    subject: "Reset your HealthMetrics password",
    html: `
      <h1>Password Reset</h1>
      <p>You requested to reset your password. Click the link below:</p>
      <p><a href="${url}">Reset Password</a></p>
      <p>This link expires in 1 hour.</p>
      <p>If you didn't request this, you can ignore this email.</p>
    `,
  });
}
```

### Update Better Auth Config

```typescript
// src/lib/auth-config.ts

import { sendVerificationEmail, sendPasswordResetEmail } from "./email";

export const auth = betterAuth({
  // ... existing config

  emailVerification: {
    sendVerificationEmail: async ({ user, token }) => {
      // Development: log to console
      if (process.env.NODE_ENV === "development") {
        const url = `${process.env.APP_URL}/auth/verify-email?token=${token}`;
        console.log("Verification URL:", url);
        return;
      }

      // Production: send via SES
      await sendVerificationEmail(user.email, token);
    },
  },

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, token }) => {
      if (process.env.NODE_ENV === "development") {
        const url = `${process.env.APP_URL}/auth/reset-password?token=${token}`;
        console.log("Reset URL:", url);
        return;
      }

      await sendPasswordResetEmail(user.email, token);
    },
  },
});
```

---

## Implementation Plan

### Phase 1: AWS Account & Terraform Setup (Day 1)

| Task | Effort | Status |
|------|--------|--------|
| Create AWS account if needed | 30m | 🔲 |
| Set up IAM admin user | 30m | 🔲 |
| Install Terraform | 15m | 🔲 |
| Create infrastructure folder | 15m | 🔲 |
| Write Terraform configuration | 2h | 🔲 |
| Test `terraform plan` | 30m | 🔲 |

### Phase 2: Deploy Infrastructure (Day 2)

| Task | Effort | Status |
|------|--------|--------|
| Run `terraform apply` | 30m | 🔲 |
| Verify S3 bucket created | 15m | 🔲 |
| Verify CloudFront distribution | 15m | 🔲 |
| Add DNS records for SES | 1h | 🔲 |
| Wait for SES domain verification | 24-48h | 🔲 |
| Request SES production access | 24-48h | 🔲 |

### Phase 3: Application Integration (Day 3)

| Task | Effort | Status |
|------|--------|--------|
| Install AWS SDK packages | 15m | 🔲 |
| Implement storage.ts | 1h | 🔲 |
| Implement email.ts | 1h | 🔲 |
| Update auth-config.ts | 30m | 🔲 |
| Update avatar upload flow | 2h | 🔲 |
| Test file uploads | 1h | 🔲 |
| Test email sending | 1h | 🔲 |

### Phase 4: Testing & Polish (Day 4)

| Task | Effort | Status |
|------|--------|--------|
| Test avatar upload end-to-end | 1h | 🔲 |
| Test email verification flow | 1h | 🔲 |
| Test password reset flow | 1h | 🔲 |
| Verify CloudFront caching | 30m | 🔲 |
| Check email deliverability | 30m | 🔲 |
| Document environment variables | 30m | 🔲 |

---

## Terraform Commands

```bash
# Navigate to infrastructure folder
cd infrastructure/terraform

# Initialize Terraform
terraform init

# Preview changes
terraform plan

# Apply changes
terraform apply

# Show outputs
terraform output

# Get sensitive outputs
terraform output -raw app_secret_access_key

# Destroy infrastructure (careful!)
terraform destroy
```

---

## Cost Estimates

### S3 Storage

| Users | Avg File Size | Total Storage | Monthly Cost |
|-------|---------------|---------------|--------------|
| 100 | 200 KB | 20 MB | $0.00 |
| 1,000 | 200 KB | 200 MB | $0.01 |
| 10,000 | 200 KB | 2 GB | $0.05 |
| 100,000 | 200 KB | 20 GB | $0.46 |

### CloudFront

| Monthly Requests | Data Transfer | Monthly Cost |
|------------------|---------------|--------------|
| 10,000 | 1 GB | $0.09 |
| 100,000 | 10 GB | $0.94 |
| 1,000,000 | 100 GB | $9.35 |

### SES

| Emails/Month | Monthly Cost |
|--------------|--------------|
| 1,000 | $0.10 |
| 10,000 | $1.00 |
| 100,000 | $10.00 |

### Total Estimated Cost

| Scale | S3 | CloudFront | SES | Total |
|-------|-----|------------|-----|-------|
| Small (100 users) | $0.01 | $0.10 | $0.10 | **$0.21** |
| Medium (1K users) | $0.01 | $0.50 | $0.50 | **$1.01** |
| Large (10K users) | $0.10 | $2.00 | $2.00 | **$4.10** |

---

## Security Considerations

1. **IAM Least Privilege** - App user can only access specific bucket and send from specific email
2. **Encryption** - S3 bucket uses server-side encryption (AES-256)
3. **HTTPS Only** - CloudFront forces HTTPS, SES requires TLS
4. **Presigned URLs** - Upload URLs expire in 5 minutes
5. **CORS Restrictions** - Only allowed origins can upload
6. **Email Authentication** - SPF, DKIM, DMARC configured for deliverability

---

## Monitoring

### CloudWatch Alarms (Optional)

```hcl
# Add to main.tf for production monitoring

resource "aws_cloudwatch_metric_alarm" "ses_bounce_rate" {
  alarm_name          = "${var.app_name}-ses-bounce-rate"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 1
  metric_name         = "Bounce"
  namespace           = "AWS/SES"
  period              = 3600
  statistic           = "Sum"
  threshold           = 50
  alarm_description   = "High email bounce rate"

  dimensions = {
    ConfigurationSetName = aws_ses_configuration_set.main.name
  }
}
```

---

## Acceptance Criteria

- [ ] S3 bucket created with proper encryption and CORS
- [ ] CloudFront distribution serves files via HTTPS
- [ ] SES domain verified and out of sandbox
- [ ] IAM user has minimal required permissions
- [ ] Avatar uploads work end-to-end
- [ ] Verification emails delivered to inbox (not spam)
- [ ] Password reset emails delivered to inbox
- [ ] All credentials stored securely (not in code)
- [ ] Terraform state managed properly
