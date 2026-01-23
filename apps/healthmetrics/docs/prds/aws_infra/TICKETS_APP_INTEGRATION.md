# AWS Infra - App Integration Tickets

These tickets cover application-side integration for S3 + CloudFront + SES.

---

## AWS-APP-01: Add AWS env config + validation

**Goal**: Centralize required AWS env vars and fail fast if missing.

**Scope**:
- Read `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`
- Read `S3_BUCKET_NAME`, `CLOUDFRONT_URL`, `CLOUDFRONT_KEY_PAIR_ID`, `CLOUDFRONT_PRIVATE_KEY`
- Read `SES_FROM_EMAIL`, `SES_REGION`

**Acceptance criteria**:
- App logs a clear error on startup if any required env var is missing.
- No secrets logged to stdout.

---

## AWS-APP-02: Presigned POST upload endpoint

**Goal**: Generate S3 presigned POSTs for uploads.

**Scope**:
- Endpoint returns `{ url, fields, key }` for `avatar`, `progress`, `food`
- Enforce avatar limits: max 2MB, JPEG/PNG/WebP
- Enforce image-only for other uploads, max 10MB

**Acceptance criteria**:
- Browser can upload to S3 using returned `url` + `fields`.
- Invalid content type or size is rejected.

---

## AWS-APP-03: CloudFront signed URL helper

**Goal**: Serve private assets via signed CloudFront URLs.

**Scope**:
- Utility to sign `CLOUDFRONT_URL/{key}` with expiration
- Reads `CLOUDFRONT_KEY_PAIR_ID` + `CLOUDFRONT_PRIVATE_KEY`

**Acceptance criteria**:
- Signed URLs work in the browser and expire as expected.

---

## AWS-APP-04: Avatar upload flow (server + client)

**Goal**: Fully replace mock avatar flow with S3 + CloudFront.

**Scope**:
- Store only S3 object key in DB
- Delete old avatar object on update
- Use signed CloudFront URL when returning avatar to client

**Acceptance criteria**:
- Avatar persists across refresh/login.
- Old avatar is removed from S3 on update.

---

## AWS-APP-05: SES mailer integration

**Goal**: Send transactional emails via SES API.

**Scope**:
- Implement SES mailer with `SES_FROM_EMAIL`
- Wire into auth verification + password reset
- Optionally include configuration set name if needed

**Acceptance criteria**:
- Verification and reset emails send successfully in production mode.

---

## AWS-APP-06: Documentation + local dev notes

**Goal**: Make setup easy for future contributors.

**Scope**:
- Document required env vars and where to set them
- Note `cors_allowed_origins` update for localhost if needed

**Acceptance criteria**:
- A new dev can set up uploads and email locally with the docs.

---

## Follow-up (Tech Debt)

- **Avatar cleanup job**: Implemented via `cleanup:avatars` script. Configure scheduling (e.g., cron) and set `AVATAR_ORPHAN_MAX_AGE_DAYS` as needed.
