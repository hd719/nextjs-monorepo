# HealthMetrics Terraform

This folder provisions S3, CloudFront, SES, and IAM for HealthMetrics.

## Prereqs

- AWS credentials configured (`AWS_PROFILE` or env vars)
- CloudFront public key PEM provided via `TF_VAR_cloudfront_public_key_pem` (or a `.tfvars` file)
- ACM + SES DNS records added in Porkbun after apply

## Commands

```bash
export TF_VAR_cloudfront_public_key_pem="$(op read op://Development/HEALTHMETRICS_CLOUDFRONT_PUBLIC_KEY/cloudfront_public_key.pem)"
AWS_PROFILE=healthmetrics AWS_REGION=us-east-1 tf apply
```
