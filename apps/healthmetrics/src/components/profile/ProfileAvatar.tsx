import { Upload, User } from "lucide-react";
import { Card } from "@/components/ui/card";
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
    <Card className="profile-form-section">
      <div className="profile-form-avatar-container">
        <div className="profile-form-avatar-preview">
          {avatarPreview ? (
            <img
              src={avatarPreview}
              alt="Avatar"
              className="profile-form-avatar-image"
            />
          ) : (
            <User className="profile-form-avatar-placeholder" />
          )}
        </div>
        <div className="profile-form-avatar-actions">
          <Label htmlFor="avatar-upload" className="profile-form-avatar-label">
            <Upload className="profile-form-upload-icon" />
            <span>Upload Avatar</span>
          </Label>
          <Input
            id="avatar-upload"
            type="file"
            accept="image/*"
            onChange={onAvatarChange}
            className="profile-form-avatar-input"
          />
          <p className="profile-form-avatar-help">Max 2MB. JPG, PNG, or GIF</p>
        </div>
      </div>
    </Card>
  );
}
