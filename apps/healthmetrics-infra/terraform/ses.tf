# SES domain identity for sending emails from the custom domain.
resource "aws_ses_domain_identity" "main" {
  domain = var.domain_name
}

# Triggers SES domain verification (requires TXT record in DNS)
# SES needs to verify you own the domain before you can send emails from it
resource "aws_ses_domain_identity_verification" "main" {
  domain = aws_ses_domain_identity.main.id
}

# DKIM: cryptographic signature for outgoing mail to prove authenticity
# Proves the email really came from your domain
# SES generates 3 DKIM tokens; you publish them as CNAMEs in DNS
resource "aws_ses_domain_dkim" "main" {
  domain = aws_ses_domain_identity.main.domain
}

# Mail-from subdomain sets the SMTP envelope domain (mail.healthmetricsapp.com)
# SPF (TXT) authorizes SES to send on behalf of this domain (A DNS record that lists who is allowed to send mail for your domain)
# MX routes bounce/complaint handling for the mail-from domain (A DNS record that specifies the mail server that handles email for your domain)
resource "aws_ses_domain_mail_from" "main" {
  domain           = aws_ses_domain_identity.main.domain
  mail_from_domain = "mail.${var.domain_name}"
}

# Configuration set for metrics + TLS requirement.
# Must be referenced by the app when sending emails to collect metrics
resource "aws_ses_configuration_set" "main" {
  name = "${var.app_name}-${var.environment}"

  delivery_options {
    tls_policy = "Require"
  }

  reputation_metrics_enabled = true
}
