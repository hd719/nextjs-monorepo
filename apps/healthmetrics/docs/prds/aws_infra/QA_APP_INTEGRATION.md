# AWS Infra - QA Checklist (App Integration)

Use this document to validate S3 uploads, CloudFront signed URLs, and SES email flows after implementation.

---

## Preconditions

- AWS infra applied and healthy
- DNS records verified (ACM + SES)
- `cdn.healthmetricsapp.com` resolves
- App env vars set (`AWS_*`, `S3_BUCKET_NAME`, `CLOUDFRONT_*`, `SES_*`)
- If SES still in sandbox: test emails only to verified addresses

---

## User Stories

1) As a user, I can upload a profile avatar and see it persist across sessions.
2) As a user, I can view my avatar securely via a signed URL.
3) As a user, I can reset my password and receive an email with a secure link.
4) As a user, I receive an email verification message after signup.
5) As a user, I can update my avatar and the old image is removed.

---

## Test Scenarios (Manual)

### Uploads (Presigned POST)

- **U1: Avatar upload success**
  - Upload a JPEG/PNG/WebP avatar under 2MB.
  - Expect 200 response and avatar appears immediately.
  - Refresh the page; avatar persists.

- **U2: Avatar upload size limit**
  - Upload a file > 2MB.
  - Expect validation error before or during upload.

- **U3: Avatar upload type limit**
  - Upload a non-image file (e.g., PDF).
  - Expect validation error.

- **U4: Progress/food upload**
  - Upload a larger image (up to 10MB).
  - Expect upload success and key returned.

### Signed URLs (CloudFront)

- **C1: Signed URL works**
  - Load an avatar via signed URL in browser.
  - Expect 200 and image renders.

- **C2: Expired signed URL fails**
  - Wait past expiry and reload.
  - Expect 403/Access Denied.

### Avatar lifecycle

- **A1: Avatar update deletes old object**
  - Upload avatar A, then avatar B.
  - Confirm avatar A object is removed from S3.

### Email (SES)

- **E1: Verification email**
  - Sign up with a test account.
  - Expect verification email delivered.

- **E2: Password reset email**
  - Request password reset.
  - Expect reset email delivered.

- **E3: Link validity**
  - Use verification/reset link.
  - Expect success and token invalidates after use.

---

## Post-Checks

- CloudFront logs and S3 logs are still disabled (v0).
- SES reputation metrics show no complaints/bounces.
- No secrets logged to console.

---

## QA Result

- Status: **Passed**
- Notes: Avatar upload, signed URL access, email verification, and password reset all validated.
