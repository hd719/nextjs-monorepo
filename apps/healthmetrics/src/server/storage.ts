import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { createUploadPost } from "@/lib/storage";

const uploadRequestSchema = z.object({
  userId: z.string().min(1),
  fileName: z.string().min(1),
  contentType: z.string().min(1),
  kind: z.enum(["avatar", "progress", "food"]),
});

export const createUploadPostForUser = createServerFn({ method: "POST" })
  .inputValidator((data: z.infer<typeof uploadRequestSchema>) => {
    uploadRequestSchema.parse(data);
    return data;
  })
  .handler(async ({ data }) => {
    return createUploadPost(data);
  });
