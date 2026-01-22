import { useCallback, useState } from "react";
import type { ChangeEvent } from "react";
import { useMutation } from "@tanstack/react-query";
import { createUploadPostForUser } from "@/server/storage";
import { fileToBase64, validateAvatarFile } from "@/utils";

interface UseAvatarUploadOptions {
  userId: string;
  initialPreview?: string;
}

export function useAvatarUpload({
  userId,
  initialPreview = "",
}: UseAvatarUploadOptions) {
  const [avatarPreview, setAvatarPreview] = useState(initialPreview);
  const [avatarKey, setAvatarKey] = useState<string | null>(null);
  const [avatarError, setAvatarError] = useState<string | null>(null);

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const { url, fields, key } = await createUploadPostForUser({
        data: {
          userId,
          fileName: file.name,
          contentType: file.type,
          kind: "avatar",
        },
      });

      const formData = new FormData();
      Object.entries(fields).forEach(([fieldKey, value]) => {
        formData.append(fieldKey, value);
      });
      formData.append("file", file);

      const response = await fetch(url, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed with status ${response.status}`);
      }

      return { key };
    },
    onSuccess: ({ key }) => {
      setAvatarKey(key);
    },
    onError: (error) => {
      console.error("Failed to upload avatar:", error);
      setAvatarError("Failed to upload avatar. Please try again.");
    },
  });

  const handleAvatarChange = useCallback(
    async (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setAvatarError(null);

      const validationError = validateAvatarFile(file);
      if (validationError) {
        setAvatarError(validationError);
        return;
      }

      try {
        const base64 = await fileToBase64(file);
        setAvatarPreview(base64);
      } catch {
        setAvatarError("Failed to process avatar image");
        return;
      }

      await uploadMutation.mutateAsync(file);
    },
    [uploadMutation]
  );

  return {
    avatarPreview,
    avatarKey,
    avatarError,
    isUploading: uploadMutation.isPending,
    handleAvatarChange,
  };
}
