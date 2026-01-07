import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useResetOnboarding } from "@/hooks/useOnboarding";
import { ROUTES } from "@/constants/routes";
import { Button } from "@/components/ui/button";
import { Settings, RotateCcw, X } from "lucide-react";

interface DevToolsProps {
  userId: string;
}

export function DevTools({ userId }: DevToolsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const resetMutation = useResetOnboarding();

  // Only show when explicitly enabled via env variable
  const showDevTools = import.meta.env.VITE_SHOW_DEV_TOOLS === "true";
  if (!showDevTools) {
    return null;
  }

  const handleResetOnboarding = async () => {
    try {
      await resetMutation.mutateAsync({ userId });
      navigate({ to: ROUTES.ONBOARDING });
    } catch (error) {
      console.error("Failed to reset onboarding:", error);
    }
  };

  // Inline styles as fallback for fixed positioning
  const toggleStyle: React.CSSProperties = {
    position: "fixed",
    bottom: "80px", // Above TanStack devtools
    right: "16px",
    zIndex: 9999,
  };

  const panelStyle: React.CSSProperties = {
    position: "fixed",
    bottom: "80px",
    right: "16px",
    zIndex: 9999,
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="dev-tools-toggle"
        style={toggleStyle}
        title="Dev Tools"
      >
        <Settings className="w-4 h-4" />
      </button>
    );
  }

  return (
    <div className="dev-tools-panel" style={panelStyle}>
      <div className="dev-tools-header">
        <span className="dev-tools-title">🛠️ Dev Tools</span>
        <button onClick={() => setIsOpen(false)} className="dev-tools-close">
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="dev-tools-content">
        <Button
          variant="outline"
          size="sm"
          onClick={handleResetOnboarding}
          disabled={resetMutation.isPending}
          className="dev-tools-button"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          {resetMutation.isPending ? "Resetting..." : "Reset Onboarding"}
        </Button>
      </div>
    </div>
  );
}
