import { useState, useEffect } from "react";
import { Clock, Target, Loader2, Check } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useFastingProtocols, useFastingStats } from "@/hooks";
import { updateFastingPreferences } from "@/server";

export interface FastingPreferencesProps {
  userId: string;
  defaultProtocolId: string | null;
  weeklyGoal: number | null;
  onSave?: () => void;
}

export function FastingPreferences({
  userId,
  defaultProtocolId,
  weeklyGoal,
  onSave,
}: FastingPreferencesProps) {
  const [selectedProtocolId, setSelectedProtocolId] = useState(
    defaultProtocolId || ""
  );
  const [selectedGoal, setSelectedGoal] = useState(weeklyGoal ?? 5);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const { data: protocols, isLoading: isLoadingProtocols } =
    useFastingProtocols(userId);
  const { data: stats } = useFastingStats(userId);

  // Reset save success after showing
  useEffect(() => {
    if (saveSuccess) {
      const timer = setTimeout(() => setSaveSuccess(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [saveSuccess]);

  const handleSave = async () => {
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      await updateFastingPreferences({
        data: {
          userId,
          defaultProtocolId: selectedProtocolId || undefined,
          goalPerWeek: selectedGoal,
        },
      });
      setSaveSuccess(true);
      onSave?.();
    } catch (error) {
      console.error("Failed to save fasting preferences:", error);
    } finally {
      setIsSaving(false);
    }
  };

  // Check if there are unsaved changes
  const hasChanges =
    selectedProtocolId !== (defaultProtocolId || "") ||
    selectedGoal !== (weeklyGoal ?? 5);

  return (
    <Card variant="supporting" className="profile-form-section">
      <div className="fasting-preferences-header">
        <h2 className="profile-form-section-heading">Fasting Preferences</h2>
        {stats && stats.totalFasts > 0 && (
          <div className="fasting-preferences-stats">
            <span className="fasting-preferences-stat">
              {stats.currentStreak} day streak
            </span>
            <span className="fasting-preferences-stat-divider">•</span>
            <span className="fasting-preferences-stat">
              {stats.totalFasts} total fasts
            </span>
          </div>
        )}
      </div>
      <p className="profile-form-section-description">
        Set your default fasting protocol and weekly goals
      </p>

      <div className="profile-form-field-grid">
        {/* Default Protocol */}
        <div className="fasting-preferences-field">
          <Label
            htmlFor="default-protocol"
            className="fasting-preferences-label"
          >
            <Clock className="fasting-preferences-label-icon" />
            Default Protocol
          </Label>
          <p className="fasting-preferences-helper">
            Used when you quick-start a fast from the dashboard
          </p>
          {isLoadingProtocols ? (
            <div className="fasting-preferences-loading">
              <Loader2 className="fasting-preferences-loading-icon" />
            </div>
          ) : (
            <select
              id="default-protocol"
              value={selectedProtocolId}
              onChange={(e) => setSelectedProtocolId(e.target.value)}
              className="profile-form-select-input"
            >
              <option value="">No default (always ask)</option>
              {protocols?.map((protocol) => (
                <option key={protocol.id} value={protocol.id}>
                  {protocol.name} ({protocol.fastingMinutes / 60}h fast,{" "}
                  {protocol.eatingMinutes / 60}h eat)
                  {protocol.isPreset ? "" : " - Custom"}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Weekly Goal */}
        <div className="fasting-preferences-field">
          <Label htmlFor="weekly-goal" className="fasting-preferences-label">
            <Target className="fasting-preferences-label-icon" />
            Weekly Fasting Goal
          </Label>
          <p className="fasting-preferences-helper">
            How many fasts do you want to complete each week?
          </p>
          <div className="fasting-preferences-goal-selector">
            {[3, 4, 5, 6, 7].map((num) => (
              <button
                key={num}
                type="button"
                className={`fasting-preferences-goal-btn ${
                  selectedGoal === num
                    ? "fasting-preferences-goal-btn-active"
                    : ""
                }`}
                onClick={() => setSelectedGoal(num)}
              >
                {num}
              </button>
            ))}
          </div>
          <p className="fasting-preferences-goal-label">
            {selectedGoal} fasts per week
            {stats &&
              stats.fastsThisWeek !== undefined &&
              ` (${stats.fastsThisWeek}/${selectedGoal} this week)`}
          </p>
        </div>
      </div>

      {/* Save Button */}
      <div className="fasting-preferences-actions">
        <Button
          type="button"
          variant={saveSuccess ? "outline" : "default"}
          onClick={handleSave}
          disabled={isSaving || !hasChanges}
        >
          {isSaving ? (
            <>
              <Loader2 className="fasting-preferences-btn-icon fasting-preferences-btn-spin" />
              Saving...
            </>
          ) : saveSuccess ? (
            <>
              <Check className="fasting-preferences-btn-icon" />
              Saved!
            </>
          ) : (
            "Save Fasting Preferences"
          )}
        </Button>
      </div>
    </Card>
  );
}
