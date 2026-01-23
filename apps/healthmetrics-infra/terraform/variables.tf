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
  default     = [
    "https://healthmetricsapp.com",
    "https://www.healthmetricsapp.com",
    "http://localhost:3003",
  ]
}

variable "cloudfront_public_key_pem" {
  description = "CloudFront public key PEM contents"
  type        = string
  sensitive   = true
}
