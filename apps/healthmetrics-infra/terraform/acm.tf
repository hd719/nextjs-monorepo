# ACM (AWS Certificate Manager) issues an SSL/TLS cert for the CDN domain
# CloudFront requires certs to be in us-east-1
# ACM (AWS Certificate Manager) is where AWS issues the SSL/TLS certificate for your custom CDN domain (cdn.healthmetricsapp.com)
# CloudFront requires that cert to exist in us-east-1, which is why we use the aws.us_east_1 provider
resource "aws_acm_certificate" "cdn" {
  provider          = aws.us_east_1
  domain_name       = var.cdn_domain_name
  validation_method = "DNS"

  lifecycle {
    create_before_destroy = true
  }
}

locals {
  acm_validation = tolist(aws_acm_certificate.cdn.domain_validation_options)[0]
}

# Finalizes the cert after you add the DNS validation CNAME in Porkbun.
resource "aws_acm_certificate_validation" "cdn" {
  provider                = aws.us_east_1
  certificate_arn         = aws_acm_certificate.cdn.arn
  validation_record_fqdns = [local.acm_validation.resource_record_name]
}
