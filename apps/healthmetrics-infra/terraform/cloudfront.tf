# Origin Access Control: lets CloudFront read from a private S3 bucket.
resource "aws_cloudfront_origin_access_control" "uploads" {
  name                              = "${var.app_name}-uploads-oac"
  description                       = "Origin Access Control for uploads bucket"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

# Public key CloudFront uses to verify signed URLs.
resource "aws_cloudfront_public_key" "uploads" {
  name        = "${var.app_name}-uploads-public-key"
  encoded_key = var.cloudfront_public_key_pem

  lifecycle {
    ignore_changes = [encoded_key]
  }
}

# Key group ties the public key to a distribution.
resource "aws_cloudfront_key_group" "uploads" {
  name  = "${var.app_name}-uploads-key-group"
  items = [aws_cloudfront_public_key.uploads.id]
}

# CloudFront distribution: CDN in front of S3, signed URLs required.
resource "aws_cloudfront_distribution" "uploads" {
  enabled             = true
  is_ipv6_enabled     = true
  comment             = "CDN for ${var.app_name} uploads"
  default_root_object = ""
  price_class         = "PriceClass_100"

  # Origin is the private S3 bucket; OAC provides secure access.
  origin {
    domain_name              = aws_s3_bucket.uploads.bucket_regional_domain_name
    origin_id                = "S3-${aws_s3_bucket.uploads.id}"
    origin_access_control_id = aws_cloudfront_origin_access_control.uploads.id
  }

  # Default behavior for all paths; requires signed URLs.
  default_cache_behavior {
    allowed_methods        = ["GET", "HEAD", "OPTIONS"]
    cached_methods         = ["GET", "HEAD"]
    target_origin_id       = "S3-${aws_s3_bucket.uploads.id}"
    trusted_key_groups     = [aws_cloudfront_key_group.uploads.id]
    viewer_protocol_policy = "redirect-to-https"

    forwarded_values {
      query_string = false

      cookies {
        forward = "none"
      }
    }

    min_ttl     = 0
    default_ttl = 86400
    max_ttl     = 31536000
    compress    = true
  }

  # More aggressive caching for avatars (they rarely change).
  ordered_cache_behavior {
    path_pattern           = "avatars/*"
    allowed_methods        = ["GET", "HEAD"]
    cached_methods         = ["GET", "HEAD"]
    target_origin_id       = "S3-${aws_s3_bucket.uploads.id}"
    trusted_key_groups     = [aws_cloudfront_key_group.uploads.id]
    viewer_protocol_policy = "redirect-to-https"

    forwarded_values {
      query_string = false

      cookies {
        forward = "none"
      }
    }

    min_ttl     = 86400
    default_ttl = 604800
    max_ttl     = 31536000
    compress    = true
  }

  # No geo restrictions for v0.
  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  # TLS cert for the custom CDN domain (ACM in us-east-1).
  viewer_certificate {
    acm_certificate_arn      = aws_acm_certificate_validation.cdn.certificate_arn
    ssl_support_method       = "sni-only"
    minimum_protocol_version = "TLSv1.2_2021"
  }

  # Custom CDN domain. Front-end fetches images from this URL using signed paths.
  aliases = [var.cdn_domain_name]

  tags = {
    Name = "Uploads CDN"
  }
}
