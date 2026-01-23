# DNS Notes (Porkbun)

This doc explains the Terraform DNS outputs and how to enter them in Porkbun.

## Why these records exist

- **ACM validation (CNAME)**: proves you control `cdn.healthmetricsapp.com` so ACM can issue the SSL/TLS cert for CloudFront.
- **SES verification (TXT)**: proves you control `healthmetricsapp.com` so SES can send mail for it.
- **SES DKIM (3x CNAME)**: publishes cryptographic keys so inboxes can verify email authenticity.
- **SES SPF (TXT)**: authorizes SES to send mail for the mail-from subdomain.
- **SES MX**: routes bounce/complaint handling for the mail-from subdomain.
- **DMARC (TXT)**: tells inboxes how to handle mail that fails SPF/DKIM (start with `p=none`).
- **CDN CNAME**: points `cdn.healthmetricsapp.com` to the CloudFront distribution domain.

## Terraform outputs you will use

Run:

```bash
cd apps/healthmetrics-infra/terraform
terraform output acm_validation_cname
terraform output ses_verification_txt
terraform output ses_dkim_cnames
terraform output ses_mail_from_spf
terraform output ses_mail_from_mx
terraform output ses_dmarc
terraform output cdn_cname
```

## How to map to Porkbun

Porkbun wants:

- **Type** (CNAME/TXT/MX)
- **Host** (left side only; Porkbun appends the domain)
- **Answer/Value** (right side)

Notes:

- If the output name/value ends with a trailing `.`, Porkbun will accept it either way.
- For names like `mail.healthmetricsapp.com`, use `mail` as the Host.

## Example template (fill with your outputs)

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

## What you entered (plain English)

- **ACM validation CNAME**: proves you control `cdn.healthmetricsapp.com` so AWS can issue the SSL cert used by CloudFront.
- **SES verification TXT**: proves you control `healthmetricsapp.com` so SES can send email.
- **SES DKIM CNAMEs (3)**: publish email signing keys so inboxes can verify authenticity.
- **SES mail-from SPF TXT**: authorizes SES to send mail on behalf of `mail.healthmetricsapp.com`.
- **SES mail-from MX**: routes bounces/complaints for `mail.healthmetricsapp.com`.
- **DMARC TXT**: tells inboxes what to do if SPF/DKIM fail (start with `p=none`).

## Records you should see in Porkbun

AWS‑related records:

- Check 1password for the records

After the full Terraform apply:

- **CNAME** `cdn` → `<cloudfront_domain_name>` (from `terraform output cdn_cname`)

## Notes about existing Porkbun defaults

- Porkbun may add default **ALIAS**, **CNAME**, **MX**, and **TXT (SPF)** records for parking or email.
- These defaults do not block SES, but **SES mail-from uses the `mail.` subdomain** and must have its own SPF + MX.
- If you are not using Porkbun email hosting, you can remove the root MX/SPF later. It is optional for SES.
