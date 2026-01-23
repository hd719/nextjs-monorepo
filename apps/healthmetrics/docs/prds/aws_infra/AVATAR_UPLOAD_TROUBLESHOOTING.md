# Avatar Upload Troubleshooting Notes

This document captures the exact issues we ran into while implementing and testing avatar uploads, plus the root cause and the specific fix applied.

## 1) S3 POST returned 404 (NoSuchBucket)

### Problem summary

Avatar upload requests returned a 404 from S3 even though the presigned POST was generated.

### Evidence

```
POST https://healthmetrics-uploads-dev.s3.us-east-1.amazonaws.com/
Status: 404 Not Found
```

### Root cause

Terraform defaults `environment = "prod"`, so it created `healthmetrics-uploads-prod`.
The app was configured with `S3_BUCKET_NAME=healthmetrics-uploads-dev`, which didn’t exist.

### Fix (what we changed)

We aligned the bucket name to the actual resource:

- **Option A (used for dev):** set `S3_BUCKET_NAME=healthmetrics-uploads-prod`
- **Option B:** run Terraform with `environment=dev` to create `healthmetrics-uploads-dev`

---

## 2) Upload returned 204 but UI showed “Failed to upload avatar”

### Problem summary

The file successfully uploaded to S3 (204), but the frontend still threw an error.

### Evidence

```
HTTP/1.1 204 No Content
Location: https://healthmetrics-uploads-prod.s3.us-east-1.amazonaws.com/avatars/...
```

Browser console showed a CORS error and the UI displayed:

```
Failed to upload avatar. Please try again.
```

### Root cause

The S3 CORS config did **not** include `http://localhost:3003`, so the browser blocked the response even though S3 stored the object.

### Fix (what we changed)

Added localhost to CORS:

**File:** `apps/healthmetrics-infra/terraform/variables.tf`

```hcl
default = [
  "https://healthmetricsapp.com",
  "https://www.healthmetricsapp.com",
  "http://localhost:3003",
]
```

Then re-applied Terraform.

---

## 3) Avatar disappeared after refresh

### Problem summary

Avatar preview showed right after upload, but disappeared after a page reload.

### Evidence

- Immediate preview was visible.
- After refresh, no avatar URL was returned.

### Root cause

We upload on file select but only persist `avatarKey` when the user clicks **Save**.
If the user doesn’t save, `users.avatar_key` remains null, so the server can’t sign a URL.

### Fix (what we changed)

We verified the flow and saved after upload. This stores `avatarKey` in the DB and the API returns a signed URL on reload.

---

## 4) Confusion about CloudFront key pair ID

### Problem summary

We didn’t know which value should be used for `CLOUDFRONT_KEY_PAIR_ID`.

### Evidence

Terraform output did not expose the key pair ID, and the PEM file was confused for the ID.

### Root cause

The key pair **ID** (e.g., `K2...`) is a CloudFront resource ID, not the PEM contents.

### Fix (what we changed)

Retrieved the ID from Terraform state or AWS console:

```bash
tf state show aws_cloudfront_public_key.uploads
```

or:
**AWS Console → CloudFront → Key management → Public keys → ID**

---

## 5) Terraform apply failed: missing public key file

### Problem summary

`tf apply` failed because it could not find `keys/cloudfront_public_key.pem`.

### Evidence

```
Invalid value for "path" parameter: no file exists at "./keys/cloudfront_public_key.pem"
```

### Root cause

The public key PEM was removed locally, but Terraform still used `file()` to load it.

### Fix (what we changed)

Switched to a variable and passed the PEM at runtime:

**File:** `apps/healthmetrics-infra/terraform/cloudfront.tf`

```hcl
encoded_key = var.cloudfront_public_key_pem
```

**File:** `apps/healthmetrics-infra/terraform/variables.tf`

```hcl
variable "cloudfront_public_key_pem" {
  type      = string
  sensitive = true
}
```

**Runtime usage:**

```bash
export TF_VAR_cloudfront_public_key_pem="$(op read op://.../cloudfront_public_key.pem)"
```

---

## 6) Terraform attempted to replace CloudFront public key (409 error)

### Problem summary

Terraform tried to replace the public key and CloudFront rejected the delete because the key was still in a key group.

### Evidence

```
Error: deleting CloudFront Public Key ... PublicKeyInUse
```

### Root cause

Changing `encoded_key` forces replacement, but CloudFront blocks deletion while it’s associated.

### Fix (what we changed)

Prevented replacement via lifecycle:

**File:** `apps/healthmetrics-infra/terraform/cloudfront.tf`

```hcl
lifecycle {
  ignore_changes = [encoded_key]
}
```

---

## 7) Cleanup job stayed in dry‑run even with override

### Problem summary

The cleanup job still ran in dry‑run mode even when explicitly set to false.

### Evidence

```
AVATAR_CLEANUP_DRY_RUN=false ...
Avatar cleanup summary ... dryRun: true
```

### Root cause

The job forced dry‑run whenever `NODE_ENV !== production`, ignoring overrides.

### Fix (what we changed)

Added explicit boolean parsing and fallback:

**File:** `apps/healthmetrics/src/jobs/cleanup-orphaned-avatars.ts`

```ts
const parseBoolean = (value?: string): boolean | undefined => {
  if (value === "true") return true;
  if (value === "false") return false;
  return undefined;
};

const dryRunOverride = parseBoolean(process.env.AVATAR_CLEANUP_DRY_RUN);
const DRY_RUN = dryRunOverride ?? !isProduction();
```

---

## 8) Env var mapping mistakes (AWS + CloudFront)

### Problem summary

The app wasn’t using the correct AWS and CloudFront credential values because fields were swapped.

### Evidence

- `AWS_ACCESS_KEY_ID` was pointing to the secret field.
- `CLOUDFRONT_KEY_PAIR_ID` was set to a PEM file, not an ID string.

### Root cause

1Password field mapping confusion.

### Fix (what we changed)

Correct mappings:

```
AWS_ACCESS_KEY_ID = Access key ID (AKIA...)
AWS_SECRET_ACCESS_KEY = Secret access key
CLOUDFRONT_KEY_PAIR_ID = Public key ID (K2...)
CLOUDFRONT_PRIVATE_KEY = PEM contents
```

---

## 9) SES configuration set not found (email verification failed)

### Problem summary
Email verification failed when SES attempted to send and the config set did not exist.

### Evidence
```
ConfigurationSetDoesNotExistException: Configuration set <healthmetrics-dev> does not exist.
```

### Root cause
`SES_CONFIGURATION_SET` was set to `healthmetrics-dev`, but that configuration set was never created in SES (us-east-1).

### Fix (what we changed)
We either removed `SES_CONFIGURATION_SET` for dev or created the set in SES to match the env value.
