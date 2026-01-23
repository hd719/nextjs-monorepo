output "s3_bucket_name" {
  description = "Name of the uploads S3 bucket"
  value       = aws_s3_bucket.uploads.id
}

output "s3_bucket_arn" {
  description = "ARN of the uploads S3 bucket"
  value       = aws_s3_bucket.uploads.arn
}

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

output "ses_domain_identity_arn" {
  description = "ARN of the SES domain identity"
  value       = aws_ses_domain_identity.main.arn
}

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
