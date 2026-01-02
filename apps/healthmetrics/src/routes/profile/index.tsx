import { createFileRoute, redirect } from "@tanstack/react-router";
import { AppLayout } from "@/components/layout/AppLayout";
import { ProfileForm } from "@/components/profile/ProfileForm";
import { fetchUser } from "@/server/auth";
import { getUserProfile } from "@/server/profile";

export const Route = createFileRoute("/profile/")({
  beforeLoad: async () => {
    const user = await fetchUser();

    if (!user) {
      throw redirect({ to: "/" });
    }

    // Fetch user profile
    const profile = await getUserProfile({ data: { userId: user.id } });

    return { user, profile };
  },
  component: ProfilePage,
});

function ProfilePage() {
  const { user, profile } = Route.useRouteContext();

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Profile Settings</h1>
          <p className="text-muted-foreground mt-2">
            Manage your profile and set your daily nutrition goals
          </p>
        </div>

        {profile ? (
          <ProfileForm userId={user.id} initialData={profile} />
        ) : (
          <div className="p-8 text-center">
            <p className="text-muted-foreground">
              Unable to load profile. Please try refreshing the page.
            </p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
