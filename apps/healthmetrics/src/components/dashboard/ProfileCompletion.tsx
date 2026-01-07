import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { ROUTES } from "@/constants/routes";
import type { UserProfile } from "@/types/profile";
import { calculateProfileCompletion } from "@/utils/profile-helpers";

export interface ProfileCompletionProps {
  profile: UserProfile | null;
}

export function ProfileCompletion({ profile }: ProfileCompletionProps) {
  const { percentage, missingFields } = calculateProfileCompletion(profile);

  if (percentage === 100) {
    return null;
  }

  return (
    <Link to={ROUTES.PROFILE} className="dashboard-profile-completion">
      <div className="dashboard-profile-completion-content">
        <span className="dashboard-profile-completion-text">
          Complete your profile ({percentage}%)
        </span>
        {missingFields.length > 0 && (
          <span className="dashboard-profile-completion-missing">
            Missing: {missingFields.join(", ")}
          </span>
        )}
      </div>
      <ChevronRight className="dashboard-profile-completion-arrow" />
    </Link>
  );
}
