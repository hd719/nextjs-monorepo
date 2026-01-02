import { Upload, User } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import styles from "./ProfileForm.module.css";

interface ProfileAvatarProps {
  avatarPreview: string;
  onAvatarChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function ProfileAvatar({
  avatarPreview,
  onAvatarChange,
}: ProfileAvatarProps) {
  return (
    <Card className={styles.formSection}>
      <div className={styles.avatarContainer}>
        <div className={styles.avatarPreview}>
          {avatarPreview ? (
            <img
              src={avatarPreview}
              alt="Avatar"
              className={styles.avatarImage}
            />
          ) : (
            <User className={styles.avatarPlaceholder} />
          )}
        </div>
        <div className={styles.avatarActions}>
          <Label htmlFor="avatar-upload" className={styles.avatarLabel}>
            <Upload className={styles.uploadIcon} />
            <span>Upload Avatar</span>
          </Label>
          <Input
            id="avatar-upload"
            type="file"
            accept="image/*"
            onChange={onAvatarChange}
            className={styles.avatarInput}
          />
          <p className={styles.avatarHelp}>Max 2MB. JPG, PNG, or GIF</p>
        </div>
      </div>
    </Card>
  );
}
