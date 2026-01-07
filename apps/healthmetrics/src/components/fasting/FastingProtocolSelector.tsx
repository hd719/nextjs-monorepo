import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Check,
  Loader2,
  Play,
  Sparkles,
  Zap,
  Flame,
  Trophy,
  Plus,
  ArrowLeft,
  Settings,
  Trash2,
} from "lucide-react";
import {
  useFastingProtocols,
  useStartFast,
  useCreateCustomProtocol,
  useDeleteCustomProtocol,
} from "@/hooks";
import { cn } from "@/utils";
import type { FastingProtocol } from "@/types";

interface FastingProtocolSelectorProps {
  userId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Protocol metadata for enhanced display (using design system colors)
const protocolMeta: Record<
  string,
  {
    icon: typeof Sparkles;
    tagline: string;
    difficulty: "beginner" | "intermediate" | "advanced" | "expert";
    color: "success" | "accent" | "warning" | "chart3";
  }
> = {
  "16:8": {
    icon: Sparkles,
    tagline: "Perfect for beginners",
    difficulty: "beginner",
    color: "success", // --success (emerald)
  },
  "18:6": {
    icon: Zap,
    tagline: "Boost your metabolism",
    difficulty: "intermediate",
    color: "accent", // --accent (cyan)
  },
  "20:4": {
    icon: Flame,
    tagline: "Warrior diet style",
    difficulty: "advanced",
    color: "warning", // --warning (amber)
  },
  "OMAD (23:1)": {
    icon: Trophy,
    tagline: "Ultimate fat burning",
    difficulty: "expert",
    color: "chart3", // --chart-3 (purple)
  },
};

type DialogView = "select" | "create";

export function FastingProtocolSelector({
  userId,
  open,
  onOpenChange,
}: FastingProtocolSelectorProps) {
  const [, startTransition] = useTransition();
  const [view, setView] = useState<DialogView>("select");
  const [selectedProtocolId, setSelectedProtocolId] = useState<string | null>(
    null
  );

  // Form state for custom protocol
  const [customName, setCustomName] = useState("");
  const [fastingHours, setFastingHours] = useState(16);
  const [formError, setFormError] = useState<string | null>(null);

  const { data: protocols, isLoading: isLoadingProtocols } =
    useFastingProtocols(userId);

  const startFast = useStartFast();
  const createProtocol = useCreateCustomProtocol();
  const deleteProtocol = useDeleteCustomProtocol();

  // Reset state when dialog closes (using transition for smoother UX)
  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      startTransition(() => {
        setView("select");
        setSelectedProtocolId(null);
        setCustomName("");
        setFastingHours(16);
        setFormError(null);
      });
    }
    onOpenChange(isOpen);
  };

  // Switch views with transition
  const switchView = (newView: DialogView) => {
    startTransition(() => {
      setView(newView);
      if (newView === "select") {
        setCustomName("");
        setFastingHours(16);
        setFormError(null);
      }
    });
  };

  const handleStart = () => {
    if (!selectedProtocolId) return;

    startFast.mutate(
      { userId, protocolId: selectedProtocolId },
      {
        onSuccess: () => {
          handleOpenChange(false);
        },
      }
    );
  };

  const handleProtocolSelect = (protocol: FastingProtocol) => {
    setSelectedProtocolId(protocol.id);
  };

  const handleDeleteProtocol = (protocolId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedProtocolId === protocolId) {
      setSelectedProtocolId(null);
    }
    deleteProtocol.mutate({ userId, protocolId });
  };

  const handleCreateProtocol = () => {
    setFormError(null);

    // Validation
    if (!customName.trim()) {
      setFormError("Please enter a name for your protocol");
      return;
    }
    if (fastingHours < 1 || fastingHours > 23) {
      setFormError("Fasting hours must be between 1 and 23");
      return;
    }

    const fastingMinutes = fastingHours * 60;
    const eatingMinutes = (24 - fastingHours) * 60;

    createProtocol.mutate(
      {
        userId,
        name: customName.trim(),
        fastingMinutes,
        eatingMinutes,
      },
      {
        onSuccess: () => {
          switchView("select");
        },
        onError: (error) => {
          setFormError(
            error instanceof Error ? error.message : "Failed to create protocol"
          );
        },
      }
    );
  };

  // Group protocols by type
  const presetProtocols = protocols?.filter((p) => p.isPreset) ?? [];
  const customProtocols = protocols?.filter((p) => !p.isPreset) ?? [];

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="protocol-dialog"
        closeOnOutsideClick
        onClose={() => handleOpenChange(false)}
      >
        {view === "select" ? (
          <>
            <DialogHeader className="protocol-dialog-header">
              <div className="protocol-dialog-icon-wrapper">
                <Sparkles className="protocol-dialog-icon" />
              </div>
              <DialogTitle className="protocol-dialog-title">
                Choose Your Challenge
              </DialogTitle>
              <DialogDescription className="protocol-dialog-description">
                Select a fasting protocol that fits your lifestyle
              </DialogDescription>
            </DialogHeader>

            <div className="protocol-selector-body">
              {isLoadingProtocols ? (
                <div className="protocol-selector-loading">
                  <Loader2 className="protocol-selector-loading-icon" />
                </div>
              ) : (
                <div className="protocol-selector-grid">
                  {presetProtocols.map((protocol) => (
                    <ProtocolCard
                      key={protocol.id}
                      protocol={protocol}
                      isSelected={selectedProtocolId === protocol.id}
                      onSelect={handleProtocolSelect}
                    />
                  ))}
                </div>
              )}

              {customProtocols.length > 0 && (
                <div className="protocol-custom-section">
                  <h4 className="protocol-section-label">
                    Your Custom Protocols
                  </h4>
                  <div className="protocol-custom-list">
                    {customProtocols.map((protocol) => (
                      <ProtocolCard
                        key={protocol.id}
                        protocol={protocol}
                        isSelected={selectedProtocolId === protocol.id}
                        onSelect={handleProtocolSelect}
                        onDelete={(e) => handleDeleteProtocol(protocol.id, e)}
                        isDeleting={
                          deleteProtocol.isPending &&
                          deleteProtocol.variables?.protocolId === protocol.id
                        }
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Create custom button */}
              <button
                type="button"
                className="protocol-create-btn"
                onClick={() => switchView("create")}
              >
                <Plus className="protocol-create-btn-icon" />
                <span>Create Custom Protocol</span>
              </button>
            </div>

            <DialogFooter className="protocol-dialog-footer">
              <Button
                variant="accent"
                size="xl"
                onClick={handleStart}
                disabled={!selectedProtocolId || startFast.isPending}
                className="w-full font-semibold"
              >
                {startFast.isPending ? (
                  <>
                    <Loader2 className="protocol-btn-icon-spin" />
                    Starting...
                  </>
                ) : (
                  <>
                    <Play className="protocol-btn-icon" />
                    Begin Fasting
                  </>
                )}
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader className="protocol-dialog-header">
              <button
                type="button"
                className="protocol-back-btn"
                onClick={() => switchView("select")}
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div className="protocol-dialog-icon-wrapper">
                <Settings className="protocol-dialog-icon" />
              </div>
              <DialogTitle className="protocol-dialog-title">
                Create Custom Protocol
              </DialogTitle>
              <DialogDescription className="protocol-dialog-description">
                Design your own fasting schedule
              </DialogDescription>
            </DialogHeader>

            <div className="protocol-create-form">
              {/* Name input */}
              <div className="protocol-form-field">
                <Label htmlFor="protocol-name" className="protocol-form-label">
                  Protocol Name
                </Label>
                <Input
                  id="protocol-name"
                  type="text"
                  placeholder="e.g., My Evening Fast"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="protocol-form-input"
                  maxLength={30}
                />
              </div>

              {/* Fasting hours slider */}
              <div className="protocol-form-field">
                <Label htmlFor="fasting-hours" className="protocol-form-label">
                  Fasting Duration
                </Label>
                <div className="protocol-hours-display">
                  <span className="protocol-hours-value">{fastingHours}</span>
                  <span className="protocol-hours-unit">hours fasting</span>
                  <span className="protocol-hours-divider">•</span>
                  <span className="protocol-hours-eat">
                    {24 - fastingHours}
                  </span>
                  <span className="protocol-hours-unit">hours eating</span>
                </div>
                <input
                  id="fasting-hours"
                  type="range"
                  min="1"
                  max="23"
                  value={fastingHours}
                  onChange={(e) => setFastingHours(Number(e.target.value))}
                  className="protocol-hours-slider"
                />
                <div className="protocol-hours-labels">
                  <span>1h</span>
                  <span>12h</span>
                  <span>23h</span>
                </div>
              </div>

              {/* Preview */}
              <div className="protocol-preview">
                <div className="protocol-preview-label">Preview</div>
                <div className="protocol-preview-name">
                  {customName.trim() || "Custom Protocol"}
                </div>
                <div className="protocol-preview-times">
                  {fastingHours}:{24 - fastingHours}
                </div>
              </div>

              {/* Error message */}
              {formError && (
                <div className="protocol-form-error">{formError}</div>
              )}
            </div>

            <DialogFooter className="protocol-dialog-footer">
              <Button
                variant="outline"
                onClick={() => switchView("select")}
                className="protocol-form-cancel"
              >
                Cancel
              </Button>
              <Button
                variant="accent"
                onClick={handleCreateProtocol}
                disabled={createProtocol.isPending}
                className="protocol-form-submit"
              >
                {createProtocol.isPending ? (
                  <>
                    <Loader2 className="protocol-btn-icon-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="protocol-btn-icon" />
                    Create Protocol
                  </>
                )}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

interface ProtocolCardProps {
  protocol: FastingProtocol;
  isSelected: boolean;
  onSelect: (protocol: FastingProtocol) => void;
  onDelete?: (e: React.MouseEvent) => void;
  isDeleting?: boolean;
}

function ProtocolCard({
  protocol,
  isSelected,
  onSelect,
  onDelete,
  isDeleting,
}: ProtocolCardProps) {
  const hours = protocol.fastingMinutes / 60;
  const eatingHours = protocol.eatingMinutes / 60;

  const meta = protocolMeta[protocol.name] ?? {
    icon: Settings,
    tagline: "Custom protocol",
    difficulty: "intermediate" as const,
    color: "accent" as const,
  };

  const Icon = meta.icon;

  return (
    <button
      type="button"
      className={cn(
        "protocol-card",
        `protocol-card-${meta.color}`,
        isSelected && "protocol-card-selected"
      )}
      onClick={() => onSelect(protocol)}
    >
      {/* Selection indicator */}
      <div
        className={cn(
          "protocol-card-check",
          isSelected && "protocol-card-check-visible"
        )}
      >
        <Check className="protocol-card-check-icon" />
      </div>

      {/* Delete button for custom protocols */}
      {onDelete && (
        <button
          type="button"
          className="protocol-card-delete"
          onClick={onDelete}
          disabled={isDeleting}
          title="Delete protocol"
        >
          {isDeleting ? (
            <Loader2 className="protocol-card-delete-icon protocol-btn-icon-spin" />
          ) : (
            <Trash2 className="protocol-card-delete-icon" />
          )}
        </button>
      )}

      {/* Icon */}
      <div
        className={cn(
          "protocol-card-icon-wrapper",
          `protocol-icon-${meta.color}`
        )}
      >
        <Icon className="protocol-card-icon" />
      </div>

      {/* Content */}
      <div className="protocol-card-content">
        <span className="protocol-card-name">{protocol.name}</span>
        <span className="protocol-card-tagline">{meta.tagline}</span>
      </div>

      {/* Time labels */}
      <div className="protocol-card-times">
        <span className="protocol-time-fast">
          <span className="protocol-time-value">{hours}</span>h fast
        </span>
        <span className="protocol-time-divider">•</span>
        <span className="protocol-time-eat">
          <span className="protocol-time-value">{eatingHours}</span>h eat
        </span>
      </div>

      {/* Difficulty badge */}
      <div
        className={cn(
          "protocol-difficulty",
          `protocol-difficulty-${meta.difficulty}`
        )}
      >
        {meta.difficulty}
      </div>
    </button>
  );
}
