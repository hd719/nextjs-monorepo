import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getUserProfile, updateUserProfile } from "@/server/profile";
import { queryKeys } from "@/utils/query-keys";
import type { UpdateUserProfileInput } from "@/utils/validation";

export function useProfile(userId?: string) {
  const enabled = Boolean(userId);
  const queryKey = enabled
    ? queryKeys.profile(userId!)
    : queryKeys.profileBase();

  return useQuery({
    queryKey,
    queryFn: () => getUserProfile({ data: { userId: userId! } }),
    enabled,
    placeholderData: (previousData) => previousData,
    staleTime: 5 * 60 * 1000,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { userId: string; updates: UpdateUserProfileInput }) =>
      updateUserProfile({ data }),
    onSuccess: (_result, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.profile(variables.userId),
      });
    },
  });
}
