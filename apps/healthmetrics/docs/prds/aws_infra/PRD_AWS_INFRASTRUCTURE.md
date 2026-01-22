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

## Decisions (v0)

- **Domain**: `healthmetricsapp.com` (DNS hosted at Porkbun)
- **Region**: `us-east-1`
- **Storage**: single S3 bucket with prefixes (`avatars/`, `progress/`, `food/`)
- **Access**: private S3 + CloudFront with **signed URLs**
- **Upload method**: **presigned POST** with size/type enforcement
- **Lifecycle**: abort multipart (7 days); noncurrent → STANDARD_IA (30 days); noncurrent delete (90 days)
- **Logging**: CloudTrail on; CloudFront/S3 access logs off for v0
- **Email**: SES API; DMARC starts at `p=none`; metrics only (no SNS yet)
- **CDN domain**: custom `cdn.healthmetricsapp.com` (ACM in us-east-1 + CNAME in Porkbun)
- **Hosting**: TBD (EC2/ECS/Netlify; decide later)

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
│  │   │  (send)      │      │   (API)      │      │              │      │    │
│  │   └──────────────┘      └──────────────┘      └──────────────┘      │    │
│  │                                │                                     │    │
│  │                                │ verification                        │    │
│  │                                ▼                                     │    │
│  │                         ┌──────────────┐                             │    │
│  │                         │     DNS      │                             │    │
│  │                         │  (Porkbun)   │                             │    │
│  │                         └──────────────┘                             │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Technical Specification

### Project Structure

```
apps/
└── healthmetrics-infra/
    ├── terraform/
    │   ├── main.tf              # Provider configuration
    │   ├── variables.tf         # Input variables
    │   ├── outputs.tf           # Output values
    │   ├── s3.tf                # S3 bucket + policies
    │   ├── cloudfront.tf        # CloudFront distribution
    │   ├── acm.tf               # ACM cert for custom CDN domain
    │   ├── ses.tf               # SES configuration
    │   ├── iam.tf               # IAM users and policies
    │   ├── keys/                # CloudFront public key only (private key stored securely)
    │   └── terraform.tfvars     # Variable values (gitignored)
    ├── bootstrap/               # One-time state backend (optional)
    │   ├── main.tf
    │   └── outputs.tf
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
  #   bucket = "healthmetricsapp-terraform-state"
  #   key    = "prod/terraform.tfstate"
  #   region = "us-east-1"
  #   dynamodb_table = "healthmetricsapp-terraform-locks"
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
  default     = "healthmetricsapp.com"
}

variable "cdn_domain_name" {
  description = "Custom CDN domain name"
  type        = string
  default     = "cdn.healthmetricsapp.com"
}

variable "cors_allowed_origins" {
  description = "Allowed origins for CORS"
  type        = list(string)
  default     = ["https://healthmetricsapp.com", "https://www.healthmetricsapp.com"]
}

# For development, add localhost
# default = ["https://healthmetricsapp.com", "http://localhost:3003"]
```

### 3. S3 Bucket (`s3.tf`)

```hcl
# s3.tf

# Main uploads bucket (single bucket + prefixes: avatars/, progress/, food/)
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

# CloudFront signed URLs (key group)
# Generate a key pair locally and store the private key outside Terraform.
resource "aws_cloudfront_public_key" "uploads" {
  name        = "${var.app_name}-uploads-public-key"
  encoded_key = file("${path.module}/keys/cloudfront_public_key.pem")
}

resource "aws_cloudfront_key_group" "uploads" {
  name  = "${var.app_name}-uploads-key-group"
  items = [aws_cloudfront_public_key.uploads.id]
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
    trusted_key_groups = [aws_cloudfront_key_group.uploads.id]

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
    trusted_key_groups = [aws_cloudfront_key_group.uploads.id]

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
    # Custom domain requires ACM certificate in us-east-1
    acm_certificate_arn      = aws_acm_certificate.cdn.arn
    ssl_support_method       = "sni-only"
    minimum_protocol_version = "TLSv1.2_2021"
  }

  aliases = [var.cdn_domain_name]

  tags = {
    Name = "Uploads CDN"
  }
}
```

### ACM Certificate (CloudFront)

```hcl
# acm.tf

resource "aws_acm_certificate" "cdn" {
  provider          = aws.us_east_1
  domain_name       = var.cdn_domain_name
  validation_method = "DNS"
}

locals {
  acm_validation = tolist(aws_acm_certificate.cdn.domain_validation_options)[0]
}

# Add validation CNAME in Porkbun DNS
resource "aws_acm_certificate_validation" "cdn" {
  provider                = aws.us_east_1
  certificate_arn         = aws_acm_certificate.cdn.arn
  validation_record_fqdns = [local.acm_validation.resource_record_name]
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

# DNS Records (Porkbun)
# Add the SES verification, DKIM, SPF, MX, DMARC, and ACM validation records manually in Porkbun.
# Also add a CNAME for the CDN domain pointing to the CloudFront distribution domain.

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
  value       = "https://${var.cdn_domain_name}"
}

# SES Outputs
output "ses_domain_identity_arn" {
  description = "ARN of the SES domain identity"
  value       = aws_ses_domain_identity.main.arn
}

# DNS Outputs (for Porkbun)
output "cdn_cname" {
  description = "CDN CNAME record (Porkbun)"
  value = {
    name  = var.cdn_domain_name
    type  = "CNAME"
    value = aws_cloudfront_distribution.uploads.domain_name
  }
}

output "acm_validation_cname" {
  description = "ACM validation CNAME record (Porkbun)"
  value = {
    name  = local.acm_validation.resource_record_name
    type  = local.acm_validation.resource_record_type
    value = local.acm_validation.resource_record_value
  }
}

# DNS Outputs (for Porkbun)
output "ses_verification_txt" {
  description = "SES verification TXT record"
  value = {
    name  = "_amazonses.${var.domain_name}"
    type  = "TXT"
    value = aws_ses_domain_identity.main.verification_token
  }
}

output "ses_dkim_cnames" {
  description = "SES DKIM CNAME records"
  value = [
    for token in aws_ses_domain_dkim.main.dkim_tokens : {
      name  = "${token}._domainkey.${var.domain_name}"
      type  = "CNAME"
      value = "${token}.dkim.amazonses.com"
    }
  ]
}

output "ses_mail_from_spf" {
  description = "SES SPF TXT record for mail-from"
  value = {
    name  = "mail.${var.domain_name}"
    type  = "TXT"
    value = "v=spf1 include:amazonses.com ~all"
  }
}

output "ses_mail_from_mx" {
  description = "SES MX record for mail-from"
  value = {
    name  = "mail.${var.domain_name}"
    type  = "MX"
    value = "10 feedback-smtp.${var.aws_region}.amazonses.com"
  }
}

output "ses_dmarc" {
  description = "DMARC record (start with p=none)"
  value = {
    name  = "_dmarc.${var.domain_name}"
    type  = "TXT"
    value = "v=DMARC1; p=none; rua=mailto:dmarc@${var.domain_name}"
  }
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
    CLOUDFRONT_URL=https://${var.cdn_domain_name}
    CLOUDFRONT_KEY_PAIR_ID=${aws_cloudfront_public_key.uploads.id}
    CLOUDFRONT_PRIVATE_KEY=<securely stored PEM>
    SES_FROM_EMAIL=noreply@${var.domain_name}
    SES_REGION=${var.aws_region}
  EOT
  sensitive   = true
}
```

---

## Application Integration

### S3 Presigned POST Generation

Constraints:
- Avatars: max 2MB; allowed types `image/jpeg`, `image/png`, `image/webp`
- Progress/Food: max 10MB; allowed types `image/*`

```typescript
// src/lib/storage.ts

import {
  S3Client,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { createPresignedPost } from "@aws-sdk/s3-presigned-post";

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
 * Generate a presigned POST for uploading a file
 * Enforces size/type and a safe key prefix.
 */
export async function getUploadPost(
  userId: string,
  fileName: string,
  contentType: string,
  kind: "avatar" | "progress" | "food"
): Promise<{ url: string; fields: Record<string, string>; assetUrl: string; key: string }> {
  if (kind === "avatar") {
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (!allowed.includes(contentType)) {
      throw new Error("Avatar must be JPEG, PNG, or WebP");
    }
  }

  const ext = fileName.split(".").pop() || "jpg";
  const prefix = kind === "avatar" ? "avatars" : kind === "progress" ? "progress" : "food";
  const key = `${prefix}/${userId}/${Date.now()}.${ext}`;

  const maxSizeBytes = kind === "avatar" ? 2 * 1024 * 1024 : 10 * 1024 * 1024;

  const { url, fields } = await createPresignedPost(s3Client, {
    Bucket: BUCKET,
    Key: key,
    Expires: 300, // 5 minutes
    Conditions: [
      ["content-length-range", 1, maxSizeBytes],
      ["starts-with", "$Content-Type", "image/"],
    ],
    Fields: {
      "Content-Type": contentType,
      "x-amz-meta-user-id": userId,
      "x-amz-meta-original-name": fileName,
    },
  });

  return {
    url,
    fields,
    // Asset URL must be signed before being served to clients
    assetUrl: `${CDN_URL}/${key}`,
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

### CloudFront Signed URL Generation

```typescript
// src/lib/cdn.ts

import { getSignedUrl } from "@aws-sdk/cloudfront-signer";

const CDN_URL = process.env.CLOUDFRONT_URL!;
const CLOUDFRONT_KEY_PAIR_ID = process.env.CLOUDFRONT_KEY_PAIR_ID!;
const CLOUDFRONT_PRIVATE_KEY = process.env.CLOUDFRONT_PRIVATE_KEY!; // stored securely

export function signCdnUrl(path: string, expiresInSeconds = 60 * 5): string {
  const url = `${CDN_URL}/${path}`;
  const expires = new Date(Date.now() + expiresInSeconds * 1000).toISOString();

  return getSignedUrl({
    url,
    dateLessThan: expires,
    keyPairId: CLOUDFRONT_KEY_PAIR_ID,
    privateKey: CLOUDFRONT_PRIVATE_KEY,
  });
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
| Create `apps/healthmetrics-infra` folder | 15m | 🔲 |
| Write Terraform configuration | 2h | 🔲 |
| Test `terraform plan` | 30m | 🔲 |

### Phase 2: Deploy Infrastructure (Day 2)

| Task | Effort | Status |
|------|--------|--------|
| Run `terraform apply` | 30m | 🔲 |
| Verify S3 bucket created | 15m | 🔲 |
| Verify CloudFront distribution | 15m | 🔲 |
| Add DNS records for SES + ACM/CDN in Porkbun | 1h | 🔲 |
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
cd apps/healthmetrics-infra/terraform

# (Optional) Bootstrap remote state
# cd ../bootstrap
# terraform init
# terraform apply

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

## Porkbun DNS Checklist

After `terraform apply`, add the following records in Porkbun DNS. Use `terraform output` to copy values.

1) **ACM validation (CNAME)**
   - Output: `acm_validation_cname`

2) **CDN CNAME**
   - Output: `cdn_cname` (points `cdn.healthmetricsapp.com` → CloudFront domain)

3) **SES verification (TXT)**
   - Output: `ses_verification_txt`

4) **SES DKIM (3x CNAME)**
   - Output: `ses_dkim_cnames`

5) **SES Mail‑From SPF (TXT)**
   - Output: `ses_mail_from_spf`

6) **SES Mail‑From MX**
   - Output: `ses_mail_from_mx`

7) **DMARC (TXT)**
   - Output: `ses_dmarc` (starts with `p=none`)

---

## Porkbun DNS Example Values (Fill From Terraform Output)

Use this as a template in Porkbun. Replace `<...>` with the values from `terraform output`.

ACM validation:
- Type: CNAME
- Host: `<acm_validation_cname.name>`
- Answer: `<acm_validation_cname.value>`

CDN:
- Type: CNAME
- Host: `cdn`
- Answer: `<cdn_cname.value>`

SES verification:
- Type: TXT
- Host: `<ses_verification_txt.name>`
- Answer: `<ses_verification_txt.value>`

SES DKIM (3 records):
- Type: CNAME
- Host: `<ses_dkim_cnames[0].name>`
- Answer: `<ses_dkim_cnames[0].value>`
- Type: CNAME
- Host: `<ses_dkim_cnames[1].name>`
- Answer: `<ses_dkim_cnames[1].value>`
- Type: CNAME
- Host: `<ses_dkim_cnames[2].name>`
- Answer: `<ses_dkim_cnames[2].value>`

SES mail-from:
- Type: TXT
- Host: `<ses_mail_from_spf.name>`
- Answer: `<ses_mail_from_spf.value>`
- Type: MX
- Host: `<ses_mail_from_mx.name>`
- Answer: `<ses_mail_from_mx.value>`

DMARC:
- Type: TXT
- Host: `<ses_dmarc.name>`
- Answer: `<ses_dmarc.value>`

---

## Implementation Checklist (Step-by-Step)

1) **AWS account + IAM**
   - Create AWS account (if needed)
   - Create an IAM admin user and enable MFA

2) **Bootstrap Terraform state (recommended)**
   - Create `apps/healthmetrics-infra/bootstrap` (S3 state bucket + DynamoDB lock)
   - Apply bootstrap stack
   - Enable backend in `apps/healthmetrics-infra/terraform/main.tf`

3) **Create CloudFront signing keys**
   - Generate a CloudFront key pair locally
   - Store the **private key** securely (not in repo)
   - Store the **public key** at `apps/healthmetrics-infra/terraform/keys/cloudfront_public_key.pem`

4) **Apply Terraform**
   - `cd apps/healthmetrics-infra/terraform`
   - `terraform init`
   - `terraform plan`
   - `terraform apply`

5) **Porkbun DNS**
   - Add ACM validation CNAME
   - Add CDN CNAME (`cdn.healthmetricsapp.com`)
   - Add SES TXT + DKIM CNAMEs + SPF + MX + DMARC
   - Wait for ACM + SES to validate

6) **SES production access**
   - Request removal from SES sandbox
   - Wait for approval

7) **App env vars**
   - Set `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`
   - Set `AWS_REGION`, `S3_BUCKET_NAME`
   - Set `CLOUDFRONT_URL`, `CLOUDFRONT_KEY_PAIR_ID`, `CLOUDFRONT_PRIVATE_KEY`
   - Set `SES_FROM_EMAIL`, `SES_REGION`

8) **App integration**
   - Implement presigned POST uploads (avatars/progress/food)
   - Enforce avatar limits (2MB, JPEG/PNG/WebP)
   - Store only object keys in DB
   - Use CloudFront signed URLs for asset delivery
   - Send emails via SES API

9) **Verification**
   - Upload avatar end‑to‑end
   - Verify signed URL access
   - Send test verification + password reset emails

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

### CloudTrail (Recommended)

Enable CloudTrail for the account (management events at minimum). For v0, we can use the default event history in AWS, and add an org trail later if needed.

---

## Acceptance Criteria

- [ ] S3 bucket created with proper encryption and CORS
- [ ] CloudFront distribution serves files via HTTPS (signed URLs required)
- [ ] SES domain verified and out of sandbox
- [ ] IAM user has minimal required permissions
- [ ] Avatar uploads work end-to-end
- [ ] Verification emails delivered to inbox (not spam)
- [ ] Password reset emails delivered to inbox
- [ ] All credentials stored securely (not in code)
- [ ] Terraform state managed properly
- [ ] DNS records added in Porkbun for SES + ACM validation + CDN CNAME
