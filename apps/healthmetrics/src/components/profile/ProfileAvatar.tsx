import { Upload, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ProfileAvatarProps {
  avatarPreview: string;
  onAvatarChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function ProfileAvatar({
  avatarPreview,
  onAvatarChange,
}: ProfileAvatarProps) {
  return (
    <div className="profile-avatar-container">
      <div className="profile-avatar-preview">
        {avatarPreview ? (
          <img
            src={avatarPreview}
            alt="Avatar"
            className="profile-avatar-image"
          />
        ) : (
          <User className="profile-avatar-placeholder" aria-hidden="true" />
        )}
      </div>
      <div className="profile-avatar-actions">
        <Label
          htmlFor="avatar-upload"
          className="profile-avatar-label focus-ring"
        >
          <Upload className="profile-avatar-upload-icon" aria-hidden="true" />
          <span>Upload Avatar</span>
        </Label>
        <Input
          id="avatar-upload"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={onAvatarChange}
          className="profile-avatar-input"
        />
        <p className="profile-avatar-help">Max 2MB. JPG, PNG, or WebP</p>
      </div>
    </div>
  );
}
