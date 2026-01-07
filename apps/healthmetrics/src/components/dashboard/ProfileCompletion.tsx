import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { ROUTES } from "@/constants/routes";
import type { UserProfile } from "@/types/profile";
import { calculateProfileCompletion } from "@/utils/profile-helpers";

export interface ProfileCompletionProps {
  profile: UserProfile | null;
}

export function ProfileCompletion({ profile }: ProfileCompletionProps) {
  const { percentage } = calculateProfileCompletion(profile);

  // Don't show if profile is complete
  if (percentage === 100) {
    return null;
  }

  return (
    <Link to={ROUTES.PROFILE} className="dashboard-profile-completion">
      <span className="dashboard-profile-completion-text">
        Complete your profile ({percentage}%)
      </span>
      <ChevronRight className="dashboard-profile-completion-arrow" />
    </Link>
  );
}
