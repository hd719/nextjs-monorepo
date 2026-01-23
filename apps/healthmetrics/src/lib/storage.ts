import {
  DeleteObjectCommand,
  DeleteObjectsCommand,
  ListObjectsV2Command,
  S3Client,
} from "@aws-sdk/client-s3";
import { createPresignedPost } from "@aws-sdk/s3-presigned-post";
import { getEnv } from "@/utils/env";

type UploadKind = "avatar" | "progress" | "food";

function getS3Client(): S3Client {
  const env = getEnv();

  if (!env.AWS_REGION || !env.AWS_ACCESS_KEY_ID || !env.AWS_SECRET_ACCESS_KEY) {
    throw new Error(
      "S3 env vars missing: AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY"
    );
  }

  return new S3Client({
    region: env.AWS_REGION,
    credentials: {
      accessKeyId: env.AWS_ACCESS_KEY_ID,
      secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
    },
  });
}

function getBucketName(): string {
  const env = getEnv();
  if (!env.S3_BUCKET_NAME) {
    throw new Error("S3_BUCKET_NAME is required");
  }
  return env.S3_BUCKET_NAME;
}

export async function createUploadPost(params: {
  userId: string;
  fileName: string;
  contentType: string;
  kind: UploadKind;
}): Promise<{ url: string; fields: Record<string, string>; key: string }> {
  const { userId, fileName, contentType, kind } = params;

  if (kind === "avatar") {
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (!allowed.includes(contentType)) {
      throw new Error("Avatar must be JPEG, PNG, or WebP");
    }
  } else if (!contentType.startsWith("image/")) {
    throw new Error("File must be an image");
  }

  const ext = fileName.split(".").pop() || "jpg";
  const prefix = kind === "avatar" ? "avatars" : kind === "progress" ? "progress" : "food";
  const key = `${prefix}/${userId}/${Date.now()}.${ext}`;
  const maxSizeBytes = kind === "avatar" ? 2 * 1024 * 1024 : 10 * 1024 * 1024;

  const { url, fields } = await createPresignedPost(getS3Client(), {
    Bucket: getBucketName(),
    Key: key,
    Expires: 300,
    Conditions: [
      ["content-length-range", 1, maxSizeBytes],
      ["starts-with", "$Content-Type", "image/"],
    ],
    Fields: {
      "Content-Type": contentType,
      "x-amz-meta-user-id": userId,
      "x-amz-meta-original-name": fileName,
    },
  });

  return { url, fields, key };
}

export async function deleteFile(key: string): Promise<void> {
  if (!key) {
    return;
  }

  const command = new DeleteObjectCommand({
    Bucket: getBucketName(),
    Key: key,
  });

  await getS3Client().send(command);
}

export type ListedObject = {
  key: string;
  lastModified?: Date;
};

export async function listObjects(prefix: string): Promise<ListedObject[]> {
  const items: ListedObject[] = [];
  let continuationToken: string | undefined;

  do {
    const response = await getS3Client().send(
      new ListObjectsV2Command({
        Bucket: getBucketName(),
        Prefix: prefix,
        ContinuationToken: continuationToken,
      })
    );

    if (response.Contents) {
      for (const entry of response.Contents) {
        if (entry.Key) {
          items.push({ key: entry.Key, lastModified: entry.LastModified });
        }
      }
    }

    continuationToken = response.IsTruncated
      ? response.NextContinuationToken
      : undefined;
  } while (continuationToken);

  return items;
}

export async function deleteFiles(keys: string[]): Promise<void> {
  if (keys.length === 0) {
    return;
  }

  const chunks: string[][] = [];
  for (let i = 0; i < keys.length; i += 1000) {
    chunks.push(keys.slice(i, i + 1000));
  }

  for (const batch of chunks) {
    await getS3Client().send(
      new DeleteObjectsCommand({
        Bucket: getBucketName(),
        Delete: {
          Objects: batch.map((key) => ({ Key: key })),
          Quiet: true,
        },
      })
    );
  }
}
