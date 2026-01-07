# PRD: Avatar Upload & Storage

## Overview

Implement persistent avatar upload functionality. Currently, uploaded avatars are only stored in component state and lost on refresh. This PRD outlines proper file upload, storage, and retrieval.

---

## Problem Statement

When a user uploads a profile picture:

1. The image displays correctly in the UI
2. On page refresh, the image disappears
3. The avatar URL is not persisted to the database

**Root Cause**: The current implementation likely uses a local blob URL or component state without saving to persistent storage.

---

## Goals

1. **Persist avatar uploads** - Images survive page refresh and sessions
2. **Secure storage** - User images stored securely with proper access control
3. **Optimized delivery** - Fast loading with appropriate sizing
4. **Good UX** - Upload progress, validation, and error handling

---

## Non-Goals

- Social avatar import (Google/GitHub profile pics) - covered in PRD_AUTH_ENHANCEMENTS
- Avatar cropping/editing in-browser
- Animated GIF support (static frame only)

---

## Technical Options

### Option A: Cloud Storage (Recommended)

**Services**: Cloudflare R2, AWS S3, Supabase Storage, Uploadthing

| Pros | Cons |
|------|------|
| Scalable, CDN-backed | External dependency |
| Image optimization built-in | Monthly cost (minimal) |
| Easy to implement | Requires account setup |

### Option B: Database Storage (Base64)

| Pros | Cons |
|------|------|
| No external dependencies | Bloats database |
| Simple implementation | No CDN, slower loads |
| | Limited to small images |

### Option C: Local Filesystem

| Pros | Cons |
|------|------|
| Free | Doesn't work on serverless |
| Simple | No CDN |
| | Manual backup needed |

**Recommendation**: **Cloudflare R2** or **Uploadthing** for best balance of simplicity and performance.

---

## Technical Specification

### Database Schema Update

```prisma
model User {
  // ... existing fields
  avatarUrl     String?   // URL to stored image
  avatarKey     String?   // Storage key for deletion
}
```

### API Endpoints

#### 1. Upload Avatar

```typescript
// POST /api/avatar/upload
// Content-Type: multipart/form-data

// Request
{
  file: File  // Max 2MB, JPG/PNG/GIF/WebP
}

// Response
{
  success: true,
  avatarUrl: "https://cdn.example.com/avatars/user-123-abc.jpg"
}
```

#### 2. Delete Avatar

```typescript
// DELETE /api/avatar

// Response
{
  success: true
}
```

### Server Implementation

```typescript
// src/server/avatar.ts

import { createServerFn } from "@tanstack/react-start/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

// Validation
const uploadSchema = z.object({
  userId: z.string().min(1),
  file: z.instanceof(File).refine(
    (file) => file.size <= 2 * 1024 * 1024,
    "File must be less than 2MB"
  ).refine(
    (file) => ["image/jpeg", "image/png", "image/gif", "image/webp"].includes(file.type),
    "File must be JPG, PNG, GIF, or WebP"
  ),
});

export const uploadAvatar = createServerFn({ method: "POST" })
  .validator(uploadSchema)
  .handler(async ({ data }) => {
    const { userId, file } = data;

    // 1. Upload to storage provider
    const { url, key } = await uploadToStorage(file, userId);

    // 2. Delete old avatar if exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { avatarKey: true },
    });

    if (user?.avatarKey) {
      await deleteFromStorage(user.avatarKey);
    }

    // 3. Update database
    await prisma.user.update({
      where: { id: userId },
      data: {
        avatarUrl: url,
        avatarKey: key,
      },
    });

    return { success: true, avatarUrl: url };
  });

export const deleteAvatar = createServerFn({ method: "POST" })
  .validator(z.object({ userId: z.string() }))
  .handler(async ({ data }) => {
    const { userId } = data;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { avatarKey: true },
    });

    if (user?.avatarKey) {
      await deleteFromStorage(user.avatarKey);
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        avatarUrl: null,
        avatarKey: null,
      },
    });

    return { success: true };
  });
```

### Storage Provider Implementation

#### Cloudflare R2 Example

```typescript
// src/lib/storage.ts

import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

const R2 = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

const BUCKET = process.env.R2_BUCKET_NAME!;
const PUBLIC_URL = process.env.R2_PUBLIC_URL!;

export async function uploadToStorage(
  file: File,
  userId: string
): Promise<{ url: string; key: string }> {
  const ext = file.name.split(".").pop() || "jpg";
  const key = `avatars/${userId}-${Date.now()}.${ext}`;

  const buffer = await file.arrayBuffer();

  await R2.send(new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    Body: Buffer.from(buffer),
    ContentType: file.type,
    CacheControl: "public, max-age=31536000", // 1 year cache
  }));

  return {
    url: `${PUBLIC_URL}/${key}`,
    key,
  };
}

export async function deleteFromStorage(key: string): Promise<void> {
  await R2.send(new DeleteObjectCommand({
    Bucket: BUCKET,
    Key: key,
  }));
}
```

#### Uploadthing Example (Simpler)

```typescript
// src/lib/uploadthing.ts

import { createUploadthing, type FileRouter } from "uploadthing/server";

const f = createUploadthing();

export const uploadRouter = {
  avatarUploader: f({ image: { maxFileSize: "2MB", maxFileCount: 1 } })
    .middleware(async ({ req }) => {
      const user = await getUser(req);
      if (!user) throw new Error("Unauthorized");
      return { userId: user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      await prisma.user.update({
        where: { id: metadata.userId },
        data: { avatarUrl: file.url },
      });
      return { url: file.url };
    }),
} satisfies FileRouter;
```

### Frontend Component Update

```typescript
// src/components/profile/ProfileAvatar.tsx

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { uploadAvatar, deleteAvatar } from "@/server/avatar";
import { Button } from "@/components/ui/button";
import { User, Upload, Trash2, Loader2 } from "lucide-react";

interface ProfileAvatarProps {
  userId: string;
  currentAvatarUrl?: string | null;
}

export function ProfileAvatar({ userId, currentAvatarUrl }: ProfileAvatarProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("userId", userId);
      return uploadAvatar({ data: { userId, file } });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      setPreview(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteAvatar({ data: { userId } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate
    if (file.size > 2 * 1024 * 1024) {
      alert("File must be less than 2MB");
      return;
    }

    if (!["image/jpeg", "image/png", "image/gif", "image/webp"].includes(file.type)) {
      alert("File must be JPG, PNG, GIF, or WebP");
      return;
    }

    // Show preview
    setPreview(URL.createObjectURL(file));

    // Upload
    uploadMutation.mutate(file);
  };

  const displayUrl = preview || currentAvatarUrl;
  const isLoading = uploadMutation.isPending || deleteMutation.isPending;

  return (
    <div className="profile-avatar-container">
      <div className="profile-avatar-image-wrapper">
        {displayUrl ? (
          <img
            src={displayUrl}
            alt="Profile avatar"
            className="profile-avatar-image"
          />
        ) : (
          <div className="profile-avatar-placeholder">
            <User className="profile-avatar-icon" />
          </div>
        )}

        {isLoading && (
          <div className="profile-avatar-loading">
            <Loader2 className="animate-spin" />
          </div>
        )}
      </div>

      <div className="profile-avatar-actions">
        <label className="profile-avatar-upload-btn">
          <input
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp"
            onChange={handleFileChange}
            disabled={isLoading}
            className="sr-only"
          />
          <Upload className="w-4 h-4 mr-2" />
          Upload Avatar
        </label>

        {currentAvatarUrl && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => deleteMutation.mutate()}
            disabled={isLoading}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Remove
          </Button>
        )}
      </div>

      <p className="profile-avatar-hint">Max 2MB. JPG, PNG, or GIF</p>
    </div>
  );
}
```

---

## Environment Variables

```bash
# Cloudflare R2
R2_ENDPOINT=https://<account-id>.r2.cloudflarestorage.com
R2_ACCESS_KEY_ID=your-access-key
R2_SECRET_ACCESS_KEY=your-secret-key
R2_BUCKET_NAME=healthmetrics-avatars
R2_PUBLIC_URL=https://avatars.yourdomain.com

# OR Uploadthing
UPLOADTHING_SECRET=sk_live_xxx
UPLOADTHING_APP_ID=your-app-id
```

---

## Implementation Plan

### Phase 1: Database & Backend (Day 1)

| Task | Effort |
|------|--------|
| Add `avatarUrl` and `avatarKey` to User schema | 0.5h |
| Run Prisma migration | 0.5h |
| Set up storage provider account | 1h |
| Implement `uploadToStorage` and `deleteFromStorage` | 2h |
| Create `uploadAvatar` and `deleteAvatar` server functions | 2h |

### Phase 2: Frontend (Day 2)

| Task | Effort |
|------|--------|
| Update `ProfileAvatar` component with mutations | 2h |
| Add loading states and error handling | 1h |
| Add delete avatar functionality | 1h |
| Update profile query to include `avatarUrl` | 0.5h |
| Test upload/delete flow | 1h |

### Phase 3: Polish (Day 3)

| Task | Effort |
|------|--------|
| Add image optimization (resize on upload) | 2h |
| Add progress indicator for large files | 1h |
| Handle edge cases (network errors, invalid files) | 1h |
| Update avatar display in header/sidebar | 1h |

---

## Acceptance Criteria

- [ ] User can upload JPG, PNG, GIF, or WebP image up to 2MB
- [ ] Uploaded image persists after page refresh
- [ ] Uploaded image appears in profile settings immediately
- [ ] User can delete their avatar
- [ ] Old avatar is deleted from storage when new one is uploaded
- [ ] Avatar displays in header profile menu
- [ ] Appropriate loading states during upload
- [ ] Error messages for invalid files (too large, wrong format)
- [ ] Works on mobile browsers

---

## Security Considerations

1. **Authentication** - Only authenticated users can upload/delete their own avatar
2. **File validation** - Server-side validation of file type and size
3. **Unique keys** - Include user ID and timestamp to prevent overwrites
4. **Signed URLs** - Consider signed URLs for private avatars (optional)
5. **Rate limiting** - Prevent abuse (covered in PRD_SECURITY_HARDENING)

---

## Cost Estimate

### Cloudflare R2

- **Storage**: $0.015/GB/month
- **Operations**: 1M Class A (writes) free, then $4.50/million
- **Egress**: Free (no bandwidth charges)

**Estimate for 10,000 users with 100KB average avatar**: ~$0.15/month

### Uploadthing

- **Free tier**: 2GB storage, 2GB bandwidth/month
- **Pro**: $10/month for 100GB storage

---

## Future Enhancements

1. **Image cropping** - Allow users to crop/position avatar before upload
2. **Social import** - Pull avatar from Google/GitHub on OAuth login
3. **Avatar history** - Keep previous avatars for undo
4. **Animated avatars** - Support animated GIFs for premium users
5. **AI-generated avatars** - Generate avatar from user preferences

---

## References

- [Cloudflare R2 Documentation](https://developers.cloudflare.com/r2/)
- [Uploadthing Documentation](https://docs.uploadthing.com/)
- [AWS S3 SDK for JavaScript](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/)
