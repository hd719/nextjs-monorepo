import { createLazyFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/layout";
import { ProfileForm } from "@/components/profile";
import { Skeleton } from "@/components/ui/skeleton";
import { useProfile } from "@/hooks";

export const Route = createLazyFileRoute("/profile/")({
  component: ProfilePage,
});

function ProfilePage() {
  const { user } = Route.useRouteContext();
  const { data: profile, isLoading } = useProfile(user.id);

  return (
    <AppLayout>
      <div className="profile-page-layout">
        {/* Page Header */}
        <div className="profile-page-header animate-fade-slide-in">
          <div>
            <h1 className="profile-page-title">Profile Settings</h1>
            <p className="profile-page-subtitle">
              Manage your profile and set your daily nutrition goals
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="profile-loading-container animate-fade-slide-in animate-stagger-1">
            <Skeleton className="profile-loading-hero" />
            <Skeleton className="profile-loading-section" />
            <Skeleton className="profile-loading-section" />
          </div>
        ) : profile ? (
          <ProfileForm userId={user.id} initialData={profile} />
        ) : (
          <div className="profile-error-container">
            <p className="profile-error-text">
              Unable to load profile. Please try refreshing the page.
            </p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
